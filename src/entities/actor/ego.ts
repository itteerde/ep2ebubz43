import { createMessage } from '@src/chat/create-message';
import {
  CharacterDetail,
  CharacterPoint,
  enumValues,
  MinStressOption,
} from '@src/data-enums';
import { EffectType, isFieldSkillEffect, Source } from '@src/features/effects';
import type { StringID } from '@src/features/feature-helpers';
import {
  RepNetwork,
  repRefreshTimerActive,
  RepWithIdentifier,
} from '@src/features/reputations';
import {
  ActiveSkillCategory,
  FieldSkillData,
  FieldSkillIdentifier,
  fieldSkillInfo,
  fieldSkillName,
  FieldSkillType,
  FullFieldSkill,
  FullSkill,
  isFieldSkill,
  KnowSkillCategory,
  setupFullFieldSkill,
  setupFullSkill,
  Skill,
  SkillType,
} from '@src/features/skills';
import {
  CommonInterval,
  createLiveTimeState,
  getElapsedTime,
  LiveTimeState,
  refreshAvailable,
} from '@src/features/time';
import { NotificationType, notify } from '@src/foundry/foundry-apps';
import { format, localize } from '@src/foundry/localization';
import { rollLabeledFormulas } from '@src/foundry/rolls';
import type { CommonDetails, EgoData } from '@src/foundry/template-schema';
import { HealthType } from '@src/health/health';
import { MentalHealth, StressType } from '@src/health/mental-health';
import { LazyGetter } from 'lazy-get-decorator';
import { compact, groupBy, map } from 'remeda';
import type { ReadonlyAppliedEffects } from '../applied-effects';
import { ItemType } from '../entity-types';
import type { ItemProxy } from '../item/item';
import type { Psi } from '../item/proxies/psi';
import type { Sleight } from '../item/proxies/sleight';
import type { Trait } from '../item/proxies/trait';
import type { ItemDatas, ItemEntity } from '../models';
import type { UpdateStore } from '../update-store';
import type { ActorEP, ItemOperations } from './actor';

export type FullEgoData = {
  // _id: string;
  name: string;
  img: string;
  system: EgoData & CommonDetails;
  items: ItemDatas[];
};

export class Ego {
  readonly data;
  readonly updater;
  readonly activeEffects;
  readonly actor;
  readonly items;
  readonly itemOperations;
  readonly psi;
  readonly addPsi;
  readonly allowSleights;
  readonly openForm;
  constructor({
    data,
    updater,
    activeEffects,
    actor,
    items,
    itemOperations,
    psi,
    addPsi,
    allowSleights,
    openForm,
  }: {
    data: FullEgoData;
    updater: UpdateStore<FullEgoData>;
    activeEffects: ReadonlyAppliedEffects | null;
    actor: ActorEP | null;
    items: Map<string, ItemProxy>;
    itemOperations: ItemOperations;
    allowSleights: boolean;
    psi?: Psi | null;
    addPsi?: (psiData: ItemEntity<ItemType.Psi>) => Promise<unknown>;
    openForm?: () => void;
  }) {
    this.data = data;
    this.updater = updater;
    this.activeEffects = activeEffects;
    this.actor = actor;
    this.items = items;
    this.itemOperations = itemOperations;
    this.psi = psi;
    this.addPsi = addPsi;
    this.allowSleights = allowSleights;
    this.openForm = openForm;
  }

 async  rollStress() {
    const { stressTestValue, actor } = this;
    createMessage({
      entity: actor,
      data: {
        header: {
          heading: localize('encounteringThreat'),
        },
        stress: {
          rolledFormulas: await rollLabeledFormulas([
            {
              label: localize('stressValue'),
              formula: stressTestValue.sv,
            },
          ]),
          notes: stressTestValue.notes,
          minStress:
            stressTestValue.minStressOption === MinStressOption.Half
              ? 'half'
              : stressTestValue.minStressOption === MinStressOption.Value
              ? stressTestValue.minSV || 1
              : '',
          stressType: StressType.TheUnknown,
          source: localize('encounteringThreat'),
        },
      },
    });
  }

  get hasStressRoll() {
    return this.settings.threatDetails && !!this.stressValueInfo.value;
  }

  static formatPoint(point: CharacterPoint) {
    return point === CharacterPoint.Credits
      ? localize('credits')
      : `${localize(point)[0]}${localize('points')[0]}`.toLocaleUpperCase();
  }

  get disabled() {
    return !this.updater.editable;
  }

  private readonly commonSkills = new Map<SkillType, FullSkill>();
  private readonly fieldSkills = new Map<string, FullFieldSkill>();
  private readonly repMap = new Map<
    RepNetwork,
    RepWithIdentifier & { track: boolean }
  >();

  get img() {
    return this.data.img;
  }

  get epData(): EgoData & CommonDetails {
    return this.data.system;
  }

  get aptitudes() {
    return this.epData.aptitudes;
  }

  get baseInitiative() {
    const { ref, int } = this.aptitudes;
    const base = (ref + int) / 5;
    return Math.round(base * 100) / 100;
  }

  get motivations() {
    return this.epData.motivations;
  }

  get description() {
    return this.epData.description;
  }

  @LazyGetter()
  get filteredMotivations() {
    return this.motivations.filter((motivation) => motivation.cause);
  }

  get settings() {
    return this.epData.settings;
  }

  get name() {
    return this.data.name;
  }

  get flex() {
    return this.epData.flex;
  }

  get useThreat() {
    return this.settings.useThreat;
  }

  get trackMentalHealth() {
    return this.settings.trackMentalHealth;
  }

  get trackReputations() {
    return this.settings.trackReputations;
  }

  @LazyGetter()
  get mentalHealth() {
    return new MentalHealth({
      data: this.epData.mentalHealth,
      statMods: this.activeEffects?.getHealthStatMods(HealthType.Mental),
      willpower: this.aptitudes.wil,
      updater: this.updater.path('system', 'mentalHealth').nestedStore(),
      source: this.name,
      recoveryEffects: this.activeEffects?.mentalHealthRecovery,
    });
  }

  private _skills: Map<string, Skill> | null = null;

  @LazyGetter()
  get skills() {
    const { canDefault } = this.settings;
    const { fieldSkills } = this.epData;
    const skills = new Map<string, Skill>();

    const addSkill = (skill: Skill) => {
      if (canDefault || skill.points) skills.set(skill.name, skill);
    };

    for (const type of enumValues(SkillType)) {
      addSkill(this.getCommonSkill(type));
    }

    for (const fieldSkill of enumValues(FieldSkillType)) {
      const fields = fieldSkills[fieldSkill];
      for (const field of fields) {
        addSkill(
          this.getFieldSkill({ ...field, fieldSkill }, { skipCheck: true }),
        );
      }
    }

    for (const effect of this.activeEffects?.getGroup(EffectType.Skill) || []) {
      const useTotal = !!effect.total && !effect.points;
      if (isFieldSkillEffect(effect.skillType)) {
        const skill: Skill = setupFullFieldSkill(
          {
            points: effect.points ?? effect.total,
            specialization: effect.specialization,
            fieldSkill: effect.skillType,
            field: effect.field,
            linkedAptitude: effect.linkedAptitude,
            aptMultiplier: useTotal
              ? 0
              : (effect.aptitudeMultiplier as 0 | 1 | 2),
            category:
              effect.category ||
              fieldSkillInfo[effect.skillType].categories[0] ||
              (effect.skillType === FieldSkillType.Know
                ? KnowSkillCategory.Academics
                : ActiveSkillCategory.Misc),
          },
          this.aptitudes,
        );

        skill.source = effect[Source];
        if (skill.total > (skills.get(skill.name)?.total || 0)) {
          addSkill(skill);
        }
      } else {
        const skill: Skill = setupFullSkill(
          {
            points: effect.points ?? effect.total,
            specialization: effect.specialization,
            skill: effect.skillType,
            linkedAptitude: effect.linkedAptitude,
            aptMultiplier: useTotal
              ? 0
              : (effect.aptitudeMultiplier as 0 | 1 | 2),

            category: effect.category,
          },
          this.aptitudes,
        );

        skill.source = effect[Source];
        if (skill.total > (skills.get(skill.name)?.total || 0)) {
          addSkill(skill);
        }
      }
    }
    this._skills = skills;
    return [...skills.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  @LazyGetter()
  get groupedSkills() {
    return groupBy(this.skills, (skill) =>
      isFieldSkill(skill) && skill.fieldSkill === FieldSkillType.Know
        ? 'know'
        : 'active',
    ) as Partial<Record<'active' | 'know', Skill[]>>;
  }

  get complementarySkills() {
    return this.groupedSkills.know?.filter((skill) => skill.total >= 40) || [];
  }

  get reps() {
    const networks = enumValues(RepNetwork);
    if (this.repMap.size !== networks.length) {
      for (const network of networks) this.getRep(network);
    }
    return this.repMap;
  }

  @LazyGetter()
  get trackedReps() {
    return [...this.reps.values()].filter((rep) => rep.track);
  }

  get egoType() {
    return this.epData.egoType;
  }

  get forkStatus() {
    return this.epData.forkType;
  }

  get stressTestValue() {
    return this.epData.threatDetails.stress;
  }

  get useCP() {
    return !!this.epData.points.customization;
  }

  @LazyGetter()
  get itemGroups() {
    const traits: Trait[] = [];
    const sleights: Sleight[] = [];
    for (const proxy of this.items.values()) {
      if (proxy.type === ItemType.Trait) traits.push(proxy);
      else if (proxy.type === ItemType.Sleight) sleights.push(proxy);
    }
    return { traits, sleights };
  }

  @LazyGetter()
  get points(): { label: string; value: number; point: CharacterPoint }[] {
    const groups: {
      label: string;
      value: number;
      point: CharacterPoint;
    }[] = [];
    if (!this.epData.settings.trackPoints) return groups;

    const { points } = this.epData;
    for (const point of enumValues(CharacterPoint)) {
      const value = points[point];
      if (value || point === CharacterPoint.Rez) {
        groups.push({
          label: Ego.formatPoint(point),
          value,
          point,
        });
      }
    }
    if (groups.length === 1 && groups[0]) {
      groups[0].label = localize('rez');
    }
    return groups;
  }

  @LazyGetter()
  get stressValueInfo() {
    const { minStressOption, minSV, notes, sv } = this.stressTestValue;
    return {
      label: `${localize('stressValue')} ${notes ? `(${notes})` : ''}`,
      value: compact([
        sv,
        minStressOption === MinStressOption.Half
          ? localize('half')
          : minStressOption === MinStressOption.Value
          ? minSV
          : '',
      ]).join('/'),
    };
  }

  @LazyGetter()
  get details() {
    const { settings, epData } = this;
    const { characterDetails, threatDetails } = epData;
    const details: { label: string; value: string }[] = [];

    if (settings.characterDetails) {
      for (const detail of enumValues(CharacterDetail)) {
        const value = characterDetails[detail];
        if (value) details.push({ label: localize(detail), value });
      }
    }

    if (settings.threatDetails) {
      const { niche, numbers, level, stress } = threatDetails;
      if (niche) details.push({ label: localize('niche'), value: niche });
      if (numbers) details.push({ label: localize('numbers'), value: numbers });
      details.push({ label: localize('threatLevel'), value: localize(level) });
      if (stress.sv) details.push(this.stressValueInfo);
    }

    return details;
  }

  addNewItemProxy(proxy: ItemProxy | null | undefined) {
    if (!proxy || this.disabled) return;
    if (this.hasItemProxy(proxy)) {
      return notify(
        NotificationType.Info,
        format('AlreadyHasItem', {
          ownerName: this.name,
          itemName: proxy.name,
        }),
      );
    }

    if (proxy.type === ItemType.Trait) {
      if (proxy.isMorphTrait) {
        notify(
          NotificationType.Error,
          localize('DESCRIPTIONS', 'OnlyEgoTraits'),
        );
      } else {
        if (proxy.hasMultipleLevels) {
          proxy.selectLevelAndAdd(this.itemOperations.add);
        } else this.itemOperations.add(proxy.getDataCopy(true));
      }
    } else if (proxy.type === ItemType.Sleight && this.allowSleights) {
      // TODO only allow sleights that match psi level
      this.itemOperations.add(proxy.getDataCopy(true));
    } else if (proxy.type === ItemType.Psi && this.allowSleights) {
      if (this.psi)
        notify(
          NotificationType.Info,
          localize('DESCRIPTIONS', 'EgoAlreadyHasPsi'),
        );
      else if (!this.addPsi)
        notify(
          NotificationType.Error,
          localize('DESCRIPTIONS', 'CannotAddPsi'),
        );
      else this.addPsi(proxy.getDataCopy(true));
    } else {
      notify(NotificationType.Error, localize('DESCRIPTIONS', 'OnlyEgoItems'));
    }
  }

  hasItemProxy(agent: ItemProxy | null | undefined) {
    return !!agent && this.items.get(agent?.id) === agent;
  }

  getCommonSkill(skill: SkillType): FullSkill {
    if (this._skills) {
      const madeSkill = this._skills.get(localize(skill));
      if (madeSkill) return madeSkill as FullSkill;
    }
    let fullSkill = this.commonSkills.get(skill);
    if (!fullSkill) {
      fullSkill = setupFullSkill(
        { skill, ...this.epData.skills[skill] },
        this.aptitudes,
      );
      this.commonSkills.set(skill, fullSkill);
    }
    return fullSkill;
  }

  getFieldSkill(
    {
      fieldSkill,
      id,
      ...data
    }: StringID<FieldSkillData> & { fieldSkill: FieldSkillType },
    { skipCheck = false } = {},
  ) {
    let fullSkill = skipCheck
      ? undefined
      : this.fieldSkills.get(
          `${fieldSkillName({ fieldSkill, field: data.field })}-${id}`,
        );

    if (!fullSkill) {
      fullSkill = setupFullFieldSkill({ fieldSkill, ...data }, this.aptitudes);
      this.fieldSkills
        .set(fullSkill.name, fullSkill)
        .set(`${fullSkill.name}-${id}`, fullSkill);
    }
    return fullSkill;
  }

  findFieldSkill(ids: FieldSkillIdentifier) {
    if (this._skills) {
      const madeSkill = this._skills.get(fieldSkillName(ids));
      if (madeSkill) return madeSkill as FullFieldSkill;
    }
    let fullSkill = this.fieldSkills.get(fieldSkillName(ids));
    if (!fullSkill) {
      const { field, fieldSkill } = ids;
      const existing = this.epData.fieldSkills[ids.fieldSkill].find(
        (f) => f.field.toLocaleLowerCase() === field.toLocaleLowerCase(),
      );
      if (existing)
        fullSkill = this.getFieldSkill(
          { fieldSkill, ...existing },
          { skipCheck: true },
        );
    }
    return fullSkill;
  }

  getRep(network: RepNetwork) {
    let rep = this.repMap.get(network);
    if (!rep) {
      rep = {
        acronym: localize(network),
        network: localize('FULL', network),
        ...this.epData.reps[network],
        identifier: { networkId: network, type: 'ego' },
      };
      this.repMap.set(network, rep);
    }
    return rep;
  }

  @LazyGetter()
  get repRefreshTimers() {
    const timers: LiveTimeState[] = [];
    for (const rep of this.reps.values()) {
      if (repRefreshTimerActive(rep)) {
        timers.push(
          createLiveTimeState({
            label: `${rep.acronym} ${localize('favor')} ${localize(
              'refresh',
            )}`.toLocaleLowerCase(),
            duration: CommonInterval.Week,
            id: rep.network,
            startTime: rep.refreshStartTime,
            updateStartTime: this.updater.path(
              'system',
              'reps',
              (rep.identifier as { networkId: RepNetwork }).networkId,
              'refreshStartTime',
            ).commit,
          }),
        );
      }
    }
    return timers;
  }

  get timers() {
    return this.repRefreshTimers;
  }

  refreshReps() {
    if (this.repRefreshTimers.some(refreshAvailable)) {
      for (const network of enumValues(RepNetwork)) {
        this.updater
          .path('system', 'reps', network)
          .store((rep) =>
            getElapsedTime(rep.refreshStartTime) >= CommonInterval.Week
              ? { ...rep, refreshStartTime: 0, minor: 0, moderate: 0 }
              : rep,
          );
      }
    }

    return this.updater.commit();
  }

  acceptItemAgent(agent: ItemProxy) {
    if (Ego.egoItems.includes(agent.type)) {
      return { accept: true } as const;
    }
    return {
      accept: false,
      override: false,
      rejectReason: `Ego can only accept [${map(Ego.egoItems, localize).join(
        ', ',
      )}] items.`,
    } as const;
  }
  static readonly egoItems = [ItemType.Psi, ItemType.Sleight, ItemType.Trait];
}

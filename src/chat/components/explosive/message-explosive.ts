import type {
  AttackTraitData,
  DamageMessageData,
  ExplosiveMessageData,
  MessageAreaEffectData,
  SubstanceUseData,
  UsedExplosiveState
} from '@src/chat/message-data';
import { UseWorldTime } from '@src/components/mixins/world-time-mixin';
import { AreaEffectType, Demolition, SubstanceType } from '@src/data-enums';
import { ExplosiveSettingsForm } from '@src/entities/actor/components/character-views/components/attacks/explosive-settings/explosive-settings-form';
import {
  pickOrDefaultCharacter
} from '@src/entities/find-entities';
import { Explosive } from '@src/entities/item/proxies/explosive';
import { currentWorldTimeMS } from '@src/features/time';
import { localize } from '@src/foundry/localization';
import { rollLabeledFormulas } from '@src/foundry/rolls';
import { notEmpty } from '@src/utility/helpers';
import { customElement, html, property } from 'lit-element';
import mix from 'mix-with/lib';
import { compact, createPipe, flatMap, pipe, prop } from 'remeda';
import { MessageElement } from '../message-element';
import styles from './message-explosive.scss';

// TODO only use world time when time state

@customElement('message-explosive')
export class MessageExplosive extends mix(MessageElement).with(UseWorldTime) {
  static get is() {
    return 'message-explosive' as const;
  }

  static get styles() {
    return [styles];
  }

  @property({ attribute: false }) explosiveUse!: ExplosiveMessageData;

  get explosive() {
    return new Explosive({
      data: this.explosiveUse.explosive,
      loaded: false,
      embedded: null,
    });
  }

  private async detonate() {
    const { explosive } = this;
    const {
      attackType = 'primary',
      centeredReduction,
      uniformBlastRadius,
      templateIDs,
      demolition,
    } = this.explosiveUse;
    const {
      rollFormulas,
      damageType,
      armorPiercing,
      armorUsed,
      reduceAVbyDV,
      substance,
      attackTraits,
      duration,
      notes,
    } = explosive.attacks[attackType] || explosive.attacks.primary;

    const damage: DamageMessageData | undefined = notEmpty(rollFormulas)
      ? {
          damageType,
          armorPiercing,
          armorUsed,
          reduceAVbyDV,
          rolledFormulas: rollLabeledFormulas(rollFormulas),
          source: explosive.name,
        }
      : undefined;

    const attackTraitInfo: AttackTraitData | undefined = notEmpty(attackTraits)
      ? {
          traits: attackTraits,
          duration,
          notes,
          startTime: duration ? currentWorldTimeMS() : undefined,
        }
      : undefined;

    const substanceUse: SubstanceUseData | undefined = substance
      ? {
          substance: substance.getDataCopy(),
          useMethod:
            substance.substanceType === SubstanceType.Chemical
              ? 'use'
              : explosive.epData.useSubstance ||
                substance.applicationMethods[0]!,
          doses: explosive.epData.dosesPerUnit,
          showHeader: true,
        }
      : undefined;

    const areaEffect: MessageAreaEffectData | undefined =
      explosive.areaEffect === AreaEffectType.Centered
        ? {
            type: explosive.areaEffect,
            dvReduction: centeredReduction || -2,
            templateIDs,
            angle:
              demolition?.type === Demolition.ShapeCentered
                ? demolition.angle
                : undefined,
          }
        : explosive.areaEffect === AreaEffectType.Uniform
        ? {
            type: explosive.areaEffect,
            radius: uniformBlastRadius || explosive.areaEffectRadius || 1,
            templateIDs,
          }
        : undefined;

    const { _id } = await this.message.createSimilar({
      areaEffect,
      damage,
      attackTraitInfo,
      substanceUse,
    });

    this.getUpdater('explosiveUse').commit({ state: ['detonated', _id] });
  }

  private async reclaim() {
    pickOrDefaultCharacter(async (character) => {
      const { explosive } = this;
      const [sameExplosive] = pipe(
        [character.items.get(explosive.id), ...character.items.values()],
        compact,
        flatMap((i) =>
          i.type === explosive.type && i.isSameAs(explosive) ? i : [],
        ),
      );
      if (sameExplosive) await sameExplosive.setQuantity((val) => val + 1);
      else {
        const copy = explosive.getDataCopy();
        copy.data.quantity = 1;
        await character.itemOperations.add(copy);
      }

      this.getUpdater('explosiveUse').commit({
        state: ['reclaimed', character.actor.tokenOrLocalInfo.name],
      });
    });
  }

  private editSettings() {
    ExplosiveSettingsForm.openWindow({
      explosive: this.explosive,
      initialSettings: this.explosiveUse,
      requireSubmit: true,
      update: createPipe(
        prop('detail'),
        this.getUpdater('explosiveUse').commit,
      ),
    });
  }

  private attemptDefusal() {
    // TODO check
  }

  render() {
    const { editable } = this.message;
    const { state, trigger, duration } = this.explosiveUse;

    // TODO change trigger and durations
    return html`
      <div class="info">
        <sl-group label=${localize('trigger')}
          >${localize(trigger.type)}</sl-group
        >
        <mwc-icon-button
          icon="edit"
          @click=${this.editSettings}
        ></mwc-icon-button>
      </div>
      ${state
        ? this.renderExplosiveState(state)
        : html`
            <div class="actions">
              ${editable
                ? html`
                    <mwc-button dense class="detonate" @click=${this.detonate}
                      >${localize('detonate')}</mwc-button
                    >
                    <mwc-button dense class="reclaim" @click=${this.reclaim}
                      >${localize('reclaim')}</mwc-button
                    >
                  `
                : ''}
              <mwc-button dense class="defuse" @click=${this.attemptDefusal}
                >${localize('defuse')}</mwc-button
              >
            </div>
          `}
    `;
  }

  private renderExplosiveState([type, idOrName]: UsedExplosiveState) {
    // TODO link to generated message
    return html` <p class="state">${localize(type)}</p> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'message-explosive': MessageExplosive;
  }
}

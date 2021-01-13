import {
  createMessage,
  MessageVisibility,
  rollModeToVisibility,
} from '@src/chat/create-message';
import type { SuccessTestMessage } from '@src/chat/message-data';
import {
  attachWindow,
  WindowController,
} from '@src/components/window/window-controls';
import { ResizeOption } from '@src/components/window/window-options';
import { AptitudeType, PoolType } from '@src/data-enums';
import type { ActorEP, MaybeToken } from '@src/entities/actor/actor';
import type { Ego } from '@src/entities/actor/ego';
import type { Character } from '@src/entities/actor/proxies/character';
import { ActorType } from '@src/entities/entity-types';
import {
  Action,
  ActionType,
  createAction,
  defaultCheckActionSubtype,
  updateAction,
} from '@src/features/actions';
import {
  matchesAptitude,
  Source,
  SuccessTestEffect,
} from '@src/features/effects';
import { stringID } from '@src/features/feature-helpers';
import { Pool, PreTestPoolAction } from '@src/features/pool';
import { localize } from '@src/foundry/localization';
import { overlay } from '@src/init';
import { debounce } from '@src/utility/decorators';
import { LazyGetter } from 'lazy-get-decorator';
import { html } from 'lit-html';
import { compact, equals, map } from 'remeda';
import { traverseActiveElements } from 'weightless';
import {
  PreTestPool,
  rollSuccessTest,
  SuccessTestModifier,
  successTestTargetClamp,
} from './success-test';

export type AptitudeCheckInit = {
  ego: Ego;
  aptitude?: AptitudeType;
  character?: Character;
  token?: MaybeToken;
  action?: Action;
};

type WinState = {
  unsub?: () => void;
  called: boolean;
  controller?: WindowController<{ check: AptitudeCheck }>;
  open?: (actor: ActorEP | null) => void;
  readonly relative: Element | null;
  cleanup: () => void;
};

export class AptitudeCheck  {
  readonly ego;
  readonly character;
  readonly token;
  readonly state: {
    aptitude: AptitudeType;
    multiplier: number;
    visibility: MessageVisibility;
    autoRoll: boolean;
  };
  readonly action: Action;

  private subs = new Set<(test: this) => void>();

  readonly activeEffects = new WeakSet<SuccessTestEffect>();
  activePool: PreTestPool = null;
  modifiers = new Set<SuccessTestModifier>();

  constructor({ ego, aptitude, character, token, action }: AptitudeCheckInit) {
    this.ego = ego;
    this.character = character;
    this.token = token;

    this.state = this.createNotifying({
      aptitude: aptitude || AptitudeType.Willpower,
      multiplier: 3,
      visibility: rollModeToVisibility(game.settings.get('core', 'rollMode')),
      autoRoll: true,
    });

    this.action = this.createNotifying(
      action ??
        createAction({
          type: ActionType.Automatic,
          subtype: defaultCheckActionSubtype(this.state.aptitude),
        }),
    );
  }

  toggleModifier = (modifier: SuccessTestModifier) => {
    this.modifiers.delete(modifier) || this.modifiers.add(modifier);
    this.notify();
  };

  toggleActivePool = (active: AptitudeCheck['activePool']) => {
    this.togglePoolBonus();
    this.activePool = equals(active, this.activePool) ? null : active;
    this.togglePoolBonus();

    this.notify();
  };

  private togglePoolBonus() {
    if (this.activePool?.[1] === PreTestPoolAction.Bonus) {
      this.toggleModifier(this.activePool[0].testModifier);
    }
  }

  toggleActiveEffect = (effect: SuccessTestEffect) => {
    this.activeEffects.delete(effect) || this.activeEffects.add(effect);
    this.notify();
  };

  get aptitudeTotal() {
    const { aptitude, multiplier } = this.state;
    return Math.round(this.ego.aptitudes[aptitude] * multiplier);
  }

  get linkedPool() {
    return Pool.linkedToAptitude(this.state.aptitude);
  }

  get pools() {
    const pools: Pool[] = [];
    if (!this.character) return pools;
    const poolMap = this.character.pools;
    if (this.ego.useThreat) {
      const threat = poolMap.get(PoolType.Threat);
      if (threat) pools.push(threat);
    } else {
      pools.push(
        ...compact([poolMap.get(this.linkedPool), poolMap.get(PoolType.Flex)]),
      );
    }
    return pools;
  }

  get modifierEffects() {
    return new Map(
      (
        this.character?.appliedEffects.getMatchingSuccessTestEffects(
          matchesAptitude(this.state.aptitude)(this.action),
          false,
        ) ?? []
      ).map((effect) => [
        effect,
        !effect.requirement || this.activeEffects.has(effect),
      ]),
    );
  }

  get ignoreMods() {
    return this.activePool?.[1] === PreTestPoolAction.IgnoreMods;
  }

  get target() {
    return this.aptitudeTotal + (this.ignoreMods ? 0 : this.totalModifiers);
  }

  get clampedTarget() {
    return successTestTargetClamp(this.target);
  }

  get totalModifiers() {
    return (
      [...this.modifierEffects].reduce(
        (accum, [effect, active]) => accum + (active ? effect.modifier : 0),
        0,
      ) + [...this.modifiers].reduce((accum, { value }) => accum + value, 0)
    );
  }

  get messageData(): SuccessTestMessage {
    const { ignoreMods, clampedTarget } = this;
    const parts: SuccessTestModifier[] = [
      {
        name: `${localize(this.state.aptitude)} x${this.state.multiplier}`,
        value: this.aptitudeTotal,
      },
    ];
    if (!ignoreMods) {
      parts.push(
        ...[...this.modifierEffects].flatMap(
          ([effect, active]) =>
            active ? { name: effect[Source], value: effect.modifier } : [],
          ...this.modifiers,
        ),
      );
    }
    return {
      parts,
      states: [
        {
          target: clampedTarget,
          ...(this.state.autoRoll
            ? rollSuccessTest({ target: this.target })
            : {}),
          action: this.activePool
            ? [this.activePool[0].type, this.activePool[1]]
            : 'initial',
        },
      ],
      ignoredModifiers: ignoreMods ? this.totalModifiers : undefined,
      linkedPool: this.linkedPool,
    };
  }

  updateState = (newState: Partial<AptitudeCheck['state']>) => {
    Object.assign(this.state, newState);
    if (newState.aptitude) this.activePool = null;
  };

  updateAction = (newAction: Partial<Action>) => {
    Object.assign(this.action, updateAction(this.action, newAction));
    if (this.action.timeMod) {
      const { timeMod } = this.action;
      const { modifierFromAction } = this;
      modifierFromAction.value = timeMod < 0 ? timeMod * 20 : timeMod * 10;
      modifierFromAction.name = `${localize(
        timeMod < 0 ? 'rushing' : 'takingTime',
      )} x${Math.abs(timeMod)}`;
      this.modifiers.add(modifierFromAction);
    } else this.modifiers.delete(this.modifierFromAction);
  };

  @LazyGetter()
  private get modifierFromAction(): SuccessTestModifier {
    return { name: '', value: 0 };
  }

  subscribe(cb: (test: this) => void) {
    this.subs.add(cb);
    cb(this);
    return () => void this.subs.delete(cb)
  }

  @debounce(50)
  private notify() {
    for (const callback of this.subs) {
      callback(this)
    }
  }

  private createNotifying<T extends { [key: string]: unknown }>(obj: T) {
    return new Proxy(
      { ...obj },
      {
        set: (obj, prop, value) => {
          const set = Reflect.set(obj, prop, value);
          this.notify();
          return set;
        },
      },
    );
  }

  private static winStates = new WeakMap<ActorEP, WinState>();

  static openWindow(aptitude: AptitudeType, actor: ActorEP) {
    const state = this.winStates.get(actor);
    if (state) {
      state.called = true;
      state.open?.(actor);
    } else {
      const state: WinState = {
        called: true,
        cleanup() {
          AptitudeCheck.winStates.delete(actor);
          this.unsub?.();
          delete this.controller;
        },
        get relative() {
          return this.called ? traverseActiveElements() : null;
        },
      };
      AptitudeCheck.winStates.set(actor, state);

      state.open = (actor: ActorEP | null) => {
        if (actor?.proxy.type !== ActorType.Character) {
          state.controller?.win.close();
          return;
        }
        const { proxy: character } = actor;
        const check = new AptitudeCheck({
          ego: character.ego,
          aptitude,
          character,
        });

        if (!state.controller) {
          state.controller = attachWindow({
            name: `${localize('successTest')} - ${localize('aptitudeCheck')}`,
            resizable: ResizeOption.Vertical,
            renderTemplate: ({ check }) => html`
              <aptitude-check-controls
                .test=${check}
                @test-completed=${async () => {
                  state.controller?.win.close();
                  // TODO pools and actions and other nonsense
                  await createMessage({
                    data: {
                      header: {
                        heading: `${localize(
                          'FULL',
                          check.state.aptitude,
                        )} ${localize('check')}`,
                        subheadings: [
                          map(
                            [check.action.type, check.action.subtype, 'action'],
                            localize,
                          ).join(' '),
                        ],
                      },
                      successTest: check.messageData,
                    },
                    entity: character,
                    visibility: check.state.visibility,
                  });
                  const pool = check.activePool?.[0];
                  if (pool) character.spendPool({ pool: pool.type, points: 1 });
                }}
              ></aptitude-check-controls>
            `,
            renderProps: { check },
            cleanup: () => state.cleanup(),
            relativeElement: state.relative,
          });
        } else {
          state.controller.update({
            renderProps: { check },
            relativeElement: state.relative,
          });
        }
        state.called = false;
      };

      state.unsub = actor.subscribe(state.open);
    }
  }
}

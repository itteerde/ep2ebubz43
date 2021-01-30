import { createMessage, MessageVisibility } from '@src/chat/create-message';
import {
  CombatActionType,
  CombatParticipant,
  LimitedAction,
  rollParticipantInitiative,
  TrackedCombatEntity,
  updateCombatState,
} from '@src/combat/combat-tracker';
import { ActorType } from '@src/entities/entity-types';
import { conditionIcons } from '@src/features/conditions';
import { readyCanvas } from '@src/foundry/canvas';
import { MutateEvent, mutatePlaceableHook } from '@src/foundry/hook-setups';
import { localize } from '@src/foundry/localization';
import { openMenu } from '@src/open-menu';
import produce from 'immer';
import { customElement, LitElement, property, html, PropertyValues } from 'lit-element';
import { compact, equals } from 'remeda';
import styles from './participant-item.scss';

@customElement('participant-item')
export class ParticipantItem extends LitElement {
  static get is() {
    return 'participant-item' as const;
  }

  static get styles() {
    return [styles];
  }

  @property({ attribute: false }) participant!: CombatParticipant;

  @property({ type: Number }) limitedAction?: LimitedAction | null;

  @property({ type: Boolean, reflect: true }) active = false;

  @property({ type: Number }) round = 0;

  @property({ type: Number }) turn = 0;

  private tokenLinked = false;
  
  updated(changedProps: PropertyValues<this>) {
    const previous = changedProps.get("participant") as CombatParticipant | undefined;
    if (!equals(previous?.entityIdentifiers, this.participant.entityIdentifiers)) {
      const { entityIdentifiers } = this.participant;
      if (entityIdentifiers?.type === TrackedCombatEntity.Token) {
        // mutatePlaceableHook({
        //   entity: Token,
        //   hook: "on",
        //   event: MutateEvent.Update
        // })
      }
    }
    super.updated(changedProps)
  }

  private get editable() {
    return (
      game.user.isGM ||
      (this.participant.actor?.owner ??
        this.participant.userId === game.user.id)
    );
  }

  private openMenu() {
    if (!this.editable) return;
    const modifiedRoundActions = this.participant.modifiedTurn?.[this.round];
    openMenu({
      header: { heading: this.participant.name },
      content: compact([
        ...(this.participant.actor?.proxy.type === ActorType.Character &&
        this.round
          ? [
              // TODO Use pools to modify action
              {
                label: localize('takeTheInitiative'),
                disabled: !!modifiedRoundActions?.tookInitiative || !!this.turn,
                callback: () =>
                  updateCombatState({
                    type: CombatActionType.UpdateParticipants,
                    payload: [
                      {
                        id: this.participant.id,
                        modifiedTurn: produce(
                          this.participant.modifiedTurn ?? {},
                          (draft) => {
                            draft[this.round] = {
                              ...(draft[this.round] || {}),
                              tookInitiative: LimitedAction.Mental,
                            };
                          },
                        ),
                      },
                    ],
                  }),
              },
              {
                label: localize('takeExtraAction'),
                disabled: modifiedRoundActions?.extraActions?.length === 2,
                callback: () => {
                  updateCombatState({
                    type: CombatActionType.UpdateParticipants,
                    payload: [
                      {
                        id: this.participant.id,
                        modifiedTurn: produce(
                          this.participant.modifiedTurn ?? {},
                          (draft) => {
                            const actions = draft[this.round]?.extraActions;
                            draft[this.round] = {
                              ...(draft[this.round] || {}),
                              extraActions:
                                actions?.length === 1
                                  ? [...actions, LimitedAction.Physical]
                                  : [LimitedAction.Physical],
                            };
                          },
                        ),
                      },
                    ],
                  });
                },
              },
            ]
          : []),
        {
          label: `${localize(
            this.participant.initiative == null ? 'roll' : 'reRoll',
          )} ${localize('initiative')}`,
          callback: () => this.rollInitiative(),
        },
        {
          label: localize('delete'),
          callback: () =>
            updateCombatState({
              type: CombatActionType.RemoveParticipants,
              payload: [this.participant.id],
            }),
        },
      ]),
    });
  }

  private async rollInitiative() {
    updateCombatState({
      type: CombatActionType.UpdateParticipants,
      payload: [await rollParticipantInitiative(this.participant)],
    });
  }

  private iconClick() {
    const token =
      this.participant.token ??
      this.participant.actor?.getActiveTokens(true)[0];
    if (token) {
      token.control({ releaseOthers: true });
      readyCanvas()?.animatePan({ x: token.x, y: token.y } as any);
    }
  }

  private openActorSheet() {
    this.participant.actor?.sheet.render(true);
  }

  render() {
    const { participant } = this;
    const { editable } = this;
    const { token, actor } = participant;
    return html`
      <wl-list-item @contextmenu=${this.openMenu}>
        <mwc-icon-button
          slot="before"
          ?disabled=${!editable || !token}
          @click=${this.iconClick}
          ><img
            src=${token?.data.img || actor?.data.img || CONST.DEFAULT_TOKEN}
        /></mwc-icon-button>
        <button
          class="name"
          ?disabled=${!editable || !actor}
          @click=${this.openActorSheet}
        >
          ${participant.name}
        </button>
        <span class="status">
          ${actor?.conditions.map(
            (condition) => html`
              <img
                src=${conditionIcons[condition]}
                title=${localize(condition)}
                height="14px"
              />
            `,
          )}
        </span>
        ${participant.initiative
          ? html` <span slot="after">${participant.initiative}</span> `
          : editable
          ? html`
              <mwc-icon-button slot="after" @click=${this.rollInitiative}
                ><img src="icons/svg/d20.svg"
              /></mwc-icon-button>
            `
          : html` <span slot="after"> - </span> `}
      </wl-list-item>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'participant-item': ParticipantItem;
  }
}

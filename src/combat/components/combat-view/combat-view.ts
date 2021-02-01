import {
  CombatActionType,
  CombatData,
  CombatParticipant,
  CombatRound,
  CombatRoundPhases,
  findViableParticipantTurn,
  rollParticipantInitiative,
  RoundPhase,
  setupCombatRound,
  setupPhases,
  updateCombatState,
} from '@src/combat/combat-tracker';
import { openWindow } from '@src/components/window/window-controls';
import { ResizeOption } from '@src/components/window/window-options';
import { localize } from '@src/foundry/localization';
import { gameSettings } from '@src/init';
import { notEmpty } from '@src/utility/helpers';
import {
  customElement,
  html,
  internalProperty,
  LitElement,
  PropertyValues,
} from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { repeat } from 'lit-html/directives/repeat';
import { equals, findIndex, range } from 'remeda';
import '../participant-item/participant-item';
import type { ParticipantItem } from '../participant-item/participant-item';
import '../participant-selector/participant-selector';
import styles from './combat-view.scss';

@customElement('combat-view')
export class CombatView extends LitElement {
  static get is() {
    return 'combat-view' as const;
  }

  static get styles() {
    return [styles];
  }

  private unsub: (() => void) | null = null;

  @internalProperty() private combatState: CombatData | null = null;

  @internalProperty() private playerTurnControls = false;

  private participants: CombatParticipant[] = [];

  private combatRound?: CombatRound | null;

  private activeTurn?: number;

  private intObs: IntersectionObserver | null = null;

  static openWindow() {
    openWindow(
      {
        key: CombatView,
        name: localize('combat'),
        content: html`<combat-view></combat-view>`,
      },
      { resizable: ResizeOption.Vertical },
    );
  }

  async connectedCallback() {
    this.unsub = gameSettings.combatState.subscribe((newState) => {
      const { combatState } = this;

      const changedParticipants = !equals(
        combatState?.participants,
        newState.participants,
      );

      this.participants = newState.participants;

      if (newState.round !== combatState?.round) {
        this.combatRound = null;
      }

      const changedRound = changedParticipants || !this.combatRound;

      if (changedRound) {
        this.combatRound = setupCombatRound(this.participants, newState.round);
      }

      if (
        changedRound ||
        combatState?.turn !== newState.turn ||
        combatState.goingBackwards !== newState.goingBackwards ||
        combatState.skipDefeated !== newState.skipDefeated
      ) {
        const {
          turn: turn = 0,
          goingBackwards,
          skipDefeated = false,
        } = newState;
        this.activeTurn = findViableParticipantTurn({
          participants: this.combatRound?.participants ?? [],
          startingTurn: turn,
          goingBackwards,
          skipDefeated,
          exhaustive: true,
        });
      }

      this.combatState = newState;
    });
    super.connectedCallback();
    this.intObs = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (entry.intersectionRatio < 0.95) {
            entry.target.scrollIntoView({ behavior: 'smooth' });
          }
          observer.unobserve(entry.target);
        }
      },
      { root: this },
    );
  }

  disconnectedCallback() {
    this.combatState = null;
    this.unsub?.();
    this.unsub = null;
    this.intObs?.disconnect();
    super.disconnectedCallback();
  }

  updated(changedProps: PropertyValues<this>) {
    requestAnimationFrame(() => {
      const active = this.renderRoot.querySelector<ParticipantItem>(
        'participant-item[active]',
      );
      if (active) this.intObs?.observe(active);
      this.playerTurnControls = !game.user.isGM && !!active?.editable;
    });
    super.updated(changedProps);
  }

  private advanceTurn() {
    const { phase = RoundPhase.Normal, phaseTurn: turn = 0 } =
      this.roundState ?? {};

    const next = this.phases?.[phase][turn + 1];
    if (next) {
      updateCombatState({
        type: CombatActionType.UpdateRound,
        payload: {
          round: this.combatState?.round || 0,
          phase,
          turn: turn + 1,
          goingBackwards: false,
        },
      });
      return;
    }
    for (const nextPhase of [RoundPhase.Normal, RoundPhase.ExtraActions].filter(
      (n) => n > phase,
    )) {
      const next = this.phases?.[nextPhase][0];
      if (next) {
        updateCombatState({
          type: CombatActionType.UpdateRound,
          payload: {
            round: this.combatState?.round || 0,
            phase: nextPhase,
            turn: 0,
            goingBackwards: false,
          },
        });
        return;
      }
    }
    this.advanceRound();
  }

  private advanceRound() {
    updateCombatState({
      type: CombatActionType.UpdateRound,
      payload: {
        round: (this.combatState?.round || 0) + 1,
        phase: RoundPhase.Normal,
        turn: 0,
        goingBackwards: false,
      },
    });
  }

  private previousRound() {
    let turn = 0;
    let phase = RoundPhase.ExtraActions;

    updateCombatState({
      type: CombatActionType.UpdateRound,
      payload: {
        round: (this.combatState?.round || 1) - 1,
        phase,
        turn: turn,
        goingBackwards: true,
      },
    });
  }

  private previousTurn() {
    const turn = findViableParticipantTurn({
      participants: this.combatRound?.participants ?? [],
      skipDefeated: this.combatState?.skipDefeated ?? false,
      goingBackwards: true,
      exhaustive: false,
      startingTurn: this.activeTurn ?? 0,
    });

    if (turn >= 0) {
      updateCombatState({
        type: CombatActionType.UpdateRound,
        payload: {
          goingBackwards: true,
          round: this.combatState?.round ?? 0,
          turn,
        },
      });
    } else this.previousRound();
  }

  private reset() {
    // TODO dialog
    updateCombatState({ type: CombatActionType.Reset });
  }

  private async rollAllInitiatives() {
    const payload: { id: string; initiative: number }[] = [];
    for (const participant of this.participants) {
      if (participant.initiative == null) {
        payload.push(await rollParticipantInitiative(participant));
      }
    }
    if (notEmpty(payload)) {
      updateCombatState({
        type: CombatActionType.UpdateParticipants,
        payload,
      });
    }
  }

  render() {
    const { round = 0 } = this.combatState ?? {};
    const { isGM } = game.user;
    const { combatRound, activeTurn = -1 } = this;
    const { participants = [], someTookInitiative, extraActions } =
      combatRound ?? {};
    const noPrevTurn = round <= 1 && activeTurn <= 0;
    return html`
      <header>
        ${isGM
          ? html`
              <mwc-icon-button
                @click=${this.rollAllInitiatives}
                ?disabled=${this.participants.every(
                  (p) => p.initiative != null,
                )}
                icon="casino"
              ></mwc-icon-button>
            `
          : ''}
        ${round ? html` <h2>${localize('round')} ${round}</h2> ` : ''}
        <sl-popover
          .renderOnDemand=${() =>
            html`<participant-selector></participant-selector>`}
        >
          <mwc-icon-button slot="base" icon="add"></mwc-icon-button>
        </sl-popover>
      </header>
      <sl-animated-list class="combat-round" transformOrigin="top">
        ${someTookInitiative
          ? html`<li class="label">
              ${localize('took')} ${localize('initiative')}
            </li>`
          : ''}
        ${repeat(
          participants,
          ({ participant, extra }) => participant.id + extra?.id,
          ({ participant, tookInitiative, extra }, index) => {
            return html`
              <participant-item
                class=${classMap({
                  'took-initiative': !!tookInitiative,
                  extra: !!extra,
                })}
                .participant=${participant}
                round=${round}
                ?active=${activeTurn === index}
                turn=${activeTurn}
                .tookInitiativePool=${tookInitiative}
                .extraActionPool=${extra?.pool}
                ?hidden=${!isGM && !!participant.hidden}
              ></participant-item>
            `;
          },
        )}
      </sl-animated-list>

      <footer>
        ${isGM
          ? html`
              <mwc-icon-button
                @click=${this.previousRound}
                icon="arrow_backward"
                ?disabled=${round <= 1}
              ></mwc-icon-button>
              <mwc-icon-button
                @click=${this.previousTurn}
                icon="chevron_left"
                ?disabled=${noPrevTurn}
              ></mwc-icon-button>
              <mwc-button
                dense
                @click=${round ? this.reset : this.advanceRound}
                ?disabled=${!round && this.participants.length === 0}
                >${localize(round ? 'end' : 'start')}
                ${localize('combat')}</mwc-button
              >
              <mwc-icon-button
                @click=${this.advanceTurn}
                icon="chevron_right"
                ?disabled=${!round}
              ></mwc-icon-button>
              <mwc-icon-button
                @click=${this.advanceRound}
                icon="arrow_forward"
                ?disabled=${!round}
              ></mwc-icon-button>
            `
          : round
          ? html`
              <mwc-icon-button
                @click=${this.previousTurn}
                icon="chevron_left"
                ?disabled=${!this.playerTurnControls || noPrevTurn}
              ></mwc-icon-button>
              <mwc-button
                dense
                @click=${this.advanceTurn}
                ?disabled=${!this.playerTurnControls}
              >
                ${localize('end')} ${localize('turn')}</mwc-button
              >
              <mwc-icon-button
                @click=${this.advanceTurn}
                icon="chevron_right"
                ?disabled=${!this.playerTurnControls}
              ></mwc-icon-button>
            `
          : ''}
      </footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'combat-view': CombatView;
  }
}

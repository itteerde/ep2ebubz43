import {
  renderFormulaField,
  renderNumberField,
  renderSelectField,
  renderTimeField,
} from '@src/components/field/fields';
import {
  renderAutoForm,
  renderSubmitForm,
  renderUpdaterForm,
} from '@src/components/form/forms';
import { UseWorldTime } from '@src/components/mixins/world-time-mixin';
import { enumValues, RechargeType } from '@src/data-enums';
import type { Character } from '@src/entities/actor/proxies/character';
import { addFeature, StringID } from '@src/features/feature-helpers';
import {
  ActiveRecharge,
  createTemporaryFeature,
} from '@src/features/temporary';
import { CommonInterval, currentWorldTimeMS } from '@src/features/time';
import { localize } from '@src/foundry/localization';
import { rollFormula } from '@src/foundry/rolls';
import { notEmpty } from '@src/utility/helpers';
import { customElement, html, LitElement, property, state } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import mix from 'mix-with/lib';
import styles from './character-view-recharge.scss';

@customElement('character-view-recharge')
export class CharacterViewRecharge extends mix(LitElement).with(UseWorldTime) {
  static get is() {
    return 'character-view-recharge' as const;
  }

  static styles = [styles];

  @property({ attribute: false }) character!: Character;

  @state() rechargeType = RechargeType.Short;

  render() {
    const { disabled, pools, updater, activeRecharge } = this.character;
    return html`
      <character-view-drawer-heading
        >${localize('recharge')}</character-view-drawer-heading
      >
      ${activeRecharge
        ? this.renderRechargeCompletion(activeRecharge)
        : html`
            <div class="recharge-init">
              ${renderAutoForm({
                props: { recharge: this.rechargeType },
                update: ({ recharge }) => {
                  if (recharge) this.rechargeType = recharge;
                },
                fields: ({ recharge }) =>
                  renderSelectField(recharge, enumValues(RechargeType), {
                    altLabel: (type) => localize('SHORT', type),
                  }),
              })}
              ${this.renderRechargeForm()}
            </div>
          `}
      ${notEmpty(pools)
        ? html`<fieldset>
            <legend>
              ${localize('spentPools')}
              <span class="total-spent"
                >${this.character.pools.totalSpent}</span
              >
            </legend>
            ${renderUpdaterForm(updater.path('system', 'spentPools'), {
              disabled,
              fields: (spent) =>
                [...pools].map(([pool, { max, spent: clampedSpent }]) =>
                  renderNumberField(
                    { ...spent[pool], value: clampedSpent },
                    { min: 0, max },
                  ),
                ),
            })}
          </fieldset>`
        : ''}
      ${enumValues(RechargeType).map(this.renderRechargeFields)}
    `;
  }

  private renderRechargeFields = (type: RechargeType) => {
    const recharge = this.character.recharges[type];
    const { timer, taken, max } = recharge;
    return html`
      <fieldset class="recharge-field">
        <legend>${localize(type)}</legend>
        ${renderAutoForm({
          disabled: this.character.disabled,
          props: { taken, refreshIn: timer.remaining },
          update: ({ taken, refreshIn }) => {
            this.character.updater.path('system', type).commit({
              taken,
              refreshStartTime:
                typeof refreshIn === 'number'
                  ? currentWorldTimeMS() - (CommonInterval.Day - refreshIn)
                  : undefined,
            });
          },
          fields: ({ taken, refreshIn }) => [
            renderNumberField(taken, { min: 0, max }),
            taken.value
              ? renderTimeField(refreshIn, {
                  min: 0,
                  whenZero: '0',
                })
              : '',
          ],
        })}
      </fieldset>
    `;
  };

  private renderRechargeCompletion(activeRecharge: StringID<ActiveRecharge>) {
    return html`
      <character-view-recharge-completion
        .activeRecharge=${activeRecharge}
        .character=${this.character}
      ></character-view-recharge-completion>
    `;
  }

  private renderRechargeForm() {
    const recharge = this.character.recharges[this.rechargeType];
    const { psi } = this.character;

    return renderSubmitForm({
      submitEmpty: true,
      submitButtonText: localize('start'),
      props: recharge.startInfo,
      update: async (changed, original) => {
        const { timeframe, formula } = { ...original, ...changed };
        const regainedPoints = (await rollFormula(formula))?.total || 0;
        await this.character.updater.path('system', 'temporary').commit(
          addFeature(
            createTemporaryFeature.activeRecharge({
              rechargeType: recharge.type,
              regainedPoints,
              duration: timeframe,
            }),
          ),
        );
        if (timeframe === 0) {
          await this.requestUpdate();
          requestAnimationFrame(() => {
            this.renderRoot
              .querySelector<HTMLElement>('.active-recharge')
              ?.click();
          });
        }
      },
      fields: ({ timeframe, formula }) => [
        renderTimeField(timeframe, { whenZero: localize('instant') }),
        recharge.type === RechargeType.Short
          ? renderFormulaField({
              ...formula,
              label: localize('poolsRegained'),
            })
          : html`<p>${localize('regainAllPools')}</p>`,
        psi?.hasVariableInfection
          ? html`
              <ul>
                <li
                  class="infection-easing ${classMap({
                    disabled: psi.hasActiveInfluences,
                  })}"
                  title=${psi.hasActiveInfluences
                    ? `🚫 ${localize('active')} ${localize('psiInfluence')}`
                    : ''}
                >
                  ${recharge.type === RechargeType.Short
                    ? `
                ${localize('ease')} ${localize('infectionRating')} ${localize(
                        'by',
                      )} 10 (${localize('minimum')} ${psi.baseInfectionRating})
                `
                    : `
                ${localize('set')} ${localize('infectionRating')} ${localize(
                        'to',
                      )} ${psi.baseInfectionRating}
                `}
                </li>
                ${psi.receded
                  ? html`
                      <li>
                        ${localize('lose')} ${localize('influence')}
                        ${localize('effect')} ${localize('immunity')}
                      </li>
                    `
                  : ''}
              </ul>
            `
          : '',
      ],
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'character-view-recharge': CharacterViewRecharge;
  }
}

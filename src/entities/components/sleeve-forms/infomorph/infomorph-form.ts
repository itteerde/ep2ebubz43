import {
  renderFormulaField,
  renderNumberField,
  renderTextField,
  renderTimeField,
} from '@src/components/field/fields';
import { renderAutoForm, renderUpdaterForm } from '@src/components/form/forms';
import { enumValues, PoolType } from '@src/data-enums';
import type { Infomorph } from '@src/entities/actor/proxies/infomorph';
import { localize } from '@src/foundry/localization';
import {
  createHealthModification,
  formatHealthModificationMode,
  HealthModificationMode,
} from '@src/health/health';
import { DotOrHotTarget } from '@src/health/recovery';
import { tooltip } from '@src/init';
import { notEmpty } from '@src/utility/helpers';
import { customElement, property, html } from 'lit-element';
import { sortBy } from 'remeda';
import { SleeveFormBase } from '../sleeve-form-base';
import styles from './infomorph-form.scss';

@customElement('infomorph-form')
export class InfomorphForm extends SleeveFormBase {
  static get is() {
    return 'infomorph-form' as const;
  }

  static styles = [styles];

  @property({ attribute: false }) infomorph!: Infomorph;

  render() {
    const {
      updater,
      disabled,
      itemGroups,
      pools,
      meshHealth,
      description,
    } = this.infomorph;

    return html`
      <entity-form-layout noSidebar>
        <div slot="details">
          <sleeve-form-acquisition
            .updateActions=${updater.prop('data', 'acquisition')}
            ?disabled=${disabled}
          ></sleeve-form-acquisition>
          <sleeve-form-pools
            .poolData=${pools}
            .poolBonuses=${itemGroups.effects.poolBonuses}
            ?disabled=${disabled}
            .editFn=${this.setDrawerFromEvent(this.renderPoolEdit)}
          ></sleeve-form-pools>

          <section>
            <sl-header heading=${localize('meshHealth')}>
              <mwc-icon-button
                slot="action"
                icon="change_history"
                @click=${this.setDrawerFromEvent(
                  this.renderHealthChangeHistory,
                  false,
                )}
              ></mwc-icon-button>
            </sl-header>
            <health-item
              clickable
              ?disabled=${disabled}
              .health=${meshHealth}
              @click=${this.setDrawerFromEvent(this.renderMeshHealthEdit)}
            ></health-item>
          </section>

          <section>
            <sl-header heading="${localize('traits')} & ${localize('ware')}">
              <mwc-icon
                slot="action"
                icon="info"
                data-tooltip=${localize('DESCRIPTIONS', 'AddItemInfo')}
                @mouseover=${tooltip.readData}
                >info</mwc-icon
              >
            </sl-header>

            ${notEmpty(itemGroups.traits)
              ? html`
                  <ul class="item-list">
                    <li class="label">${localize('traits')}:</li>
                    ${sortBy(itemGroups.traits, (t) => t.fullName).map(
                      (trait, index, list) => html` <li>${trait.fullName.trim()}</li>${index < list.length - 1 ? "," : ""} `,
                    )}
                  </ul>
                `
              : ''}
          </section>
        </div>
        <editor-wrapper
          slot="description"
          ?disabled=${disabled}
          .updateActions=${updater.prop('data', 'description')}
        ></editor-wrapper>
        ${this.renderDrawerContent()}
      </entity-form-layout>
    `;
  }

  private renderHealthChangeHistory() {
    const { meshHealth, disabled } = this.infomorph;
    return html`
      <section class="history">
        <h3>${localize('history')}</h3>
        <mwc-list>
          ${meshHealth.log.map(
            ({ mode, damage, wounds, source, timestamp }) => html`
              <mwc-list-item twoline noninteractive>
                <span
                  ><span class="change-source">[${source}]</span>
                  ${formatHealthModificationMode(mode)}</span
                >
                <span slot="secondary"
                  >${damage} ${meshHealth.main.damage.label}, ${wounds}
                  ${meshHealth.wound?.wounds.label} -
                  <time>${timeSince(timestamp)}</time></span
                >
              </mwc-list-item>
            `,
          )}
        </mwc-list>
        ${notEmpty(meshHealth.log)
          ? html`
              <delete-button
                data-tooltip="${localize('delete')} ${localize('history')}"
                @mouseover=${tooltip.readData}
                @focus=${tooltip.readData}
                @delete=${() => meshHealth.resetLog()}
                ?disabled=${disabled}
              ></delete-button>
            `
          : ''}
      </section>
    `;
  }

  private renderMeshHealthEdit() {
    const { meshHealth, updater } = this.infomorph;
    return html`
      <h3>${localize('meshHealth')}</h3>
      ${renderUpdaterForm(updater.prop('data', 'meshHealth'), {
        fields: ({ baseDurability }) =>
          renderNumberField(baseDurability, { min: 1 }),
      })}
      ${renderAutoForm({
        classes: 'health-state',
        props: meshHealth.data,
        update: ({
          damage = meshHealth.data.damage,
          wounds = meshHealth.data.wounds,
        }) =>
          meshHealth.applyModification(
            createHealthModification({
              mode: HealthModificationMode.Edit,
              damage,
              wounds,
              source: localize('form'),
            }),
          ),
        fields: ({ damage, wounds }) => [
          renderNumberField(damage, { min: 0 }),
          renderNumberField(wounds, { min: 0 }),
        ],
      })}
      ${enumValues(DotOrHotTarget).map(
        (target) => html`
          ${renderUpdaterForm(
            updater
              .prop('data', 'meshHealth')
              .nestedStore()
              .prop('hot', target),
            {
              classes: 'auto-heal-form',
              fields: ({ amount, interval }) => html`
                <p>${localize(target)} ${localize('repair')}</p>

                ${[
                  renderTimeField(interval),
                  interval.value ? renderFormulaField(amount) : '',
                ]}
              `,
            },
          )}
        `,
      )}
    `;
  }

  private renderPoolEdit() {
    return html`
      <h3>${localize('pools')}</h3>
      ${renderUpdaterForm(this.infomorph.updater.prop('data', 'pools'), {
        fields: (pools) =>
          enumValues(PoolType).map((type) =>
            type === PoolType.Threat
              ? ''
              : renderNumberField(pools[type], { min: 0 }),
          ),
      })}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'infomorph-form': InfomorphForm;
  }
}

import {
  emptyValue,
  renderNumberField,
  renderSelectField,
  renderTextField,
} from '@src/components/field/fields';
import { renderUpdaterForm } from '@src/components/form/forms';
import { DeviceType, enumValues, FabType, PhysicalWare } from '@src/data-enums';
import { entityFormDetailsStyles } from '@src/entities/components/form-layout/entity-form-details-style';
import type { PhysicalTech } from '@src/entities/item/proxies/physical-tech';
import { localize } from '@src/foundry/localization';
import { tooltip } from '@src/init';
import { customElement, property, html } from 'lit-element';
import { type } from 'remeda';
import { ItemFormBase } from '../item-form-base';
import styles from './physical-tech-form.scss';

@customElement('physical-tech-form')
export class PhysicalTechForm extends ItemFormBase {
  static get is() {
    return 'physical-tech-form' as const;
  }

  static styles = [entityFormDetailsStyles, styles];

  @property({ attribute: false }) item!: PhysicalTech;

  render() {
    const { updater, embedded, isBlueprint, type, deviceType } = this.item;
    const { disabled } = this;
    return html`
      <entity-form-layout>
        <entity-form-header
          slot="header"
          .updateActions=${updater.prop('')}
          type=${localize(type)}
        >
          ${isBlueprint
            ? html` <li slot="tag">${localize('blueprint')}</li> `
            : ''}
        </entity-form-header>

        <div slot="details">
          ${deviceType ? this.renderMeshHealthSection() : ''}
        </div>

        ${renderUpdaterForm(updater.prop('data'), {
          disabled,
          slot: 'sidebar',
          fields: ({ category, wareType, deviceType, fabricator }) => [
            renderTextField(category),
            html`<entity-form-sidebar-divider></entity-form-sidebar-divider>`,
            renderSelectField(wareType, enumValues(PhysicalWare), {
              ...emptyValue,
              disabled: !!embedded,
            }),
            renderSelectField(deviceType, enumValues(DeviceType), {
              ...emptyValue,
              disabled: !!embedded,
            }),
            renderSelectField(fabricator, enumValues(FabType), emptyValue),
          ],
        })}
        ${this.renderDrawerContent()}
      </entity-form-layout>
    `;
  }

  private renderMeshHealthSection() {
    return html`
      <section>
        <sl-header heading=${localize('meshHealth')}>
          <mwc-icon-button
            slot="action"
            data-tooltip=${localize('changes')}
            @mouseover=${tooltip.fromData}
            @focus=${tooltip.fromData}
            icon="change_history"
            @click=${this.setDrawerFromEvent(
              this.renderHealthChangeHistory,
              false,
            )}
          ></mwc-icon-button>
        </sl-header>
        <health-item
          clickable
          ?disabled=${this.disabled}
          .health=${this.item.meshHealth}
          @click=${this.setDrawerFromEvent(this.renderMeshHealthEdit)}
        ></health-item>
      </section>
    `;
  }

  private renderHealthChangeHistory() {
    const { meshHealth } = this.item;
    return html`
      <section class="history">
        <h3>${localize('history')}</h3>
        <health-log
          .health=${meshHealth}
          ?disabled=${this.disabled}
        ></health-log>
      </section>
    `;
  }

  private renderMeshHealthEdit() {
    const { meshHealth, updater } = this.item;
    return html`
      <h3>${localize('meshHealth')}</h3>
      ${renderUpdaterForm(updater.prop('data', 'meshHealth'), {
        fields: ({ baseDurability }) =>
          renderNumberField(baseDurability, { min: 1 }),
      })}
      <health-state-form .health=${meshHealth}></health-state-form>
      <health-regen-settings-form
        .health=${meshHealth}
        .regenUpdater=${updater.prop('data', 'meshHealth').nestedStore()}
      ></health-regen-settings-form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'physical-tech-form': PhysicalTechForm;
  }
}

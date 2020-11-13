import { formatLabeledFormulas, formatArmorUsed } from '@src/combat/attack-formatting';
import type { ThrownWeaponAttack } from '@src/combat/attacks';
import { renderFormulaField, renderLabeledCheckbox, renderNumberField, renderTextareaField } from '@src/components/field/fields';
import { renderAutoForm, renderUpdaterForm } from '@src/components/form/forms';
import type { SlWindow } from '@src/components/window/window';
import { openWindow } from '@src/components/window/window-controls';
import { ResizeOption, SlWindowEventName } from '@src/components/window/window-options';
import { enumValues, AttackTrait } from '@src/data-enums';
import { entityFormCommonStyles } from '@src/entities/components/form-layout/entity-form-common-styles';
import { ItemType } from '@src/entities/entity-types';
import { renderItemForm } from '@src/entities/item/item-views';
import type { ThrownWeapon } from '@src/entities/item/proxies/thrown-weapon';
import { handleDrop, DropType, itemDropToItemProxy } from '@src/foundry/drag-and-drop';
import { notify, NotificationType } from '@src/foundry/foundry-apps';
import { localize } from '@src/foundry/localization';
import { tooltip } from '@src/init';
import { notEmpty } from '@src/utility/helpers';
import { customElement, html, property, PropertyValues } from 'lit-element';
import { map, mapToObj } from 'remeda';
import { complexityForm, renderComplexityFields, renderGearTraitCheckboxes } from '../common-gear-fields';
import { ItemFormBase } from '../item-form-base';
import styles from './thrown-weapon-form.scss';

@customElement('thrown-weapon-form')
export class ThrownWeaponForm extends ItemFormBase {
  static get is() {
    return 'thrown-weapon-form' as const;
  }

  static styles = [entityFormCommonStyles, complexityForm.styles, styles];

  @property({ attribute: false }) item!: ThrownWeapon;

  private coatingSheet?: SlWindow | null;

  private coatingSheetKey = {};

  disconnectedCallback() {
    this.closeCoatingSheet();
    super.disconnectedCallback();
  }

  updated(changedProps: PropertyValues) {
    if (this.coatingSheet)  this.openCoatingSheet()
    super.updated(changedProps);
  }

  private addDrop = handleDrop(async ({ ev, data }) => {
    if (this.disabled) return;
    const type = (ev.currentTarget as HTMLElement).dataset.drop;
    if (data?.type === DropType.Item) {
      const agent = await itemDropToItemProxy(data);
      if (agent?.type === ItemType.Substance) {
        if (agent.isElectronic) {
          // TODO Better error messages
          notify(
            NotificationType.Error,
            `${localize('non-electronic')} ${localize('substance')}`,
          );
        } else {
          this.item.setCoating(agent);
        }
      }
    }
  });

  private openCoatingSheet() {
    const { coating, fullName } = this.item;
    if (!coating) return this.closeCoatingSheet()
    const { win, wasConnected } = openWindow(
      {
        key: this.coatingSheetKey,
        content: renderItemForm(coating),
        adjacentEl: this,
        forceFocus: !this.coatingSheet,
        name: `[${fullName} ${localize('coating')}] ${coating.fullName}`,
      },
      { resizable: ResizeOption.Vertical },
    );
    this.coatingSheet = win;
    if (!wasConnected) {
      win.addEventListener(
        SlWindowEventName.Closed,
        () => (this.coatingSheet = null),
        { once: true },
      );
    }
  }

  private closeCoatingSheet() {
    this.coatingSheet?.close();
    this.coatingSheet = null;
  }

  private deleteCoating() {
    return this.item.removeCoating();
  }



  render() {
    const { updater, type, coating } = this.item;
    const { disabled } = this;
    // TODO Exotic Skill
    return html`
      <entity-form-layout>
        <entity-form-header
          noDefaultImg
          slot="header"
          .updateActions=${updater.prop('')}
          type=${localize(type)}
          ?disabled=${disabled}
        >
        </entity-form-header>

        ${renderUpdaterForm(updater.prop('data'), {
          disabled,
          slot: 'sidebar',
          fields: renderGearTraitCheckboxes,
        })}

        <div slot="details">

        <section>
            <sl-header heading=${localize('details')}></sl-header>
            <div class="detail-forms">
              ${renderUpdaterForm(updater.prop('data'), {
                classes: complexityForm.cssClass,
                disabled,
                fields: renderComplexityFields,
              })}
              ${renderUpdaterForm(updater.prop('data'), {
                disabled,
                classes: 'quantity-form',
                fields: ({ quantity, quantityPerCost }) => [
                  renderNumberField(quantity, { min: 0 }),
                  renderNumberField(quantityPerCost, { min: 1 }),
                ],
              })}
            </div>
          </section>

        ${this.renderAttack(this.item.attacks.primary)}

        <sl-dropzone ?disabled=${disabled} @drop=${this.addDrop}>
            <sl-header heading=${localize('coating')} ?hideBorder=${!coating}
              ><mwc-icon
                slot="info"
                data-tooltip="${localize('drop')} ${localize(
                  'non-electronic',
                )} ${localize('substance')}"
                @mouseenter=${tooltip.fromData}
                >info</mwc-icon
              ></sl-header
            >
            ${coating
              ? html`
                  <div class="addon">
                    <span class="addon-name">${coating.name}</span>
                    <span class="addon-type">${coating.fullType}</span>
                    <mwc-icon-button
                      icon="launch"
                      @click=${this.openCoatingSheet}
                    ></mwc-icon-button>
                    <delete-button
                      ?disabled=${disabled}
                      @delete=${this.deleteCoating}
                    ></delete-button>
                  </div>
                `
              : ''}
          </sl-dropzone>
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

  private renderAttack(attack: ThrownWeaponAttack) {
    return html`
      <section>
        <sl-header heading=${attack.label || localize('attack')}>
          <mwc-icon-button
            icon="edit"
            slot="action"
            ?disabled=${this.disabled}
            @click=${this.setDrawerFromEvent(
              this.renderAttackEdit,
            )}
          ></mwc-icon-button>
        </sl-header>
        <div class="attack-details">
          <sl-group label=${localize('SHORT', 'damageValue')}>
            ${notEmpty(attack.rollFormulas)
              ? [
                  formatLabeledFormulas(attack.rollFormulas),
                  formatArmorUsed(attack),
                ].join('; ')
              : '-'}
          </sl-group>

          ${notEmpty(attack.attackTraits)
            ? html`
                <sl-group class="attack-traits" label=${localize('traits')}>
                  ${map(attack.attackTraits, localize).join(', ')}</sl-group
                >
              `
            : ''}
          ${attack.notes
            ? html`
                <sl-group class="attack-notes" label=${localize('notes')}>
                  ${attack.notes}</sl-group
                >
              `
            : ''}
        </div>
      </section>
    `;
  }

  private renderAttackEdit() {
    const updater = this.item.updater.prop('data', "primaryAttack");
    const { disabled } = this;
    const { attackTraits } = updater.originalValue();
    const attackTraitsObj = mapToObj(enumValues(AttackTrait), (trait) => [
      trait,
      attackTraits.includes(trait),
    ]);
    return html`
      <h3>${localize('attack')}</h3>
      ${renderUpdaterForm(updater, {
        disabled,
        fields: ({ damageFormula, armorPiercing }) => [
          renderFormulaField(damageFormula),
          renderLabeledCheckbox(armorPiercing),
        ],
      })}
      <p class="label">${localize('attackTraits')}</p>
      ${renderAutoForm({
        props: attackTraitsObj,
        update: (traits) =>
          updater.commit({
            attackTraits: enumValues(AttackTrait).flatMap((trait) => {
              const active = traits[trait] ?? attackTraitsObj[trait];
              return active ? trait : [];
            }),
          }),
        fields: (traits) => map(Object.values(traits), renderLabeledCheckbox),
      })}
      ${renderUpdaterForm(updater, {
        disabled,
        fields: ({ notes }) => [renderTextareaField(notes)],
      })}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'thrown-weapon-form': ThrownWeaponForm;
  }
}
import {
  renderFormulaField,
  renderLabeledCheckbox,
  renderNumberField,
  renderSelectField,
  renderTextField,
} from '@src/components/field/fields';
import {
  renderSubmitForm,
  renderUpdaterForm,
} from '@src/components/form/forms';
import { enumValues } from '@src/data-enums';
import type { Biological } from '@src/entities/actor/proxies/biological';
import { renderMovementRateFields } from '@src/features/components/movement-rate-fields';
import { addUpdateRemoveFeature, idProp } from '@src/features/feature-helpers';
import { defaultMovement, Movement } from '@src/features/movement';
import { Size } from '@src/features/size';
import {
  handleDrop,
  DropType,
  itemDropToItemProxy,
} from '@src/foundry/drag-and-drop';
import { notify, NotificationType } from '@src/foundry/foundry-apps';
import { localize } from '@src/foundry/localization';
import { tooltip } from '@src/init';
import { notEmpty, withSign } from '@src/utility/helpers';
import {
  customElement,
  LitElement,
  property,
  html,
  TemplateResult,
} from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { renderPoolEditForm } from '../pools/pool-edit-form';
import { SleeveFormBase } from '../sleeve-form-base';
import styles from './biological-form.scss';

const itemGroupKeys = ['ware', 'software', 'traits'] as const;

@customElement('biological-form')
export class BiologicalForm extends SleeveFormBase {
  static get is() {
    return 'biological-form' as const;
  }

  static styles = [styles];

  @property({ attribute: false }) sleeve!: Biological;

  private movementOperations = addUpdateRemoveFeature(
    () => this.sleeve.updater.prop('data', 'movementRates').commit,
  );

  private handleItemDrop = handleDrop(async ({ data }) => {
    console.log(data);
    if (data?.type === DropType.Item) {
      this.sleeve.addNewItemProxy(await itemDropToItemProxy(data));
    } else
      notify(
        NotificationType.Info,
        localize('DESCRIPTIONS', 'OnlyInfomorphItems'),
      );
  });

  render() {
    const {
      updater,
      disabled,
      itemGroups,
      pools,
      physicalHealth,
      type,
      sleeved,
      itemTrash,
      movementRates,
      availableBrains,
      nonDefaultBrain,
    } = this.sleeve;
    const { movementEffects } = itemGroups.effects;

    return html`
      <entity-form-layout>
        <entity-form-header
          slot="header"
          .updateActions=${updater.prop('')}
          type=${localize(type)}
        >
          ${sleeved ? html` <li slot="tag">${localize('sleeved')}</li> ` : ''}
        </entity-form-header>

        ${renderUpdaterForm(updater.prop('data'), {
          disabled,
          slot: 'sidebar',
          fields: ({
            size,
            subtype,
            sex,
            isSwarm,
            reach,
            unarmedDV,
            prehensileLimbs,
            brain,
          }) => [
            renderTextField(subtype),
            renderTextField(sex),
            html`<entity-form-sidebar-divider></entity-form-sidebar-divider>`,
            renderLabeledCheckbox(isSwarm, {
              tooltipText: localize('DESCRIPTIONS', 'AppliesSwarmRules'),
            }),
            renderSelectField(size, enumValues(Size)),
            html`<entity-form-sidebar-divider></entity-form-sidebar-divider>`,
            isSwarm.value
              ? ''
              : [
                  renderNumberField(prehensileLimbs, { min: 0 }),
                  renderNumberField(reach, { min: 0, max: 30, step: 10 }),
                ],
            renderFormulaField(unarmedDV),
            notEmpty(availableBrains)
              ? html`
                  <entity-form-sidebar-divider></entity-form-sidebar-divider>
                  ${renderSelectField(brain, [...availableBrains.keys()], {
                    emptyText: localize('default'),
                    altLabel: (key) => availableBrains.get(key)!.fullName,
                  })}
                `
              : '',
          ],
        })}

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
            <sl-header heading=${localize('physicalHealth')}>
              <mwc-icon-button
                slot="action"
                data-tooltip=${localize('changes')}
                @mouseover=${tooltip.fromData}
                @focus=${tooltip.fromData}
                icon="change_history"
                @click=${this.setDrawerFromEvent(
                  this.renderPhysicalHealthChangeHistory,
                  false,
                )}
              ></mwc-icon-button>
            </sl-header>
            <health-item
              clickable
              ?disabled=${disabled}
              .health=${physicalHealth}
              @click=${this.setDrawerFromEvent(this.renderPhysicalHealthEdit)}
            ></health-item>
          </section>

          ${nonDefaultBrain
            ? html`
                <section>
                  <sl-header heading=${localize('meshHealth')}>
                    <mwc-icon-button
                      slot="action"
                      data-tooltip=${localize('changes')}
                      @mouseover=${tooltip.fromData}
                      @focus=${tooltip.fromData}
                      icon="change_history"
                      @click=${this.setDrawerFromEvent(
                        this.renderMeshHealthChangeHistory,
                        false,
                      )}
                    ></mwc-icon-button>
                  </sl-header>
                  <health-item
                    clickable
                    ?disabled=${disabled}
                    .health=${nonDefaultBrain.meshHealth}
                    @click=${this.setDrawerFromEvent(this.renderMeshHealthEdit)}
                    ><span slot="source"
                      >${nonDefaultBrain.fullName}</span
                    ></health-item
                  >
                </section>
              `
            : ''}

          <section>
            <sl-header heading=${localize('movementRates')}>
              <mwc-icon-button
                slot="action"
                icon="add"
                ?disabled=${disabled}
                @click=${this.setDrawerFromEvent(this.renderMovementCreator)}
              ></mwc-icon-button>
            </sl-header>
            <sl-animated-list class="movement-list">
              ${repeat(movementRates, idProp, (movement) => {
                const { baseModification, fullModification } =
                  movementEffects.get(movement.type) ?? {};
                return html`<li class="movement-rate">
                  <sl-popover
                    .renderOnDemand=${() => html`
                      <sl-popover-section
                        heading="${localize('edit')} ${localize('movement')}"
                      >
                        <delete-button
                          slot="action"
                          @delete=${this.movementOperations.removeCallback(
                            movement.id,
                          )}
                        ></delete-button>
                        ${renderSubmitForm({
                          props: movement,
                          update: this.movementOperations.update,
                          fields: renderMovementRateFields,
                        })}
                      </sl-popover-section>
                    `}
                  >
                    <button slot="base" ?disabled=${disabled}>
                      ${localize(movement.type)}
                      ${movement.base}${baseModification
                        ? html`<sup>(${withSign(baseModification)})</sup>`
                        : ''}
                      /
                      ${movement.full}${fullModification
                        ? html`<sup>(${withSign(fullModification)})</sup>`
                        : ''}
                    </button>
                  </sl-popover>
                </li>`;
              })}
            </sl-animated-list>
          </section>

          <sl-dropzone @drop=${this.handleItemDrop} ?disabled=${disabled}>
            <sl-header heading="${localize('traits')} & ${localize('ware')}">
              <mwc-icon
                slot="icon"
                data-tooltip=${localize(
                  'DESCRIPTIONS',
                  'OnlyPhysicalMorphItems',
                )}
                @mouseover=${tooltip.fromData}
                >info</mwc-icon
              >
              ${notEmpty(itemTrash) && !disabled
                ? html`
                    <mwc-icon-button
                      @click=${this.setDrawerFromEvent(this.renderItemTrash)}
                      icon="delete_outline"
                      slot="action"
                    ></mwc-icon-button>
                  `
                : ''}
            </sl-header>

            ${itemGroupKeys.map((key) => {
              const group = itemGroups[key];
              return notEmpty(group)
                ? html`
                    <sleeve-form-items-list
                      .items=${group}
                      label=${localize(key)}
                    ></sleeve-form-items-list>
                  `
                : '';
            })}
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

  private renderMovementCreator() {
    return html`
      <h3>${localize('add')} ${localize('movement')}</h3>

      ${renderSubmitForm({
        props: defaultMovement,
        update: this.movementOperations.add,
        fields: renderMovementRateFields,
        noDebounce: true,
        submitEmpty: true,
      })}
    `;
  }

  private renderItemTrash() {
    return html`
      <h3>${localize('deleted')} ${localize('items')}</h3>
      <item-trash .proxy=${this.sleeve}></item-trash>
    `;
  }

  private renderPhysicalHealthChangeHistory() {
    const { physicalHealth, disabled } = this.sleeve;
    return this.renderHealthHistorySection(html` <health-log
      .health=${physicalHealth}
      ?disabled=${disabled}
    ></health-log>`);
  }

  private renderMeshHealthChangeHistory() {
    const { nonDefaultBrain, disabled } = this.sleeve;
    return this.renderHealthHistorySection(html`
      ${nonDefaultBrain
        ? html` <health-log
            .health=${nonDefaultBrain.meshHealth}
            ?disabled=${disabled}
          ></health-log>`
        : ''}
    `);
  }

  private renderHealthHistorySection(log: TemplateResult) {
    return html`
      <section class="history">
        <h3>${localize('history')}</h3>
        ${log}
      </section>
    `;
  }

  private renderPhysicalHealthEdit() {
    const { physicalHealth, updater } = this.sleeve;
    return html`
      <h3>${localize('physicalHealth')}</h3>
      ${renderUpdaterForm(updater.prop('data', 'physicalHealth'), {
        fields: ({ baseDurability }) =>
          renderNumberField(baseDurability, { min: 1 }),
      })}
      <health-state-form .health=${physicalHealth}></health-state-form>
      <health-regen-settings-form
        .health=${physicalHealth}
        .regenUpdater=${updater.prop('data', 'physicalHealth').nestedStore()}
      ></health-regen-settings-form>
    `;
  }

  private renderMeshHealthEdit() {
    const { nonDefaultBrain } = this.sleeve;
    if (!nonDefaultBrain) return html``;
    const { updater, meshHealth } = nonDefaultBrain;
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

  private renderPoolEdit() {
    return html`
      <h3>${localize('pools')}</h3>
      ${renderPoolEditForm(this.sleeve.updater.prop('data', 'pools'))}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'biological-form': BiologicalForm;
  }
}
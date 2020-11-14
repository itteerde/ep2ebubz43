import {
  renderSelectField,
  emptyTextDash,
  renderLabeledCheckbox,
  renderNumberField,
} from '@src/components/field/fields';
import { renderUpdaterForm } from '@src/components/form/forms';
import type { SlWindow } from '@src/components/window/window';
import { openWindow } from '@src/components/window/window-controls';
import {
  ResizeOption,
  SlWindowEventName,
} from '@src/components/window/window-options';
import { enumValues, ExplosiveSize, PhysicalWare } from '@src/data-enums';
import { entityFormCommonStyles } from '@src/entities/components/form-layout/entity-form-common-styles';
import { renderItemForm } from '@src/entities/item/item-views';
import type { Explosive } from '@src/entities/item/proxies/explosive';
import { FiringMode } from '@src/features/firing-modes';
import { handleDrop } from '@src/foundry/drag-and-drop';
import { localize } from '@src/foundry/localization';
import { customElement, html, property, PropertyValues } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { difference, identity } from 'remeda';
import { SeekerWeapon } from '../../../proxies/seeker-weapon';
import {
  accessoriesListStyles,
  complexityForm,
  renderComplexityFields,
  renderRangedAccessoriesEdit,
} from '../common-gear-fields';
import { ItemFormBase } from '../item-form-base';
import styles from './seeker-weapon-form.scss';

@customElement('seeker-weapon-form')
export class SeekerWeaponForm extends ItemFormBase {
  static get is() {
    return 'seeker-weapon-form' as const;
  }

  static styles = [
    entityFormCommonStyles,
    complexityForm.styles,
    accessoriesListStyles,
    styles,
  ];

  @property({ attribute: false }) item!: SeekerWeapon;

  private missilesSheet?: SlWindow | null;

  private readonly missilesSheetKey = {};

  update(changedProps: PropertyValues) {
    if (this.missilesSheet) this.openMissilesSheet();

    super.update(changedProps);
  }

  disconnectedCallback() {
    this.closeMissilesSheet();
    super.disconnectedCallback();
  }

  private addDrop = handleDrop(async ({ ev, data }) => {
    if (this.disabled) return;
    // TODO
  });

  private openMissilesSheet() {
    const { missiles, fullName } = this.item;
    if (!missiles) return this.closeMissilesSheet();
    const { win, wasConnected } = openWindow(
      {
        key: this.missilesSheetKey,
        content: renderItemForm(missiles),
        adjacentEl: this,
        forceFocus: !this.missilesSheet,
        name: `[${fullName} ${localize('coating')}] ${missiles.fullName}`,
      },
      { resizable: ResizeOption.Vertical },
    );

    this.missilesSheet = win;
    if (!wasConnected) {
      win.addEventListener(
        SlWindowEventName.Closed,
        () => (this.missilesSheet = null),
        { once: true },
      );
    }
  }

  private closeMissilesSheet() {
    this.missilesSheet?.close();
    this.missilesSheet = null;
  }

  render() {
    const {
      updater,
      type,
      accessories,
      missiles,
      alternativeAmmo,
      primaryAmmo,
      allowAlternativeAmmo,
    } = this.item;
    const alternativeMissile =
      allowAlternativeAmmo && missiles?.size === alternativeAmmo.missileSize;
    const { disabled } = this;
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
          fields: ({ wareType, firingMode, hasAlternativeAmmo }) => [
            renderSelectField(
              wareType,
              enumValues(PhysicalWare),
              emptyTextDash,
            ),
            renderSelectField(firingMode, [
              FiringMode.SingleShot,
              FiringMode.SemiAutomatic,
            ]),
            renderLabeledCheckbox(
              {
                ...hasAlternativeAmmo,
                label: localize('alternativeAmmo'),
              },
              { disabled: alternativeMissile },
            ),
          ],
        })}

        <div slot="details">
          ${renderUpdaterForm(updater.prop('data'), {
            disabled,
            classes: complexityForm.cssClass,
            fields: renderComplexityFields,
          })}

          <sl-dropzone ?disabled=${this.disabled} @drop=${this.addDrop}>
            <sl-header
              heading="${localize('missile')} ${localize('info')}"
            ></sl-header>
            ${missiles && !alternativeMissile
              ? this.renderMissiles(missiles)
              : ''}
            ${renderUpdaterForm(updater.prop('data', 'primaryAmmo'), {
              disabled,
              classes: 'missile-info-form',
              fields: ({ missileSize, missileCapacity, range }) => [
                renderSelectField(missileSize, enumValues(ExplosiveSize), {
                  disableOptions: allowAlternativeAmmo
                    ? [alternativeAmmo.missileSize]
                    : [],
                  disabled: !!(missiles && !alternativeMissile),
                }),
                renderNumberField(missileCapacity, { min: 1 }),
                renderNumberField(range, { min: 1 }),
              ],
            })}
          </sl-dropzone>

          ${allowAlternativeAmmo
            ? html`
                <sl-dropzone ?disabled=${this.disabled} @drop=${this.addDrop}>
                  <sl-header
                    heading="${localize('missile')} ${localize('info')}"
                  ></sl-header>
                  ${missiles && alternativeMissile
                    ? this.renderMissiles(missiles)
                    : ''}
                  ${renderUpdaterForm(updater.prop('data', 'alternativeAmmo'), {
                    disabled,
                    classes: 'missile-info-form',
                    fields: ({ missileSize, missileCapacity, range }) => [
                      renderSelectField(
                        missileSize,
                        enumValues(ExplosiveSize),
                        {
                          disableOptions: [primaryAmmo.missileSize],
                          disabled: alternativeMissile,
                        },
                      ),
                      renderNumberField(missileCapacity, { min: 1 }),
                      renderNumberField(range, { min: 1 }),
                    ],
                  })}
                </sl-dropzone>
              `
            : ''}

          <section>
            <sl-header heading=${localize('accessories')}>
              <mwc-icon-button
                slot="action"
                icon="edit"
                ?disabled=${disabled}
                @click=${this.setDrawerFromEvent(this.renderAccessoriesEdit)}
              ></mwc-icon-button>
            </sl-header>

            <sl-animated-list class="accessories-list">
              ${repeat(
                accessories,
                identity,
                (accessory) => html` <li>${localize(accessory)}</li> `,
              )}
            </sl-animated-list>
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

  private renderMissiles(missiles: Explosive) {
    return html`
      <div class="addon">
        <span class="addon-name">${missiles.name}</span>
        <span class="addon-type">${missiles.fullType}</span>
        <mwc-icon-button
          icon="launch"
          @click=${this.openMissilesSheet}
        ></mwc-icon-button>
        <delete-button
          ?disabled=${this.disabled}
          @delete=${missiles.deleteSelf}
        ></delete-button>
      </div>
      <hr />
    `;
  }

  private renderAccessoriesEdit() {
    return renderRangedAccessoriesEdit(
      this.item.accessories,
      SeekerWeapon.possibleAccessories,
      this.item.updater.prop('data', 'accessories').commit,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'seeker-weapon-form': SeekerWeaponForm;
  }
}
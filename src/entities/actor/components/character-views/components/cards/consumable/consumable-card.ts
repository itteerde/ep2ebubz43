import {
  renderLabeledCheckbox,
  renderNumberField,
  renderNumberInput,
} from '@src/components/field/fields';
import { renderAutoForm } from '@src/components/form/forms';
import { AptitudeType } from '@src/data-enums';
import { ActorType, ItemType } from '@src/entities/entity-types';
import type { ConsumableItem } from '@src/entities/item/item';
import { Substance } from '@src/entities/item/proxies/substance';
import { SpecialTest } from '@src/features/tags';
import { prettyMilliseconds } from '@src/features/time';
import { NotificationType, notify } from '@src/foundry/foundry-apps';
import { localize } from '@src/foundry/localization';
import { tooltip } from '@src/init';
import { openMenu } from '@src/open-menu';
import { AptitudeCheckControls } from '@src/success-test/components/aptitude-check-controls/aptitude-check-controls';
import { createSuccessTestModifier } from '@src/success-test/success-test';
import { localImage } from '@src/utility/images';
import { customElement, html, property } from 'lit-element';
import { compact } from 'remeda';
import { requestCharacter } from '../../../character-request-event';
import { ItemCardBase } from '../item-card-base';
import styles from './consumable-card.scss';

@customElement('consumable-card')
export class ConsumableCard extends ItemCardBase {
  static get is() {
    return 'consumable-card' as const;
  }

  static get styles() {
    return [...super.styles, styles];
  }

  @property({ attribute: false }) item!: ConsumableItem;

  private openSubstanceuseMenu(ev: MouseEvent) {
    const { item } = this;
    if (item.type === ItemType.Substance) {
      if (item.applicationMethods.length === 1)
        item.createMessage({ method: item.applicationMethods[0]! });
      else {
        let isHidden = false;
        openMenu({
          header: { heading: `${localize('use')} ${item.name}` },
          content: [
            renderAutoForm({
              props: { hidden: isHidden },
              update: ({ hidden = false }) => (isHidden = hidden),
              fields: ({ hidden }) => renderLabeledCheckbox(hidden),
            }),
            'divider',
            ...item.applicationMethods.map((method) => ({
              label: `${localize(method)} - ${localize(
                'onset',
              )}: ${prettyMilliseconds(Substance.onsetTime(method))}`,
              callback: () => item.createMessage({ method, hidden: isHidden }),
            })),
          ],
          position: ev,
        });
      }
    }
  }

  private addictionTest() {
    const { character } = requestCharacter(this);

    if (!character) return;
    if (this.item.type === ItemType.Substance) {
      const { addiction, addictionMod } = this.item.epData;
      AptitudeCheckControls.openWindow({
        entities: { actor: character.actor },
        getState: (actor) => {
          if (actor.proxy.type !== ActorType.Character) return null;
          return {
            ego: actor.proxy.ego,
            character: actor.proxy,
            aptitude: AptitudeType.Willpower,
            modifiers: compact([
              addiction &&
                createSuccessTestModifier({
                  name: localize('addiction'),
                  value: addictionMod,
                }),
            ]),
            special: {
              type: SpecialTest.Addiction,
              source: this.item.name,
            },
          };
        },
      });
    }
  }

  private deductQuantity() {
    this.item.consumeUnit();
  }

  private increaseQuantity() {
    this.item.setQuantity(this.item.quantity + 1);
  }

  private toggleStashed() {
    return this.item.toggleStashed();
  }

  renderHeaderButtons() {
    const { item } = this;
    const { editable } = item;
    return html` ${item.stashed
      ? html`
          <mwc-icon-button
            @click=${this.toggleStashed}
            icon=${item.stashed ? 'unarchive' : 'archive'}
            ?disabled=${!editable}
          ></mwc-icon-button>
        `
      : item.type === ItemType.Substance
      ? html`
          ${item.isAddictive
            ? html`
                <mwc-icon-button
                  @click=${this.addictionTest}
                  ?disabled=${!editable}
                  data-tooltip="${localize('addiction')} ${localize('test')}"
                  @mouseover=${tooltip.fromData}
                >
                  <img src=${localImage('icons/actions/chained-heart.svg')} />
                </mwc-icon-button>
              `
            : ''}
          <mwc-icon-button
            @click=${this.openSubstanceuseMenu}
            ?disabled=${!editable || item.quantity === 0}
            data-tooltip=${localize('use')}
            @mouseover=${tooltip.fromData}
            ><img src=${localImage('icons/actions/pill-drop.svg')} />
          </mwc-icon-button>
        `
      : ''}`;
  }

  renderExpandedContent() {
    const { item } = this;
    const { editable } = item;
    return html`
      ${item.type !== ItemType.Substance || !item.appliedState
        ? renderAutoForm({
            classes: 'quantity-form',
            disabled: !editable,
            props: { quantity: item.quantity },
            update: item.updateQuantity.commit,
            fields: ({ quantity }) => html`
              <div class="quantity">
                <mwc-icon-button
                  icon="keyboard_arrow_left"
                  ?disabled=${!editable || quantity.value === 0}
                  @click=${this.deductQuantity}
                ></mwc-icon-button>
                ${renderNumberInput(quantity, { min: 0, max: 9999 })}
                <mwc-icon-button
                  icon="keyboard_arrow_right"
                  ?disabled=${!editable || quantity.value === 9999}
                  @click=${this.increaseQuantity}
                ></mwc-icon-button>
              </div>
            `,
          })
        : ''}
      ${item.type === ItemType.Explosive
        ? html`
            <character-view-explosive-attacks
              .explosive=${item}
            ></character-view-explosive-attacks>
          `
        : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'consumable-card': ConsumableCard;
  }
}

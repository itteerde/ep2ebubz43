import { renderSubmitForm } from '@src/components/form/forms';
import { enumValues } from '@src/data-enums';
import type { Character } from '@src/entities/actor/proxies/character';
import { ActorType } from '@src/entities/entity-types';
import { ArmorType } from '@src/features/active-armor';
import { EffectType, formatEffect, Source } from '@src/features/effects';
import { localize } from '@src/foundry/localization';
import {
  customElement,
  LitElement,
  property,
  html,
  internalProperty,
} from 'lit-element';
import { mapToObj } from 'remeda';
import styles from './character-view-armor.scss';

@customElement('character-view-armor')
export class CharacterViewArmor extends LitElement {
  static get is() {
    return 'character-view-armor' as const;
  }

  static styles = [styles];

  @property({ attribute: false }) character!: Character;

  @internalProperty() private reductionCreator = false;

  private toggleReductionCreator() {
    this.reductionCreator = !this.reductionCreator;
  }

  private get movementModifiers() {
    if (
      !this.character.sleeve ||
      this.character.sleeve.type === ActorType.Infomorph
    )
      return {};
    return {
      encumbered: this.character.armor.isEncumbered(
        this.character.sleeve.physicalHealth.main.durability.value,
      ),
      overburdened: this.character.armor.isOverburdened,
    };
  }

  render() {
    const { encumbered, overburdened } = this.movementModifiers;
    const { armor, disabled } = this.character;
    return html`
      <character-view-drawer-heading
        >${localize('armor')}</character-view-drawer-heading
      >

      <div class="movement-modifiers">
        ${overburdened
          ? html`
              <sl-group label=${localize('overburdened')}
                >${localize('DESCRIPTIONS', 'Overburdened')}</sl-group
              >
            `
          : ''}
        ${encumbered
          ? html`
              <sl-group label=${localize('encumbered')}
                >${localize('DESCRIPTIONS', 'Encumbered')}</sl-group
              >
            `
          : ''}
      </div>

      <section>
        <sl-header
          heading=${localize('sources')}
          itemCount=${armor.sources.length}
        >
          <sl-group slot="action" label=${localize('layers')}
            >${armor.get('layers')}</sl-group
          >
        </sl-header>
        <ul>
          ${armor.sources.map(
            (effect) => html`
              <li>[${effect[Source]}] ${formatEffect(effect)}</li>
            `,
          )}
        </ul>
      </section>

      <section>
        <sl-header heading=${localize('armorReduction')}>
          <mwc-icon-button
            @click=${this.toggleReductionCreator}
            ?disabled=${disabled}
            icon="add"
            class=${this.reductionCreator ? 'active' : ''}
          ></mwc-icon-button>
        </sl-header>
        ${this.reductionCreator ? this.renderReductionCreator() : ""}
        <sl-animated-list>
          ${this.character.sleeve?.epData.damagedArmor.map(
            ({ source, id, ...armors }) => html`
              <wl-list-item
                clickable
                ?disabled=${this.character.disabled}
                @click=${() => this.character.sleeve?.removeArmorDamage(id)}
              >
                <span slot="before">${source}</span>
                <span
                  >${enumValues(ArmorType).map((type, index, list) => {
                    const reduction = armors[type];
                    return reduction
                      ? `${localize(type)}: ${-reduction}${
                          index < list.length - 1 ? ', ' : ''
                        }`
                      : '';
                  })}</span
                >
              </wl-list-item>
            `,
          )}
        </sl-animated-list>
      </section>
    `;
  }

  private renderReductionCreator() {
    return html`
    ${renderSubmitForm({
      props: { source: "", ...mapToObj(enumValues(ArmorType), type => [type, 0])},
      update: (changed, orig) => {
        const damage = { ...orig, ...changed };
        this.character.sleeve?.addArmorDamage(damage, damage.source);
      },
      fields: ({ source, ...armors}) => [

      ]
    })}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'character-view-armor': CharacterViewArmor;
  }
}

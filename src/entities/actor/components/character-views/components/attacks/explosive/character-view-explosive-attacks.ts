import {
  formatAreaEffect,
  formatArmorUsed,
} from '@src/combat/attack-formatting';
import type { ExplosiveAttack } from '@src/combat/attacks';
import type { Character } from '@src/entities/actor/proxies/character';
import type { Explosive } from '@src/entities/item/proxies/explosive';
import { prettyMilliseconds } from '@src/features/time';
import { localize } from '@src/foundry/localization';
import { joinLabeledFormulas } from '@src/foundry/rolls';
import { formatDamageType } from '@src/health/health';
import { clickIfEnter, notEmpty } from '@src/utility/helpers';
import { customElement, LitElement, property, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { map } from 'remeda';
import styles from './character-view-explosive-attacks.scss';

@customElement('character-view-explosive-attacks')
export class CharacterViewExplosiveAttacks extends LitElement {
  static get is() {
    return 'character-view-explosive-attacks' as const;
  }

  static get styles() {
    return [styles];
  }


  @property({ attribute: false }) explosive!: Explosive;


  render() {
    const {
      attacks,

      sticky,
    } = this.explosive;
    return html`
      <ul class="attacks">
        ${this.renderAttack(attacks.primary)}
        ${attacks.secondary ? this.renderAttack(attacks.secondary) : ''}
      </ul>
      <div class="shared">
        ${sticky ? html`<div>${localize('sticky')}</div>` : ''}
        <div class="area-effect">
          ${localize('areaEffect')}
          <span class="area-values"> ${formatAreaEffect(this.explosive)} </span>
        </div>
      </div>
    `;
  }

  private renderAttack(attack: ExplosiveAttack) {
    return html`
      <li>
        <div class="info">
          ${this.explosive.hasSecondaryMode
            ? html` <div class="label">${attack.label}</div> `
            : ''}
          <div class="main">
            ${notEmpty(attack.rollFormulas)
              ? html`
                  ${formatDamageType(attack.damageType)}
                  ${joinLabeledFormulas(attack.rollFormulas)}
                  ${formatArmorUsed(attack)}.
                `
              : ''}
            ${map(attack.attackTraits, localize).join(', ')}
          </div>

          <div class="additional">
            ${attack.duration
              ? `${localize('lasts')} ${prettyMilliseconds(attack.duration)}`
              : ''}
            ${attack.notes}
          </div>
        </div>
        <div class="actions">
          <button @keydown=${clickIfEnter} dense outlined><span>${localize('throw')}</span></button>
          <button @keydown=${clickIfEnter} dense outlined><span>${localize('plant')}</span></button>

        </div>
      </li>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'character-view-explosive-attacks': CharacterViewExplosiveAttacks;
  }
}

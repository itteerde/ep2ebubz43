import { startRangedAttack } from '@src/combat/attack-init';
import type { AttackType } from '@src/combat/attacks';
import type { SeekerWeapon } from '@src/entities/item/proxies/seeker-weapon';
import { localize } from '@src/foundry/localization';
import { customElement, html, LitElement, property } from 'lit-element';
import { map } from 'remeda';
import { requestCharacter } from '../../character-request-event';
import { openSeekerAmmoMenu } from './ammo-menus';
import styles from './attack-info-styles.scss';

@customElement('character-view-seeker-attacks')
export class CharacterViewSeekerAttacks extends LitElement {
  static get is() {
    return 'character-view-seeker-attacks' as const;
  }

  static get styles() {
    return [styles];
  }

  @property({ attribute: false }) weapon!: SeekerWeapon;

  private openMissileSelect(ev: MouseEvent) {
    const { character } = requestCharacter(this);
    character && openSeekerAmmoMenu(ev, character, this.weapon);
  }

  private fire = (attackType: AttackType) => {
    const attack = this.weapon.missiles?.attacks[attackType];
    const { character, token } = requestCharacter(this);

    if (!attack || !character) return;
    startRangedAttack({
      actor: character.actor,
      firingMode: this.weapon.firingMode,
      token,
      weaponId: this.weapon.id,
      adjacentElement: this,
      attackType,
    });
  };

  render() {
    const {
      missiles,
      editable,
      gearTraits,
      firingMode,
      activeAmmoSettings,
      acceptableMissileSizes,
    } = this.weapon;
    // TODO: Reload, range
    return html`
      <colored-tag
        clickable
        ?disabled=${!editable}
        @click=${this.openMissileSelect}
      >
        ${missiles
          ? html`
              <span
                >${missiles.fullName},
                <sl-group label=${localize('capacity')}
                  >${activeAmmoSettings.missileCapacity}</sl-group
                ></span
              >
              <span slot="after">${missiles.fullType}</span>
            `
          : html`
              <span>${localize('load')}</span>
              <span slot="after"
                >${map(acceptableMissileSizes, localize).join('/')}
                ${localize('missiles')}</span
              >
            `}
      </colored-tag>

      ${missiles
        ? html`<character-view-explosive-attacks
            .explosive=${missiles}
            .onAttack=${this.fire}
          ></character-view-explosive-attacks>`
        : ''}
      <colored-tag type="info">${localize(firingMode)}</colored-tag>
      ${gearTraits.map(
        (trait) =>
          html`<colored-tag type="info">${localize(trait)}</colored-tag>`,
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'character-view-seeker-attacks': CharacterViewSeekerAttacks;
  }
}

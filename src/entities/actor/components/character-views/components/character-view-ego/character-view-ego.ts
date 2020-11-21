import { renderTextInput } from '@src/components/field/fields';
import { renderAutoForm } from '@src/components/form/forms';
import { AptitudeType, enumValues } from '@src/data-enums';
import type { Ego } from '@src/entities/actor/ego';
import type { Character } from '@src/entities/actor/proxies/character';
import {
  Skill,
  skillFilterCheck
} from '@src/features/skills';
import { localize } from '@src/foundry/localization';
import { notEmpty, safeMerge } from '@src/utility/helpers';
import {
  customElement,


  html,
  internalProperty, LitElement,
  property,



  PropertyValues, queryAll
} from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { live } from 'lit-html/directives/live';
import { compact, first, reject } from 'remeda';
import styles from './character-view-ego.scss';

@customElement('character-view-ego')
export class CharacterViewEgo extends LitElement {
  static get is() {
    return 'character-view-ego' as const;
  }

  static styles = [styles];

  @property({ attribute: false }) character!: Character;

  @property({ attribute: false }) ego!: Ego;

  @queryAll('.skill-item')
  skillItems!: NodeListOf<HTMLElement>;

  @internalProperty()
  private skillControls = {
    filter: '',
    singleColumn: false,
  };

  private skillFilterCheck!: ReturnType<typeof skillFilterCheck>;

  update(changedProps: PropertyValues) {
    this.skillFilterCheck = skillFilterCheck(this.skillControls.filter);
    super.update(changedProps);
  }

  private updateSkillControls = (
    changed: Partial<CharacterViewEgo['skillControls']>,
  ) => {
    this.skillControls = safeMerge(this.skillControls, changed);
  };

  private findFirstUnfilteredSkill = (ev: KeyboardEvent) => {
    if (ev.key === 'Enter') {
      const unfiltered = reject([...this.skillItems], (skillItem) =>
        skillItem.classList.contains('filtered'),
      );
      first(unfiltered)?.[unfiltered.length > 1 ? 'focus' : 'click']();
    }
  };

  get disabled() {
    return this.character.disabled;
  }

  render() {
    const { active, know } = this.ego.groupedSkills;

    return html`
      <header>
        <button @click=${this.ego.openForm}>
          <span class="name">${this.ego.name}</span>
          <span class="details">
            ${compact([
              this.ego.egoType,
              this.ego.forkStatus &&
                `${localize(this.ego.forkStatus)} ${localize('fork')}`,
            ]).join(' • ')}</span
          >
        </button>
      </header>

      <sl-section heading=${localize('aptitudes')}>
        <sl-group
          slot="control"
          class="initiative"
          label=${localize('initiative')}
          >${this.character.initiative}</sl-group
        >
        <ul class="aptitudes-list">
          ${enumValues(AptitudeType).map(this.renderAptitude)}
        </ul>
        ${this.ego.trackMentalHealth
          ? html`
              <health-item
                class="mental-health-view"
                .health=${this.ego.mentalHealth}
              ><span slot="source">${localize("mentalHealth")}</span></health-item>
            `
          : ''}
      </sl-section>

      <sl-section heading=${localize('skills')}>
        ${renderAutoForm({
          classes: 'skill-controls',
          storeOnInput: true,
          noDebounce: true,
          slot: 'control',
          props: this.skillControls,
          update: this.updateSkillControls,
          fields: ({ filter }) => html`
            <div
              class="skill-filter"
              @keypress=${this.findFirstUnfilteredSkill}
            >
              ${renderTextInput(filter, {
                search: true,
                placeholder: localize('filter'),
              })}
            </div>
          `,
        })}

        <ul class="skills-list">
          ${active?.map(this.renderSkill)}
          ${notEmpty(know)
            ? html`
                <li class="divider" role="separator"></li>
                ${know.map(this.renderSkill)}
              `
            : ''}
        </ul>
      </sl-section>
    `;
  }

  private renderAptitude = (type: AptitudeType) => {
    const points = this.ego.aptitudes[type];
    return html` <wl-list-item
      clickable
      ?disabled=${this.disabled}
      class="aptitude-item"
    >
      <span class="aptitude-name">${localize(type)}</span>
      <div class="aptitude-values">
        <span class="aptitude-points">${points}</span>
        <span class="aptitude-check">${points * 3}</span>
      </div>
    </wl-list-item>`;
  };

  private renderSkill = (skill: Skill) => {
    const filtered = this.skillFilterCheck(skill);
    return html` <wl-list-item
      clickable
      class="skill-item ${classMap({ filtered })}"
      ?disabled=${this.disabled}
      tabindex=${live(filtered ? "-1" : "0")}

    >
      <span class="skill-name">${skill.fullName}</span>
      <span class="skill-total" slot="after">${skill.total}</span>
    </wl-list-item>`;
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'character-view-ego': CharacterViewEgo;
  }
}

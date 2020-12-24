import { renderTextInput } from '@src/components/field/fields';
import { renderAutoForm } from '@src/components/form/forms';
import { TabsMixin } from '@src/components/mixins/tabs-mixin';
import { AptitudeType, enumValues } from '@src/data-enums';
import type { Ego } from '@src/entities/actor/ego';
import type { Character } from '@src/entities/actor/proxies/character';
import { maxFavors } from '@src/features/reputations';
import { Skill, skillFilterCheck } from '@src/features/skills';
import { LangEntry, localize } from '@src/foundry/localization';
import { notEmpty, safeMerge } from '@src/utility/helpers';
import {
  customElement,
  html,
  internalProperty,
  LitElement,
  property,
  PropertyValues,
  queryAll,
} from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { live } from 'lit-html/directives/live';
import { first, range, reject } from 'remeda';
import styles from './tabbed-section.scss';

@customElement('character-view-tabbed-section')
export class CharacterViewTabbedSection extends TabsMixin(['stats', 'details'])(
  LitElement,
) {
  static get is() {
    return 'character-view-tabbed-section' as const;
  }

  static get styles() {
    return [styles];
  }

  @property({ attribute: false }) character!: Character;

  @property({ attribute: false }) ego!: Ego;

  @internalProperty()
  private skillControls = {
    filter: '',
    singleColumn: false,
  };

  @queryAll('.skill-item')
  private skillItems!: NodeListOf<HTMLElement>;

  private skillFilterCheck!: ReturnType<typeof skillFilterCheck>;

  update(changedProps: PropertyValues) {
    this.skillFilterCheck = skillFilterCheck(this.skillControls.filter);
    super.update(changedProps);
  }

  private updateSkillControls = (
    changed: Partial<CharacterViewTabbedSection['skillControls']>,
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
    return html`
      ${this.renderTabBar()} ${this.renderTabbedContent(this.activeTab)}
    `;
  }

  protected renderTab(tab: LangEntry) {
    return html`
      <mwc-tab data-tab=${tab} minWidth label=${localize(tab)}></mwc-tab>
    `;
  }

  protected renderTabbedContent(
    tab: CharacterViewTabbedSection['tabs'][number],
  ) {
    return tab === 'stats' ? this.renderStats() : this.renderDetails();
  }

  protected renderStats() {
    const { active, know } = this.ego.groupedSkills;

    return html`
      <div class="stats">
        <ul class="aptitudes-list">
          ${enumValues(AptitudeType).map(this.renderAptitude)}
        </ul>

        ${this.ego.trackReputations
          ? html`
              <ul class="rep-list">
                ${this.ego.trackedReps.map(this.renderRep)}
              </ul>
            `
          : ''}

        <ul class="skills-list">
          ${active?.map(this.renderSkill)}
          ${notEmpty(know)
            ? html`
                <li class="divider" role="separator"></li>
                ${know.map(this.renderSkill)}
              `
            : ''}
          <li class="filter">
            ${renderAutoForm({
              classes: 'skill-controls',
              storeOnInput: true,
              noDebounce: true,
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
          </li>
        </ul>
      </div>
    `;
  }

  protected renderDetails() {
    return html`
      ${notEmpty(this.ego.details)
        ? html`
            <div class="details">
              ${this.ego.details.map(
                ({ label, value }) => html`
                  <span class="details"
                    >${label} <span class="value">${value}</span></span
                  >
                `,
              )}
            </div>
          `
        : ''}
      ${this.ego.description
        ? html`
            <enriched-html .content=${this.ego.description}></enriched-html>
          `
        : ''}
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
      tabindex=${live(filtered ? -1 : 0)}
    >
      <span class="skill-name">${skill.fullName}</span>
      <span class="skill-total" slot="after">${skill.total}</span>
    </wl-list-item>`;
  };

  private renderRep = (rep: Ego['trackedReps'][number]) => {
    return html`
      <li class="rep-item">
        <span title=${rep.network} class="rep-acronym">${rep.acronym}</span>
        <span class="rep-score">${rep.score}</span>
        <div class="favors">
          ${[...maxFavors].map(([favor, max]) => {
            const usedAmount = rep[favor];
            return html`
              <span title=${localize(favor)}>
                ${range(1, max + 1).map(
                  (favorNumber) => html`
                    <mwc-icon
                      >${usedAmount >= favorNumber
                        ? 'check_box'
                        : 'check_box_outline_blank'}</mwc-icon
                    >
                  `,
                )}
              </span>
            `;
          })}
        </div>
      </li>
    `;
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'character-view-tabbed-section': CharacterViewTabbedSection;
  }
}

import { renderLabeledCheckbox } from '@src/components/field/fields';
import { renderAutoForm } from '@src/components/form/forms';
import { ActorType } from '@src/entities/entity-types';
import { matchID } from '@src/features/feature-helpers';
import { localize } from '@src/foundry/localization';
import { RenderDialogEvent } from '@src/open-dialog';
import { debounce } from '@src/utility/decorators';
import { internalProperty, LitElement, property, query } from 'lit-element';
import { html, TemplateResult } from 'lit-html';
import { traverseActiveElements } from 'weightless';
import type { MaybeToken } from '../../actor';
import type { Character } from '../../proxies/character';
import {
  CharacterDrawerRenderer,
  CharacterDrawerRenderEvent,
} from './character-drawer-render-event';
import { CharacterRequestEvent } from './character-request-event';

export enum ItemGroup {
  Consumables = 'consumables',
  Sleights = 'sleights',
  Traits = 'traits',
  Equipped = 'equipped',
  Stashed = 'stashed',
}

export abstract class CharacterViewBase extends LitElement {
  protected abstract renderDrawer(): TemplateResult;

  @property({ attribute: false }) character!: Character;

  @property({
    attribute: false,
    hasChanged(value, oldValue) {
      return !value || !oldValue || value === oldValue;
    },
  })
  token?: MaybeToken;

  @internalProperty() protected drawerContentRenderer:
    | (() => TemplateResult)
    | null = null;

  @query('.drawer', true)
  private drawer!: HTMLElement;

  protected drawerOpener: HTMLElement | null = null;

  disconnectedCallback() {
    this.closeDrawer();
    super.disconnectedCallback();
  }

  firstUpdated() {
    this.addEventListener(CharacterDrawerRenderEvent.is, ({ renderer }) => {
      this.toggleDrawerRenderer(renderer);
    });
    this.addEventListener(CharacterRequestEvent.is, (ev) => {
      ev.character = this.character;
      ev.token = this.token;
      ev.stopPropagation();
    });
  }

  protected toggleDrawerRenderer(renderer: CharacterDrawerRenderer) {
    this.toggleDrawerContent(this[`render${renderer}` as const]);
  }

  protected renderDrawerContent() {
    return this.drawerContentRenderer?.call(this) ?? '';
  }

  @debounce(200, true)
  protected toggleDrawerContent(fn: () => TemplateResult) {
    if (this.drawerContentRenderer === fn) this.closeDrawer();
    else {
      const active = traverseActiveElements();
      if (active instanceof HTMLElement) this.drawerOpener = active;
      this.drawerContentRenderer = fn;
    }
  }

  protected closeDrawer() {
    if (this.isConnected && this.drawer.classList.contains('open')) {
      this.drawer.classList.add('closing');
      this.drawer.addEventListener(
        'animationend',
        () => {
          this.drawerContentRenderer = null;
          this.drawer.classList.remove('closing');
          if (this.drawerOpener?.isConnected) this.drawerOpener.focus();
          this.drawerOpener = null;
        },
        { once: true },
      );
    } else this.drawerContentRenderer = null;
  }

  get drawerIsOpen() {
    return !!this.drawerContentRenderer;
  }

  renderResleeve() {
    return html`
      <character-view-resleeve
        .character=${this.character}
      ></character-view-resleeve>
    `;
  }

  renderEffects() {
    return html`
      <effects-viewer
        .effects=${this.character.appliedEffects}
      ></effects-viewer>
    `;
  }

  renderSearch() {
    return html`
      <character-view-search
        .character=${this.character}
      ></character-view-search>
    `;
  }

  renderRecharge() {
    return html`
      <character-view-recharge
        .character=${this.character}
      ></character-view-recharge>
    `;
  }

  renderTime() {
    return html`
      <character-view-time .character=${this.character}></character-view-time>
    `;
  }

  renderNetworkSettings() {
    return html`
      <character-view-network-settings
        .character=${this.character}
      ></character-view-network-settings>
    `;
  }

  renderArmor() {
    return html`
      <character-view-armor .character=${this.character}></character-view-armor>
    `;
  }

  renderMentalHealth() {
    return html`<character-view-mental-health
      .health=${this.character.ego.mentalHealth}
      .character=${this.character}
    ></character-view-mental-health>`;
  }

  renderSleevePhysicalHealth() {
    const { sleeve } = this.character;
    if (!sleeve || sleeve?.type === ActorType.Infomorph) return html``;
    return html`<character-view-physical-health
      .health=${sleeve.physicalHealth}
      .sleeve=${sleeve}
      .character=${this.character}
    ></character-view-physical-health>`;
  }

  renderSleeveMeshHealth() {
    const { sleeve } = this.character;
    if (!sleeve?.activeMeshHealth) return html``;
    return html`
      <character-view-mesh-health
        .character=${this.character}
        .health=${sleeve?.activeMeshHealth}
      ></character-view-mesh-health>
    `;
  }

  renderConditions() {
    return html`<character-view-conditions
      .character=${this.character}
    ></character-view-conditions>`;
  }
}

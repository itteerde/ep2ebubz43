import { UseWorldTime } from '@src/components/mixins/world-time-mixin';
import { Placement } from '@src/components/popover/popover-options';
import { RechargeType } from '@src/data-enums';
import type { MaybeToken } from '@src/entities/actor/actor';
import type { Character } from '@src/entities/actor/proxies/character';
import { localize } from '@src/foundry/localization';
import { tooltip } from '@src/init';
import { notEmpty } from '@src/utility/helpers';
import {
  customElement,
  html,
  LitElement,
  property,
  TemplateResult,
} from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import mix from 'mix-with/lib';
import { range } from 'remeda';
import {
  CharacterDrawerRenderer,
  CharacterDrawerRenderEvent,
} from '../../character-drawer-render-event';
import styles from './character-view-header.scss';

@customElement('character-view-header')
export class CharacterViewHeader extends mix(LitElement).with(UseWorldTime) {
  static get is() {
    return 'character-view-header' as const;
  }

  static styles = [styles];

  @property({ attribute: false }) character!: Character;

  @property({
    attribute: false,
    hasChanged(value, oldValue) {
      return !value || !oldValue || value === oldValue;
    },
  })
  token?: MaybeToken;

  private requestDrawerRender(ev: Event) {
    const { renderer } = (ev.currentTarget as HTMLElement).dataset;
    this.dispatchEvent(
      new CharacterDrawerRenderEvent(renderer as CharacterDrawerRenderer),
    );
  }

  private updateFromChange() {
    this.requestUpdate();
  }

  render() {
    const img = this.token?.data.img || this.character.img;
    const name = this.token?.data.name || this.character.name;

    return html`
      <img src=${img} />
      <h2>${name}</h2>
      <div class="actions">
        ${this.renderActionIconButton({
          icon: 'search',
          tooltipText: localize('search'),
          renderer: CharacterDrawerRenderer.Search,
        })}
        ${this.renderActionIconButton({
          icon: 'access_time',
          tooltipText: localize('time'),
          renderer: CharacterDrawerRenderer.Time,
          content: this.character.activeDurations
            ? html`
                <sl-notification-coin
                  value=${this.character.activeDurations}
                  ?actionRequired=${this.character.requiresAttention}
                ></sl-notification-coin>
              `
            : undefined,
        })}
        ${this.renderActionIconButton({
          icon: 'groups',
          tooltipText: localize('resleeve'),
          renderer: CharacterDrawerRenderer.Resleeve,
        })}

        <mwc-button
          class="effects-toggle"
          dense
          label="${localize('effects')}: ${this.character.appliedEffects.total}"
          data-renderer=${CharacterDrawerRenderer.Effects}
          @click=${this.requestDrawerRender}
        ></mwc-button>

        ${this.character.poolHolder === this.character
          ? this.renderRecharges()
          : ''}
      </div>
      <sl-popover
        class="restore-popover"
        .closeEvents=${['trash-changed']}
        @trash-changed=${this.updateFromChange}
        placement=${Placement.Right}
        .renderOnDemand=${this.renderItemTrash}
        unpadded
      >
        <mwc-icon-button
          icon="restore_from_trash"
          class="restore-button"
          ?disabled=${!notEmpty(this.character.actor.itemTrash) ||
          this.character.disabled}
          slot="base"
        >
        </mwc-icon-button>
      </sl-popover>
    `;
  }

  private renderRecharges() {
    const { activeRecharge, timeTillRechargeComplete } = this.character;
    return html` <button
      class="recharges"
      ?disabled=${this.character.disabled}
      data-renderer=${CharacterDrawerRenderer.Recharge}
      @click=${this.requestDrawerRender}
      data-tooltip=${localize('recharge')}
      @mouseover=${tooltip.fromData}
      @focus=${tooltip.fromData}
    >
      ${Object.values(this.character.recharges).map(
        ({ type, taken, max }) => html`
          <div
            class="recharge ${classMap({
              active: activeRecharge?.rechargeType === type,
              ready: !timeTillRechargeComplete,
            })}"
          >
            <span class="recharge-type"
              >${localize(type === RechargeType.Short ? 'short' : 'long')}</span
            >
            ${range(0, max).map(
              (box) => html`
                <mwc-icon
                  >${taken > box
                    ? 'check_box'
                    : 'check_box_outline_blank'}</mwc-icon
                >
              `,
            )}
          </div>
        `,
      )}
    </button>`;
  }

  private renderActionIconButton({
    icon,
    tooltipText,
    renderer,
    content,
  }: {
    icon: string;
    tooltipText: string;
    renderer: CharacterDrawerRenderer;
    content?: TemplateResult;
  }) {
    return html` <mwc-icon-button
      ?disabled=${this.character.disabled}
      data-tooltip=${tooltipText}
      icon=${icon}
      @mouseenter=${tooltip.fromData}
      @focus=${tooltip.fromData}
      data-renderer=${renderer}
      @click=${this.requestDrawerRender}
      >${content || ''}</mwc-icon-button
    >`;
  }

  private renderItemTrash = () => {
    return html` <item-trash .proxy=${this.character}></item-trash> `;
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'character-view-header': CharacterViewHeader;
  }
}

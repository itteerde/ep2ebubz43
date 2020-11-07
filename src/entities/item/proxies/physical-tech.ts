import { Activation, DeviceType } from '@src/data-enums';
import type { ObtainableEffects } from '@src/entities/applied-effects';
import type { ItemType } from '@src/entities/entity-types';
import { localize } from '@src/foundry/localization';
import { HealthType } from '@src/health/health';
import { InfomorphHealth } from '@src/health/infomorph-health';
import { LazyGetter } from 'lazy-get-decorator';
import mix from 'mix-with/lib';
import { compact } from 'remeda';
import { Copyable, Equippable, Gear, Purchasable } from '../item-mixins';
import { ItemProxyBase, ItemProxyInit } from './item-proxy-base';

class Base extends ItemProxyBase<ItemType.PhysicalTech> {}
export class PhysicalTech
  extends mix(Base).with(Purchasable, Gear, Equippable, Copyable)
  implements ObtainableEffects {
  constructor(init: ItemProxyInit<ItemType.PhysicalTech>) {
    super(init);
  }

  get state() {
    return this.epData.state;
  }

  get activated() {
    return this.activation !== Activation.None && this.state.activated;
  }

  get activation() {
    return this.epData.activation;
  }

  get effects() {
    return this.epData.effects;
  }

  get activatedEffects() {
    return this.epData.activatedEffects;
  }

  get deviceType() {
    return this.epData.deviceType;
  }

  get isBrain() {
    return this.deviceType === DeviceType.Host;
  }

  @LazyGetter()
  get effectGroups() {
    const { effects, activatedEffects, activation } = this;
    const group = new Map<"passive" | "activated", typeof effects>();
    group.set("passive", effects);
    if (activation) group.set("activated", activatedEffects)
    return group;
  }

  @LazyGetter()
  get currentEffects() {
    const { effects, activatedEffects, activated } = this;
    return {
      source: this.name,
      effects: compact([effects, activated && activatedEffects]).flat(),
    };
  }

  @LazyGetter()
  get meshHealth() {
    return new InfomorphHealth({
      data: this.epData.meshHealth,
      statMods: undefined,
      updater: this.updater.prop('data', 'meshHealth').nestedStore(),
      source: localize('host'),
      homeDevices: 1, // TODO
    });
  }

  getDataCopy(reset = false) {
    const copy = super.getDataCopy(reset);
    copy.data = {
      ...copy.data,
      state: {
        equipped: false,
        disabled: false,
        activated: false,
        embeddedEgos: [],
        onboardAliDeleted: false,
      },
    };
    return copy;
  }
}

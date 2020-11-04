export enum FiringMode {
  SingleShot = 'singleShot',
  SemiAutomatic = 'semiAuto',
  BurstFire = 'burstFire',
  FullAuto = 'fullAuto',
}

export enum MultiAmmoOption {
  ConcentratedToHit = 'concentratedToHit',
  ConcentratedDamage = 'concentratedDamage',
  AdjacentTargets = 'adjacentTargets',
}

export type FullAutoOption = MultiAmmoOption | 'suppressiveFire';

export const multiAmmoValues = {
  [FiringMode.BurstFire]: {
    [MultiAmmoOption.ConcentratedDamage]: '1d10',
    [MultiAmmoOption.AdjacentTargets]: 2,
    [MultiAmmoOption.ConcentratedToHit]: 10,
  },
  [FiringMode.FullAuto]: {
    [MultiAmmoOption.ConcentratedDamage]: '2d10',
    [MultiAmmoOption.AdjacentTargets]: 3,
    [MultiAmmoOption.ConcentratedToHit]: 30,
  },
} as const;

export type MultiAmmoFiringMode = keyof typeof multiAmmoValues;

export type FiringModeGroup =
  | [FiringMode.SingleShot | FiringMode.SemiAutomatic]
  | [FiringMode.BurstFire, MultiAmmoOption]
  | [FiringMode.FullAuto, FullAutoOption];

export const createFiringModeGroup = (
  firingMode: FiringMode,
): FiringModeGroup => {
  switch (firingMode) {
    case FiringMode.SemiAutomatic:
    case FiringMode.SingleShot:
      return [firingMode];

    case FiringMode.BurstFire:
    case FiringMode.FullAuto:
      return [firingMode, MultiAmmoOption.ConcentratedDamage];
  }
};

export const firingModeCost = {
  [FiringMode.SingleShot]: 1,
  [FiringMode.SemiAutomatic]: 1,
  [FiringMode.BurstFire]: 3,
  [FiringMode.FullAuto]: 10,
  suppressiveFire: 20,
} as const;

export const hasFiringModeOptions = (
  mode: FiringMode,
): mode is MultiAmmoFiringMode => mode in multiAmmoValues;
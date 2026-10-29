import { UpgradeType } from '@/types/game';

export interface UpgradeInfo {
  type: UpgradeType;
  title: string;
  tagline: string;
  description: string;
  iconName: string;
  accentColor: string;
}

export const MAX_UPGRADE_LEVEL = 10;

export const UPGRADE_METADATA: Record<UpgradeType, UpgradeInfo> = {
  engine: {
    type: 'engine',
    title: 'Engine',
    tagline: 'Horsepower & Top Speed',
    description: 'Increases engine driving torque and peak velocity for conquering steep gradients.',
    iconName: 'flame',
    accentColor: '#FF595E',
  },
  tires: {
    type: 'tires',
    title: 'Tires',
    tagline: 'Traction & Hill Grip',
    description: 'Upgrades rubber compound and deep treads to eliminate wheel spinning on slick slopes.',
    iconName: 'disc',
    accentColor: '#FFCA3A',
  },
  suspension: {
    type: 'suspension',
    title: 'Suspension',
    tagline: 'Shock Absorption & Stability',
    description: 'Reinforces dual spring coils and hydraulic dampers for buttery landings over big jumps.',
    iconName: 'git-commit',
    accentColor: '#8AC926',
  },
  fuel: {
    type: 'fuel',
    title: 'Fuel Tank',
    tagline: 'Extended Driving Range',
    description: 'Expands fuel reservoir volume so you can cover greater distances between fuel canisters.',
    iconName: 'droplet',
    accentColor: '#1982C4',
  },
};

/**
 * Calculates the coin cost for upgrading from current level to next level (1-indexed).
 * Base cost scales smoothly: level 1->2 is ~150 coins, up to level 9->10 at ~3500 coins.
 */
export function getUpgradeCost(type: UpgradeType, currentLevel: number): number {
  if (currentLevel >= MAX_UPGRADE_LEVEL) return 0;
  
  const baseCostMultiplier: Record<UpgradeType, number> = {
    engine: 180,
    tires: 140,
    suspension: 130,
    fuel: 160,
  };

  const base = baseCostMultiplier[type];
  // Quadratic cost scaling: base * (level^1.35)
  return Math.round(base * Math.pow(currentLevel, 1.38) / 10) * 10;
}

/**
 * Multiplier applied to vehicle base stats based on upgrade level (1 to 10).
 * Level 1 = 1.0 (baseline)
 * Level 10 = ~1.75x to 2.2x improvement!
 */
export function getEnginePowerMultiplier(level: number): number {
  return 1.0 + (level - 1) * 0.12; // Level 10 = +108% power
}

export function getTireGripMultiplier(level: number): number {
  return 1.0 + (level - 1) * 0.09; // Level 10 = +81% grip
}

export function getSuspensionStiffnessMultiplier(level: number): number {
  return 1.0 + (level - 1) * 0.10; // Level 10 = +90% stiffness & damping
}

export function getFuelCapacityMultiplier(level: number): number {
  return 1.0 + (level - 1) * 0.14; // Level 10 = +126% fuel volume
}

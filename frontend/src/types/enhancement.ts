export type FailurePenalty = 'none' | 'minus1' | 'minus2' | 'minus3' | 'break';
export type EnhancementResult = 'success' | 'failure' | 'downgrade' | 'broken';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'weapon' | 'armor' | 'accessory';

export interface EnhancementLevel {
  level: number;
  successRate: number;
  failurePenalty: FailurePenalty;
  breakChance: number;
  statBonus: number;
  goldCost: number;
  stoneRequired: number;
}

export const ENHANCEMENT_LEVELS: EnhancementLevel[] = [
  { level: 1, successRate: 90, failurePenalty: 'none', breakChance: 0, statBonus: 3, goldCost: 100, stoneRequired: 1 },
  { level: 2, successRate: 90, failurePenalty: 'none', breakChance: 0, statBonus: 6, goldCost: 200, stoneRequired: 1 },
  { level: 3, successRate: 90, failurePenalty: 'none', breakChance: 0, statBonus: 9, goldCost: 400, stoneRequired: 1 },
  { level: 4, successRate: 70, failurePenalty: 'none', breakChance: 0, statBonus: 14, goldCost: 800, stoneRequired: 2 },
  { level: 5, successRate: 70, failurePenalty: 'none', breakChance: 0, statBonus: 19, goldCost: 1500, stoneRequired: 2 },
  { level: 6, successRate: 70, failurePenalty: 'none', breakChance: 0, statBonus: 24, goldCost: 3000, stoneRequired: 2 },
  { level: 7, successRate: 50, failurePenalty: 'minus1', breakChance: 0, statBonus: 32, goldCost: 5000, stoneRequired: 3 },
  { level: 8, successRate: 50, failurePenalty: 'minus1', breakChance: 0, statBonus: 40, goldCost: 8000, stoneRequired: 3 },
  { level: 9, successRate: 50, failurePenalty: 'minus1', breakChance: 0, statBonus: 48, goldCost: 12000, stoneRequired: 3 },
  { level: 10, successRate: 30, failurePenalty: 'minus2', breakChance: 0, statBonus: 60, goldCost: 20000, stoneRequired: 5 },
  { level: 11, successRate: 30, failurePenalty: 'minus2', breakChance: 0, statBonus: 72, goldCost: 35000, stoneRequired: 5 },
  { level: 12, successRate: 30, failurePenalty: 'minus2', breakChance: 0, statBonus: 84, goldCost: 50000, stoneRequired: 5 },
  { level: 13, successRate: 15, failurePenalty: 'minus3', breakChance: 30, statBonus: 102, goldCost: 80000, stoneRequired: 8 },
  { level: 14, successRate: 15, failurePenalty: 'minus3', breakChance: 40, statBonus: 120, goldCost: 120000, stoneRequired: 8 },
  { level: 15, successRate: 5, failurePenalty: 'break', breakChance: 50, statBonus: 145, goldCost: 200000, stoneRequired: 10 },
];

export type ProtectionEffect = 'prevent_downgrade' | 'prevent_break' | 'increase_chance';

export interface ProtectionItem {
  id: string;
  name: string;
  icon: string;
  effect: ProtectionEffect;
  value: number;
  usableFromLevel: number;
  usableToLevel: number;
}

export const PROTECTION_ITEMS: ProtectionItem[] = [
  { id: 'protection_seal', name: 'Koruma Muhru', icon: '🛡️', effect: 'prevent_downgrade', value: 0, usableFromLevel: 7, usableToLevel: 15 },
  { id: 'destruction_shield', name: 'Yikim Kalkani', icon: '💎', effect: 'prevent_break', value: 0, usableFromLevel: 13, usableToLevel: 15 },
  { id: 'luck_stone', name: 'Sans Tasi', icon: '🍀', effect: 'increase_chance', value: 10, usableFromLevel: 1, usableToLevel: 15 },
];

export interface EnhanceableItem {
  id: string;
  name: string;
  type: ItemType;
  icon: string;
  rarity: ItemRarity;
  baseStats: {
    attack?: number;
    defense?: number;
    hp?: number;
    mp?: number;
  };
  currentLevel: number;
  maxLevel: number;
  isBroken: boolean;
}

export interface PlayerProtectionItem {
  id: string;
  count: number;
}

export function getRarityColor(rarity: ItemRarity): string {
  const colors: Record<ItemRarity, string> = {
    common: '#9d9d9d',
    uncommon: '#1eff00',
    rare: '#0070ff',
    epic: '#a335ee',
    legendary: '#ff8000',
  };
  return colors[rarity];
}

export function getSuccessRateColor(rate: number): string {
  if (rate >= 70) return '#44ff44';
  if (rate >= 40) return '#ffff44';
  if (rate >= 20) return '#ff8800';
  return '#ff4444';
}

export function calculateStatBonus(item: EnhanceableItem): Record<string, number> {
  const levelInfo = ENHANCEMENT_LEVELS.find(l => l.level === item.currentLevel);
  if (!levelInfo || item.currentLevel === 0) return {};

  const bonus: Record<string, number> = {};
  const multiplier = levelInfo.statBonus / 100;

  if (item.baseStats.attack) {
    bonus.attack = Math.floor(item.baseStats.attack * multiplier);
  }
  if (item.baseStats.defense) {
    bonus.defense = Math.floor(item.baseStats.defense * multiplier);
  }
  if (item.baseStats.hp) {
    bonus.hp = Math.floor(item.baseStats.hp * multiplier);
  }
  if (item.baseStats.mp) {
    bonus.mp = Math.floor(item.baseStats.mp * multiplier);
  }

  return bonus;
}

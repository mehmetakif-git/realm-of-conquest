import { create } from 'zustand';
import type { EnhanceableItem, EnhancementResult, PlayerProtectionItem } from '../types/enhancement';
import { ENHANCEMENT_LEVELS } from '../types/enhancement';

interface EnhancementStore {
  items: EnhanceableItem[];
  enhancementStones: number;
  protectionItems: PlayerProtectionItem[];

  enhanceItem: (
    itemId: string,
    useProtections: string[]
  ) => { result: EnhancementResult; newLevel: number };
  addItem: (item: EnhanceableItem) => void;
  removeItem: (itemId: string) => void;
  addStones: (count: number) => void;
  addProtectionItem: (itemId: string, count: number) => void;
  setItems: (items: EnhanceableItem[]) => void;
}

// Mock items for testing
const MOCK_ITEMS: EnhanceableItem[] = [
  {
    id: 'item-1',
    name: 'Ates Kilici',
    type: 'weapon',
    icon: '🗡️',
    rarity: 'rare',
    baseStats: { attack: 50 },
    currentLevel: 3,
    maxLevel: 15,
    isBroken: false,
  },
  {
    id: 'item-2',
    name: 'Ejderha Zirhi',
    type: 'armor',
    icon: '🛡️',
    rarity: 'epic',
    baseStats: { defense: 80, hp: 100 },
    currentLevel: 5,
    maxLevel: 15,
    isBroken: false,
  },
  {
    id: 'item-3',
    name: 'Ruzgar Yayi',
    type: 'weapon',
    icon: '🏹',
    rarity: 'uncommon',
    baseStats: { attack: 35 },
    currentLevel: 0,
    maxLevel: 15,
    isBroken: false,
  },
  {
    id: 'item-4',
    name: 'Golge Hanceri',
    type: 'weapon',
    icon: '🔪',
    rarity: 'legendary',
    baseStats: { attack: 70 },
    currentLevel: 9,
    maxLevel: 15,
    isBroken: false,
  },
  {
    id: 'item-5',
    name: 'Bilgelik Yuzugu',
    type: 'accessory',
    icon: '💍',
    rarity: 'rare',
    baseStats: { mp: 50 },
    currentLevel: 2,
    maxLevel: 15,
    isBroken: false,
  },
  {
    id: 'item-6',
    name: 'Karanlik Asa',
    type: 'weapon',
    icon: '🪄',
    rarity: 'epic',
    baseStats: { attack: 60, mp: 30 },
    currentLevel: 12,
    maxLevel: 15,
    isBroken: false,
  },
];

export const useEnhancementStore = create<EnhancementStore>((set, get) => ({
  items: MOCK_ITEMS,
  enhancementStones: 50,
  protectionItems: [
    { id: 'protection_seal', count: 5 },
    { id: 'destruction_shield', count: 2 },
    { id: 'luck_stone', count: 10 },
  ],

  enhanceItem: (itemId, useProtections) => {
    const state = get();
    const item = state.items.find(i => i.id === itemId);

    if (!item) {
      return { result: 'failure' as EnhancementResult, newLevel: 0 };
    }

    const nextLevel = item.currentLevel + 1;
    const levelInfo = ENHANCEMENT_LEVELS.find(l => l.level === nextLevel);

    if (!levelInfo) {
      return { result: 'failure' as EnhancementResult, newLevel: item.currentLevel };
    }

    // Calculate success rate with luck stone
    let successRate = levelInfo.successRate;
    if (useProtections.includes('luck_stone')) {
      successRate = Math.min(100, successRate + 10);
    }

    // Roll for success
    const roll = Math.random() * 100;
    const isSuccess = roll < successRate;

    let result: EnhancementResult;
    let newLevel = item.currentLevel;

    if (isSuccess) {
      result = 'success';
      newLevel = item.currentLevel + 1;
    } else {
      // Failed - check for protections
      const hasProtectionSeal = useProtections.includes('protection_seal');
      const hasDestructionShield = useProtections.includes('destruction_shield');

      // Check for item break
      if (levelInfo.breakChance > 0) {
        const breakRoll = Math.random() * 100;
        if (breakRoll < levelInfo.breakChance && !hasDestructionShield) {
          result = 'broken';
          newLevel = 0;
        } else if (!hasProtectionSeal && levelInfo.failurePenalty !== 'none') {
          result = 'downgrade';
          const penalty =
            levelInfo.failurePenalty === 'minus1' ? 1 :
            levelInfo.failurePenalty === 'minus2' ? 2 : 3;
          newLevel = Math.max(0, item.currentLevel - penalty);
        } else {
          result = 'failure';
        }
      } else if (levelInfo.failurePenalty !== 'none' && !hasProtectionSeal) {
        result = 'downgrade';
        const penalty =
          levelInfo.failurePenalty === 'minus1' ? 1 :
          levelInfo.failurePenalty === 'minus2' ? 2 : 3;
        newLevel = Math.max(0, item.currentLevel - penalty);
      } else {
        result = 'failure';
      }
    }

    // Update state
    set(state => ({
      items: state.items.map(i => {
        if (i.id === itemId) {
          return {
            ...i,
            currentLevel: result === 'broken' ? 0 : newLevel,
            isBroken: result === 'broken',
          };
        }
        return i;
      }),
      enhancementStones: state.enhancementStones - levelInfo.stoneRequired,
      protectionItems: state.protectionItems.map(p => {
        if (useProtections.includes(p.id)) {
          return { ...p, count: Math.max(0, p.count - 1) };
        }
        return p;
      }),
    }));

    return { result, newLevel };
  },

  addItem: (item) => {
    set(state => ({
      items: [...state.items, item],
    }));
  },

  removeItem: (itemId) => {
    set(state => ({
      items: state.items.filter(i => i.id !== itemId),
    }));
  },

  addStones: (count) => {
    set(state => ({
      enhancementStones: state.enhancementStones + count,
    }));
  },

  addProtectionItem: (itemId, count) => {
    set(state => ({
      protectionItems: state.protectionItems.map(p => {
        if (p.id === itemId) {
          return { ...p, count: p.count + count };
        }
        return p;
      }),
    }));
  },

  setItems: (items) => {
    set({ items });
  },
}));

import { create } from 'zustand';
import type {
  DungeonId,
  DifficultyId,
  TeamMember,
  ClassId,
  DungeonRun,
  LootItem,
  DungeonResult,
} from '../types/dungeon';
import {
  DUNGEONS,
  DIFFICULTY_MULTIPLIERS,
  validateTeam,
  calculateTeamBonus,
} from '../types/dungeon';

interface DungeonState {
  // State
  currentDungeon: DungeonId | null;
  currentDifficulty: DifficultyId;
  team: TeamMember[];
  dailyEntries: Record<DungeonId, number>;
  isInDungeon: boolean;
  currentRun: DungeonRun | null;
  lastResult: DungeonResult | null;

  // Team Actions
  setTeam: (team: TeamMember[]) => void;
  addToTeam: (member: TeamMember) => boolean;
  removeFromTeam: (memberId: string) => void;
  clearTeam: () => void;

  // Dungeon Actions
  selectDungeon: (dungeonId: DungeonId) => void;
  selectDifficulty: (difficulty: DifficultyId) => void;
  startDungeon: () => { success: boolean; message: string };
  completeDungeon: (deaths: number, completionTime: number) => DungeonResult;
  leaveDungeon: () => void;

  // Helpers
  canEnterDungeon: (dungeonId: DungeonId, playerLevel: number) => { can: boolean; reason: string };
  getRemainingEntries: (dungeonId: DungeonId) => number;
  getTeamValidation: () => { valid: boolean; missing: ClassId[]; message: string };
}

// Mock team members for testing
const mockTeamMembers: TeamMember[] = [
  { id: 'player-1', name: 'IronShield', level: 45, class: 'warrior', hp: 500, maxHp: 500, mp: 100, maxMp: 100, isOnline: true, isReady: true },
  { id: 'player-2', name: 'ShadowArrow', level: 42, class: 'archer', hp: 350, maxHp: 350, mp: 120, maxMp: 120, isOnline: true, isReady: true },
  { id: 'player-3', name: 'FireMaster', level: 44, class: 'mage', hp: 280, maxHp: 280, mp: 200, maxMp: 200, isOnline: true, isReady: false },
  { id: 'player-4', name: 'LightBringer', level: 43, class: 'healer', hp: 320, maxHp: 320, mp: 180, maxMp: 180, isOnline: true, isReady: true },
  { id: 'player-5', name: 'SilentBlade', level: 41, class: 'ninja', hp: 300, maxHp: 300, mp: 80, maxMp: 80, isOnline: false, isReady: false },
];

// Generate random loot based on dungeon and difficulty
function generateLoot(dungeonId: DungeonId, difficulty: DifficultyId, teamBonus: number): LootItem[] {
  const dungeon = DUNGEONS[dungeonId];
  const rewards = dungeon.rewards[difficulty];
  const loot: LootItem[] = [];

  // Guaranteed item
  loot.push({
    id: `item-${Date.now()}-1`,
    name: `${dungeon.boss.name} ${getRandomItemType()}`,
    rarity: rewards.guaranteedRarity,
    type: getRandomItemType(),
    stats: generateRandomStats(rewards.guaranteedRarity),
  });

  // Chance for additional items based on team bonus
  const extraItemChance = 0.3 + (teamBonus / 100);
  if (Math.random() < extraItemChance) {
    const possibleRarities = rewards.loot;
    const randomRarity = possibleRarities[Math.floor(Math.random() * possibleRarities.length)];
    loot.push({
      id: `item-${Date.now()}-2`,
      name: `${getRandomPrefix()} ${getRandomItemType()}`,
      rarity: randomRarity,
      type: getRandomItemType(),
      stats: generateRandomStats(randomRarity),
    });
  }

  // Legendary/Mythic chance
  if (rewards.legendaryChance && Math.random() < rewards.legendaryChance) {
    loot.push({
      id: `item-${Date.now()}-3`,
      name: `Efsanevi ${getRandomItemType()}`,
      rarity: 'legendary',
      type: getRandomItemType(),
      stats: generateRandomStats('legendary'),
    });
  }

  if (rewards.mythicChance && Math.random() < rewards.mythicChance) {
    loot.push({
      id: `item-${Date.now()}-4`,
      name: `Mitik ${getRandomItemType()}`,
      rarity: 'mythic',
      type: getRandomItemType(),
      stats: generateRandomStats('mythic'),
    });
  }

  return loot;
}

function getRandomItemType(): string {
  const types = ['Kilic', 'Zirh', 'Kalkan', 'Miğfer', 'Eldiven', 'Bot', 'Yuzuk', 'Kolye'];
  return types[Math.floor(Math.random() * types.length)];
}

function getRandomPrefix(): string {
  const prefixes = ['Ates', 'Buz', 'Karanlik', 'Isik', 'Firtina', 'Guclu', 'Antik', 'Lanetli'];
  return prefixes[Math.floor(Math.random() * prefixes.length)];
}

function generateRandomStats(rarity: string): Record<string, number> {
  const multiplier = { uncommon: 1, rare: 1.5, epic: 2, legendary: 3, mythic: 5 }[rarity] || 1;
  return {
    ATK: Math.floor(10 * multiplier + Math.random() * 20 * multiplier),
    DEF: Math.floor(8 * multiplier + Math.random() * 15 * multiplier),
    HP: Math.floor(50 * multiplier + Math.random() * 100 * multiplier),
  };
}

export const useDungeonStore = create<DungeonState>((set, get) => ({
  currentDungeon: null,
  currentDifficulty: 'normal',
  team: [],
  dailyEntries: {
    goblin_cave: 5,
    dark_forest: 4,
    ice_temple: 3,
    volcano_castle: 3,
    demon_tower: 2,
    dragon_nest: 2,
    dark_realm: 1,
    legendary_dungeon: 1,
  },
  isInDungeon: false,
  currentRun: null,
  lastResult: null,

  setTeam: (team) => set({ team }),

  addToTeam: (member) => {
    const { team } = get();
    if (team.length >= 5) return false;
    if (team.some(m => m.id === member.id)) return false;
    if (team.some(m => m.class === member.class)) return false;

    set({ team: [...team, member] });
    return true;
  },

  removeFromTeam: (memberId) => {
    set({ team: get().team.filter(m => m.id !== memberId) });
  },

  clearTeam: () => set({ team: [] }),

  selectDungeon: (dungeonId) => set({ currentDungeon: dungeonId }),

  selectDifficulty: (difficulty) => set({ currentDifficulty: difficulty }),

  startDungeon: () => {
    const { currentDungeon, currentDifficulty, team, dailyEntries } = get();

    if (!currentDungeon) {
      return { success: false, message: 'Dungeon secilmedi!' };
    }

    const dungeon = DUNGEONS[currentDungeon];
    const validation = validateTeam(team);

    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    const remaining = dailyEntries[currentDungeon];
    if (remaining <= 0) {
      return { success: false, message: 'Gunluk giris hakki bitti!' };
    }

    // Check if all team members are ready
    const notReady = team.filter(m => !m.isReady);
    if (notReady.length > 0) {
      return { success: false, message: `Hazir olmayan oyuncular: ${notReady.map(m => m.name).join(', ')}` };
    }

    const multiplier = DIFFICULTY_MULTIPLIERS[currentDifficulty];
    const bossMaxHp = dungeon.boss.hp * multiplier.bossHp;

    const run: DungeonRun = {
      dungeonId: currentDungeon,
      difficulty: currentDifficulty,
      team: [...team],
      startTime: new Date(),
      currentPhase: 1,
      bossHp: bossMaxHp,
      bossMaxHp,
      deaths: 0,
      isComplete: false,
    };

    set({
      isInDungeon: true,
      currentRun: run,
      dailyEntries: {
        ...dailyEntries,
        [currentDungeon]: remaining - 1,
      },
    });

    return { success: true, message: 'Dungeon basliyor!' };
  },

  completeDungeon: (deaths, completionTime) => {
    const { currentRun, team } = get();

    if (!currentRun) {
      throw new Error('No active dungeon run');
    }

    const dungeon = DUNGEONS[currentRun.dungeonId];
    const rewards = dungeon.rewards[currentRun.difficulty];
    const multiplier = DIFFICULTY_MULTIPLIERS[currentRun.difficulty];
    const teamBonus = calculateTeamBonus(team);

    // Calculate final rewards
    const timeBonus = completionTime < dungeon.duration * 0.7 ? 1.15 : 1.0;
    const deathPenalty = deaths * 0.05;
    const finalMultiplier = Math.max(0.5, (1 + teamBonus / 100) * timeBonus - deathPenalty);

    const gold = Math.floor(rewards.gold * multiplier.goldBonus * finalMultiplier);
    const exp = Math.floor(rewards.exp * (rewards.bonusExp || 1) * finalMultiplier);
    const loot = generateLoot(currentRun.dungeonId, currentRun.difficulty, teamBonus);

    // Calculate rating (1-3 stars)
    let rating = 3;
    if (deaths > 0) rating--;
    if (completionTime > dungeon.duration) rating--;
    rating = Math.max(1, rating);

    const result: DungeonResult = {
      dungeonId: currentRun.dungeonId,
      difficulty: currentRun.difficulty,
      completionTime,
      deaths,
      gold,
      exp,
      loot,
      teamBonus,
      rating,
    };

    set({
      isInDungeon: false,
      currentRun: null,
      lastResult: result,
    });

    return result;
  },

  leaveDungeon: () => {
    set({
      isInDungeon: false,
      currentRun: null,
    });
  },

  canEnterDungeon: (dungeonId, playerLevel) => {
    const dungeon = DUNGEONS[dungeonId];
    const { dailyEntries } = get();

    if (playerLevel < dungeon.minLevel) {
      return { can: false, reason: `Level ${dungeon.minLevel}+ gerekli` };
    }

    if (dailyEntries[dungeonId] <= 0) {
      return { can: false, reason: 'Gunluk giris hakki bitti' };
    }

    // Special check for legendary dungeon (weekly)
    if (dungeonId === 'legendary_dungeon') {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();

      // Only available Friday 20:00 to Sunday 23:59
      const isAvailable = (day === 5 && hour >= 20) || day === 6 || (day === 0 && hour <= 23);
      if (!isAvailable) {
        return { can: false, reason: 'Sadece Cuma 20:00 - Pazar 23:59 arasi acik' };
      }
    }

    return { can: true, reason: '' };
  },

  getRemainingEntries: (dungeonId) => {
    return get().dailyEntries[dungeonId];
  },

  getTeamValidation: () => {
    return validateTeam(get().team);
  },
}));

// Export mock team for testing
export { mockTeamMembers };

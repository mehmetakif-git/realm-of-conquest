// Dungeon System Types - 8 Dungeons with 5-Class Team Requirement

export type DungeonId =
  | 'goblin_cave'
  | 'dark_forest'
  | 'ice_temple'
  | 'volcano_castle'
  | 'demon_tower'
  | 'dragon_nest'
  | 'dark_realm'
  | 'legendary_dungeon';

export type DifficultyId = 'normal' | 'hard' | 'nightmare' | 'hell';

export type ClassId = 'warrior' | 'archer' | 'mage' | 'healer' | 'ninja';

export type MechanicType =
  | 'spawn_minions'
  | 'rage_mode'
  | 'phase_change'
  | 'aoe_warning'
  | 'poison_aura'
  | 'root_player'
  | 'mind_control'
  | 'shield'
  | 'enrage'
  | 'disperse'
  | 'freeze'
  | 'burn'
  | 'flying_phase'
  | 'stealth'
  | 'teleport'
  | 'self_destruct';

export type LootRarity = 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface BossMechanic {
  trigger: string;
  name: string;
  description: string;
  effect: MechanicType;
}

export interface BossAbility {
  name: string;
  cooldown: number;
  damage: number;
  target: 'single' | 'aoe' | 'random' | 'self';
  effect?: string;
}

export interface Boss {
  name: string;
  emoji: string;
  hp: number;
  atk: number;
  def: number;
  mechanics: BossMechanic[];
  abilities: BossAbility[];
}

export interface DungeonReward {
  gold: number;
  exp: number;
  loot: LootRarity[];
  guaranteedRarity: LootRarity;
  bonusExp?: number;
  legendaryChance?: number;
  mythicChance?: number;
}

export interface Dungeon {
  id: DungeonId;
  name: string;
  emoji: string;
  minLevel: number;
  dailyLimit: number;
  duration: number;
  difficulty: number;
  boss: Boss;
  rewards: Record<DifficultyId, DungeonReward>;
}

export interface DifficultyMultiplier {
  mobPower: number;
  bossHp: number;
  bossDamage: number;
  expBonus: number;
  goldBonus: number;
}

export interface TeamMember {
  id: string;
  name: string;
  level: number;
  class: ClassId;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  isOnline: boolean;
  isReady: boolean;
}

export interface DungeonRun {
  dungeonId: DungeonId;
  difficulty: DifficultyId;
  team: TeamMember[];
  startTime: Date;
  currentPhase: number;
  bossHp: number;
  bossMaxHp: number;
  deaths: number;
  isComplete: boolean;
}

export interface LootItem {
  id: string;
  name: string;
  rarity: LootRarity;
  type: string;
  stats: Record<string, number>;
}

export interface DungeonResult {
  dungeonId: DungeonId;
  difficulty: DifficultyId;
  completionTime: number;
  deaths: number;
  gold: number;
  exp: number;
  loot: LootItem[];
  teamBonus: number;
  rating: number;
}

// ==================== CONSTANTS ====================

export const CLASS_INFO: Record<ClassId, { name: string; emoji: string; role: string; color: string }> = {
  warrior: { name: 'Savasci', emoji: '⚔️', role: 'Tank', color: '#dc2626' },
  archer: { name: 'Okcu', emoji: '🏹', role: 'Ranged DPS', color: '#16a34a' },
  mage: { name: 'Buyucu', emoji: '🔮', role: 'AoE/Burst', color: '#7c3aed' },
  healer: { name: 'Sifaci', emoji: '✨', role: 'Healer', color: '#0ea5e9' },
  ninja: { name: 'Ninja', emoji: '🗡️', role: 'Utility', color: '#64748b' },
};

export const REQUIRED_CLASSES: ClassId[] = ['warrior', 'archer', 'mage', 'healer', 'ninja'];

export const DIFFICULTY_MULTIPLIERS: Record<DifficultyId, DifficultyMultiplier> = {
  normal: {
    mobPower: 1.0,
    bossHp: 1.0,
    bossDamage: 1.0,
    expBonus: 1.0,
    goldBonus: 1.0,
  },
  hard: {
    mobPower: 1.5,
    bossHp: 1.8,
    bossDamage: 1.5,
    expBonus: 1.2,
    goldBonus: 1.2,
  },
  nightmare: {
    mobPower: 2.5,
    bossHp: 3.0,
    bossDamage: 2.2,
    expBonus: 1.5,
    goldBonus: 1.5,
  },
  hell: {
    mobPower: 4.0,
    bossHp: 5.0,
    bossDamage: 3.5,
    expBonus: 2.0,
    goldBonus: 2.0,
  },
};

export const DIFFICULTY_INFO: Record<DifficultyId, { name: string; emoji: string; color: string }> = {
  normal: { name: 'Normal', emoji: '🟢', color: '#22c55e' },
  hard: { name: 'Hard', emoji: '🟡', color: '#eab308' },
  nightmare: { name: 'Nightmare', emoji: '🔴', color: '#ef4444' },
  hell: { name: 'Hell', emoji: '⚫', color: '#1f2937' },
};

export const DUNGEONS: Record<DungeonId, Dungeon> = {
  goblin_cave: {
    id: 'goblin_cave',
    name: 'Goblin Magarasi',
    emoji: '🟢',
    minLevel: 40,
    dailyLimit: 5,
    duration: 15,
    difficulty: 1,
    boss: {
      name: 'Goblin Krali',
      emoji: '👑',
      hp: 50000,
      atk: 150,
      def: 50,
      mechanics: [
        { trigger: 'hp_50', name: 'Goblin Cagirma', description: 'Boss HP %50\'de 5 goblin yardimci cagirir', effect: 'spawn_minions' },
        { trigger: 'hp_25', name: 'Ofke Modu', description: 'Boss ofkelenir, +50% hasar', effect: 'rage_mode' },
      ],
      abilities: [
        { name: 'Vahsi Vurus', cooldown: 8, damage: 1.5, target: 'single' },
        { name: 'Ofke Patlamasi', cooldown: 15, damage: 1.2, target: 'aoe' },
        { name: 'Tas Firlatma', cooldown: 5, damage: 0.8, target: 'random' },
      ],
    },
    rewards: {
      normal: { gold: 5000, exp: 8000, loot: ['uncommon', 'rare'], guaranteedRarity: 'uncommon' },
      hard: { gold: 12000, exp: 20000, loot: ['rare', 'epic'], guaranteedRarity: 'rare', bonusExp: 1.2 },
      nightmare: { gold: 30000, exp: 50000, loot: ['epic', 'legendary'], guaranteedRarity: 'epic', bonusExp: 1.5 },
      hell: { gold: 80000, exp: 150000, loot: ['epic', 'legendary'], guaranteedRarity: 'epic', bonusExp: 2.0, legendaryChance: 0.3 },
    },
  },

  dark_forest: {
    id: 'dark_forest',
    name: 'Karanlik Orman',
    emoji: '🌲',
    minLevel: 50,
    dailyLimit: 4,
    duration: 20,
    difficulty: 2,
    boss: {
      name: 'Zehirli Treant',
      emoji: '🌳',
      hp: 80000,
      atk: 200,
      def: 80,
      mechanics: [
        { trigger: 'always', name: 'Zehir Alani', description: 'Boss etrafinda surekli zehir DoT', effect: 'poison_aura' },
        { trigger: 'hp_60', name: 'Kok Baglama', description: 'Rastgele bir oyuncuyu koklere baglar', effect: 'root_player' },
        { trigger: 'hp_30', name: 'Tohum Patlamasi', description: 'Tum takima buyuk hasar, dagilma gerekli', effect: 'disperse' },
      ],
      abilities: [
        { name: 'Zehir Puskurtme', cooldown: 10, damage: 0.8, target: 'aoe', effect: 'poison' },
        { name: 'Dal Darbesi', cooldown: 6, damage: 1.4, target: 'single' },
        { name: 'Doga Cagrisi', cooldown: 20, damage: 0, target: 'self', effect: 'summon' },
      ],
    },
    rewards: {
      normal: { gold: 8000, exp: 15000, loot: ['uncommon', 'rare'], guaranteedRarity: 'uncommon' },
      hard: { gold: 18000, exp: 35000, loot: ['rare', 'epic'], guaranteedRarity: 'rare', bonusExp: 1.2 },
      nightmare: { gold: 45000, exp: 80000, loot: ['epic', 'legendary'], guaranteedRarity: 'epic', bonusExp: 1.5 },
      hell: { gold: 120000, exp: 250000, loot: ['epic', 'legendary'], guaranteedRarity: 'epic', bonusExp: 2.0, legendaryChance: 0.35 },
    },
  },

  ice_temple: {
    id: 'ice_temple',
    name: 'Buzul Tapinagi',
    emoji: '❄️',
    minLevel: 60,
    dailyLimit: 3,
    duration: 25,
    difficulty: 3,
    boss: {
      name: 'Buz Kralicesi',
      emoji: '👸',
      hp: 120000,
      atk: 280,
      def: 100,
      mechanics: [
        { trigger: 'hp_70', name: 'Donma Debuffi', description: 'Rastgele oyuncu donarak hareket edemez', effect: 'freeze' },
        { trigger: 'hp_40', name: 'Buz Firtinasi', description: 'Tum takima surekli DoT', effect: 'aoe_warning' },
        { trigger: 'hp_20', name: 'Buz Kristali', description: 'Kristalleri kirarak boss\'a hasar verilebilir', effect: 'shield' },
      ],
      abilities: [
        { name: 'Buzlu Nefes', cooldown: 12, damage: 1.3, target: 'aoe', effect: 'freeze' },
        { name: 'Buz Okları', cooldown: 5, damage: 1.0, target: 'random' },
        { name: 'Mutlak Sifir', cooldown: 25, damage: 2.0, target: 'aoe' },
      ],
    },
    rewards: {
      normal: { gold: 15000, exp: 25000, loot: ['rare'], guaranteedRarity: 'rare' },
      hard: { gold: 35000, exp: 60000, loot: ['rare', 'epic'], guaranteedRarity: 'rare', bonusExp: 1.2 },
      nightmare: { gold: 80000, exp: 150000, loot: ['epic', 'legendary'], guaranteedRarity: 'epic', bonusExp: 1.5 },
      hell: { gold: 200000, exp: 400000, loot: ['epic', 'legendary'], guaranteedRarity: 'epic', bonusExp: 2.0, legendaryChance: 0.4 },
    },
  },

  volcano_castle: {
    id: 'volcano_castle',
    name: 'Volkan Kalesi',
    emoji: '🔥',
    minLevel: 70,
    dailyLimit: 3,
    duration: 30,
    difficulty: 3,
    boss: {
      name: 'Ates Lord\'u',
      emoji: '😈',
      hp: 180000,
      atk: 350,
      def: 120,
      mechanics: [
        { trigger: 'always', name: 'Ates Havuzu', description: 'Yerde ates alanlari olusur, surekli hasar', effect: 'burn' },
        { trigger: 'hp_50', name: 'Lav Patlamasi', description: 'Kacinilabilir buyuk patlama', effect: 'aoe_warning' },
        { trigger: 'hp_30', name: 'Ates Elementi', description: 'Ates elementleri cagirir', effect: 'spawn_minions' },
      ],
      abilities: [
        { name: 'Ates Topu', cooldown: 8, damage: 1.5, target: 'single' },
        { name: 'Lav Dalgas', cooldown: 15, damage: 1.2, target: 'aoe' },
        { name: 'Cehennem Atesi', cooldown: 30, damage: 2.5, target: 'aoe' },
      ],
    },
    rewards: {
      normal: { gold: 20000, exp: 35000, loot: ['rare', 'epic'], guaranteedRarity: 'rare' },
      hard: { gold: 50000, exp: 80000, loot: ['epic'], guaranteedRarity: 'epic', bonusExp: 1.2 },
      nightmare: { gold: 120000, exp: 200000, loot: ['epic', 'legendary'], guaranteedRarity: 'epic', bonusExp: 1.5 },
      hell: { gold: 300000, exp: 500000, loot: ['epic', 'legendary'], guaranteedRarity: 'epic', bonusExp: 2.0, legendaryChance: 0.45 },
    },
  },

  demon_tower: {
    id: 'demon_tower',
    name: 'Seytan Kulesi',
    emoji: '👹',
    minLevel: 80,
    dailyLimit: 2,
    duration: 35,
    difficulty: 4,
    boss: {
      name: 'Seytan Lordu',
      emoji: '👿',
      hp: 250000,
      atk: 450,
      def: 150,
      mechanics: [
        { trigger: 'hp_70', name: 'Karanlik Ok', description: 'Takım uyesini kontrol eder', effect: 'mind_control' },
        { trigger: 'hp_40', name: 'Koruyucu Kalkan', description: 'Kalkan kirildiktan sonra hasar verilebilir', effect: 'shield' },
        { trigger: 'hp_10', name: 'Olum Sarmali', description: 'Tum takima cok buyuk hasar', effect: 'enrage' },
      ],
      abilities: [
        { name: 'Karanlik Pence', cooldown: 6, damage: 1.6, target: 'single' },
        { name: 'Karanlik Portal', cooldown: 20, damage: 0, target: 'self', effect: 'summon' },
        { name: 'Ruh Emme', cooldown: 25, damage: 1.0, target: 'aoe', effect: 'drain' },
      ],
    },
    rewards: {
      normal: { gold: 40000, exp: 60000, loot: ['epic'], guaranteedRarity: 'epic' },
      hard: { gold: 100000, exp: 150000, loot: ['epic', 'legendary'], guaranteedRarity: 'epic', bonusExp: 1.2 },
      nightmare: { gold: 250000, exp: 350000, loot: ['epic', 'legendary'], guaranteedRarity: 'epic', bonusExp: 1.5, legendaryChance: 0.15 },
      hell: { gold: 600000, exp: 800000, loot: ['legendary'], guaranteedRarity: 'legendary', bonusExp: 2.0, legendaryChance: 0.4 },
    },
  },

  dragon_nest: {
    id: 'dragon_nest',
    name: 'Ejderha Yuvasi',
    emoji: '🐉',
    minLevel: 90,
    dailyLimit: 2,
    duration: 40,
    difficulty: 4,
    boss: {
      name: 'Kizil Ejderha',
      emoji: '🐲',
      hp: 400000,
      atk: 600,
      def: 200,
      mechanics: [
        { trigger: 'hp_80', name: 'Ucma Fazi', description: 'Sadece uzak saldiri etkili', effect: 'flying_phase' },
        { trigger: 'hp_50', name: 'Ates Nefesi', description: 'Cizgi seklinde buyuk hasar', effect: 'aoe_warning' },
        { trigger: 'hp_20', name: 'Enrage', description: 'Tum mekanikler 2x hizli', effect: 'enrage' },
      ],
      abilities: [
        { name: 'Kuyruk Darbesi', cooldown: 8, damage: 2.0, target: 'aoe' },
        { name: 'Ates Nefesi', cooldown: 15, damage: 1.8, target: 'aoe' },
        { name: 'Gokyuzu Saldirisi', cooldown: 25, damage: 2.5, target: 'random' },
      ],
    },
    rewards: {
      normal: { gold: 80000, exp: 120000, loot: ['epic', 'legendary'], guaranteedRarity: 'epic' },
      hard: { gold: 200000, exp: 300000, loot: ['epic', 'legendary'], guaranteedRarity: 'epic', bonusExp: 1.2, legendaryChance: 0.2 },
      nightmare: { gold: 500000, exp: 700000, loot: ['legendary'], guaranteedRarity: 'legendary', bonusExp: 1.5, legendaryChance: 0.35 },
      hell: { gold: 1200000, exp: 1500000, loot: ['legendary'], guaranteedRarity: 'legendary', bonusExp: 2.0, legendaryChance: 0.6 },
    },
  },

  dark_realm: {
    id: 'dark_realm',
    name: 'Karanlik Diyar',
    emoji: '⚫',
    minLevel: 100,
    dailyLimit: 1,
    duration: 50,
    difficulty: 5,
    boss: {
      name: 'Karanlik Imparator',
      emoji: '🖤',
      hp: 600000,
      atk: 800,
      def: 250,
      mechanics: [
        { trigger: 'hp_80', name: 'Golge Klonlari', description: 'Gercek boss\'u bul', effect: 'stealth' },
        { trigger: 'hp_50', name: 'Karanlik Alani', description: 'Gorus sifir, ses ipucu', effect: 'aoe_warning' },
        { trigger: 'hp_20', name: 'Ruh Emme', description: 'HP drain tum takim', effect: 'mind_control' },
        { trigger: 'hp_5', name: 'Son Care', description: 'Kendini patlatma, takim kacmali', effect: 'self_destruct' },
      ],
      abilities: [
        { name: 'Karanlik Darbe', cooldown: 5, damage: 1.8, target: 'single' },
        { name: 'Golge Firtinasi', cooldown: 18, damage: 1.5, target: 'aoe' },
        { name: 'Ruh Hasati', cooldown: 30, damage: 2.0, target: 'aoe', effect: 'drain' },
      ],
    },
    rewards: {
      normal: { gold: 150000, exp: 200000, loot: ['epic', 'legendary'], guaranteedRarity: 'epic', legendaryChance: 0.25 },
      hard: { gold: 400000, exp: 600000, loot: ['legendary'], guaranteedRarity: 'legendary', bonusExp: 1.2, legendaryChance: 0.4 },
      nightmare: { gold: 1000000, exp: 1200000, loot: ['legendary'], guaranteedRarity: 'legendary', bonusExp: 1.5, legendaryChance: 0.6 },
      hell: { gold: 2500000, exp: 3000000, loot: ['legendary', 'mythic'], guaranteedRarity: 'legendary', bonusExp: 2.0, legendaryChance: 0.8, mythicChance: 0.05 },
    },
  },

  legendary_dungeon: {
    id: 'legendary_dungeon',
    name: 'Efsanevi Zindan',
    emoji: '👑',
    minLevel: 110,
    dailyLimit: 0, // Weekly
    duration: 60,
    difficulty: 5,
    boss: {
      name: 'Kaos Tanrisi',
      emoji: '💀',
      hp: 1000000,
      atk: 1200,
      def: 400,
      mechanics: [
        { trigger: 'hp_90', name: 'Kaos Dalgasi', description: 'Her hafta degisen mekanikler', effect: 'phase_change' },
        { trigger: 'hp_60', name: 'Puzzle Mekaniği', description: 'Takim koordinasyonu zorunlu', effect: 'shield' },
        { trigger: 'hp_30', name: 'Ultimate Kaos', description: 'Tum mekanikler ayni anda', effect: 'enrage' },
        { trigger: 'hp_10', name: 'Son Savas', description: 'Olumcul son faz', effect: 'self_destruct' },
      ],
      abilities: [
        { name: 'Kaos Yildirimi', cooldown: 8, damage: 2.5, target: 'random' },
        { name: 'Bosluk Patlamasi', cooldown: 20, damage: 2.0, target: 'aoe' },
        { name: 'Gerceklik Bukulumu', cooldown: 35, damage: 3.0, target: 'aoe' },
      ],
    },
    rewards: {
      normal: { gold: 300000, exp: 500000, loot: ['legendary'], guaranteedRarity: 'legendary' },
      hard: { gold: 800000, exp: 1500000, loot: ['legendary', 'mythic'], guaranteedRarity: 'legendary', bonusExp: 1.2, mythicChance: 0.1 },
      nightmare: { gold: 2000000, exp: 3500000, loot: ['legendary', 'mythic'], guaranteedRarity: 'legendary', bonusExp: 1.5, mythicChance: 0.25 },
      hell: { gold: 5000000, exp: 8000000, loot: ['mythic'], guaranteedRarity: 'legendary', bonusExp: 2.0, mythicChance: 0.5 },
    },
  },
};

// Team bonus constants
export const TEAM_BONUSES = {
  allDifferentClasses: {
    name: '5 Farkli Sinif Bonusu',
    dropRate: 20,
    goldBonus: 15,
    expBonus: 10,
  },
  perfectTeam: {
    name: 'Mukemmel Takim',
    dropRate: 35,
    goldBonus: 30,
    expBonus: 20,
  },
};

// Helper functions
export function getDungeon(id: DungeonId): Dungeon {
  return DUNGEONS[id];
}

export function getDifficultyInfo(id: DifficultyId): { name: string; emoji: string; color: string } {
  return DIFFICULTY_INFO[id];
}

export function getDifficultyMultiplier(id: DifficultyId): DifficultyMultiplier {
  return DIFFICULTY_MULTIPLIERS[id];
}

export function getClassInfo(id: ClassId): { name: string; emoji: string; role: string; color: string } {
  return CLASS_INFO[id];
}

export function validateTeam(team: TeamMember[]): { valid: boolean; missing: ClassId[]; message: string } {
  const teamClasses = team.map(m => m.class);
  const missing = REQUIRED_CLASSES.filter(cls => !teamClasses.includes(cls));

  if (missing.length > 0) {
    return {
      valid: false,
      missing,
      message: `Eksik siniflar: ${missing.map(c => CLASS_INFO[c].name).join(', ')}`,
    };
  }

  const allDifferent = new Set(teamClasses).size === 5;

  return {
    valid: true,
    missing: [],
    message: allDifferent
      ? `Mukemmel Takim! +${TEAM_BONUSES.perfectTeam.dropRate}% drop bonus`
      : 'Takim hazir',
  };
}

export function calculateTeamBonus(team: TeamMember[]): number {
  const teamClasses = new Set(team.map(m => m.class));
  if (teamClasses.size === 5) {
    return TEAM_BONUSES.perfectTeam.dropRate;
  }
  return 0;
}

export function canEnterDungeon(playerLevel: number, dungeonId: DungeonId): boolean {
  const dungeon = DUNGEONS[dungeonId];
  return playerLevel >= dungeon.minLevel;
}

export function formatDuration(minutes: number): string {
  return `~${minutes} dk`;
}

export function getDifficultyStars(difficulty: number): string {
  return '⭐'.repeat(difficulty);
}

export function getRarityColor(rarity: LootRarity): string {
  const colors: Record<LootRarity, string> = {
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
    mythic: '#ef4444',
  };
  return colors[rarity];
}

export function getRarityName(rarity: LootRarity): string {
  const names: Record<LootRarity, string> = {
    uncommon: 'Uncommon',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
    mythic: 'Mythic',
  };
  return names[rarity];
}

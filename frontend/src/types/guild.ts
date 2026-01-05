// Guild Types - 10 Different Guild Types with Unique Bonuses

export type GuildTypeId =
  | 'bandit'
  | 'guardian'
  | 'merchant'
  | 'warrior'
  | 'tank'
  | 'support'
  | 'crafter'
  | 'hunter'
  | 'social'
  | 'elite';

export type GuildRankId = 'leader' | 'officer' | 'veteran' | 'elite' | 'member' | 'recruit';

export type GuildFeature =
  | 'basic'
  | 'chat'
  | 'storage'
  | 'building'
  | 'bonuses'
  | 'shop'
  | 'quests'
  | 'arena'
  | 'events'
  | 'all';

export type GuildSpecialAbility =
  | 'bandit_radar'
  | 'bandit_radar_plus'
  | 'guardian_beacon'
  | 'guardian_beacon_plus'
  | 'merchant_caravan'
  | 'merchant_empire'
  | 'war_cry'
  | 'war_master'
  | 'fortress'
  | 'iron_fortress'
  | 'mass_heal'
  | 'divine_blessing'
  | 'master_forge'
  | 'legendary_forge'
  | 'hunter_mark'
  | 'master_hunter'
  | 'party_buff'
  | 'community_hero'
  | 'elite_status'
  | 'legendary_elite';

export interface GuildBonus {
  // Bandit bonuses
  caravan_attack?: number;
  loot_bonus?: number;
  infamy_reduction?: number;
  // Guardian bonuses
  caravan_defense?: number;
  guard_reward?: number;
  karma_gain?: number;
  // Merchant bonuses
  trade_fee?: number;
  market_slots?: number;
  caravan_capacity?: number;
  // Warrior bonuses
  pvp_damage?: number;
  arena_reward?: number;
  war_bonus?: number;
  // Tank bonuses
  defense?: number;
  hp_bonus?: number;
  damage_reduction?: number;
  // Support bonuses
  healing?: number;
  buff_duration?: number;
  mp_regen?: number;
  // Crafter bonuses
  craft_success?: number;
  craft_speed?: number;
  resource_bonus?: number;
  // Hunter bonuses
  pve_damage?: number;
  drop_rate?: number;
  exp_bonus?: number;
  // Social bonuses
  friendship_bonus?: number;
  event_reward?: number;
  daily_quest?: number;
  // Elite bonuses
  all_bonus?: number;
  prestige?: number;
  // Special ability
  special?: GuildSpecialAbility;
}

export interface GuildType {
  id: GuildTypeId;
  name: string;
  emoji: string;
  description: string;
  color: string;
  minLevel: number;
  bonuses: Record<number, GuildBonus>;
}

export interface GuildLevel {
  level: number;
  cost: number;
  members: number;
  exp: number;
  features: GuildFeature[];
}

export interface GuildRank {
  id: GuildRankId;
  name: string;
  emoji: string;
  permissions: string[];
  color: string;
}

export interface GuildMember {
  id: string;
  name: string;
  level: number;
  rank: GuildRankId;
  contribution: number;
  joinedAt: Date;
  lastOnline: Date;
  isOnline: boolean;
}

export interface Guild {
  id: string;
  name: string;
  type: GuildTypeId;
  description: string;
  level: number;
  exp: number;
  treasury: number;
  memberCount: number;
  maxMembers: number;
  leaderId: string;
  leaderName: string;
  members: GuildMember[];
  createdAt: Date;
}

// ==================== CONSTANTS ====================

export const GUILD_TYPES: Record<GuildTypeId, GuildType> = {
  bandit: {
    id: 'bandit',
    name: 'Haydut Loncasi',
    emoji: '⚔️',
    description: 'Kervan yagmasi ve haydutlukta uzmanlasimis lonca',
    color: '#dc2626',
    minLevel: 20,
    bonuses: {
      1: { caravan_attack: 10, loot_bonus: 15, infamy_reduction: 10 },
      2: { caravan_attack: 12, loot_bonus: 18, infamy_reduction: 12 },
      3: { caravan_attack: 15, loot_bonus: 22, infamy_reduction: 15 },
      4: { caravan_attack: 18, loot_bonus: 26, infamy_reduction: 18 },
      5: { caravan_attack: 25, loot_bonus: 35, infamy_reduction: 30, special: 'bandit_radar' },
      6: { caravan_attack: 28, loot_bonus: 40, infamy_reduction: 35, special: 'bandit_radar' },
      7: { caravan_attack: 32, loot_bonus: 45, infamy_reduction: 40, special: 'bandit_radar' },
      8: { caravan_attack: 36, loot_bonus: 50, infamy_reduction: 45, special: 'bandit_radar' },
      9: { caravan_attack: 40, loot_bonus: 60, infamy_reduction: 50, special: 'bandit_radar' },
      10: { caravan_attack: 50, loot_bonus: 75, infamy_reduction: 60, special: 'bandit_radar_plus' }
    }
  },

  guardian: {
    id: 'guardian',
    name: 'Koruyucu Loncasi',
    emoji: '🛡️',
    description: 'Kervan koruma ve adalet saglayan lonca',
    color: '#2563eb',
    minLevel: 20,
    bonuses: {
      1: { caravan_defense: 10, guard_reward: 15, karma_gain: 20 },
      2: { caravan_defense: 12, guard_reward: 18, karma_gain: 24 },
      3: { caravan_defense: 15, guard_reward: 22, karma_gain: 28 },
      4: { caravan_defense: 18, guard_reward: 26, karma_gain: 32 },
      5: { caravan_defense: 25, guard_reward: 35, karma_gain: 40, special: 'guardian_beacon' },
      6: { caravan_defense: 28, guard_reward: 40, karma_gain: 45, special: 'guardian_beacon' },
      7: { caravan_defense: 32, guard_reward: 45, karma_gain: 50, special: 'guardian_beacon' },
      8: { caravan_defense: 36, guard_reward: 50, karma_gain: 55, special: 'guardian_beacon' },
      9: { caravan_defense: 40, guard_reward: 60, karma_gain: 65, special: 'guardian_beacon' },
      10: { caravan_defense: 50, guard_reward: 75, karma_gain: 80, special: 'guardian_beacon_plus' }
    }
  },

  merchant: {
    id: 'merchant',
    name: 'Ticaret Loncasi',
    emoji: '💰',
    description: 'Ekonomi ve ticarette uzmanlasimis lonca',
    color: '#f59e0b',
    minLevel: 20,
    bonuses: {
      1: { trade_fee: -5, market_slots: 2, caravan_capacity: 10 },
      2: { trade_fee: -7, market_slots: 3, caravan_capacity: 15 },
      3: { trade_fee: -10, market_slots: 4, caravan_capacity: 20 },
      4: { trade_fee: -12, market_slots: 5, caravan_capacity: 25 },
      5: { trade_fee: -15, market_slots: 6, caravan_capacity: 35, special: 'merchant_caravan' },
      6: { trade_fee: -17, market_slots: 7, caravan_capacity: 40, special: 'merchant_caravan' },
      7: { trade_fee: -20, market_slots: 8, caravan_capacity: 45, special: 'merchant_caravan' },
      8: { trade_fee: -22, market_slots: 9, caravan_capacity: 50, special: 'merchant_caravan' },
      9: { trade_fee: -25, market_slots: 10, caravan_capacity: 60, special: 'merchant_caravan' },
      10: { trade_fee: -30, market_slots: 12, caravan_capacity: 75, special: 'merchant_empire' }
    }
  },

  warrior: {
    id: 'warrior',
    name: 'Savasci Loncasi',
    emoji: '🗡️',
    description: 'PvP ve saldiirida uzmanlasimis lonca',
    color: '#b91c1c',
    minLevel: 20,
    bonuses: {
      1: { pvp_damage: 5, arena_reward: 10, war_bonus: 15 },
      2: { pvp_damage: 7, arena_reward: 12, war_bonus: 18 },
      3: { pvp_damage: 10, arena_reward: 15, war_bonus: 22 },
      4: { pvp_damage: 12, arena_reward: 18, war_bonus: 26 },
      5: { pvp_damage: 15, arena_reward: 25, war_bonus: 35, special: 'war_cry' },
      6: { pvp_damage: 17, arena_reward: 28, war_bonus: 40, special: 'war_cry' },
      7: { pvp_damage: 20, arena_reward: 32, war_bonus: 45, special: 'war_cry' },
      8: { pvp_damage: 22, arena_reward: 36, war_bonus: 50, special: 'war_cry' },
      9: { pvp_damage: 25, arena_reward: 40, war_bonus: 60, special: 'war_cry' },
      10: { pvp_damage: 30, arena_reward: 50, war_bonus: 75, special: 'war_master' }
    }
  },

  tank: {
    id: 'tank',
    name: 'Tank Loncasi',
    emoji: '🛡️',
    description: 'Savunma ve dayaniklilikta uzmanlasimis lonca',
    color: '#6b7280',
    minLevel: 20,
    bonuses: {
      1: { defense: 8, hp_bonus: 5, damage_reduction: 3 },
      2: { defense: 10, hp_bonus: 7, damage_reduction: 4 },
      3: { defense: 12, hp_bonus: 10, damage_reduction: 5 },
      4: { defense: 15, hp_bonus: 12, damage_reduction: 6 },
      5: { defense: 20, hp_bonus: 15, damage_reduction: 8, special: 'fortress' },
      6: { defense: 22, hp_bonus: 17, damage_reduction: 9, special: 'fortress' },
      7: { defense: 25, hp_bonus: 20, damage_reduction: 10, special: 'fortress' },
      8: { defense: 28, hp_bonus: 22, damage_reduction: 12, special: 'fortress' },
      9: { defense: 32, hp_bonus: 25, damage_reduction: 15, special: 'fortress' },
      10: { defense: 40, hp_bonus: 30, damage_reduction: 20, special: 'iron_fortress' }
    }
  },

  support: {
    id: 'support',
    name: 'Destek Loncasi',
    emoji: '✨',
    description: 'Sifa ve buff konusunda uzmanlasimis lonca',
    color: '#a855f7',
    minLevel: 20,
    bonuses: {
      1: { healing: 10, buff_duration: 15, mp_regen: 5 },
      2: { healing: 12, buff_duration: 18, mp_regen: 7 },
      3: { healing: 15, buff_duration: 22, mp_regen: 10 },
      4: { healing: 18, buff_duration: 26, mp_regen: 12 },
      5: { healing: 25, buff_duration: 35, mp_regen: 15, special: 'mass_heal' },
      6: { healing: 28, buff_duration: 40, mp_regen: 17, special: 'mass_heal' },
      7: { healing: 32, buff_duration: 45, mp_regen: 20, special: 'mass_heal' },
      8: { healing: 36, buff_duration: 50, mp_regen: 22, special: 'mass_heal' },
      9: { healing: 40, buff_duration: 60, mp_regen: 25, special: 'mass_heal' },
      10: { healing: 50, buff_duration: 75, mp_regen: 30, special: 'divine_blessing' }
    }
  },

  crafter: {
    id: 'crafter',
    name: 'Meslekci Loncasi',
    emoji: '🔨',
    description: 'Crafting ve uretimde uzmanlasimis lonca',
    color: '#ea580c',
    minLevel: 20,
    bonuses: {
      1: { craft_success: 5, craft_speed: 10, resource_bonus: 8 },
      2: { craft_success: 7, craft_speed: 12, resource_bonus: 10 },
      3: { craft_success: 10, craft_speed: 15, resource_bonus: 12 },
      4: { craft_success: 12, craft_speed: 18, resource_bonus: 15 },
      5: { craft_success: 15, craft_speed: 25, resource_bonus: 20, special: 'master_forge' },
      6: { craft_success: 17, craft_speed: 28, resource_bonus: 22, special: 'master_forge' },
      7: { craft_success: 20, craft_speed: 32, resource_bonus: 25, special: 'master_forge' },
      8: { craft_success: 22, craft_speed: 36, resource_bonus: 28, special: 'master_forge' },
      9: { craft_success: 25, craft_speed: 40, resource_bonus: 32, special: 'master_forge' },
      10: { craft_success: 30, craft_speed: 50, resource_bonus: 40, special: 'legendary_forge' }
    }
  },

  hunter: {
    id: 'hunter',
    name: 'Avci Loncasi',
    emoji: '🏹',
    description: 'PvE ve farming konusunda uzmanlasimis lonca',
    color: '#059669',
    minLevel: 20,
    bonuses: {
      1: { pve_damage: 8, drop_rate: 10, exp_bonus: 5 },
      2: { pve_damage: 10, drop_rate: 12, exp_bonus: 7 },
      3: { pve_damage: 12, drop_rate: 15, exp_bonus: 10 },
      4: { pve_damage: 15, drop_rate: 18, exp_bonus: 12 },
      5: { pve_damage: 20, drop_rate: 25, exp_bonus: 15, special: 'hunter_mark' },
      6: { pve_damage: 22, drop_rate: 28, exp_bonus: 17, special: 'hunter_mark' },
      7: { pve_damage: 25, drop_rate: 32, exp_bonus: 20, special: 'hunter_mark' },
      8: { pve_damage: 28, drop_rate: 36, exp_bonus: 22, special: 'hunter_mark' },
      9: { pve_damage: 32, drop_rate: 40, exp_bonus: 25, special: 'hunter_mark' },
      10: { pve_damage: 40, drop_rate: 50, exp_bonus: 30, special: 'master_hunter' }
    }
  },

  social: {
    id: 'social',
    name: 'Sosyal Lonca',
    emoji: '🎭',
    description: 'Topluluk etkinliklerine odaklanan lonca',
    color: '#ec4899',
    minLevel: 20,
    bonuses: {
      1: { friendship_bonus: 10, event_reward: 15, daily_quest: 1 },
      2: { friendship_bonus: 12, event_reward: 18, daily_quest: 1 },
      3: { friendship_bonus: 15, event_reward: 22, daily_quest: 2 },
      4: { friendship_bonus: 18, event_reward: 26, daily_quest: 2 },
      5: { friendship_bonus: 25, event_reward: 35, daily_quest: 3, special: 'party_buff' },
      6: { friendship_bonus: 28, event_reward: 40, daily_quest: 3, special: 'party_buff' },
      7: { friendship_bonus: 32, event_reward: 45, daily_quest: 4, special: 'party_buff' },
      8: { friendship_bonus: 36, event_reward: 50, daily_quest: 4, special: 'party_buff' },
      9: { friendship_bonus: 40, event_reward: 60, daily_quest: 5, special: 'party_buff' },
      10: { friendship_bonus: 50, event_reward: 75, daily_quest: 6, special: 'community_hero' }
    }
  },

  elite: {
    id: 'elite',
    name: 'Elit Lonca',
    emoji: '👑',
    description: 'Her seye erisimi olan prestijli lonca',
    color: '#fbbf24',
    minLevel: 40,
    bonuses: {
      1: { all_bonus: 5, prestige: 10 },
      2: { all_bonus: 7, prestige: 15 },
      3: { all_bonus: 10, prestige: 20 },
      4: { all_bonus: 12, prestige: 25 },
      5: { all_bonus: 15, prestige: 35, special: 'elite_status' },
      6: { all_bonus: 17, prestige: 40, special: 'elite_status' },
      7: { all_bonus: 20, prestige: 45, special: 'elite_status' },
      8: { all_bonus: 22, prestige: 50, special: 'elite_status' },
      9: { all_bonus: 25, prestige: 60, special: 'elite_status' },
      10: { all_bonus: 30, prestige: 75, special: 'legendary_elite' }
    }
  }
};

export const GUILD_LEVELS: Record<number, GuildLevel> = {
  1: { level: 1, cost: 5000, members: 20, exp: 0, features: ['basic'] },
  2: { level: 2, cost: 10000, members: 30, exp: 5000, features: ['basic', 'chat'] },
  3: { level: 3, cost: 30000, members: 40, exp: 15000, features: ['basic', 'chat', 'storage'] },
  4: { level: 4, cost: 70000, members: 50, exp: 35000, features: ['basic', 'chat', 'storage', 'building'] },
  5: { level: 5, cost: 150000, members: 65, exp: 70000, features: ['basic', 'chat', 'storage', 'building', 'bonuses'] },
  6: { level: 6, cost: 300000, members: 80, exp: 120000, features: ['basic', 'chat', 'storage', 'building', 'bonuses', 'shop'] },
  7: { level: 7, cost: 500000, members: 100, exp: 200000, features: ['basic', 'chat', 'storage', 'building', 'bonuses', 'shop', 'quests'] },
  8: { level: 8, cost: 800000, members: 120, exp: 320000, features: ['basic', 'chat', 'storage', 'building', 'bonuses', 'shop', 'quests', 'arena'] },
  9: { level: 9, cost: 1200000, members: 150, exp: 500000, features: ['basic', 'chat', 'storage', 'building', 'bonuses', 'shop', 'quests', 'arena', 'events'] },
  10: { level: 10, cost: 2000000, members: 200, exp: 800000, features: ['all'] }
};

export const GUILD_RANKS: Record<GuildRankId, GuildRank> = {
  leader: {
    id: 'leader',
    name: 'Lider',
    emoji: '👑',
    permissions: ['all'],
    color: '#fbbf24'
  },
  officer: {
    id: 'officer',
    name: 'Subay',
    emoji: '🥇',
    permissions: ['invite', 'kick', 'promote', 'manage_storage', 'start_war'],
    color: '#ef4444'
  },
  veteran: {
    id: 'veteran',
    name: 'Veteran',
    emoji: '🥈',
    permissions: ['invite', 'use_storage'],
    color: '#3b82f6'
  },
  elite: {
    id: 'elite',
    name: 'Elit Uye',
    emoji: '🥉',
    permissions: ['use_storage'],
    color: '#8b5cf6'
  },
  member: {
    id: 'member',
    name: 'Uye',
    emoji: '⚔️',
    permissions: ['chat'],
    color: '#10b981'
  },
  recruit: {
    id: 'recruit',
    name: 'Caylak',
    emoji: '🛡️',
    permissions: ['chat'],
    color: '#6b7280'
  }
};

// Helper functions
export function getGuildType(typeId: GuildTypeId): GuildType {
  return GUILD_TYPES[typeId];
}

export function getGuildLevel(level: number): GuildLevel {
  return GUILD_LEVELS[level] || GUILD_LEVELS[1];
}

export function getGuildRank(rankId: GuildRankId): GuildRank {
  return GUILD_RANKS[rankId];
}

export function getGuildBonuses(typeId: GuildTypeId, level: number): GuildBonus {
  const guildType = GUILD_TYPES[typeId];
  return guildType.bonuses[level] || guildType.bonuses[1];
}

export function getNextLevelExp(currentLevel: number): number {
  const nextLevel = currentLevel + 1;
  if (nextLevel > 10) return 0;
  return GUILD_LEVELS[nextLevel].exp;
}

export function getNextLevelCost(currentLevel: number): number {
  const nextLevel = currentLevel + 1;
  if (nextLevel > 10) return 0;
  return GUILD_LEVELS[nextLevel].cost;
}

export function hasFeature(guildLevel: number, feature: GuildFeature): boolean {
  const level = GUILD_LEVELS[guildLevel];
  if (!level) return false;
  return level.features.includes('all') || level.features.includes(feature);
}

export function canJoinGuild(playerLevel: number, guildTypeId: GuildTypeId): boolean {
  const guildType = GUILD_TYPES[guildTypeId];
  return playerLevel >= guildType.minLevel;
}

export function formatBonusName(key: string): string {
  const names: Record<string, string> = {
    caravan_attack: 'Kervan Saldiri',
    loot_bonus: 'Yagma Bonusu',
    infamy_reduction: 'Infamy Azaltma',
    caravan_defense: 'Kervan Savunma',
    guard_reward: 'Koruyucu Odulu',
    karma_gain: 'Karma Kazanci',
    trade_fee: 'Ticaret Ucreti',
    market_slots: 'Market Slotu',
    caravan_capacity: 'Kervan Kapasitesi',
    pvp_damage: 'PvP Hasar',
    arena_reward: 'Arena Odulu',
    war_bonus: 'Savas Bonusu',
    defense: 'Savunma',
    hp_bonus: 'HP Bonusu',
    damage_reduction: 'Hasar Azaltma',
    healing: 'Sifa',
    buff_duration: 'Buff Suresi',
    mp_regen: 'MP Yenilenme',
    craft_success: 'Craft Basarisi',
    craft_speed: 'Craft Hizi',
    resource_bonus: 'Kaynak Bonusu',
    pve_damage: 'PvE Hasar',
    drop_rate: 'Dusme Orani',
    exp_bonus: 'EXP Bonusu',
    friendship_bonus: 'Arkadaslik Bonusu',
    event_reward: 'Etkinlik Odulu',
    daily_quest: 'Gunluk Gorev',
    all_bonus: 'Tum Bonuslar',
    prestige: 'Prestij'
  };
  return names[key] || key;
}

export function formatSpecialAbility(ability: GuildSpecialAbility): string {
  const names: Record<GuildSpecialAbility, string> = {
    bandit_radar: 'Haydut Radari',
    bandit_radar_plus: 'Gelismis Haydut Radari',
    guardian_beacon: 'Koruyucu Isareti',
    guardian_beacon_plus: 'Gelismis Koruyucu Isareti',
    merchant_caravan: 'Ticaret Kervani',
    merchant_empire: 'Ticaret Imparatorlugu',
    war_cry: 'Savas Naras',
    war_master: 'Savas Ustasi',
    fortress: 'Kale',
    iron_fortress: 'Demir Kale',
    mass_heal: 'Toplu Sifa',
    divine_blessing: 'Ilahi Kutsama',
    master_forge: 'Usta Demirhanesi',
    legendary_forge: 'Efsanevi Demirhane',
    hunter_mark: 'Avci Isareti',
    master_hunter: 'Usta Avci',
    party_buff: 'Parti Buffi',
    community_hero: 'Topluluk Kahramani',
    elite_status: 'Elit Status',
    legendary_elite: 'Efsanevi Elit'
  };
  return names[ability] || ability;
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Simdi';
  if (minutes < 60) return `${minutes}dk once`;
  if (hours < 24) return `${hours}s once`;
  return `${days}g once`;
}

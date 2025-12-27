export interface Account {
  id: string;
  email: string;
  username: string;
  is_verified: boolean;
  is_banned: boolean;
  ban_reason?: string;
  trust_score: number;
  premium_until?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export type CharacterClass = 'warrior' | 'archer' | 'mage' | 'healer' | 'ninja';

export type Specialization =
  | 'berserker' | 'paladin'           // Warrior
  | 'sharpshooter' | 'trapper'        // Archer
  | 'dark_mage' | 'elementalist'      // Mage
  | 'druid' | 'priest'                // Healer
  | 'assassin' | 'shadow_dancer';     // Ninja

export interface Character {
  id: string;
  account_id: string;
  name: string;
  class: CharacterClass;
  specialization?: Specialization;
  level: number;
  experience: number;
  cap: number;
  hp: number;
  max_hp: number;
  mp: number;
  max_mp: number;
  attack: number;
  defense: number;
  speed: number;
  crit_rate: number;
  stat_points: number;
  str: number;
  agi: number;
  int: number;
  vit: number;
  wis: number;
  map_id: string;
  position_x: number;
  position_y: number;
  gold: number;
  premium_gems: number;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  account: Account;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
}

export const CLASS_INFO: Record<CharacterClass, {
  name: string;
  nameTR: string;
  icon: string;
  role: string;
  description: string;
  color: string;
}> = {
  warrior: {
    name: 'Warrior',
    nameTR: 'Savaşçı',
    icon: '⚔️',
    role: 'Tank/Melee DPS',
    description: 'Ön saflarda savaşan, yüksek dayanıklılığa sahip yakın dövüş uzmanı.',
    color: 'from-red-600 to-orange-500',
  },
  archer: {
    name: 'Archer',
    nameTR: 'Okçu',
    icon: '🏹',
    role: 'Ranged DPS',
    description: 'Uzak mesafeden yüksek hasar veren, kritik vuruş uzmanı.',
    color: 'from-green-600 to-emerald-500',
  },
  mage: {
    name: 'Mage',
    nameTR: 'Büyücü',
    icon: '🔮',
    role: 'Burst/AoE',
    description: 'Yüksek büyü hasarı veren, AoE ve burst uzmanı.',
    color: 'from-purple-600 to-violet-500',
  },
  healer: {
    name: 'Healer',
    nameTR: 'Şifacı',
    icon: '✨',
    role: 'Support/Heal',
    description: 'Takımı iyileştiren ve destekleyen, buff/debuff uzmanı.',
    color: 'from-yellow-500 to-amber-400',
  },
  ninja: {
    name: 'Ninja',
    nameTR: 'Ninja',
    icon: '🗡️',
    role: 'Assassin',
    description: 'Gölgelerde hareket eden, hız ve kaçış uzmanı suikastçı.',
    color: 'from-gray-600 to-slate-500',
  },
};

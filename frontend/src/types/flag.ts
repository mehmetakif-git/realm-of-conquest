export type FlagType = 'neutral' | 'red' | 'blue';

export interface FlagStatus {
  type: FlagType;
  changedAt: Date | null;
  cooldownEnds: Date | null;
  canChange: boolean;
}

export interface InfamyKarma {
  infamy: number;
  karma: number;
  pkKills: number;
  pkDeaths: number;
  bounty: number;
}

export interface FlagBuffs {
  attackBonus: number;
  defenseBonus: number;
  speedBonus: number;
  expBonus: number;
  goldBonus: number;
  specialEffects: string[];
}

export const FLAG_BUFFS: Record<FlagType, FlagBuffs> = {
  neutral: {
    attackBonus: 0,
    defenseBonus: 0,
    speedBonus: 0,
    expBonus: 0,
    goldBonus: 0,
    specialEffects: [],
  },
  red: {
    attackBonus: 20,
    defenseBonus: -10,
    speedBonus: 10,
    expBonus: -20,
    goldBonus: 0,
    specialEffects: [
      'Kervan saldirisi acik',
      'PK acik',
      'Sehirlere giremez',
      'Yakalanirsa hapise gider',
    ],
  },
  blue: {
    attackBonus: 0,
    defenseBonus: 15,
    speedBonus: 0,
    expBonus: 10,
    goldBonus: 15,
    specialEffects: [
      'Kervan koruma acik',
      'Haydut avi bonusu',
      'Sehir erisimi tam',
      'Koruma odulleri',
    ],
  },
};

export interface InfamyLevel {
  min: number;
  max: number;
  title: string;
  color: string;
}

export const INFAMY_LEVELS: InfamyLevel[] = [
  { min: 0, max: 49, title: 'Temiz', color: '#00ff00' },
  { min: 50, max: 99, title: 'Supheli', color: '#ffff00' },
  { min: 100, max: 199, title: 'Suclu', color: '#ff8800' },
  { min: 200, max: 499, title: 'Aranan', color: '#ff4400' },
  { min: 500, max: 999, title: 'Tehlikeli', color: '#ff0000' },
  { min: 1000, max: Infinity, title: 'Kotu Sohretli', color: '#880000' },
];

export const KARMA_LEVELS: InfamyLevel[] = [
  { min: 0, max: 49, title: 'Siradan', color: '#888888' },
  { min: 50, max: 99, title: 'Yardimsever', color: '#88ff88' },
  { min: 100, max: 199, title: 'Koruyucu', color: '#00ff00' },
  { min: 200, max: 499, title: 'Kahraman', color: '#00ffff' },
  { min: 500, max: 999, title: 'Efsane', color: '#ffff00' },
  { min: 1000, max: Infinity, title: 'Aziz', color: '#ffd700' },
];

export function getInfamyLevel(infamy: number): InfamyLevel {
  return INFAMY_LEVELS.find(l => infamy >= l.min && infamy <= l.max) || INFAMY_LEVELS[0];
}

export function getKarmaLevel(karma: number): InfamyLevel {
  return KARMA_LEVELS.find(l => karma >= l.min && karma <= l.max) || KARMA_LEVELS[0];
}

// PvP Rules
export interface PvPCheckResult {
  canAttack: boolean;
  reason?: string;
  infamyGain?: number;
  karmaGain?: number;
}

export function canAttackPlayer(
  attackerFlag: FlagType,
  attackerLevel: number,
  attackerInCity: boolean,
  targetFlag: FlagType,
  targetLevel: number,
  targetInCity: boolean
): PvPCheckResult {
  // Neutral cannot attack
  if (attackerFlag === 'neutral') {
    return { canAttack: false, reason: 'Tarafsiz iken PvP yapamazsin!' };
  }

  // Level difference check (±10 levels)
  const levelDiff = Math.abs(attackerLevel - targetLevel);
  if (levelDiff > 10) {
    return { canAttack: false, reason: 'Level farki cok fazla! (Max ±10)' };
  }

  // No PvP in cities
  if (attackerInCity || targetInCity) {
    return { canAttack: false, reason: 'Sehir icinde PvP yasak!' };
  }

  // Red flag rules
  if (attackerFlag === 'red') {
    if (targetFlag === 'neutral') {
      return { canAttack: true, infamyGain: 20 };
    }
    if (targetFlag === 'blue') {
      return { canAttack: true, infamyGain: 10 };
    }
    if (targetFlag === 'red') {
      return { canAttack: true, infamyGain: 5 };
    }
  }

  // Blue flag rules
  if (attackerFlag === 'blue') {
    if (targetFlag === 'red') {
      return { canAttack: true, karmaGain: 10 };
    }
    return { canAttack: false, reason: 'Mavi puse sadece haydutlara saldirabilir!' };
  }

  return { canAttack: false };
}

// Other player type for GameWorld
export interface OtherPlayer {
  id: string;
  name: string;
  level: number;
  x: number;
  y: number;
  flag: FlagType;
  class: string;
  icon: string;
}

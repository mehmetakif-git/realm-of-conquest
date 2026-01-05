export type CaravanStatus = 'preparing' | 'traveling' | 'under_attack' | 'arrived' | 'destroyed';

// 5 Kervan Tipi - Bronze to Royal
export interface CaravanType {
  id: string;
  name: string;
  emoji: string;
  icon: string;
  investment: number;
  reward: number;
  profit: number;
  profitPercent: number;
  hp: number;
  maxGuards: number;
  minLevel: number;
  duration: number; // dakika (base)
}

export const CARAVAN_TYPES: CaravanType[] = [
  {
    id: 'bronze',
    name: 'Bronz Kervan',
    emoji: '🟤',
    icon: '🚚',
    investment: 1000,
    reward: 1500,
    profit: 500,
    profitPercent: 50,
    hp: 5000,
    maxGuards: 1,
    minLevel: 20,
    duration: 10,
  },
  {
    id: 'silver',
    name: 'Gumus Kervan',
    emoji: '⚪',
    icon: '🚐',
    investment: 5000,
    reward: 8000,
    profit: 3000,
    profitPercent: 60,
    hp: 15000,
    maxGuards: 2,
    minLevel: 30,
    duration: 15,
  },
  {
    id: 'gold',
    name: 'Altin Kervan',
    emoji: '🟡',
    icon: '🚛',
    investment: 20000,
    reward: 36000,
    profit: 16000,
    profitPercent: 80,
    hp: 40000,
    maxGuards: 3,
    minLevel: 40,
    duration: 20,
  },
  {
    id: 'diamond',
    name: 'Elmas Kervan',
    emoji: '💎',
    icon: '🚜',
    investment: 100000,
    reward: 200000,
    profit: 100000,
    profitPercent: 100,
    hp: 100000,
    maxGuards: 4,
    minLevel: 50,
    duration: 30,
  },
  {
    id: 'royal',
    name: 'Kraliyet Kervani',
    emoji: '👑',
    icon: '🏰',
    investment: 500000,
    reward: 1250000,
    profit: 750000,
    profitPercent: 150,
    hp: 250000,
    maxGuards: 5,
    minLevel: 70,
    duration: 40,
  },
];

// Checkpoint
export interface Checkpoint {
  x: number;
  y: number;
  name: string;
}

// 5 Rota - Checkpoint'li
export interface CaravanRoute {
  id: string;
  name: string;
  distance: 'short' | 'medium' | 'long' | 'very_long' | 'extreme';
  duration: number; // dakika
  dangerLevel: number; // 1-5
  dangerStars: string; // ⭐ symbols
  bonusPercent: number;
  banditSpawnChance: number;
  startPoint: { x: number; y: number; name: string };
  endPoint: { x: number; y: number; name: string };
  checkpoints: Checkpoint[];
}

export const CARAVAN_ROUTES: CaravanRoute[] = [
  {
    id: 'route1',
    name: 'Baslangic Koyu → Kasaba',
    distance: 'short',
    duration: 10,
    dangerLevel: 1,
    dangerStars: '⭐',
    bonusPercent: 0,
    banditSpawnChance: 0.2,
    startPoint: { x: 100, y: 100, name: 'Baslangic Koyu' },
    endPoint: { x: 300, y: 200, name: 'Kasaba' },
    checkpoints: [
      { x: 150, y: 130, name: 'Orman Girisi' },
      { x: 200, y: 150, name: 'Nehir Koprusu' },
      { x: 250, y: 180, name: 'Kasaba Kapisi' },
    ],
  },
  {
    id: 'route2',
    name: 'Kasaba → Sehir',
    distance: 'medium',
    duration: 20,
    dangerLevel: 2,
    dangerStars: '⭐⭐',
    bonusPercent: 10,
    banditSpawnChance: 0.35,
    startPoint: { x: 300, y: 200, name: 'Kasaba' },
    endPoint: { x: 600, y: 400, name: 'Sehir' },
    checkpoints: [
      { x: 400, y: 260, name: 'Col Baslangici' },
      { x: 500, y: 330, name: 'Vaha' },
      { x: 550, y: 380, name: 'Sehir Duvarlari' },
    ],
  },
  {
    id: 'route3',
    name: 'Sehir → Baskent',
    distance: 'long',
    duration: 35,
    dangerLevel: 3,
    dangerStars: '⭐⭐⭐',
    bonusPercent: 25,
    banditSpawnChance: 0.5,
    startPoint: { x: 600, y: 400, name: 'Sehir' },
    endPoint: { x: 1000, y: 700, name: 'Baskent' },
    checkpoints: [
      { x: 700, y: 480, name: 'Dag Gecidi' },
      { x: 800, y: 560, name: 'Karanlik Orman' },
      { x: 900, y: 640, name: 'Baskent Kapisi' },
    ],
  },
  {
    id: 'route4',
    name: 'Baskent → Liman',
    distance: 'very_long',
    duration: 50,
    dangerLevel: 4,
    dangerStars: '⭐⭐⭐⭐',
    bonusPercent: 50,
    banditSpawnChance: 0.65,
    startPoint: { x: 1000, y: 700, name: 'Baskent' },
    endPoint: { x: 1500, y: 1100, name: 'Liman' },
    checkpoints: [
      { x: 1100, y: 800, name: 'Buzul Yolu' },
      { x: 1250, y: 920, name: 'Volkan Vadisi' },
      { x: 1400, y: 1040, name: 'Sahil Yolu' },
      { x: 1480, y: 1090, name: 'Liman Girisi' },
    ],
  },
  {
    id: 'route5',
    name: 'Liman → Ejderha Adasi',
    distance: 'extreme',
    duration: 75,
    dangerLevel: 5,
    dangerStars: '⭐⭐⭐⭐⭐',
    bonusPercent: 100,
    banditSpawnChance: 0.8,
    startPoint: { x: 1500, y: 1100, name: 'Liman' },
    endPoint: { x: 2200, y: 1600, name: 'Ejderha Adasi' },
    checkpoints: [
      { x: 1650, y: 1200, name: 'Acik Deniz' },
      { x: 1800, y: 1300, name: 'Firtina Bolgesi' },
      { x: 1950, y: 1400, name: 'Korsan Sulari' },
      { x: 2100, y: 1520, name: 'Ada Kiyisi' },
    ],
  },
];

// NPC Guard Yetenekleri
export type GuardAbility = 'basic_attack' | 'stun' | 'aoe_attack' | 'taunt' | 'heal' | 'shield' | 'divine_protection';

// NPC Guard Tipi
export interface NPCGuardType {
  id: string;
  name: string;
  emoji: string;
  costPerHour: number;
  power: number; // 1-5
  hp: number;
  atk: number;
  def: number;
  abilities: GuardAbility[];
  description: string;
}

export const NPC_GUARD_TYPES: NPCGuardType[] = [
  {
    id: 'rookie',
    name: 'Caylak Muhafiz',
    emoji: '🟤',
    costPerHour: 500,
    power: 1,
    hp: 3000,
    atk: 50,
    def: 20,
    abilities: ['basic_attack'],
    description: 'Temel koruma saglar',
  },
  {
    id: 'veteran',
    name: 'Deneyimli Muhafiz',
    emoji: '⚪',
    costPerHour: 2000,
    power: 2,
    hp: 8000,
    atk: 120,
    def: 60,
    abilities: ['basic_attack', 'stun'],
    description: 'Stun yetenegi ile haydutlari durdurur',
  },
  {
    id: 'elite',
    name: 'Elit Muhafiz',
    emoji: '🔵',
    costPerHour: 8000,
    power: 3,
    hp: 20000,
    atk: 250,
    def: 120,
    abilities: ['basic_attack', 'stun', 'aoe_attack'],
    description: 'AoE saldiri ile birden fazla hayduta karsi koyar',
  },
  {
    id: 'knight',
    name: 'Sovalye',
    emoji: '🟣',
    costPerHour: 25000,
    power: 4,
    hp: 50000,
    atk: 400,
    def: 200,
    abilities: ['basic_attack', 'stun', 'aoe_attack', 'taunt', 'heal'],
    description: 'Taunt ile haydutlari kendine ceker, heal ile kervani iyilestirir',
  },
  {
    id: 'royal',
    name: 'Kraliyet Muhafizi',
    emoji: '🟡',
    costPerHour: 100000,
    power: 5,
    hp: 120000,
    atk: 650,
    def: 350,
    abilities: ['basic_attack', 'stun', 'aoe_attack', 'taunt', 'heal', 'shield', 'divine_protection'],
    description: 'En guclu muhafiz, tum yeteneklere sahip',
  },
];

// Oyuncu Koruyucu (Player Guard)
export interface CaravanGuard {
  id: string;
  odanId: string;
  characterName: string;
  characterLevel: number;
  characterClass: string;
  status: 'active' | 'dead' | 'left';
  rewardShare: number; // 0.10 = %10
  joinedAt: Date;
}

// NPC Guard Instance
export interface NPCGuardInstance {
  id: string;
  type: NPCGuardType;
  hp: number;
  maxHp: number;
  status: 'active' | 'dead';
  hiredAt: Date;
  duration: number; // saat
}

// Kervan
export interface Caravan {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerLevel: number;

  type: CaravanType;
  route: CaravanRoute;
  status: CaravanStatus;

  // HP Sistemi
  hp: number;
  maxHp: number;

  progressPercent: number;
  currentCheckpoint: number;
  currentX: number;
  currentY: number;

  investment: number;
  potentialReward: number;

  // Koruyucular
  guards: CaravanGuard[];
  npcGuards: NPCGuardInstance[];
  maxPlayerGuards: number;

  startedAt: Date | null;
  estimatedArrival: Date | null;

  isUnderAttack: boolean;
  attackerName: string | null;
  timesAttacked: number;
}

// Koruyucu Panosu (Guardian Board) Listing
export interface GuardianListing {
  guardianId: string;
  guardianName: string;
  level: number;
  class: string;
  fee: number; // %10-15 arasi
  availableHours: string;
  rating: number; // 1-5 yildiz
  successRate: number; // %
  isOnline: boolean;
  autoDefend: boolean;
  totalGuarded: number;
  totalEarned: number;
}

// Helper Functions
export function getDangerColor(level: number): string {
  if (level <= 1) return '#44ff44';
  if (level <= 2) return '#88ff44';
  if (level <= 3) return '#ffff44';
  if (level <= 4) return '#ff8844';
  return '#ff4444';
}

export function getStatusColor(status: CaravanStatus): string {
  switch (status) {
    case 'preparing':
      return '#888888';
    case 'traveling':
      return '#44ff44';
    case 'under_attack':
      return '#ff4444';
    case 'arrived':
      return '#44aaff';
    case 'destroyed':
      return '#ff0000';
    default:
      return '#ffffff';
  }
}

export function getStatusText(status: CaravanStatus): string {
  switch (status) {
    case 'preparing':
      return 'Hazirlaniyor';
    case 'traveling':
      return 'Yolda';
    case 'under_attack':
      return 'Saldiri Altinda!';
    case 'arrived':
      return 'Vardi';
    case 'destroyed':
      return 'Yagmalandi';
    default:
      return status;
  }
}

export function calculateCaravanRewards(
  type: CaravanType,
  route: CaravanRoute
): { baseReward: number; routeBonus: number; totalReward: number; estimatedTime: number } {
  const baseReward = type.reward;
  const routeBonus = Math.floor(baseReward * (route.bonusPercent / 100));
  const totalReward = baseReward + routeBonus;
  const estimatedTime = type.duration + Math.floor(route.duration * 0.5);

  return { baseReward, routeBonus, totalReward, estimatedTime };
}

export function getCaravanTypeById(id: string): CaravanType | undefined {
  return CARAVAN_TYPES.find((t) => t.id === id);
}

export function getRouteById(id: string): CaravanRoute | undefined {
  return CARAVAN_ROUTES.find((r) => r.id === id);
}

export function getGuardTypeById(id: string): NPCGuardType | undefined {
  return NPC_GUARD_TYPES.find((g) => g.id === id);
}

export function formatGold(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toString();
}

export function getDistanceText(distance: CaravanRoute['distance']): string {
  switch (distance) {
    case 'short':
      return 'Kisa';
    case 'medium':
      return 'Orta';
    case 'long':
      return 'Uzun';
    case 'very_long':
      return 'Cok Uzun';
    case 'extreme':
      return 'Ekstrem';
    default:
      return distance;
  }
}

export type CaravanStatus = 'preparing' | 'traveling' | 'under_attack' | 'arrived' | 'destroyed';

export interface CaravanType {
  id: number;
  name: string;
  capacity: number;
  speed: number;
  baseCost: number;
  minGuards: number;
  maxGuards: number;
  rewardMultiplier: number;
  icon: string;
}

export interface CaravanRoute {
  id: number;
  name: string;
  startCity: string;
  endCity: string;
  distance: number;
  dangerLevel: number;
  estimatedMinutes: number;
  rewardBonus: number;
}

export interface CaravanGuard {
  id: string;
  odanId: string;
  characterName: string;
  characterLevel: number;
  characterClass: string;
  status: 'active' | 'dead' | 'left';
  rewardShare: number;
  joinedAt: Date;
}

export interface Caravan {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerLevel: number;

  type: CaravanType;
  route: CaravanRoute;
  status: CaravanStatus;

  progressPercent: number;
  currentX: number;
  currentY: number;

  investment: number;
  cargoValue: number;
  potentialReward: number;

  guards: CaravanGuard[];
  maxGuards: number;

  startedAt: Date | null;
  estimatedArrival: Date | null;

  isUnderAttack: boolean;
  timesAttacked: number;
}

export const CARAVAN_TYPES: CaravanType[] = [
  { id: 1, name: 'Kucuk Kervan', capacity: 100, speed: 8, baseCost: 1000, minGuards: 0, maxGuards: 2, rewardMultiplier: 1.0, icon: '🐴' },
  { id: 2, name: 'Orta Kervan', capacity: 250, speed: 6, baseCost: 5000, minGuards: 1, maxGuards: 4, rewardMultiplier: 1.5, icon: '🐪' },
  { id: 3, name: 'Buyuk Kervan', capacity: 500, speed: 4, baseCost: 15000, minGuards: 2, maxGuards: 6, rewardMultiplier: 2.5, icon: '🐘' },
  { id: 4, name: 'Ticaret Konvoyu', capacity: 1000, speed: 3, baseCost: 50000, minGuards: 4, maxGuards: 10, rewardMultiplier: 4.0, icon: '🚂' },
];

export const CARAVAN_ROUTES: CaravanRoute[] = [
  { id: 1, name: 'Guvenli Yol', startCity: 'Baslangic Koyu', endCity: 'Ticaret Sehri', distance: 100, dangerLevel: 2, estimatedMinutes: 5, rewardBonus: 1.0 },
  { id: 2, name: 'Orman Gecidi', startCity: 'Baslangic Koyu', endCity: 'Orman Kasabasi', distance: 150, dangerLevel: 5, estimatedMinutes: 8, rewardBonus: 1.3 },
  { id: 3, name: 'Tehlikeli Kestirme', startCity: 'Baslangic Koyu', endCity: 'Ticaret Sehri', distance: 60, dangerLevel: 8, estimatedMinutes: 3, rewardBonus: 1.8 },
  { id: 4, name: 'Haydut Vadisi', startCity: 'Orman Kasabasi', endCity: 'Madenci Koyu', distance: 200, dangerLevel: 9, estimatedMinutes: 10, rewardBonus: 2.5 },
];

export function getDangerColor(level: number): string {
  if (level <= 3) return '#44ff44';
  if (level <= 6) return '#ffff44';
  return '#ff4444';
}

export function getStatusColor(status: CaravanStatus): string {
  switch (status) {
    case 'preparing': return '#888888';
    case 'traveling': return '#44ff44';
    case 'under_attack': return '#ff4444';
    case 'arrived': return '#44aaff';
    case 'destroyed': return '#ff0000';
    default: return '#ffffff';
  }
}

export function getStatusText(status: CaravanStatus): string {
  switch (status) {
    case 'preparing': return 'Hazirlaniyor';
    case 'traveling': return 'Yolda';
    case 'under_attack': return 'Saldiri Altinda!';
    case 'arrived': return 'Vardi';
    case 'destroyed': return 'Yagmalandi';
    default: return status;
  }
}

export function calculateCaravanRewards(
  type: CaravanType,
  route: CaravanRoute,
  investment: number
): { cargoValue: number; potentialReward: number; estimatedTime: number } {
  const cargoValue = Math.floor(investment * 1.5);
  const potentialReward = Math.floor(cargoValue * type.rewardMultiplier * route.rewardBonus);
  const estimatedTime = Math.floor(route.estimatedMinutes * (10 / type.speed));

  return { cargoValue, potentialReward, estimatedTime };
}

// Taxi System Types

export type TaxiDriverStatus = 'available' | 'busy' | 'offline';
export type TaxiPassengerStatus = 'searching' | 'riding' | 'arrived';
export type TaxiRequestStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type TaxiRideEndReason =
  | 'completed'
  | 'driver_combat'
  | 'driver_death'
  | 'driver_logout'
  | 'distance_exceeded'
  | 'insufficient_funds'
  | 'manual_kick'
  | 'passenger_leave';

export type TaxiServiceType = 'powerLeveling' | 'questHelp' | 'dungeon' | 'boss' | 'escort';
export type TaxiPurpose = 'farming' | 'quest' | 'dungeon' | 'exploration' | 'boss';

// Taxi Rules
export const TAXI_RULES = {
  minLevelDifference: 10,
  maxDistance: 50, // metre
  passengerInheritAccess: true,
  passengerCanFarm: true,
  passengerGetFullRewards: true,
  cancelOnCombat: true,
  cancelOnDeath: true,
  cancelOnLogout: true,
  cancelOnDistance: true,
  paymentInterval: 60, // saniye
  autoPayment: true,
  refundOnEarlyCancel: true,
  driverCanKick: true,
  passengerCanLeave: true,
  distanceWarningTime: 5000, // 5 saniye
};

// Recommended rates per zone
export const ZONE_TAXI_RATES: Record<string, { rate: number; difficulty: number }> = {
  starter_forest: { rate: 50, difficulty: 1 },
  sand_desert: { rate: 100, difficulty: 1 },
  coastal_region: { rate: 200, difficulty: 2 },
  mountain_pass: { rate: 300, difficulty: 3 },
  volcano_valley: { rate: 500, difficulty: 4 },
  ice_wasteland: { rate: 700, difficulty: 4 },
  abandoned_city: { rate: 1000, difficulty: 5 },
  demon_lands: { rate: 1500, difficulty: 5 },
  dragon_nest: { rate: 2000, difficulty: 5 },
};

// Driver Services
export interface TaxiServices {
  powerLeveling: boolean;
  questHelp: boolean;
  dungeon: boolean;
  boss: boolean;
  escort: boolean;
}

// Driver Statistics
export interface TaxiDriverStats {
  totalRides: number;
  totalDistance: number; // km
  totalEarnings: number;
  rating: number; // 1-5
  successRate: number; // %
  responseTime: number; // saniye
  totalRatings: number;
  cancellations: number;
}

// Driver Availability
export interface TaxiAvailability {
  schedule: string;
  timezone: string;
  currentlyAvailable: boolean;
}

// Driver Preferences
export interface TaxiDriverPreferences {
  minPassengerLevel: number;
  maxPassengerLevel: number;
  preferredLanguage: string;
  autoAccept: boolean;
}

// Taxi Driver
export interface TaxiDriver {
  playerId: string;
  playerName: string;
  level: number;
  class: string;

  accessibleZones: string[];
  baseRate: number;
  negotiable: boolean;

  availability: TaxiAvailability;
  stats: TaxiDriverStats;
  services: TaxiServices;
  preferences: TaxiDriverPreferences;

  status: TaxiDriverStatus;
  currentPassenger: string | null;
  currentDestination: string | null;
}

// Passenger Needs
export interface TaxiPassengerNeeds {
  destination: string;
  purpose: TaxiPurpose;
  duration: number;
  budget: number;
}

// Passenger Preferences
export interface TaxiPassengerPreferences {
  preferredDriverRating: number;
  language: string;
  escort: boolean;
}

// Passenger Stats
export interface TaxiPassengerStats {
  totalRides: number;
  totalSpent: number;
  averageRating: number;
}

// Taxi Passenger
export interface TaxiPassenger {
  playerId: string;
  playerName: string;
  level: number;

  needs: TaxiPassengerNeeds;
  preferences: TaxiPassengerPreferences;
  stats: TaxiPassengerStats;

  status: TaxiPassengerStatus;
  currentDriver: string | null;
}

// Taxi Request Requirements
export interface TaxiRequestRequirements {
  minDriverLevel: number;
  minDriverRating: number;
  services: TaxiServiceType[];
}

// Taxi Offer
export interface TaxiOffer {
  driverId: string;
  driverName: string;
  driverLevel: number;
  driverRating: number;
  rate: number;
  eta: number; // dakika
  message: string;
}

// Taxi Request
export interface TaxiRequest {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerLevel: number;

  destination: string;
  pickupLocation: { x: number; y: number };
  estimatedDuration: number;
  maxBudget: number;

  requirements: TaxiRequestRequirements;

  status: TaxiRequestStatus;
  createdAt: Date;
  expiresAt: Date;

  offers: TaxiOffer[];
  acceptedOffer: TaxiOffer | null;
}

// Active Taxi Ride
export interface TaxiRide {
  id: string;
  driverId: string;
  driverName: string;
  driverLevel: number;
  passengerId: string;
  passengerName: string;
  passengerLevel: number;

  destination: string;
  rate: number;

  startTime: Date;
  endTime: Date | null;

  totalPaid: number;
  status: 'active' | 'completed' | 'cancelled';
  endReason: TaxiRideEndReason | null;

  driverPosition: { x: number; y: number };
  passengerPosition: { x: number; y: number };
  currentDistance: number;
}

// Rating Tags
export const DRIVER_RATING_TAGS = [
  'Hizli',
  'Guvenli',
  'Yardimsever',
  'Iyi Iletisim',
  'Profesyonel',
  'Escort Basarili'
];

export const PASSENGER_RATING_TAGS = [
  'Saygili',
  'Zamaninda Odedi',
  'Iyi Iletisim',
  'Mesafeye Uydu',
  'Tekrar Alirim'
];

// Rating
export interface TaxiRating {
  rideId: string;
  fromId: string;
  toId: string;
  stars: number;
  tags: string[];
  feedback: string;
  createdAt: Date;
}

// Cancel Reason Info
export interface CancelReasonInfo {
  reason: TaxiRideEndReason;
  refund: 'full' | 'partial' | null;
  penalty: 'driver_rating' | 'passenger_rating' | null;
  message: string;
}

export const CANCEL_REASONS: Record<TaxiRideEndReason, CancelReasonInfo> = {
  completed: {
    reason: 'completed',
    refund: null,
    penalty: null,
    message: 'Yolculuk tamamlandi.'
  },
  driver_combat: {
    reason: 'driver_combat',
    refund: 'full',
    penalty: null,
    message: 'Surucu savasa girdi. Taksi iptal edildi.'
  },
  driver_death: {
    reason: 'driver_death',
    refund: 'full',
    penalty: null,
    message: 'Surucu oldu. Taksi iptal edildi.'
  },
  driver_logout: {
    reason: 'driver_logout',
    refund: 'full',
    penalty: 'driver_rating',
    message: 'Surucu oyundan cikti. Taksi iptal edildi.'
  },
  distance_exceeded: {
    reason: 'distance_exceeded',
    refund: 'partial',
    penalty: 'passenger_rating',
    message: 'Mesafe limiti asildi. Taksi iptal edildi.'
  },
  insufficient_funds: {
    reason: 'insufficient_funds',
    refund: null,
    penalty: 'passenger_rating',
    message: 'Yolcunun parasi bitti. Taksi iptal edildi.'
  },
  manual_kick: {
    reason: 'manual_kick',
    refund: 'partial',
    penalty: null,
    message: 'Surucu seni indirdi.'
  },
  passenger_leave: {
    reason: 'passenger_leave',
    refund: null,
    penalty: null,
    message: 'Taksiden indiniz.'
  }
};

// Helper Functions
export function calculateRecommendedRate(
  driverRating: number,
  driverSuccessRate: number,
  hasEscort: boolean,
  zoneId: string
): number {
  const zoneInfo = ZONE_TAXI_RATES[zoneId];
  if (!zoneInfo) return 100;

  let rate = zoneInfo.rate;

  // Rating bonus
  if (driverRating >= 4.8) {
    rate *= 1.2;
  } else if (driverRating >= 4.5) {
    rate *= 1.1;
  }

  // Success rate bonus
  if (driverSuccessRate >= 95) {
    rate *= 1.1;
  }

  // Escort service bonus
  if (hasEscort) {
    rate *= 1.3;
  }

  return Math.floor(rate);
}

export function formatTaxiRate(rate: number): string {
  if (rate >= 1000) {
    return `${(rate / 1000).toFixed(1)}K`;
  }
  return rate.toString();
}

export function formatTaxiDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}s ${mins}dk` : `${hours} saat`;
  }
  return `${minutes} dakika`;
}

export function canBeDriver(playerLevel: number, passengerLevel: number): boolean {
  return playerLevel - passengerLevel >= TAXI_RULES.minLevelDifference;
}

export function getStarEmoji(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let stars = '⭐'.repeat(fullStars);
  if (hasHalf && fullStars < 5) {
    stars += '⭐';
  }
  return stars || '⭐';
}

export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return '#4ade80'; // green
  if (rating >= 4.0) return '#a3e635'; // lime
  if (rating >= 3.5) return '#facc15'; // yellow
  if (rating >= 3.0) return '#fb923c'; // orange
  return '#f87171'; // red
}

export function getDifficultyStars(difficulty: number): string {
  return '⭐'.repeat(difficulty);
}

import { create } from 'zustand';
import type {
  TaxiDriver,
  TaxiRequest,
  TaxiRide,
  TaxiOffer,
  TaxiServiceType,
  TaxiRideEndReason
} from '../types/taxi';
import { CANCEL_REASONS } from '../types/taxi';

// Mock Taxi Drivers
const MOCK_TAXI_DRIVERS: TaxiDriver[] = [
  {
    playerId: 'driver-1',
    playerName: 'DragonMaster',
    level: 78,
    class: 'warrior',
    accessibleZones: ['starter_forest', 'sand_desert', 'coastal_region', 'mountain_pass', 'volcano_valley', 'ice_wasteland', 'abandoned_city'],
    baseRate: 500,
    negotiable: true,
    availability: { schedule: '08:00-22:00', timezone: 'UTC+3', currentlyAvailable: true },
    stats: { totalRides: 127, totalDistance: 4520, totalEarnings: 2850000, rating: 4.9, successRate: 98, responseTime: 30, totalRatings: 120, cancellations: 2 },
    services: { powerLeveling: true, questHelp: true, dungeon: true, boss: true, escort: true },
    preferences: { minPassengerLevel: 1, maxPassengerLevel: 70, preferredLanguage: 'tr', autoAccept: false },
    status: 'available',
    currentPassenger: null,
    currentDestination: null
  },
  {
    playerId: 'driver-2',
    playerName: 'ShadowGuide',
    level: 65,
    class: 'ninja',
    accessibleZones: ['starter_forest', 'sand_desert', 'coastal_region', 'mountain_pass', 'volcano_valley', 'ice_wasteland'],
    baseRate: 400,
    negotiable: true,
    availability: { schedule: '24/7', timezone: 'UTC+3', currentlyAvailable: true },
    stats: { totalRides: 89, totalDistance: 3200, totalEarnings: 1650000, rating: 4.7, successRate: 95, responseTime: 45, totalRatings: 85, cancellations: 4 },
    services: { powerLeveling: true, questHelp: false, dungeon: true, boss: false, escort: true },
    preferences: { minPassengerLevel: 10, maxPassengerLevel: 55, preferredLanguage: 'tr', autoAccept: true },
    status: 'available',
    currentPassenger: null,
    currentDestination: null
  },
  {
    playerId: 'driver-3',
    playerName: 'HolyCarrier',
    level: 92,
    class: 'healer',
    accessibleZones: ['starter_forest', 'sand_desert', 'coastal_region', 'mountain_pass', 'volcano_valley', 'ice_wasteland', 'abandoned_city', 'demon_lands'],
    baseRate: 800,
    negotiable: false,
    availability: { schedule: '10:00-20:00', timezone: 'UTC+3', currentlyAvailable: true },
    stats: { totalRides: 256, totalDistance: 8900, totalEarnings: 6200000, rating: 4.95, successRate: 99, responseTime: 20, totalRatings: 250, cancellations: 1 },
    services: { powerLeveling: true, questHelp: true, dungeon: true, boss: true, escort: true },
    preferences: { minPassengerLevel: 1, maxPassengerLevel: 85, preferredLanguage: 'tr', autoAccept: false },
    status: 'available',
    currentPassenger: null,
    currentDestination: null
  },
  {
    playerId: 'driver-4',
    playerName: 'SwiftRunner',
    level: 55,
    class: 'archer',
    accessibleZones: ['starter_forest', 'sand_desert', 'coastal_region', 'mountain_pass', 'volcano_valley'],
    baseRate: 300,
    negotiable: true,
    availability: { schedule: '14:00-02:00', timezone: 'UTC+3', currentlyAvailable: true },
    stats: { totalRides: 45, totalDistance: 1500, totalEarnings: 450000, rating: 4.3, successRate: 91, responseTime: 60, totalRatings: 42, cancellations: 3 },
    services: { powerLeveling: true, questHelp: false, dungeon: false, boss: false, escort: false },
    preferences: { minPassengerLevel: 1, maxPassengerLevel: 45, preferredLanguage: 'tr', autoAccept: true },
    status: 'busy',
    currentPassenger: 'player-x',
    currentDestination: 'volcano_valley'
  },
  {
    playerId: 'driver-5',
    playerName: 'IronWheels',
    level: 110,
    class: 'warrior',
    accessibleZones: ['starter_forest', 'sand_desert', 'coastal_region', 'mountain_pass', 'volcano_valley', 'ice_wasteland', 'abandoned_city', 'demon_lands', 'dragon_nest'],
    baseRate: 1500,
    negotiable: false,
    availability: { schedule: '18:00-24:00', timezone: 'UTC+3', currentlyAvailable: false },
    stats: { totalRides: 512, totalDistance: 18500, totalEarnings: 15800000, rating: 4.85, successRate: 97, responseTime: 15, totalRatings: 500, cancellations: 8 },
    services: { powerLeveling: true, questHelp: true, dungeon: true, boss: true, escort: true },
    preferences: { minPassengerLevel: 1, maxPassengerLevel: 100, preferredLanguage: 'tr', autoAccept: false },
    status: 'offline',
    currentPassenger: null,
    currentDestination: null
  }
];

interface TaxiState {
  // Drivers
  drivers: TaxiDriver[];
  featuredDrivers: TaxiDriver[];

  // Driver Mode (if current player is a driver)
  driverMode: {
    active: boolean;
    profile: TaxiDriver | null;
    currentPassenger: string | null;
    sessionEarnings: number;
  };

  // Passenger Mode (if current player is passenger)
  passengerMode: {
    active: boolean;
    currentDriver: string | null;
    currentRide: TaxiRide | null;
    totalSpent: number;
  };

  // Requests
  activeRequests: TaxiRequest[];
  myRequests: TaxiRequest[];

  // Filters
  filters: {
    zone: string | 'all';
    minRating: number;
    maxRate: number;
    services: TaxiServiceType[];
    onlineOnly: boolean;
  };

  // Actions
  setFilters: (filters: Partial<TaxiState['filters']>) => void;
  getFilteredDrivers: () => TaxiDriver[];
  getFeaturedDrivers: () => TaxiDriver[];

  // Driver Actions
  toggleDriverMode: (active: boolean) => void;
  updateDriverProfile: (updates: Partial<TaxiDriver>) => void;
  acceptRequest: (requestId: string, rate: number) => void;
  kickPassenger: () => void;

  // Passenger Actions
  createRequest: (
    passengerId: string,
    passengerName: string,
    passengerLevel: number,
    destination: string,
    maxBudget: number,
    services: TaxiServiceType[]
  ) => TaxiRequest;
  cancelRequest: (requestId: string) => void;
  acceptOffer: (requestId: string, driverId: string) => void;
  leaveRide: () => void;

  // Ride Actions
  startRide: (driverId: string, passengerId: string, destination: string, rate: number) => TaxiRide;
  endRide: (reason: TaxiRideEndReason) => void;
  processPayment: () => void;

  // Rating
  rateRide: (rideId: string, toId: string, stars: number, tags: string[], feedback: string) => void;
}

export const useTaxiStore = create<TaxiState>((set, get) => ({
  drivers: MOCK_TAXI_DRIVERS,
  featuredDrivers: [],

  driverMode: {
    active: false,
    profile: null,
    currentPassenger: null,
    sessionEarnings: 0
  },

  passengerMode: {
    active: false,
    currentDriver: null,
    currentRide: null,
    totalSpent: 0
  },

  activeRequests: [],
  myRequests: [],

  filters: {
    zone: 'all',
    minRating: 0,
    maxRate: 10000,
    services: [],
    onlineOnly: false
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  getFilteredDrivers: () => {
    const { drivers, filters } = get();

    return drivers.filter((driver) => {
      // Online filter
      if (filters.onlineOnly && driver.status === 'offline') {
        return false;
      }

      // Rating filter
      if (driver.stats.rating < filters.minRating) {
        return false;
      }

      // Rate filter
      if (driver.baseRate > filters.maxRate) {
        return false;
      }

      // Zone filter
      if (filters.zone !== 'all' && !driver.accessibleZones.includes(filters.zone)) {
        return false;
      }

      // Services filter
      if (filters.services.length > 0) {
        const hasAllServices = filters.services.every(
          (service) => driver.services[service]
        );
        if (!hasAllServices) {
          return false;
        }
      }

      return true;
    });
  },

  getFeaturedDrivers: () => {
    const { drivers } = get();

    return drivers
      .filter((d) => d.status === 'available')
      .filter((d) => d.stats.rating >= 4.7)
      .filter((d) => d.stats.totalRides >= 50)
      .sort((a, b) => b.stats.rating - a.stats.rating)
      .slice(0, 5);
  },

  toggleDriverMode: (active) => {
    set((state) => ({
      driverMode: {
        ...state.driverMode,
        active
      }
    }));
  },

  updateDriverProfile: (updates) => {
    set((state) => ({
      driverMode: {
        ...state.driverMode,
        profile: state.driverMode.profile
          ? { ...state.driverMode.profile, ...updates }
          : null
      }
    }));
  },

  acceptRequest: (requestId, rate) => {
    set((state) => {
      const request = state.activeRequests.find((r) => r.id === requestId);
      if (!request || !state.driverMode.profile) return state;

      const offer: TaxiOffer = {
        driverId: state.driverMode.profile.playerId,
        driverName: state.driverMode.profile.playerName,
        driverLevel: state.driverMode.profile.level,
        driverRating: state.driverMode.profile.stats.rating,
        rate,
        eta: 5,
        message: ''
      };

      return {
        activeRequests: state.activeRequests.map((r) =>
          r.id === requestId
            ? { ...r, offers: [...r.offers, offer] }
            : r
        )
      };
    });
  },

  kickPassenger: () => {
    const { passengerMode } = get();
    if (passengerMode.currentRide) {
      get().endRide('manual_kick');
    }
  },

  createRequest: (passengerId, passengerName, passengerLevel, destination, maxBudget, services) => {
    const request: TaxiRequest = {
      id: `request-${Date.now()}`,
      passengerId,
      passengerName,
      passengerLevel,
      destination,
      pickupLocation: { x: 100, y: 100 },
      estimatedDuration: 30,
      maxBudget,
      requirements: {
        minDriverLevel: passengerLevel + 10,
        minDriverRating: 4.0,
        services
      },
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      offers: [],
      acceptedOffer: null
    };

    set((state) => ({
      activeRequests: [...state.activeRequests, request],
      myRequests: [...state.myRequests, request]
    }));

    return request;
  },

  cancelRequest: (requestId) => {
    set((state) => ({
      activeRequests: state.activeRequests.filter((r) => r.id !== requestId),
      myRequests: state.myRequests.filter((r) => r.id !== requestId)
    }));
  },

  acceptOffer: (requestId, driverId) => {
    set((state) => {
      const request = state.activeRequests.find((r) => r.id === requestId);
      if (!request) return state;

      const offer = request.offers.find((o) => o.driverId === driverId);
      if (!offer) return state;

      // Start ride
      const ride = get().startRide(driverId, request.passengerId, request.destination, offer.rate);

      return {
        activeRequests: state.activeRequests.map((r) =>
          r.id === requestId
            ? { ...r, status: 'accepted' as const, acceptedOffer: offer }
            : r
        ),
        passengerMode: {
          ...state.passengerMode,
          active: true,
          currentDriver: driverId,
          currentRide: ride
        }
      };
    });
  },

  leaveRide: () => {
    get().endRide('passenger_leave');
  },

  startRide: (driverId, passengerId, destination, rate) => {
    const driver = get().drivers.find((d) => d.playerId === driverId);

    const ride: TaxiRide = {
      id: `ride-${Date.now()}`,
      driverId,
      driverName: driver?.playerName || 'Unknown',
      driverLevel: driver?.level || 0,
      passengerId,
      passengerName: 'Passenger',
      passengerLevel: 0,
      destination,
      rate,
      startTime: new Date(),
      endTime: null,
      totalPaid: 0,
      status: 'active',
      endReason: null,
      driverPosition: { x: 100, y: 100 },
      passengerPosition: { x: 100, y: 100 },
      currentDistance: 0
    };

    set((state) => ({
      passengerMode: {
        ...state.passengerMode,
        active: true,
        currentDriver: driverId,
        currentRide: ride
      },
      drivers: state.drivers.map((d) =>
        d.playerId === driverId
          ? { ...d, status: 'busy' as const, currentPassenger: passengerId, currentDestination: destination }
          : d
      )
    }));

    return ride;
  },

  endRide: (reason) => {
    const { passengerMode } = get();
    if (!passengerMode.currentRide) return;

    const cancelInfo = CANCEL_REASONS[reason];

    set((state) => ({
      passengerMode: {
        ...state.passengerMode,
        active: false,
        currentDriver: null,
        currentRide: state.passengerMode.currentRide
          ? {
              ...state.passengerMode.currentRide,
              status: 'completed',
              endTime: new Date(),
              endReason: reason
            }
          : null
      },
      drivers: state.drivers.map((d) =>
        d.playerId === state.passengerMode.currentDriver
          ? { ...d, status: 'available' as const, currentPassenger: null, currentDestination: null }
          : d
      )
    }));

    console.log(`Ride ended: ${cancelInfo.message}`);
  },

  processPayment: () => {
    set((state) => {
      if (!state.passengerMode.currentRide) return state;

      const newTotalPaid = state.passengerMode.currentRide.totalPaid + state.passengerMode.currentRide.rate;

      return {
        passengerMode: {
          ...state.passengerMode,
          currentRide: {
            ...state.passengerMode.currentRide,
            totalPaid: newTotalPaid
          },
          totalSpent: state.passengerMode.totalSpent + state.passengerMode.currentRide.rate
        }
      };
    });
  },

  rateRide: (_rideId, toId, stars, _tags, _feedback) => {
    console.log(`Rating submitted: ${stars} stars to ${toId}`);
    // In real implementation, this would update the driver/passenger stats
  }
}));

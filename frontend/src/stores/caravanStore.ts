import { create } from 'zustand';
import type {
  Caravan,
  CaravanGuard,
  CaravanStatus,
  NPCGuardInstance,
  GuardianListing,
} from '../types/caravan';
import {
  CARAVAN_TYPES,
  CARAVAN_ROUTES,
  NPC_GUARD_TYPES,
  calculateCaravanRewards,
  getCaravanTypeById,
  getRouteById,
  getGuardTypeById,
} from '../types/caravan';

interface CaravanReward {
  playerId: string;
  playerName: string;
  type: 'gold' | 'exp' | 'karma';
  amount: number;
}

// Mock Guardian Board Data
const MOCK_GUARDIAN_LISTINGS: GuardianListing[] = [
  {
    guardianId: 'guard-1',
    guardianName: 'SteelShield',
    level: 45,
    class: 'warrior',
    fee: 10,
    availableHours: '08:00-22:00',
    rating: 4.8,
    successRate: 95,
    isOnline: true,
    autoDefend: true,
    totalGuarded: 127,
    totalEarned: 850000,
  },
  {
    guardianId: 'guard-2',
    guardianName: 'HolyProtector',
    level: 52,
    class: 'healer',
    fee: 12,
    availableHours: '10:00-20:00',
    rating: 4.5,
    successRate: 88,
    isOnline: true,
    autoDefend: true,
    totalGuarded: 89,
    totalEarned: 620000,
  },
  {
    guardianId: 'guard-3',
    guardianName: 'ShadowWarden',
    level: 48,
    class: 'ninja',
    fee: 15,
    availableHours: '00:00-24:00',
    rating: 4.9,
    successRate: 97,
    isOnline: false,
    autoDefend: true,
    totalGuarded: 203,
    totalEarned: 1250000,
  },
  {
    guardianId: 'guard-4',
    guardianName: 'ArrowStorm',
    level: 41,
    class: 'archer',
    fee: 11,
    availableHours: '12:00-00:00',
    rating: 4.2,
    successRate: 82,
    isOnline: true,
    autoDefend: false,
    totalGuarded: 56,
    totalEarned: 380000,
  },
  {
    guardianId: 'guard-5',
    guardianName: 'FlameWard',
    level: 55,
    class: 'mage',
    fee: 13,
    availableHours: '06:00-18:00',
    rating: 4.7,
    successRate: 91,
    isOnline: true,
    autoDefend: true,
    totalGuarded: 145,
    totalEarned: 980000,
  },
];

interface CaravanStore {
  caravans: Caravan[];
  myCaravan: Caravan | null;
  guardingCaravan: Caravan | null;
  guardianListings: GuardianListing[];

  // Caravan Actions
  createCaravan: (
    ownerId: string,
    ownerName: string,
    ownerLevel: number,
    typeId: string,
    routeId: string
  ) => Caravan | null;
  startCaravan: (caravanId: string) => void;

  // Guard Actions
  joinAsGuard: (
    caravanId: string,
    characterId: string,
    characterName: string,
    characterLevel: number,
    characterClass: string
  ) => boolean;
  leaveGuard: (caravanId: string, characterId: string) => void;
  hireNPCGuard: (caravanId: string, guardTypeId: string, duration: number) => boolean;
  hirePlayerGuardian: (caravanId: string, guardianId: string) => boolean;

  // Attack Actions
  attackCaravan: (caravanId: string, attackerId: string, attackerName?: string) => void;
  damageCaravan: (caravanId: string, damage: number) => void;
  endAttack: (caravanId: string, attackerWon: boolean) => void;

  // Progress & Complete
  updateProgress: () => void;
  completeCaravan: (caravanId: string) => { rewards: CaravanReward[] };
  destroyCaravan: (caravanId: string) => void;

  // Getters
  getActiveCaravans: () => Caravan[];
  setMyCaravan: (caravan: Caravan | null) => void;
  setGuardingCaravan: (caravan: Caravan | null) => void;
}

export const useCaravanStore = create<CaravanStore>((set, get) => ({
  caravans: [],
  myCaravan: null,
  guardingCaravan: null,
  guardianListings: MOCK_GUARDIAN_LISTINGS,

  createCaravan: (ownerId, ownerName, ownerLevel, typeId, routeId) => {
    const type = getCaravanTypeById(typeId);
    const route = getRouteById(routeId);

    if (!type || !route) return null;

    // Level check
    if (ownerLevel < type.minLevel) return null;

    const { totalReward } = calculateCaravanRewards(type, route);

    const newCaravan: Caravan = {
      id: crypto.randomUUID(),
      ownerId,
      ownerName,
      ownerLevel,
      type,
      route,
      status: 'preparing',

      // HP Sistemi
      hp: type.hp,
      maxHp: type.hp,

      progressPercent: 0,
      currentCheckpoint: 0,
      currentX: route.startPoint.x,
      currentY: route.startPoint.y,

      investment: type.investment,
      potentialReward: totalReward,

      guards: [],
      npcGuards: [],
      maxPlayerGuards: type.maxGuards,

      startedAt: null,
      estimatedArrival: null,

      isUnderAttack: false,
      attackerName: null,
      timesAttacked: 0,
    };

    set((state) => ({
      caravans: [...state.caravans, newCaravan],
      myCaravan: newCaravan,
    }));

    return newCaravan;
  },

  startCaravan: (caravanId) => {
    set((state) => ({
      caravans: state.caravans.map((c) => {
        if (c.id === caravanId && c.status === 'preparing') {
          const now = new Date();
          const { estimatedTime } = calculateCaravanRewards(c.type, c.route);
          return {
            ...c,
            status: 'traveling' as CaravanStatus,
            startedAt: now,
            estimatedArrival: new Date(now.getTime() + estimatedTime * 60000),
          };
        }
        return c;
      }),
      myCaravan:
        state.myCaravan?.id === caravanId
          ? {
              ...state.myCaravan,
              status: 'traveling' as CaravanStatus,
              startedAt: new Date(),
            }
          : state.myCaravan,
    }));
  },

  joinAsGuard: (caravanId, characterId, characterName, characterLevel, characterClass) => {
    const caravan = get().caravans.find((c) => c.id === caravanId);
    if (!caravan || caravan.guards.length >= caravan.maxPlayerGuards) return false;

    // Check if already a guard
    if (caravan.guards.some((g) => g.odanId === characterId)) return false;

    const guard: CaravanGuard = {
      id: crypto.randomUUID(),
      odanId: characterId,
      characterName,
      characterLevel,
      characterClass,
      status: 'active',
      rewardShare: 0.1, // %10
      joinedAt: new Date(),
    };

    set((state) => {
      const updatedCaravans = state.caravans.map((c) => {
        if (c.id === caravanId) {
          return { ...c, guards: [...c.guards, guard] };
        }
        return c;
      });

      const guardingCaravan = updatedCaravans.find((c) => c.id === caravanId) || null;

      return {
        caravans: updatedCaravans,
        guardingCaravan,
      };
    });

    return true;
  },

  leaveGuard: (caravanId, characterId) => {
    set((state) => ({
      caravans: state.caravans.map((c) => {
        if (c.id === caravanId) {
          return {
            ...c,
            guards: c.guards.map((g) =>
              g.odanId === characterId ? { ...g, status: 'left' as const } : g
            ),
          };
        }
        return c;
      }),
      guardingCaravan: state.guardingCaravan?.id === caravanId ? null : state.guardingCaravan,
    }));
  },

  hireNPCGuard: (caravanId, guardTypeId, duration) => {
    const caravan = get().caravans.find((c) => c.id === caravanId);
    const guardType = getGuardTypeById(guardTypeId);

    if (!caravan || !guardType) return false;

    // Max 3 NPC guard per caravan
    if (caravan.npcGuards.length >= 3) return false;

    const npcGuard: NPCGuardInstance = {
      id: crypto.randomUUID(),
      type: guardType,
      hp: guardType.hp,
      maxHp: guardType.hp,
      status: 'active',
      hiredAt: new Date(),
      duration,
    };

    set((state) => ({
      caravans: state.caravans.map((c) => {
        if (c.id === caravanId) {
          return { ...c, npcGuards: [...c.npcGuards, npcGuard] };
        }
        return c;
      }),
      myCaravan:
        state.myCaravan?.id === caravanId
          ? { ...state.myCaravan, npcGuards: [...state.myCaravan.npcGuards, npcGuard] }
          : state.myCaravan,
    }));

    return true;
  },

  hirePlayerGuardian: (caravanId, guardianId) => {
    const guardian = get().guardianListings.find((g) => g.guardianId === guardianId);
    if (!guardian || !guardian.isOnline) return false;

    return get().joinAsGuard(
      caravanId,
      guardian.guardianId,
      guardian.guardianName,
      guardian.level,
      guardian.class
    );
  },

  attackCaravan: (caravanId, _attackerId, attackerName) => {
    set((state) => ({
      caravans: state.caravans.map((c) => {
        if (c.id === caravanId) {
          return {
            ...c,
            status: 'under_attack' as CaravanStatus,
            isUnderAttack: true,
            attackerName: attackerName || 'Bilinmeyen Haydut',
            timesAttacked: c.timesAttacked + 1,
          };
        }
        return c;
      }),
    }));
  },

  damageCaravan: (caravanId, damage) => {
    set((state) => ({
      caravans: state.caravans.map((c) => {
        if (c.id === caravanId) {
          const newHp = Math.max(0, c.hp - damage);
          if (newHp <= 0) {
            // Caravan destroyed
            return {
              ...c,
              hp: 0,
              status: 'destroyed' as CaravanStatus,
            };
          }
          return { ...c, hp: newHp };
        }
        return c;
      }),
    }));
  },

  endAttack: (caravanId, attackerWon) => {
    if (attackerWon) {
      get().destroyCaravan(caravanId);
    } else {
      set((state) => ({
        caravans: state.caravans.map((c) => {
          if (c.id === caravanId) {
            return {
              ...c,
              status: 'traveling' as CaravanStatus,
              isUnderAttack: false,
              attackerName: null,
            };
          }
          return c;
        }),
      }));
    }
  },

  updateProgress: () => {
    set((state) => ({
      caravans: state.caravans.map((c) => {
        if (c.status === 'traveling' && !c.isUnderAttack) {
          const newProgress = Math.min(100, c.progressPercent + 2);
          const newStatus: CaravanStatus = newProgress >= 100 ? 'arrived' : 'traveling';

          // Calculate position along route
          const totalCheckpoints = c.route.checkpoints.length;
          const checkpointIndex = Math.floor((newProgress / 100) * totalCheckpoints);
          const currentCheckpoint = Math.min(checkpointIndex, totalCheckpoints - 1);

          // Interpolate position
          let newX = c.route.startPoint.x;
          let newY = c.route.startPoint.y;

          if (newProgress >= 100) {
            newX = c.route.endPoint.x;
            newY = c.route.endPoint.y;
          } else if (currentCheckpoint >= 0 && c.route.checkpoints[currentCheckpoint]) {
            const cp = c.route.checkpoints[currentCheckpoint];
            newX = cp.x;
            newY = cp.y;
          }

          return {
            ...c,
            progressPercent: newProgress,
            status: newStatus,
            currentCheckpoint,
            currentX: newX,
            currentY: newY,
          };
        }
        return c;
      }),
      myCaravan:
        state.myCaravan && state.myCaravan.status === 'traveling' && !state.myCaravan.isUnderAttack
          ? {
              ...state.myCaravan,
              progressPercent: Math.min(100, state.myCaravan.progressPercent + 2),
              status: state.myCaravan.progressPercent + 2 >= 100 ? 'arrived' : 'traveling',
            }
          : state.myCaravan,
      guardingCaravan:
        state.guardingCaravan &&
        state.guardingCaravan.status === 'traveling' &&
        !state.guardingCaravan.isUnderAttack
          ? {
              ...state.guardingCaravan,
              progressPercent: Math.min(100, state.guardingCaravan.progressPercent + 2),
              status: state.guardingCaravan.progressPercent + 2 >= 100 ? 'arrived' : 'traveling',
            }
          : state.guardingCaravan,
    }));
  },

  completeCaravan: (caravanId) => {
    const caravan = get().caravans.find((c) => c.id === caravanId);
    if (!caravan) return { rewards: [] };

    const activeGuards = caravan.guards.filter((g) => g.status === 'active');
    const guardShareTotal = activeGuards.length * 0.1;
    const ownerShare = 1 - guardShareTotal;

    const rewards: CaravanReward[] = [
      {
        playerId: caravan.ownerId,
        playerName: caravan.ownerName,
        type: 'gold',
        amount: Math.floor(caravan.potentialReward * ownerShare),
      },
      ...activeGuards.map((g) => ({
        playerId: g.odanId,
        playerName: g.characterName,
        type: 'gold' as const,
        amount: Math.floor(caravan.potentialReward * g.rewardShare),
      })),
      // Karma for owner
      {
        playerId: caravan.ownerId,
        playerName: caravan.ownerName,
        type: 'karma',
        amount: 10,
      },
      // Karma for guards
      ...activeGuards.map((g) => ({
        playerId: g.odanId,
        playerName: g.characterName,
        type: 'karma' as const,
        amount: 20,
      })),
    ];

    set((state) => ({
      caravans: state.caravans.filter((c) => c.id !== caravanId),
      myCaravan: state.myCaravan?.id === caravanId ? null : state.myCaravan,
      guardingCaravan: state.guardingCaravan?.id === caravanId ? null : state.guardingCaravan,
    }));

    return { rewards };
  },

  destroyCaravan: (caravanId) => {
    set((state) => ({
      caravans: state.caravans.map((c) => {
        if (c.id === caravanId) {
          return { ...c, status: 'destroyed' as CaravanStatus, hp: 0 };
        }
        return c;
      }),
    }));

    // Remove after a short delay
    setTimeout(() => {
      set((state) => ({
        caravans: state.caravans.filter((c) => c.id !== caravanId),
        myCaravan: state.myCaravan?.id === caravanId ? null : state.myCaravan,
        guardingCaravan: state.guardingCaravan?.id === caravanId ? null : state.guardingCaravan,
      }));
    }, 3000);
  },

  getActiveCaravans: () => {
    return get().caravans.filter(
      (c) => c.status === 'preparing' || c.status === 'traveling' || c.status === 'under_attack'
    );
  },

  setMyCaravan: (caravan) => {
    set({ myCaravan: caravan });
  },

  setGuardingCaravan: (caravan) => {
    set({ guardingCaravan: caravan });
  },
}));

// Export types and constants for use in components
export { CARAVAN_TYPES, CARAVAN_ROUTES, NPC_GUARD_TYPES };

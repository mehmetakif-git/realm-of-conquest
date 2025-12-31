import { create } from 'zustand';
import type { Caravan, CaravanGuard, CaravanStatus } from '../types/caravan';
import { CARAVAN_TYPES, CARAVAN_ROUTES, calculateCaravanRewards } from '../types/caravan';

interface CaravanReward {
  playerId: string;
  playerName: string;
  type: 'gold' | 'exp' | 'karma';
  amount: number;
}

interface CaravanStore {
  caravans: Caravan[];
  myCaravan: Caravan | null;
  guardingCaravan: Caravan | null;

  createCaravan: (
    ownerId: string,
    ownerName: string,
    ownerLevel: number,
    typeId: number,
    routeId: number,
    investment: number
  ) => Caravan | null;
  startCaravan: (caravanId: string) => void;
  joinAsGuard: (
    caravanId: string,
    characterId: string,
    characterName: string,
    characterLevel: number,
    characterClass: string
  ) => boolean;
  leaveGuard: (caravanId: string, characterId: string) => void;
  attackCaravan: (caravanId: string, attackerId: string) => void;
  endAttack: (caravanId: string, attackerWon: boolean) => void;
  updateProgress: () => void;
  completeCaravan: (caravanId: string) => { rewards: CaravanReward[] };
  destroyCaravan: (caravanId: string) => void;
  getActiveCaravans: () => Caravan[];
  setMyCaravan: (caravan: Caravan | null) => void;
  setGuardingCaravan: (caravan: Caravan | null) => void;
}

export const useCaravanStore = create<CaravanStore>((set, get) => ({
  caravans: [],
  myCaravan: null,
  guardingCaravan: null,

  createCaravan: (ownerId, ownerName, ownerLevel, typeId, routeId, investment) => {
    const type = CARAVAN_TYPES.find(t => t.id === typeId);
    const route = CARAVAN_ROUTES.find(r => r.id === routeId);

    if (!type || !route) return null;

    const { cargoValue, potentialReward } = calculateCaravanRewards(type, route, investment);

    const newCaravan: Caravan = {
      id: crypto.randomUUID(),
      ownerId,
      ownerName,
      ownerLevel,
      type,
      route,
      status: 'preparing',
      progressPercent: 0,
      currentX: 10,
      currentY: 50,
      investment: type.baseCost + investment,
      cargoValue,
      potentialReward,
      guards: [],
      maxGuards: type.maxGuards,
      startedAt: null,
      estimatedArrival: null,
      isUnderAttack: false,
      timesAttacked: 0,
    };

    set(state => ({
      caravans: [...state.caravans, newCaravan],
      myCaravan: newCaravan,
    }));

    return newCaravan;
  },

  startCaravan: (caravanId) => {
    set(state => ({
      caravans: state.caravans.map(c => {
        if (c.id === caravanId && c.status === 'preparing') {
          const now = new Date();
          const estimatedMinutes = c.route.estimatedMinutes * (10 / c.type.speed);
          return {
            ...c,
            status: 'traveling' as CaravanStatus,
            startedAt: now,
            estimatedArrival: new Date(now.getTime() + estimatedMinutes * 60000),
          };
        }
        return c;
      }),
      myCaravan: state.myCaravan?.id === caravanId ? {
        ...state.myCaravan,
        status: 'traveling' as CaravanStatus,
        startedAt: new Date(),
      } : state.myCaravan,
    }));
  },

  joinAsGuard: (caravanId, characterId, characterName, characterLevel, characterClass) => {
    const caravan = get().caravans.find(c => c.id === caravanId);
    if (!caravan || caravan.guards.length >= caravan.maxGuards) return false;

    // Check if already a guard
    if (caravan.guards.some(g => g.odanId === characterId)) return false;

    const guard: CaravanGuard = {
      id: crypto.randomUUID(),
      odanId: characterId,
      characterName,
      characterLevel,
      characterClass,
      status: 'active',
      rewardShare: 0.1,
      joinedAt: new Date(),
    };

    set(state => {
      const updatedCaravans = state.caravans.map(c => {
        if (c.id === caravanId) {
          return { ...c, guards: [...c.guards, guard] };
        }
        return c;
      });

      const guardingCaravan = updatedCaravans.find(c => c.id === caravanId) || null;

      return {
        caravans: updatedCaravans,
        guardingCaravan,
      };
    });

    return true;
  },

  leaveGuard: (caravanId, characterId) => {
    set(state => ({
      caravans: state.caravans.map(c => {
        if (c.id === caravanId) {
          return {
            ...c,
            guards: c.guards.map(g =>
              g.odanId === characterId ? { ...g, status: 'left' as const } : g
            ),
          };
        }
        return c;
      }),
      guardingCaravan: state.guardingCaravan?.id === caravanId ? null : state.guardingCaravan,
    }));
  },

  attackCaravan: (caravanId, _attackerId) => {
    set(state => ({
      caravans: state.caravans.map(c => {
        if (c.id === caravanId) {
          return {
            ...c,
            status: 'under_attack' as CaravanStatus,
            isUnderAttack: true,
            timesAttacked: c.timesAttacked + 1,
          };
        }
        return c;
      }),
    }));
  },

  endAttack: (caravanId, attackerWon) => {
    if (attackerWon) {
      get().destroyCaravan(caravanId);
    } else {
      set(state => ({
        caravans: state.caravans.map(c => {
          if (c.id === caravanId) {
            return {
              ...c,
              status: 'traveling' as CaravanStatus,
              isUnderAttack: false,
            };
          }
          return c;
        }),
      }));
    }
  },

  updateProgress: () => {
    set(state => ({
      caravans: state.caravans.map(c => {
        if (c.status === 'traveling' && !c.isUnderAttack) {
          const newProgress = Math.min(100, c.progressPercent + 2);
          const newStatus: CaravanStatus = newProgress >= 100 ? 'arrived' : 'traveling';
          const newX = 10 + (newProgress * 0.8);
          const newY = 50 + Math.sin(newProgress * 0.1) * 15;

          return {
            ...c,
            progressPercent: newProgress,
            status: newStatus,
            currentX: newX,
            currentY: newY,
          };
        }
        return c;
      }),
      myCaravan: state.myCaravan && state.myCaravan.status === 'traveling' && !state.myCaravan.isUnderAttack
        ? {
            ...state.myCaravan,
            progressPercent: Math.min(100, state.myCaravan.progressPercent + 2),
            status: state.myCaravan.progressPercent + 2 >= 100 ? 'arrived' : 'traveling',
          }
        : state.myCaravan,
      guardingCaravan: state.guardingCaravan && state.guardingCaravan.status === 'traveling' && !state.guardingCaravan.isUnderAttack
        ? {
            ...state.guardingCaravan,
            progressPercent: Math.min(100, state.guardingCaravan.progressPercent + 2),
            status: state.guardingCaravan.progressPercent + 2 >= 100 ? 'arrived' : 'traveling',
          }
        : state.guardingCaravan,
    }));
  },

  completeCaravan: (caravanId) => {
    const caravan = get().caravans.find(c => c.id === caravanId);
    if (!caravan) return { rewards: [] };

    const activeGuards = caravan.guards.filter(g => g.status === 'active');
    const guardShareTotal = activeGuards.length * 0.1;
    const ownerShare = 1 - guardShareTotal;

    const rewards: CaravanReward[] = [
      {
        playerId: caravan.ownerId,
        playerName: caravan.ownerName,
        type: 'gold',
        amount: Math.floor(caravan.potentialReward * ownerShare),
      },
      ...activeGuards.map(g => ({
        playerId: g.odanId,
        playerName: g.characterName,
        type: 'gold' as const,
        amount: Math.floor(caravan.potentialReward * g.rewardShare),
      })),
      // Karma for guards
      ...activeGuards.map(g => ({
        playerId: g.odanId,
        playerName: g.characterName,
        type: 'karma' as const,
        amount: 20,
      })),
    ];

    set(state => ({
      caravans: state.caravans.filter(c => c.id !== caravanId),
      myCaravan: state.myCaravan?.id === caravanId ? null : state.myCaravan,
      guardingCaravan: state.guardingCaravan?.id === caravanId ? null : state.guardingCaravan,
    }));

    return { rewards };
  },

  destroyCaravan: (caravanId) => {
    set(state => ({
      caravans: state.caravans.map(c => {
        if (c.id === caravanId) {
          return { ...c, status: 'destroyed' as CaravanStatus };
        }
        return c;
      }),
    }));

    // Remove after a short delay
    setTimeout(() => {
      set(state => ({
        caravans: state.caravans.filter(c => c.id !== caravanId),
        myCaravan: state.myCaravan?.id === caravanId ? null : state.myCaravan,
        guardingCaravan: state.guardingCaravan?.id === caravanId ? null : state.guardingCaravan,
      }));
    }, 3000);
  },

  getActiveCaravans: () => {
    return get().caravans.filter(c =>
      c.status === 'preparing' || c.status === 'traveling' || c.status === 'under_attack'
    );
  },

  setMyCaravan: (caravan) => {
    set({ myCaravan: caravan });
  },

  setGuardingCaravan: (caravan) => {
    set({ guardingCaravan: caravan });
  },
}));

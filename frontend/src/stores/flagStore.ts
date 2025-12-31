import { create } from 'zustand';
import type { FlagType } from '../types/flag';

const FLAG_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

interface FlagState {
  flagType: FlagType;
  flagChangedAt: Date | null;
  infamy: number;
  karma: number;
  pkKills: number;
  pkDeaths: number;
  isInCity: boolean;

  setFlag: (flag: FlagType) => boolean;
  addInfamy: (amount: number) => void;
  addKarma: (amount: number) => void;
  recordPkKill: () => void;
  recordPkDeath: () => void;
  setInCity: (inCity: boolean) => void;
  canChangeFlag: () => boolean;
  getCooldownRemaining: () => number;
}

export const useFlagStore = create<FlagState>((set, get) => ({
  flagType: 'neutral',
  flagChangedAt: null,
  infamy: 0,
  karma: 0,
  pkKills: 0,
  pkDeaths: 0,
  isInCity: true,

  setFlag: (flag: FlagType) => {
    const { canChangeFlag, flagType } = get();

    if (flag === flagType) return false;
    if (!canChangeFlag()) return false;

    set({
      flagType: flag,
      flagChangedAt: new Date(),
    });
    return true;
  },

  addInfamy: (amount: number) => {
    set((state) => ({
      infamy: Math.max(0, state.infamy + amount),
    }));
  },

  addKarma: (amount: number) => {
    set((state) => ({
      karma: Math.max(0, state.karma + amount),
    }));
  },

  recordPkKill: () => {
    set((state) => ({
      pkKills: state.pkKills + 1,
    }));
  },

  recordPkDeath: () => {
    set((state) => ({
      pkDeaths: state.pkDeaths + 1,
    }));
  },

  setInCity: (inCity: boolean) => {
    set({ isInCity: inCity });
  },

  canChangeFlag: () => {
    const { flagChangedAt } = get();
    if (!flagChangedAt) return true;

    const elapsed = Date.now() - flagChangedAt.getTime();
    return elapsed >= FLAG_COOLDOWN_MS;
  },

  getCooldownRemaining: () => {
    const { flagChangedAt } = get();
    if (!flagChangedAt) return 0;

    const elapsed = Date.now() - flagChangedAt.getTime();
    return Math.max(0, FLAG_COOLDOWN_MS - elapsed);
  },
}));

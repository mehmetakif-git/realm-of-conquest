import { create } from 'zustand';
import type {
  Guild,
  GuildMember,
  GuildTypeId,
  GuildRankId,
} from '../types/guild';
import {
  GUILD_TYPES,
  GUILD_LEVELS,
  getGuildLevel,
  getNextLevelExp,
} from '../types/guild';

interface GuildState {
  // State
  myGuild: Guild | null;
  myMembership: GuildMember | null;
  availableGuilds: Guild[];
  pendingInvites: string[];

  // Actions
  createGuild: (name: string, type: GuildTypeId, description: string, playerId: string, playerName: string, playerLevel: number) => boolean;
  joinGuild: (guildId: string, playerId: string, playerName: string, playerLevel: number) => boolean;
  leaveGuild: () => void;
  donateGold: (amount: number) => void;
  promoteMember: (memberId: string, newRank: GuildRankId) => void;
  demoteMember: (memberId: string, newRank: GuildRankId) => void;
  kickMember: (memberId: string) => void;
  upgradeGuild: () => { success: boolean; message: string };
  addExp: (amount: number) => void;
  searchGuilds: (query: string) => Guild[];
  getGuildById: (guildId: string) => Guild | undefined;
}

// Mock available guilds for testing
const mockGuilds: Guild[] = [
  {
    id: 'guild-1',
    name: 'Kara Kartallar',
    type: 'bandit',
    description: 'Kervan yagmacilari toplulugu',
    level: 5,
    exp: 68000,
    treasury: 2450000,
    memberCount: 45,
    maxMembers: 65,
    leaderId: 'player-1',
    leaderName: 'SilverWolf',
    members: [
      { id: 'player-1', name: 'SilverWolf', level: 45, rank: 'leader', contribution: 500000, joinedAt: new Date('2024-01-01'), lastOnline: new Date(), isOnline: true },
      { id: 'player-2', name: 'DarkRider', level: 42, rank: 'officer', contribution: 350000, joinedAt: new Date('2024-01-15'), lastOnline: new Date(), isOnline: true },
      { id: 'player-3', name: 'ShadowBlade', level: 38, rank: 'veteran', contribution: 200000, joinedAt: new Date('2024-02-01'), lastOnline: new Date(Date.now() - 3600000), isOnline: false },
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'guild-2',
    name: 'Adalet Kalkani',
    type: 'guardian',
    description: 'Barisi koruyan kahraman toplulugu',
    level: 7,
    exp: 195000,
    treasury: 5800000,
    memberCount: 82,
    maxMembers: 100,
    leaderId: 'player-10',
    leaderName: 'WhiteKnight',
    members: [
      { id: 'player-10', name: 'WhiteKnight', level: 50, rank: 'leader', contribution: 800000, joinedAt: new Date('2023-06-01'), lastOnline: new Date(), isOnline: true },
    ],
    createdAt: new Date('2023-06-01'),
  },
  {
    id: 'guild-3',
    name: 'Altin Kervan',
    type: 'merchant',
    description: 'Ticaretin krallari',
    level: 8,
    exp: 310000,
    treasury: 12500000,
    memberCount: 98,
    maxMembers: 120,
    leaderId: 'player-20',
    leaderName: 'GoldMaster',
    members: [
      { id: 'player-20', name: 'GoldMaster', level: 48, rank: 'leader', contribution: 1200000, joinedAt: new Date('2023-03-01'), lastOnline: new Date(), isOnline: false },
    ],
    createdAt: new Date('2023-03-01'),
  },
  {
    id: 'guild-4',
    name: 'Celik Yumruklar',
    type: 'warrior',
    description: 'En guclu savascilar',
    level: 6,
    exp: 115000,
    treasury: 3200000,
    memberCount: 65,
    maxMembers: 80,
    leaderId: 'player-30',
    leaderName: 'IronFist',
    members: [
      { id: 'player-30', name: 'IronFist', level: 52, rank: 'leader', contribution: 600000, joinedAt: new Date('2023-09-01'), lastOnline: new Date(), isOnline: true },
    ],
    createdAt: new Date('2023-09-01'),
  },
  {
    id: 'guild-5',
    name: 'Yesil Oklar',
    type: 'hunter',
    description: 'Avci toplulugu',
    level: 4,
    exp: 32000,
    treasury: 1100000,
    memberCount: 38,
    maxMembers: 50,
    leaderId: 'player-40',
    leaderName: 'ForestArcher',
    members: [
      { id: 'player-40', name: 'ForestArcher', level: 35, rank: 'leader', contribution: 280000, joinedAt: new Date('2024-03-01'), lastOnline: new Date(), isOnline: true },
    ],
    createdAt: new Date('2024-03-01'),
  },
];

export const useGuildStore = create<GuildState>((set, get) => ({
  myGuild: null,
  myMembership: null,
  availableGuilds: mockGuilds,
  pendingInvites: [],

  createGuild: (name, type, description, playerId, playerName, playerLevel) => {
    const guildType = GUILD_TYPES[type];

    // Check level requirement
    if (playerLevel < guildType.minLevel) {
      return false;
    }

    const newMember: GuildMember = {
      id: playerId,
      name: playerName,
      level: playerLevel,
      rank: 'leader',
      contribution: 0,
      joinedAt: new Date(),
      lastOnline: new Date(),
      isOnline: true,
    };

    const newGuild: Guild = {
      id: `guild-${Date.now()}`,
      name,
      type,
      description,
      level: 1,
      exp: 0,
      treasury: 0,
      memberCount: 1,
      maxMembers: GUILD_LEVELS[1].members,
      leaderId: playerId,
      leaderName: playerName,
      members: [newMember],
      createdAt: new Date(),
    };

    set({
      myGuild: newGuild,
      myMembership: newMember,
      availableGuilds: [...get().availableGuilds, newGuild],
    });

    return true;
  },

  joinGuild: (guildId, playerId, playerName, playerLevel) => {
    const guild = get().availableGuilds.find(g => g.id === guildId);
    if (!guild) return false;

    // Check if guild is full
    if (guild.memberCount >= guild.maxMembers) return false;

    // Check level requirement
    const guildType = GUILD_TYPES[guild.type];
    if (playerLevel < guildType.minLevel) return false;

    const newMember: GuildMember = {
      id: playerId,
      name: playerName,
      level: playerLevel,
      rank: 'recruit',
      contribution: 0,
      joinedAt: new Date(),
      lastOnline: new Date(),
      isOnline: true,
    };

    const updatedGuild: Guild = {
      ...guild,
      memberCount: guild.memberCount + 1,
      members: [...guild.members, newMember],
    };

    set({
      myGuild: updatedGuild,
      myMembership: newMember,
      availableGuilds: get().availableGuilds.map(g =>
        g.id === guildId ? updatedGuild : g
      ),
    });

    return true;
  },

  leaveGuild: () => {
    const { myGuild, myMembership } = get();
    if (!myGuild || !myMembership) return;

    // Leader cannot leave - must transfer or disband
    if (myMembership.rank === 'leader') return;

    const updatedGuild: Guild = {
      ...myGuild,
      memberCount: myGuild.memberCount - 1,
      members: myGuild.members.filter(m => m.id !== myMembership.id),
    };

    set({
      myGuild: null,
      myMembership: null,
      availableGuilds: get().availableGuilds.map(g =>
        g.id === myGuild.id ? updatedGuild : g
      ),
    });
  },

  donateGold: (amount) => {
    const { myGuild, myMembership } = get();
    if (!myGuild || !myMembership) return;

    const updatedMember: GuildMember = {
      ...myMembership,
      contribution: myMembership.contribution + amount,
    };

    const updatedGuild: Guild = {
      ...myGuild,
      treasury: myGuild.treasury + amount,
      members: myGuild.members.map(m =>
        m.id === myMembership.id ? updatedMember : m
      ),
    };

    set({
      myGuild: updatedGuild,
      myMembership: updatedMember,
      availableGuilds: get().availableGuilds.map(g =>
        g.id === myGuild.id ? updatedGuild : g
      ),
    });
  },

  promoteMember: (memberId, newRank) => {
    const { myGuild, myMembership } = get();
    if (!myGuild || !myMembership) return;

    // Check permission
    if (myMembership.rank !== 'leader' && myMembership.rank !== 'officer') return;

    // Cannot promote to leader or above your rank
    if (newRank === 'leader') return;

    const updatedGuild: Guild = {
      ...myGuild,
      members: myGuild.members.map(m =>
        m.id === memberId ? { ...m, rank: newRank } : m
      ),
    };

    set({
      myGuild: updatedGuild,
      availableGuilds: get().availableGuilds.map(g =>
        g.id === myGuild.id ? updatedGuild : g
      ),
    });
  },

  demoteMember: (memberId, newRank) => {
    const { myGuild, myMembership } = get();
    if (!myGuild || !myMembership) return;

    // Check permission
    if (myMembership.rank !== 'leader' && myMembership.rank !== 'officer') return;

    const updatedGuild: Guild = {
      ...myGuild,
      members: myGuild.members.map(m =>
        m.id === memberId ? { ...m, rank: newRank } : m
      ),
    };

    set({
      myGuild: updatedGuild,
      availableGuilds: get().availableGuilds.map(g =>
        g.id === myGuild.id ? updatedGuild : g
      ),
    });
  },

  kickMember: (memberId) => {
    const { myGuild, myMembership } = get();
    if (!myGuild || !myMembership) return;

    // Check permission
    if (myMembership.rank !== 'leader' && myMembership.rank !== 'officer') return;

    // Cannot kick leader
    if (memberId === myGuild.leaderId) return;

    const updatedGuild: Guild = {
      ...myGuild,
      memberCount: myGuild.memberCount - 1,
      members: myGuild.members.filter(m => m.id !== memberId),
    };

    set({
      myGuild: updatedGuild,
      availableGuilds: get().availableGuilds.map(g =>
        g.id === myGuild.id ? updatedGuild : g
      ),
    });
  },

  upgradeGuild: () => {
    const { myGuild, myMembership } = get();
    if (!myGuild || !myMembership) {
      return { success: false, message: 'Lonca bulunamadi!' };
    }

    // Check permission
    if (myMembership.rank !== 'leader') {
      return { success: false, message: 'Sadece lider lonca yukseltebilir!' };
    }

    // Check max level
    if (myGuild.level >= 10) {
      return { success: false, message: 'Lonca maksimum seviyede!' };
    }

    const nextLevel = myGuild.level + 1;
    const nextLevelInfo = getGuildLevel(nextLevel);
    const requiredExp = getNextLevelExp(myGuild.level);

    // Check exp
    if (myGuild.exp < requiredExp) {
      return { success: false, message: `Yetersiz deneyim! Gerekli: ${requiredExp.toLocaleString()}` };
    }

    // Check treasury
    if (myGuild.treasury < nextLevelInfo.cost) {
      return { success: false, message: `Yetersiz hazine! Gerekli: ${nextLevelInfo.cost.toLocaleString()} Gold` };
    }

    const updatedGuild: Guild = {
      ...myGuild,
      level: nextLevel,
      treasury: myGuild.treasury - nextLevelInfo.cost,
      maxMembers: nextLevelInfo.members,
    };

    set({
      myGuild: updatedGuild,
      availableGuilds: get().availableGuilds.map(g =>
        g.id === myGuild.id ? updatedGuild : g
      ),
    });

    return { success: true, message: `Lonca Seviye ${nextLevel} oldu!` };
  },

  addExp: (amount) => {
    const { myGuild } = get();
    if (!myGuild) return;

    const updatedGuild: Guild = {
      ...myGuild,
      exp: myGuild.exp + amount,
    };

    set({
      myGuild: updatedGuild,
      availableGuilds: get().availableGuilds.map(g =>
        g.id === myGuild.id ? updatedGuild : g
      ),
    });
  },

  searchGuilds: (query) => {
    const { availableGuilds, myGuild } = get();
    const lowerQuery = query.toLowerCase();

    return availableGuilds.filter(g => {
      // Don't show own guild in search
      if (myGuild && g.id === myGuild.id) return false;

      return (
        g.name.toLowerCase().includes(lowerQuery) ||
        g.description.toLowerCase().includes(lowerQuery) ||
        GUILD_TYPES[g.type].name.toLowerCase().includes(lowerQuery)
      );
    });
  },

  getGuildById: (guildId) => {
    return get().availableGuilds.find(g => g.id === guildId);
  },
}));

import { useState } from 'react';
import type { Guild, GuildTypeId, GuildRankId } from '../../types/guild';
import {
  GUILD_TYPES,
  GUILD_LEVELS,
  GUILD_RANKS,
  getGuildBonuses,
  getNextLevelExp,
  formatBonusName,
  formatSpecialAbility,
  getRelativeTime,
} from '../../types/guild';

type TabType = 'my-guild' | 'search' | 'create' | 'ranks';

interface GuildModalProps {
  playerGold: number;
  playerLevel: number;
  playerId: string;
  playerName: string;
  myGuild: Guild | null;
  myRank: GuildRankId | null;
  availableGuilds: Guild[];
  onClose: () => void;
  onCreateGuild: (name: string, type: GuildTypeId, description: string) => boolean;
  onJoinGuild: (guildId: string) => boolean;
  onLeaveGuild: () => void;
  onDonateGold: (amount: number) => void;
  onPromoteMember: (memberId: string, newRank: GuildRankId) => void;
  onKickMember: (memberId: string) => void;
  onUpgradeGuild: () => { success: boolean; message: string };
  onSpendGold: (amount: number) => void;
}

export default function GuildModal({
  playerGold,
  playerLevel,
  playerId,
  playerName: _playerName,
  myGuild,
  myRank,
  availableGuilds,
  onClose,
  onCreateGuild,
  onJoinGuild,
  onLeaveGuild,
  onDonateGold,
  onPromoteMember: _onPromoteMember,
  onKickMember,
  onUpgradeGuild,
  onSpendGold,
}: GuildModalProps) {
  // Note: _playerName and _onPromoteMember reserved for future features
  void _playerName;
  void _onPromoteMember;
  const [activeTab, setActiveTab] = useState<TabType>(myGuild ? 'my-guild' : 'search');
  const [searchQuery, setSearchQuery] = useState('');
  const [donateAmount, setDonateAmount] = useState(1000);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create guild form state
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildType, setNewGuildType] = useState<GuildTypeId | ''>('');
  const [newGuildDescription, setNewGuildDescription] = useState('');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'my-guild', label: 'Loncam' },
    { id: 'search', label: 'Lonca Ara' },
    { id: 'create', label: 'Lonca Kur' },
    { id: 'ranks', label: 'Rutbeler' },
  ];

  // Filter guilds by search
  const filteredGuilds = availableGuilds.filter(g => {
    if (myGuild && g.id === myGuild.id) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      g.name.toLowerCase().includes(query) ||
      g.description.toLowerCase().includes(query) ||
      GUILD_TYPES[g.type].name.toLowerCase().includes(query)
    );
  });

  const handleCreateGuild = () => {
    if (!newGuildName.trim()) {
      setMessage({ type: 'error', text: 'Lonca adi gerekli!' });
      return;
    }
    if (!newGuildType) {
      setMessage({ type: 'error', text: 'Lonca tipi secin!' });
      return;
    }

    const guildType = GUILD_TYPES[newGuildType];
    if (playerLevel < guildType.minLevel) {
      setMessage({ type: 'error', text: `Bu lonca tipi icin Level ${guildType.minLevel} gerekli!` });
      return;
    }

    const cost = GUILD_LEVELS[1].cost;
    if (playerGold < cost) {
      setMessage({ type: 'error', text: `Yetersiz gold! Gerekli: ${cost.toLocaleString()}` });
      return;
    }

    const success = onCreateGuild(newGuildName, newGuildType, newGuildDescription);
    if (success) {
      onSpendGold(cost);
      setMessage({ type: 'success', text: 'Lonca basariyla kuruldu!' });
      setActiveTab('my-guild');
      setNewGuildName('');
      setNewGuildType('');
      setNewGuildDescription('');
    } else {
      setMessage({ type: 'error', text: 'Lonca kurulamadi!' });
    }
  };

  const handleJoinGuild = (guildId: string) => {
    const guild = availableGuilds.find(g => g.id === guildId);
    if (!guild) return;

    const guildType = GUILD_TYPES[guild.type];
    if (playerLevel < guildType.minLevel) {
      setMessage({ type: 'error', text: `Bu lonca icin Level ${guildType.minLevel} gerekli!` });
      return;
    }

    if (guild.memberCount >= guild.maxMembers) {
      setMessage({ type: 'error', text: 'Lonca dolu!' });
      return;
    }

    const success = onJoinGuild(guildId);
    if (success) {
      setMessage({ type: 'success', text: `${guild.name} loncasina katildin!` });
      setActiveTab('my-guild');
    } else {
      setMessage({ type: 'error', text: 'Loncaya katilmaadi!' });
    }
  };

  const handleDonate = () => {
    if (donateAmount > playerGold) {
      setMessage({ type: 'error', text: 'Yetersiz gold!' });
      return;
    }
    onDonateGold(donateAmount);
    onSpendGold(donateAmount);
    setShowDonateModal(false);
    setMessage({ type: 'success', text: `${donateAmount.toLocaleString()} gold bagislandi!` });
  };

  const handleUpgrade = () => {
    const result = onUpgradeGuild();
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  const renderMyGuild = () => {
    if (!myGuild) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <span className="text-6xl mb-4">🏰</span>
          <p className="text-lg mb-2">Henuz bir loncaya uye degilsin!</p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('search')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
            >
              Lonca Ara
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
            >
              Lonca Kur
            </button>
          </div>
        </div>
      );
    }

    const guildType = GUILD_TYPES[myGuild.type];
    const bonuses = getGuildBonuses(myGuild.type, myGuild.level);
    const nextLevelExp = getNextLevelExp(myGuild.level);
    const expProgress = nextLevelExp > 0 ? (myGuild.exp / nextLevelExp) * 100 : 100;
    const nextLevelCost = myGuild.level < 10 ? GUILD_LEVELS[myGuild.level + 1]?.cost || 0 : 0;

    return (
      <div className="space-y-4">
        {/* Guild Header */}
        <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: `${guildType.color}20`, borderColor: guildType.color, borderWidth: '1px' }}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{guildType.emoji}</span>
              <h3 className="text-xl font-bold text-white">{myGuild.name}</h3>
              <span className="text-sm px-2 py-0.5 rounded" style={{ backgroundColor: guildType.color }}>
                Lv.{myGuild.level}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{guildType.name}</p>
          </div>
          <div className="flex gap-2">
            {myRank !== 'leader' && (
              <button
                onClick={onLeaveGuild}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
              >
                Ayril
              </button>
            )}
            <button
              onClick={() => setShowDonateModal(true)}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
            >
              Bagis
            </button>
          </div>
        </div>

        {/* Guild Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800 p-3 rounded text-center">
            <p className="text-gray-400 text-sm">Lider</p>
            <p className="text-white font-semibold">{myGuild.leaderName}</p>
          </div>
          <div className="bg-gray-800 p-3 rounded text-center">
            <p className="text-gray-400 text-sm">Uyeler</p>
            <p className="text-white font-semibold">{myGuild.memberCount}/{myGuild.maxMembers}</p>
          </div>
          <div className="bg-gray-800 p-3 rounded text-center">
            <p className="text-gray-400 text-sm">Hazine</p>
            <p className="text-yellow-400 font-semibold">{myGuild.treasury.toLocaleString()}</p>
          </div>
        </div>

        {/* Experience Bar */}
        {myGuild.level < 10 && (
          <div className="bg-gray-800 p-3 rounded">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Deneyim</span>
              <span className="text-white">{myGuild.exp.toLocaleString()} / {nextLevelExp.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, expProgress)}%` }}
              />
            </div>
            {myRank === 'leader' && myGuild.exp >= nextLevelExp && (
              <button
                onClick={handleUpgrade}
                disabled={myGuild.treasury < nextLevelCost}
                className="w-full mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm"
              >
                Seviye Atla ({nextLevelCost.toLocaleString()} Gold)
              </button>
            )}
          </div>
        )}

        {/* Bonuses */}
        <div className="bg-gray-800 p-4 rounded">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>🎯</span> Lonca Bonuslari
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(bonuses).map(([key, value]) => {
              if (key === 'special') return null;
              const isNegative = typeof value === 'number' && value < 0;
              return (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-400">{formatBonusName(key)}:</span>
                  <span className={isNegative ? 'text-green-400' : 'text-green-400'}>
                    {isNegative ? '' : '+'}{value}%
                  </span>
                </div>
              );
            })}
          </div>
          {bonuses.special && (
            <div className="mt-3 p-2 bg-purple-900/50 rounded border border-purple-600">
              <span className="text-purple-400 text-sm">
                ✨ {formatSpecialAbility(bonuses.special)}
              </span>
            </div>
          )}
        </div>

        {/* Member List */}
        <div className="bg-gray-800 p-4 rounded">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>👥</span> Uyeler ({myGuild.members.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {myGuild.members.map(member => {
              const rank = GUILD_RANKS[member.rank];
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 bg-gray-700 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span>{rank.emoji}</span>
                    <span className="text-white">{member.name}</span>
                    <span className="text-gray-400 text-sm">Lv.{member.level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={member.isOnline ? 'text-green-400' : 'text-gray-500'}>
                      {member.isOnline ? '⚔️ Online' : `💤 ${getRelativeTime(member.lastOnline)}`}
                    </span>
                    {myRank === 'leader' && member.id !== playerId && (
                      <button
                        onClick={() => onKickMember(member.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        At
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderSearch = () => (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Lonca ara..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
      />

      {filteredGuilds.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <span className="text-4xl">🔍</span>
          <p className="mt-2">Lonca bulunamadi</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredGuilds.map(guild => {
            const guildType = GUILD_TYPES[guild.type];
            const canJoin = playerLevel >= guildType.minLevel && guild.memberCount < guild.maxMembers;

            return (
              <div
                key={guild.id}
                className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{guildType.emoji}</span>
                    <div>
                      <h4 className="text-white font-semibold">{guild.name}</h4>
                      <p className="text-sm text-gray-400">{guildType.name} - Lv.{guild.level}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinGuild(guild.id)}
                    disabled={!canJoin || !!myGuild}
                    className="px-4 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm"
                  >
                    {myGuild ? 'Loncadasin' : canJoin ? 'Katil' : `Lv.${guildType.minLevel}+`}
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-2">{guild.description}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  <span>👥 {guild.memberCount}/{guild.maxMembers}</span>
                  <span>👑 {guild.leaderName}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderCreate = () => {
    if (myGuild) {
      return (
        <div className="text-center py-8 text-gray-400">
          <span className="text-4xl">🏰</span>
          <p className="mt-2">Zaten bir loncaya uyesin!</p>
          <p className="text-sm">Yeni lonca kurmak icin once mevcut loncandan ayrilmalisin.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Guild Name */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Lonca Adi</label>
          <input
            type="text"
            value={newGuildName}
            onChange={(e) => setNewGuildName(e.target.value)}
            placeholder="Lonca adini gir..."
            maxLength={20}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Guild Type */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Lonca Tipi</label>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {Object.values(GUILD_TYPES).map(type => {
              const isSelected = newGuildType === type.id;
              const canSelect = playerLevel >= type.minLevel;

              return (
                <button
                  key={type.id}
                  onClick={() => canSelect && setNewGuildType(type.id)}
                  disabled={!canSelect}
                  className={`p-3 rounded border text-left transition-all ${
                    isSelected
                      ? 'border-2'
                      : canSelect
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-700 opacity-50 cursor-not-allowed'
                  }`}
                  style={{
                    borderColor: isSelected ? type.color : undefined,
                    backgroundColor: isSelected ? `${type.color}20` : undefined,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{type.emoji}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{type.name}</p>
                      {!canSelect && (
                        <p className="text-red-400 text-xs">Lv.{type.minLevel}+ gerekli</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Aciklama</label>
          <textarea
            value={newGuildDescription}
            onChange={(e) => setNewGuildDescription(e.target.value)}
            placeholder="Lonca aciklamasi..."
            maxLength={100}
            rows={2}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Requirements */}
        <div className="bg-gray-800 p-3 rounded">
          <h4 className="text-white text-sm font-semibold mb-2">Gereksinimler</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className={playerLevel >= 20 ? 'text-green-400' : 'text-red-400'}>
                {playerLevel >= 20 ? '✅' : '❌'} Level 20+
              </span>
              <span className="text-gray-400">Mevcut: {playerLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className={playerGold >= 5000 ? 'text-green-400' : 'text-red-400'}>
                {playerGold >= 5000 ? '✅' : '❌'} 5,000 Gold
              </span>
              <span className="text-gray-400">Mevcut: {playerGold.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreateGuild}
          disabled={!newGuildName || !newGuildType || playerGold < 5000}
          className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-semibold transition-colors"
        >
          Lonca Kur - 5,000 Gold
        </button>
      </div>
    );
  };

  const renderRanks = () => (
    <div className="space-y-3">
      <p className="text-gray-400 text-sm mb-4">
        Her rutbenin farkli yetkileri vardir. Yuksek rutbeler daha fazla lonca yonetim yetkisine sahiptir.
      </p>
      {Object.values(GUILD_RANKS).map(rank => (
        <div
          key={rank.id}
          className="p-4 bg-gray-800 rounded-lg border border-gray-700"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{rank.emoji}</span>
            <div>
              <h4 className="text-white font-semibold" style={{ color: rank.color }}>
                {rank.name}
              </h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {rank.permissions.map(perm => (
                  <span
                    key={perm}
                    className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300"
                  >
                    {perm === 'all' ? 'Tum Yetkiler' : perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🏰</span> LONCA SiSTEMi
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mx-4 mt-4 p-3 rounded ${
              message.type === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMessage(null);
              }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-yellow-400 border-b-2 border-yellow-400 bg-gray-800'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeTab === 'my-guild' && renderMyGuild()}
          {activeTab === 'search' && renderSearch()}
          {activeTab === 'create' && renderCreate()}
          {activeTab === 'ranks' && renderRanks()}
        </div>
      </div>

      {/* Donate Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-gray-800 p-6 rounded-lg w-80">
            <h3 className="text-lg font-bold text-white mb-4">Hazineye Bagis</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Miktar</label>
                <input
                  type="number"
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white mt-1"
                />
              </div>
              <div className="flex gap-2">
                {[1000, 5000, 10000, 50000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setDonateAmount(amount)}
                    className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    {amount >= 1000 ? `${amount / 1000}K` : amount}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-400">
                Mevcut: <span className="text-yellow-400">{playerGold.toLocaleString()}</span> Gold
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDonateModal(false)}
                  className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 rounded"
                >
                  Iptal
                </button>
                <button
                  onClick={handleDonate}
                  disabled={donateAmount > playerGold || donateAmount <= 0}
                  className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded"
                >
                  Bagisla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

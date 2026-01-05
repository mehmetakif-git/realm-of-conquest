import { useState, useMemo } from 'react';
import type {
  DungeonId,
  DifficultyId,
  TeamMember,
  ClassId,
  DungeonResult,
} from '../../types/dungeon';
import {
  DUNGEONS,
  CLASS_INFO,
  DIFFICULTY_INFO,
  DIFFICULTY_MULTIPLIERS,
  REQUIRED_CLASSES,
  formatDuration,
  getRarityColor,
  getRarityName,
} from '../../types/dungeon';

// Mock friends data
const MOCK_FRIENDS = [
  { id: 'friend-1', name: 'ShadowArrow', level: 42, class: 'archer' as ClassId, isOnline: true },
  { id: 'friend-2', name: 'FireMaster', level: 44, class: 'mage' as ClassId, isOnline: true },
  { id: 'friend-3', name: 'LightBringer', level: 43, class: 'healer' as ClassId, isOnline: true },
  { id: 'friend-4', name: 'DarkBlade', level: 38, class: 'ninja' as ClassId, isOnline: false },
  { id: 'friend-5', name: 'IronGuard', level: 45, class: 'warrior' as ClassId, isOnline: false },
];

// Mock guild members
const MOCK_GUILD_MEMBERS = [
  { id: 'guild-1', name: 'SilentBlade', level: 41, class: 'ninja' as ClassId, isOnline: true },
  { id: 'guild-2', name: 'HolyPriest', level: 46, class: 'healer' as ClassId, isOnline: true },
  { id: 'guild-3', name: 'StormMage', level: 40, class: 'mage' as ClassId, isOnline: true },
  { id: 'guild-4', name: 'SwiftArrow', level: 39, class: 'archer' as ClassId, isOnline: true },
  { id: 'guild-5', name: 'TankMaster', level: 48, class: 'warrior' as ClassId, isOnline: false },
  { id: 'guild-6', name: 'NightShadow', level: 44, class: 'ninja' as ClassId, isOnline: true },
  { id: 'guild-7', name: 'ArcaneWizard', level: 47, class: 'mage' as ClassId, isOnline: false },
  { id: 'guild-8', name: 'DivineHealer', level: 42, class: 'healer' as ClassId, isOnline: true },
];

interface DungeonModalProps {
  playerLevel: number;
  playerClass: ClassId;
  playerName: string;
  team: TeamMember[];
  dailyEntries: Record<DungeonId, number>;
  lastResult: DungeonResult | null;
  onClose: () => void;
  onAddToTeam: (member: TeamMember) => boolean;
  onRemoveFromTeam: (memberId: string) => void;
  onStartDungeon: (dungeonId: DungeonId, difficulty: DifficultyId) => { success: boolean; message: string };
}

type ViewMode = 'browse' | 'team-finder' | 'result';

export default function DungeonModal({
  playerLevel,
  playerClass,
  playerName,
  team,
  dailyEntries,
  lastResult,
  onClose,
  onAddToTeam,
  onRemoveFromTeam,
  onStartDungeon,
}: DungeonModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(lastResult ? 'result' : 'browse');
  const [selectedDungeon, setSelectedDungeon] = useState<DungeonId | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyId>('normal');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [invitedPlayers, setInvitedPlayers] = useState<Set<string>>(new Set());

  // Current player as first team member
  const currentPlayerMember: TeamMember = useMemo(() => ({
    id: 'self',
    name: playerName,
    level: playerLevel,
    class: playerClass,
    hp: 500,
    maxHp: 500,
    mp: 100,
    maxMp: 100,
    isOnline: true,
    isReady: true,
  }), [playerName, playerLevel, playerClass]);

  // Full team including current player
  const fullTeam = useMemo(() => {
    const hasCurrentPlayer = team.some(m => m.id === 'self');
    return hasCurrentPlayer ? team : [currentPlayerMember, ...team];
  }, [team, currentPlayerMember]);

  // Team validation
  const teamValidation = useMemo(() => {
    const teamClasses = fullTeam.map(m => m.class);
    const missing = REQUIRED_CLASSES.filter(cls => !teamClasses.includes(cls));
    const allPresent = missing.length === 0;

    return {
      valid: allPresent,
      missing,
      count: fullTeam.length,
      message: allPresent
        ? 'Takim hazir! Dungeon\'a girebilirsiniz.'
        : `Eksik siniflar: ${missing.map(c => CLASS_INFO[c].name).join(', ')}`,
    };
  }, [fullTeam]);

  // Available dungeons
  const availableDungeons = useMemo(() => {
    return Object.values(DUNGEONS).map(dungeon => ({
      ...dungeon,
      canEnter: playerLevel >= dungeon.minLevel,
      remainingEntries: dailyEntries[dungeon.id],
    }));
  }, [playerLevel, dailyEntries]);

  // Selected dungeon details
  const dungeonDetails = useMemo(() => {
    if (!selectedDungeon) return null;
    return DUNGEONS[selectedDungeon];
  }, [selectedDungeon]);

  const handleSelectDungeon = (dungeonId: DungeonId) => {
    setSelectedDungeon(dungeonId);
  };

  const handleEnterDungeon = () => {
    if (!selectedDungeon) return;
    setViewMode('team-finder');
  };

  const handleInvitePlayer = (player: { id: string; name: string; level: number; class: ClassId }) => {
    // Check if class already in team
    if (fullTeam.some(m => m.class === player.class)) {
      setMessage({ type: 'error', text: `${CLASS_INFO[player.class].name} sinifi zaten takimda!` });
      return;
    }

    const newMember: TeamMember = {
      id: player.id,
      name: player.name,
      level: player.level,
      class: player.class,
      hp: 400,
      maxHp: 400,
      mp: 100,
      maxMp: 100,
      isOnline: true,
      isReady: false,
    };

    const success = onAddToTeam(newMember);
    if (success) {
      setInvitedPlayers(prev => new Set([...prev, player.id]));
      setMessage({ type: 'success', text: `${player.name} takima davet edildi!` });
    }
  };

  const handleStartAutoMatch = () => {
    setIsMatching(true);
    setMessage({ type: 'success', text: 'Eslesme araniyor...' });

    // Simulate auto-matching
    setTimeout(() => {
      // Add missing classes from mock data
      const missingClasses = teamValidation.missing;
      const allPlayers = [...MOCK_FRIENDS, ...MOCK_GUILD_MEMBERS].filter(p => p.isOnline);

      missingClasses.forEach(cls => {
        const player = allPlayers.find(p => p.class === cls && !fullTeam.some(m => m.id === p.id));
        if (player) {
          handleInvitePlayer(player);
        }
      });

      setIsMatching(false);
      setMessage({ type: 'success', text: 'Takim tamamlandi!' });
    }, 2000);
  };

  const handleStartDungeon = () => {
    if (!selectedDungeon || !teamValidation.valid) return;

    const result = onStartDungeon(selectedDungeon, selectedDifficulty);
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setTimeout(() => onClose(), 1500);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  // Render boss gallery (left side)
  const renderBossGallery = () => (
    <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-2">
      {availableDungeons.map(dungeon => {
        const isSelected = selectedDungeon === dungeon.id;
        const canEnter = dungeon.canEnter && dungeon.remainingEntries > 0;

        return (
          <div
            key={dungeon.id}
            onClick={() => canEnter && handleSelectDungeon(dungeon.id)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              isSelected
                ? 'border-purple-500 bg-gradient-to-r from-purple-900/40 to-pink-900/30 shadow-lg shadow-purple-500/20'
                : canEnter
                ? 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                : 'border-gray-800 bg-gray-900/50 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{dungeon.boss.emoji}</span>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">{dungeon.name}</h4>
                <p className="text-xs text-gray-400">
                  LV {dungeon.minLevel}+ • {formatDuration(dungeon.duration)}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-xs ${dungeon.canEnter ? 'text-green-400' : 'text-red-400'}`}>
                  {dungeon.canEnter ? `${dungeon.remainingEntries}/${dungeon.dailyLimit}` : 'Kilitli'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Render boss details (right side)
  const renderBossDetails = () => {
    if (!dungeonDetails) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <span className="text-6xl">👈</span>
            <p className="mt-4">Bir dungeon sec</p>
          </div>
        </div>
      );
    }

    const boss = dungeonDetails.boss;

    return (
      <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
        {/* Boss Header */}
        <div className="text-center p-4 bg-gradient-to-b from-purple-900/40 to-transparent rounded-lg">
          <span className="text-5xl">{boss.emoji}</span>
          <h3 className="text-xl font-bold text-white mt-2">{boss.name}</h3>
          <p className="text-gray-400 text-sm">{dungeonDetails.name}</p>
        </div>

        {/* Boss Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-red-900/30 p-2 rounded text-center">
            <p className="text-red-400 text-xs">HP</p>
            <p className="text-white font-bold">{(boss.hp / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-orange-900/30 p-2 rounded text-center">
            <p className="text-orange-400 text-xs">ATK</p>
            <p className="text-white font-bold">{boss.atk}</p>
          </div>
          <div className="bg-blue-900/30 p-2 rounded text-center">
            <p className="text-blue-400 text-xs">DEF</p>
            <p className="text-white font-bold">{boss.def}</p>
          </div>
        </div>

        {/* Boss Mechanics */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <h4 className="text-yellow-400 text-sm font-semibold mb-2">⚠️ Mekanikler</h4>
          <div className="space-y-1">
            {boss.mechanics.slice(0, 3).map((mech, idx) => (
              <p key={idx} className="text-xs text-gray-300">
                • <span className="text-yellow-400">{mech.name}:</span> {mech.description}
              </p>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div>
          <h4 className="text-white text-sm font-semibold mb-2">Zorluk Sec</h4>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(DIFFICULTY_INFO) as DifficultyId[]).map(diff => {
              const info = DIFFICULTY_INFO[diff];
              const mult = DIFFICULTY_MULTIPLIERS[diff];
              const rewards = dungeonDetails.rewards[diff];
              const isSelected = selectedDifficulty === diff;

              return (
                <div
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`p-2 rounded border cursor-pointer transition-all text-center ${
                    isSelected
                      ? 'border-purple-500 bg-purple-900/30'
                      : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                  }`}
                >
                  <span className="text-lg">{info.emoji}</span>
                  <p className="text-xs font-semibold" style={{ color: info.color }}>{info.name}</p>
                  <div className="text-[10px] text-gray-400 mt-1 space-y-0.5">
                    <p>x{mult.bossHp} HP</p>
                    <p className="text-yellow-400">{(rewards.gold / 1000).toFixed(0)}K</p>
                    <p className="text-blue-400">{(rewards.exp / 1000).toFixed(0)}K XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enter Button */}
        <button
          onClick={handleEnterDungeon}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-bold text-lg transition-all shadow-lg shadow-purple-500/30"
        >
          🏛️ DUNGEON'A GiR
        </button>
      </div>
    );
  };

  // Render team finder screen
  const renderTeamFinder = () => {
    const onlineFriends = MOCK_FRIENDS.filter(f => f.isOnline);
    const onlineGuildMembers = MOCK_GUILD_MEMBERS.filter(m => m.isOnline);

    return (
      <div className="space-y-4">
        {/* Back Button */}
        <button
          onClick={() => setViewMode('browse')}
          className="text-gray-400 hover:text-white flex items-center gap-1 text-sm"
        >
          ← Dungeon Secimi
        </button>

        {/* Selected Dungeon Info */}
        {dungeonDetails && (
          <div className="flex items-center gap-3 p-3 bg-purple-900/30 rounded-lg border border-purple-600">
            <span className="text-2xl">{dungeonDetails.boss.emoji}</span>
            <div>
              <h4 className="text-white font-semibold">{dungeonDetails.name}</h4>
              <p className="text-sm text-purple-300">{DIFFICULTY_INFO[selectedDifficulty].name} - {dungeonDetails.boss.name}</p>
            </div>
          </div>
        )}

        {/* Team Status */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">MEVCUT TAKIM ({fullTeam.length}/5)</h3>

          <div className="grid grid-cols-5 gap-2 mb-3">
            {REQUIRED_CLASSES.map(cls => {
              const member = fullTeam.find(m => m.class === cls);
              const classInfo = CLASS_INFO[cls];
              const isFilled = !!member;

              return (
                <div
                  key={cls}
                  className={`p-2 rounded border text-center ${
                    isFilled
                      ? 'border-purple-500 bg-gradient-to-b from-purple-900/40 to-pink-900/30'
                      : 'border-gray-600 border-dashed bg-gray-700/30'
                  }`}
                >
                  <span className="text-xl">{classInfo.emoji}</span>
                  <p className="text-[10px] text-gray-400">{classInfo.role}</p>
                  {isFilled ? (
                    <div className="mt-1">
                      <p className="text-xs text-white truncate">{member.name}</p>
                      <p className="text-[10px] text-gray-400">Lv.{member.level}</p>
                      {member.id !== 'self' && (
                        <button
                          onClick={() => onRemoveFromTeam(member.id)}
                          className="text-red-400 text-[10px] hover:text-red-300"
                        >
                          Cikar
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-red-400 mt-1">[Bos]</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className={`p-2 rounded text-sm ${
            teamValidation.valid
              ? 'bg-green-900/30 text-green-400'
              : 'bg-yellow-900/30 text-yellow-400'
          }`}>
            {teamValidation.valid ? '✅' : '⚠️'} {teamValidation.message}
          </div>
        </div>

        {/* Invite Lists */}
        <div className="grid grid-cols-2 gap-4">
          {/* Friends */}
          <div className="bg-gray-800 rounded-lg p-3">
            <h4 className="text-white font-semibold text-sm mb-2">
              👥 ARKADASLARIM (Online: {onlineFriends.length}/{MOCK_FRIENDS.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {MOCK_FRIENDS.map(friend => {
                const isInTeam = fullTeam.some(m => m.id === friend.id);
                const classInTeam = fullTeam.some(m => m.class === friend.class);
                const isInvited = invitedPlayers.has(friend.id);

                return (
                  <div
                    key={friend.id}
                    className={`flex items-center justify-between p-2 rounded ${
                      friend.isOnline ? 'bg-gray-700' : 'bg-gray-800 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={friend.isOnline ? 'text-green-400' : 'text-gray-500'}>●</span>
                      <span className="text-sm">{CLASS_INFO[friend.class].emoji}</span>
                      <div>
                        <p className="text-white text-sm">{friend.name}</p>
                        <p className="text-[10px] text-gray-400">Lv.{friend.level}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInvitePlayer(friend)}
                      disabled={!friend.isOnline || isInTeam || classInTeam || isInvited}
                      className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded"
                    >
                      {isInTeam || isInvited ? 'Takimda' : classInTeam ? 'Sinif Dolu' : 'Davet'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guild */}
          <div className="bg-gray-800 rounded-lg p-3">
            <h4 className="text-white font-semibold text-sm mb-2">
              🏰 LONCAM (Online: {onlineGuildMembers.length}/{MOCK_GUILD_MEMBERS.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {MOCK_GUILD_MEMBERS.map(member => {
                const isInTeam = fullTeam.some(m => m.id === member.id);
                const classInTeam = fullTeam.some(m => m.class === member.class);
                const isInvited = invitedPlayers.has(member.id);

                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-2 rounded ${
                      member.isOnline ? 'bg-gray-700' : 'bg-gray-800 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={member.isOnline ? 'text-green-400' : 'text-gray-500'}>●</span>
                      <span className="text-sm">{CLASS_INFO[member.class].emoji}</span>
                      <div>
                        <p className="text-white text-sm">{member.name}</p>
                        <p className="text-[10px] text-gray-400">Lv.{member.level}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInvitePlayer(member)}
                      disabled={!member.isOnline || isInTeam || classInTeam || isInvited}
                      className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded"
                    >
                      {isInTeam || isInvited ? 'Takimda' : classInTeam ? 'Sinif Dolu' : 'Davet'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Auto Match */}
        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg p-4 border border-blue-600/50">
          <h4 className="text-white font-semibold text-sm mb-2">🤖 OTOMATiK ESLESTiRME</h4>
          <p className="text-gray-400 text-xs mb-3">
            Sistem seni uygun oyuncularla otomatik eslestirir
          </p>
          <button
            onClick={handleStartAutoMatch}
            disabled={isMatching || teamValidation.valid}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-semibold"
          >
            {isMatching ? '⏳ Eslestiriliyor...' : teamValidation.valid ? '✅ Takim Tam' : 'Eslestirmeye Basla'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode('browse')}
            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
          >
            Geri
          </button>
          <button
            onClick={handleStartDungeon}
            disabled={!teamValidation.valid}
            className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg font-bold shadow-lg shadow-green-500/30"
          >
            {teamValidation.valid ? '⚔️ HAZIR - BASLA!' : `Takim: ${fullTeam.length}/5`}
          </button>
        </div>
      </div>
    );
  };

  // Render result screen
  const renderResult = () => {
    if (!lastResult) return null;
    const dungeon = DUNGEONS[lastResult.dungeonId];
    const diffInfo = DIFFICULTY_INFO[lastResult.difficulty];

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center p-4 bg-gradient-to-b from-yellow-900/30 to-transparent rounded-lg">
          <h3 className="text-2xl font-bold text-yellow-400 mb-2">
            🎉 DUNGEON TAMAMLANDI!
          </h3>
          <p className="text-gray-400">
            {dungeon.emoji} {dungeon.name} - {diffInfo.name}
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3].map(star => (
              <span
                key={star}
                className={`text-2xl ${star <= lastResult.rating ? 'text-yellow-400' : 'text-gray-600'}`}
              >
                ⭐
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 p-3 rounded text-center">
            <p className="text-gray-400 text-sm">Sure</p>
            <p className="text-white font-bold">{lastResult.completionTime} dk</p>
          </div>
          <div className="bg-gray-800 p-3 rounded text-center">
            <p className="text-gray-400 text-sm">Olum</p>
            <p className={`font-bold ${lastResult.deaths === 0 ? 'text-green-400' : 'text-red-400'}`}>
              {lastResult.deaths}
            </p>
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">🎁 ODULLER</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Gold</span>
              <span className="text-yellow-400 font-bold">
                +{lastResult.gold.toLocaleString()}
                {lastResult.teamBonus > 0 && (
                  <span className="text-green-400 text-sm ml-1">
                    (+{lastResult.teamBonus}% bonus)
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">EXP</span>
              <span className="text-blue-400 font-bold">+{lastResult.exp.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Loot */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">🎒 LOOT</h4>
          <div className="space-y-2">
            {lastResult.loot.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 rounded"
                style={{ backgroundColor: `${getRarityColor(item.rarity)}20` }}
              >
                <div>
                  <span
                    className="font-semibold"
                    style={{ color: getRarityColor(item.rarity) }}
                  >
                    [{getRarityName(item.rarity)}]
                  </span>{' '}
                  <span className="text-white">{item.name}</span>
                </div>
                <div className="text-xs text-gray-400">
                  {Object.entries(item.stats).map(([stat, val]) => (
                    <span key={stat} className="ml-2">
                      +{val} {stat}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('browse')}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
          >
            Tekrar Gir
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 rounded font-semibold"
          >
            Cikis
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🏛️</span> DUNGEON SiSTEMi
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mx-4 mt-4 p-3 rounded ${
              message.type === 'success'
                ? 'bg-green-900/50 text-green-400'
                : 'bg-red-900/50 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {viewMode === 'browse' && (
            <div className="grid grid-cols-5 gap-4">
              {/* Left: Boss Gallery (2 cols) */}
              <div className="col-span-2">
                <h3 className="text-white font-semibold mb-3">Dungeon Sec</h3>
                {renderBossGallery()}
              </div>

              {/* Right: Boss Details (3 cols) */}
              <div className="col-span-3">
                {renderBossDetails()}
              </div>
            </div>
          )}

          {viewMode === 'team-finder' && renderTeamFinder()}
          {viewMode === 'result' && renderResult()}
        </div>
      </div>
    </div>
  );
}

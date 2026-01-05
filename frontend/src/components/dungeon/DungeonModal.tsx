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
  getDifficultyStars,
  formatDuration,
  getRarityColor,
  getRarityName,
} from '../../types/dungeon';

interface DungeonModalProps {
  playerLevel: number;
  playerClass: ClassId;
  team: TeamMember[];
  dailyEntries: Record<DungeonId, number>;
  lastResult: DungeonResult | null;
  onClose: () => void;
  onAddToTeam: (member: TeamMember) => boolean;
  onRemoveFromTeam: (memberId: string) => void;
  onStartDungeon: (dungeonId: DungeonId, difficulty: DifficultyId) => { success: boolean; message: string };
}

type ViewMode = 'list' | 'difficulty' | 'result';

export default function DungeonModal({
  playerLevel,
  playerClass: _playerClass,
  team,
  dailyEntries,
  lastResult,
  onClose,
  onAddToTeam: _onAddToTeam,
  onRemoveFromTeam,
  onStartDungeon,
}: DungeonModalProps) {
  // Reserved for future use
  void _playerClass;
  void _onAddToTeam;

  const [viewMode, setViewMode] = useState<ViewMode>(lastResult ? 'result' : 'list');
  const [selectedDungeon, setSelectedDungeon] = useState<DungeonId | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyId>('normal');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Get team validation
  const teamValidation = useMemo(() => {
    const teamClasses = team.map(m => m.class);
    const missing = REQUIRED_CLASSES.filter(cls => !teamClasses.includes(cls));
    const allPresent = missing.length === 0;

    return {
      valid: allPresent,
      missing,
      count: team.length,
      message: allPresent
        ? 'Takim hazir! Dungeon\'a girebilirsiniz.'
        : `Eksik siniflar: ${missing.map(c => CLASS_INFO[c].name).join(', ')}`,
    };
  }, [team]);

  // Available dungeons based on player level
  const availableDungeons = useMemo(() => {
    return Object.values(DUNGEONS).map(dungeon => ({
      ...dungeon,
      canEnter: playerLevel >= dungeon.minLevel,
      remainingEntries: dailyEntries[dungeon.id],
    }));
  }, [playerLevel, dailyEntries]);

  const handleSelectDungeon = (dungeonId: DungeonId) => {
    setSelectedDungeon(dungeonId);
    setViewMode('difficulty');
    setMessage(null);
  };

  const handleStartDungeon = () => {
    if (!selectedDungeon) return;

    const result = onStartDungeon(selectedDungeon, selectedDifficulty);
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setTimeout(() => onClose(), 1500);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  const renderTeamPanel = () => (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <span>👥</span> TAKIM DURUMU
      </h3>

      <div className="grid grid-cols-5 gap-2 mb-3">
        {REQUIRED_CLASSES.map(cls => {
          const member = team.find(m => m.class === cls);
          const classInfo = CLASS_INFO[cls];

          return (
            <div
              key={cls}
              className={`p-2 rounded border text-center ${
                member
                  ? 'bg-green-900/30 border-green-600'
                  : 'bg-gray-700 border-gray-600'
              }`}
            >
              <span className="text-xl">{classInfo.emoji}</span>
              <p className="text-xs text-gray-400">{classInfo.role}</p>
              {member ? (
                <div className="mt-1">
                  <p className="text-sm text-white truncate">{member.name}</p>
                  <p className="text-xs text-gray-400">Lv.{member.level}</p>
                  {member.id !== 'self' && (
                    <button
                      onClick={() => onRemoveFromTeam(member.id)}
                      className="text-red-400 text-xs hover:text-red-300"
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

      <div
        className={`p-2 rounded text-sm ${
          teamValidation.valid
            ? 'bg-green-900/30 text-green-400'
            : 'bg-yellow-900/30 text-yellow-400'
        }`}
      >
        {teamValidation.valid ? '✅' : '⚠️'} {teamValidation.count}/5 Sinif -{' '}
        {teamValidation.message}
      </div>
    </div>
  );

  const renderDungeonList = () => (
    <div className="space-y-3 max-h-[50vh] overflow-y-auto">
      {availableDungeons.map(dungeon => {
        const canEnter = dungeon.canEnter && dungeon.remainingEntries > 0;
        const isLegendary = dungeon.id === 'legendary_dungeon';

        return (
          <div
            key={dungeon.id}
            className={`p-4 rounded-lg border transition-all ${
              canEnter
                ? 'bg-gray-800 border-gray-600 hover:border-yellow-500 cursor-pointer'
                : 'bg-gray-900 border-gray-700 opacity-60'
            }`}
            onClick={() => canEnter && handleSelectDungeon(dungeon.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{dungeon.emoji}</span>
                <div>
                  <h4 className="text-white font-semibold">{dungeon.name}</h4>
                  <p className="text-sm text-gray-400">
                    {getDifficultyStars(dungeon.difficulty)} {formatDuration(dungeon.duration)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm ${dungeon.canEnter ? 'text-green-400' : 'text-red-400'}`}>
                  LV {dungeon.minLevel}+
                </p>
                <p className="text-sm text-gray-400">
                  {isLegendary ? '🔒 Cuma-Pazar' : `Kalan: ${dungeon.remainingEntries}/${dungeon.dailyLimit}`}
                </p>
              </div>
            </div>

            {/* Boss Preview */}
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <span>{dungeon.boss.emoji}</span>
              <span>Boss: {dungeon.boss.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderDifficultySelect = () => {
    if (!selectedDungeon) return null;
    const dungeon = DUNGEONS[selectedDungeon];

    return (
      <div className="space-y-4">
        {/* Back Button */}
        <button
          onClick={() => setViewMode('list')}
          className="text-gray-400 hover:text-white flex items-center gap-1"
        >
          ← Dungeon Listesi
        </button>

        {/* Dungeon Header */}
        <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
          <span className="text-3xl">{dungeon.emoji}</span>
          <div>
            <h3 className="text-xl font-bold text-white">{dungeon.name}</h3>
            <p className="text-gray-400">
              Boss: {dungeon.boss.emoji} {dungeon.boss.name}
            </p>
          </div>
        </div>

        {/* Difficulty Cards */}
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(DIFFICULTY_INFO) as DifficultyId[]).map(diff => {
            const info = DIFFICULTY_INFO[diff];
            const mult = DIFFICULTY_MULTIPLIERS[diff];
            const rewards = dungeon.rewards[diff];
            const isSelected = selectedDifficulty === diff;

            return (
              <div
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-2 border-yellow-500 bg-yellow-900/20'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{info.emoji}</span>
                  <span className="font-bold" style={{ color: info.color }}>
                    {info.name}
                  </span>
                </div>

                <div className="text-xs text-gray-400 space-y-1">
                  <p>Mob: x{mult.mobPower}</p>
                  <p>Boss HP: x{mult.bossHp}</p>
                  <p>Boss DMG: x{mult.bossDamage}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-700 text-xs">
                  <p className="text-yellow-400">💰 {rewards.gold.toLocaleString()}</p>
                  <p className="text-blue-400">⭐ {rewards.exp.toLocaleString()} EXP</p>
                  <p className="text-purple-400">
                    🎁 {getRarityName(rewards.guaranteedRarity)}+
                  </p>
                  {rewards.legendaryChance && (
                    <p className="text-orange-400">
                      ✨ Legendary {(rewards.legendaryChance * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Boss Mechanics Preview */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
            <span>⚠️</span> Boss Mekanikleri
          </h4>
          <div className="space-y-2">
            {dungeon.boss.mechanics.slice(0, 3).map((mech, idx) => (
              <div key={idx} className="text-sm">
                <span className="text-yellow-400">{mech.name}:</span>{' '}
                <span className="text-gray-400">{mech.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartDungeon}
          disabled={!teamValidation.valid}
          className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold text-lg transition-colors"
        >
          {teamValidation.valid
            ? `Dungeon'a Gir - ${DIFFICULTY_INFO[selectedDifficulty].name}`
            : '5 Farkli Sinif Gerekli!'}
        </button>
      </div>
    );
  };

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
          <h4 className="text-white font-semibold mb-3">🎁 ODÜLLER</h4>
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
            onClick={() => setViewMode('list')}
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
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700">
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
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {/* Team Panel - Always visible except in result */}
          {viewMode !== 'result' && renderTeamPanel()}

          {/* View Content */}
          {viewMode === 'list' && renderDungeonList()}
          {viewMode === 'difficulty' && renderDifficultySelect()}
          {viewMode === 'result' && renderResult()}
        </div>
      </div>
    </div>
  );
}

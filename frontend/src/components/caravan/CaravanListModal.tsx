import { useMemo } from 'react';
import type { Caravan } from '../../types/caravan';
import { getDangerColor, getStatusColor, getStatusText, formatGold } from '../../types/caravan';
import type { FlagType } from '../../types';

interface CaravanListModalProps {
  caravans: Caravan[];
  playerFlag: FlagType;
  playerLevel: number;
  playerId: string;
  onClose: () => void;
  onJoinAsGuard: (caravanId: string) => void;
  onAttack: (caravanId: string) => void;
  onLeaveGuard: (caravanId: string) => void;
  onCreateCaravan?: () => void;
}

export default function CaravanListModal({
  caravans,
  playerFlag,
  playerLevel,
  playerId,
  onClose,
  onJoinAsGuard,
  onAttack,
  onLeaveGuard,
  onCreateCaravan,
}: CaravanListModalProps) {
  const activeCaravans = useMemo(() => {
    return caravans.filter(
      (c) => c.status === 'traveling' || c.status === 'under_attack' || c.status === 'preparing'
    );
  }, [caravans]);

  const canJoinAsGuard = (caravan: Caravan): boolean => {
    if (playerFlag !== 'blue') return false;
    if (caravan.ownerId === playerId) return false;
    if (caravan.guards.some((g) => g.odanId === playerId)) return false;
    if (caravan.guards.length >= caravan.maxPlayerGuards) return false;
    if (caravan.status !== 'preparing' && caravan.status !== 'traveling') return false;
    return true;
  };

  const canAttack = (caravan: Caravan): boolean => {
    if (playerFlag !== 'red') return false;
    if (caravan.ownerId === playerId) return false;
    if (caravan.status !== 'traveling') return false;
    if (playerLevel < 10) return false;
    return true;
  };

  const isMyGuard = (caravan: Caravan): boolean => {
    return caravan.guards.some((g) => g.odanId === playerId && g.status === 'active');
  };

  const isMyCaravan = (caravan: Caravan): boolean => {
    return caravan.ownerId === playerId;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl border-2 border-yellow-600/50 shadow-2xl w-[900px] max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="text-center py-5 border-b border-yellow-600/30 bg-gradient-to-r from-yellow-900/30 to-orange-900/30">
          <h2
            className="text-yellow-400 text-2xl font-bold"
            style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}
          >
            🚚 AKTiF KERVANLAR
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {playerFlag === 'blue' && '🛡️ Mavi Puse - Koruyucu olarak katil ve odul kazan!'}
            {playerFlag === 'red' && '⚔️ Kirmizi Puse - Kervanlara saldır ve yagmala!'}
            {playerFlag === 'neutral' && '⚪ Tarafsiz - Bayrak sec: Koruyucu veya Haydut ol!'}
          </p>
        </div>

        {/* Caravan List */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeCaravans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🚚</div>
              <div className="text-xl">Aktif kervan yok</div>
              <div className="text-sm mt-2">Kendi kervanini baslat veya bekle!</div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {activeCaravans.map((caravan) => {
                const progressPercent = Math.round(caravan.progressPercent);
                const isMine = isMyCaravan(caravan);
                const amGuard = isMyGuard(caravan);
                const hpPercent = Math.round((caravan.hp / caravan.maxHp) * 100);

                return (
                  <div
                    key={caravan.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isMine
                        ? 'bg-yellow-900/20 border-yellow-500'
                        : amGuard
                        ? 'bg-blue-900/20 border-blue-500'
                        : caravan.isUnderAttack
                        ? 'bg-red-900/20 border-red-500 animate-pulse'
                        : 'bg-black/40 border-gray-700'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <span className="text-4xl">{caravan.type.icon}</span>
                          <div className="text-sm">{caravan.type.emoji}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{caravan.type.name}</span>
                            {isMine && (
                              <span className="text-yellow-400 text-xs bg-yellow-900/50 px-2 py-0.5 rounded">
                                SENiN
                              </span>
                            )}
                            {amGuard && (
                              <span className="text-blue-400 text-xs bg-blue-900/50 px-2 py-0.5 rounded">
                                KORUYUCU
                              </span>
                            )}
                          </div>
                          <div className="text-gray-500 text-sm">{caravan.route.name}</div>
                          <div className="text-gray-600 text-xs">
                            {caravan.route.startPoint.name} → {caravan.route.endPoint.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className="font-bold text-sm px-3 py-1 rounded"
                          style={{
                            color: getStatusColor(caravan.status),
                            backgroundColor: `${getStatusColor(caravan.status)}20`,
                          }}
                        >
                          {getStatusText(caravan.status)}
                          {caravan.isUnderAttack && caravan.attackerName && (
                            <span className="ml-1 text-xs">({caravan.attackerName})</span>
                          )}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">Sahibi: {caravan.ownerName}</div>
                      </div>
                    </div>

                    {/* HP Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-red-400">❤️ HP</span>
                        <span className={`${hpPercent > 50 ? 'text-green-400' : hpPercent > 25 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {formatGold(caravan.hp)} / {formatGold(caravan.maxHp)} ({hpPercent}%)
                        </span>
                      </div>
                      <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-gray-700">
                        <div
                          className={`h-full transition-all duration-300 ${
                            hpPercent > 50
                              ? 'bg-gradient-to-r from-green-600 to-green-400'
                              : hpPercent > 25
                              ? 'bg-gradient-to-r from-yellow-600 to-yellow-400'
                              : 'bg-gradient-to-r from-red-600 to-red-400'
                          }`}
                          style={{ width: `${hpPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{caravan.route.startPoint.name}</span>
                        <span>📍 {progressPercent}%</span>
                        <span>{caravan.route.endPoint.name}</span>
                      </div>
                      <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-gray-700">
                        <div
                          className={`h-full transition-all duration-300 ${
                            caravan.status === 'under_attack'
                              ? 'bg-gradient-to-r from-red-600 to-orange-500 animate-pulse'
                              : 'bg-gradient-to-r from-yellow-600 to-green-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      {/* Checkpoint markers */}
                      <div className="flex justify-between mt-1 px-1">
                        {caravan.route.checkpoints.map((cp, idx) => {
                          const cpProgress = ((idx + 1) / (caravan.route.checkpoints.length + 1)) * 100;
                          const isPassed = progressPercent >= cpProgress;
                          return (
                            <span
                              key={idx}
                              className={`text-[10px] ${isPassed ? 'text-green-400' : 'text-gray-600'}`}
                              title={cp.name}
                            >
                              📍
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Info Row */}
                    <div className="flex gap-4 mb-3 text-sm flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">💰</span>
                        <span className="text-yellow-400 font-bold">{formatGold(caravan.potentialReward)}</span>
                        <span className="text-gray-500">odul</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-blue-400">🛡️</span>
                        <span className="text-blue-400 font-bold">
                          {caravan.guards.filter((g) => g.status === 'active').length}
                        </span>
                        <span className="text-gray-500">/ {caravan.maxPlayerGuards} koruyucu</span>
                      </div>
                      {caravan.npcGuards.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-purple-400">🤖</span>
                          <span className="text-purple-400 font-bold">
                            {caravan.npcGuards.filter((g) => g.status === 'active').length}
                          </span>
                          <span className="text-gray-500">NPC muhafiz</span>
                        </div>
                      )}
                      <div
                        className="flex items-center gap-1"
                        style={{ color: getDangerColor(caravan.route.dangerLevel) }}
                      >
                        <span>⚠️</span>
                        <span className="font-bold">{caravan.route.dangerStars}</span>
                        <span className="text-gray-500">tehlike</span>
                      </div>
                    </div>

                    {/* Guards List */}
                    {(caravan.guards.length > 0 || caravan.npcGuards.length > 0) && (
                      <div className="mb-3 bg-black/30 rounded-lg p-2">
                        <div className="text-blue-400 text-xs font-bold mb-1">Koruyucular:</div>
                        <div className="flex flex-wrap gap-2">
                          {/* Player Guards */}
                          {caravan.guards.map((guard) => (
                            <div
                              key={guard.id}
                              className={`text-xs px-2 py-1 rounded ${
                                guard.status === 'active'
                                  ? 'bg-blue-900/50 text-blue-300'
                                  : guard.status === 'dead'
                                  ? 'bg-red-900/50 text-red-300 line-through'
                                  : 'bg-gray-900/50 text-gray-500'
                              }`}
                            >
                              🛡️ {guard.characterName} (Lv.{guard.characterLevel})
                            </div>
                          ))}
                          {/* NPC Guards */}
                          {caravan.npcGuards.map((npc) => (
                            <div
                              key={npc.id}
                              className={`text-xs px-2 py-1 rounded ${
                                npc.status === 'active'
                                  ? 'bg-purple-900/50 text-purple-300'
                                  : 'bg-red-900/50 text-red-300 line-through'
                              }`}
                            >
                              {npc.type.emoji} {npc.type.name} (HP: {Math.round((npc.hp / npc.maxHp) * 100)}%)
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                      {canJoinAsGuard(caravan) && (
                        <button
                          onClick={() => onJoinAsGuard(caravan.id)}
                          className="px-4 py-2 bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-bold rounded-lg transition-colors text-sm"
                        >
                          🛡️ Koruyucu Ol (%10 pay)
                        </button>
                      )}
                      {amGuard && (
                        <button
                          onClick={() => onLeaveGuard(caravan.id)}
                          className="px-4 py-2 bg-gradient-to-b from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 text-white font-bold rounded-lg transition-colors text-sm"
                        >
                          Ayril
                        </button>
                      )}
                      {canAttack(caravan) && (
                        <button
                          onClick={() => onAttack(caravan.id)}
                          className="px-4 py-2 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-bold rounded-lg transition-colors text-sm"
                        >
                          ⚔️ Saldır! (Yagmala)
                        </button>
                      )}
                      {isMine && caravan.status === 'preparing' && (
                        <div className="text-yellow-400 text-sm italic">Koruyucu bekleniyor...</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-yellow-600/30 bg-black/30">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              {playerFlag === 'neutral' && (
                <span className="text-gray-400">
                  ⚪ Bayrak sec: 🔵 Mavi koruyucu, 🔴 Kirmizi haydut olabilirsin
                </span>
              )}
              {playerFlag === 'blue' && (
                <span className="text-blue-400">
                  🛡️ Mavi Puse - Kervanlara koruyucu olarak katilabilirsin (%10 pay)
                </span>
              )}
              {playerFlag === 'red' && (
                <span className="text-red-400">
                  ⚔️ Kirmizi Puse - Kervanlara saldirir, HP'sini 0'a dusurursen yagmalarsın!
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {onCreateCaravan && playerLevel >= 20 && (
                <button
                  onClick={onCreateCaravan}
                  className="px-6 py-2 bg-gradient-to-b from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-bold rounded-lg transition-colors"
                >
                  🚚 Yeni Kervan
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

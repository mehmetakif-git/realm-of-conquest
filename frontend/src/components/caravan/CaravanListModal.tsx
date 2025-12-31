import { useMemo } from 'react';
import type { Caravan } from '../../types/caravan';
import { getDangerColor, getStatusColor, getStatusText } from '../../types/caravan';
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
    return caravans.filter(c => c.status === 'traveling' || c.status === 'under_attack' || c.status === 'preparing');
  }, [caravans]);

  const canJoinAsGuard = (caravan: Caravan): boolean => {
    if (playerFlag !== 'blue') return false;
    if (caravan.ownerId === playerId) return false;
    if (caravan.guards.some(g => g.odanId === playerId)) return false;
    if (caravan.guards.length >= caravan.maxGuards) return false;
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
    return caravan.guards.some(g => g.odanId === playerId && g.status === 'active');
  };

  const isMyCaravan = (caravan: Caravan): boolean => {
    return caravan.ownerId === playerId;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl border-2 border-yellow-600/50 shadow-2xl w-[800px] max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="text-center py-5 border-b border-yellow-600/30 bg-gradient-to-r from-yellow-900/30 to-orange-900/30">
          <h2 className="text-yellow-400 text-2xl font-bold" style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
            AKTIF KERVANLAR
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {playerFlag === 'blue' && '🛡️ Koruyucu olarak katil ve odul kazan!'}
            {playerFlag === 'red' && '⚔️ Kervanlara saldır ve yagmala!'}
            {playerFlag === 'neutral' && '⚪ Bayrak sec: Koruyucu veya Haydut ol!'}
          </p>
        </div>

        {/* Caravan List */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeCaravans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🐪</div>
              <div className="text-xl">Aktif kervan yok</div>
              <div className="text-sm mt-2">Kendi kervanini baslat veya bekle!</div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {activeCaravans.map(caravan => {
                const type = caravan.type;
                const route = caravan.route;

                const progressPercent = Math.round(caravan.progressPercent);
                const isMine = isMyCaravan(caravan);
                const amGuard = isMyGuard(caravan);

                return (
                  <div
                    key={caravan.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isMine
                        ? 'bg-yellow-900/20 border-yellow-500'
                        : amGuard
                        ? 'bg-blue-900/20 border-blue-500'
                        : 'bg-black/40 border-gray-700'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{type.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{type.name}</span>
                            {isMine && <span className="text-yellow-400 text-xs bg-yellow-900/50 px-2 py-0.5 rounded">SENIN</span>}
                            {amGuard && <span className="text-blue-400 text-xs bg-blue-900/50 px-2 py-0.5 rounded">KORUYUCU</span>}
                          </div>
                          <div className="text-gray-500 text-sm">{route.name}</div>
                          <div className="text-gray-600 text-xs">{route.startCity} → {route.endCity}</div>
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
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          Sahibi: {caravan.ownerName}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{route.startCity}</span>
                        <span>{progressPercent}%</span>
                        <span>{route.endCity}</span>
                      </div>
                      <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-gray-700">
                        <div
                          className={`h-full transition-all duration-300 ${
                            caravan.status === 'under_attack'
                              ? 'bg-gradient-to-r from-red-600 to-orange-500 animate-pulse'
                              : 'bg-gradient-to-r from-yellow-600 to-green-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Info Row */}
                    <div className="flex gap-4 mb-3 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">💰</span>
                        <span className="text-yellow-400 font-bold">{caravan.cargoValue.toLocaleString()}</span>
                        <span className="text-gray-500">kargo</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-blue-400">🛡️</span>
                        <span className="text-blue-400 font-bold">{caravan.guards.filter(g => g.status === 'active').length}</span>
                        <span className="text-gray-500">/ {type.maxGuards} koruyucu</span>
                      </div>
                      <div className="flex items-center gap-1" style={{ color: getDangerColor(route.dangerLevel) }}>
                        <span>⚠️</span>
                        <span className="font-bold">{'💀'.repeat(Math.ceil(route.dangerLevel / 2))}</span>
                        <span className="text-gray-500">tehlike</span>
                      </div>
                    </div>

                    {/* Guards List */}
                    {caravan.guards.length > 0 && (
                      <div className="mb-3 bg-black/30 rounded-lg p-2">
                        <div className="text-blue-400 text-xs font-bold mb-1">Koruyucular:</div>
                        <div className="flex flex-wrap gap-2">
                          {caravan.guards.map(guard => (
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
                          🛡️ Koruyucu Ol
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
                          ⚔️ Saldır!
                        </button>
                      )}
                      {isMine && caravan.status === 'preparing' && (
                        <div className="text-yellow-400 text-sm italic">
                          Koruyucu bekleniyor...
                        </div>
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
                  ⚪ Bayrak sec: Mavi koruyucu, Kirmizi haydut olabilirsin
                </span>
              )}
              {playerFlag === 'blue' && (
                <span className="text-blue-400">
                  🛡️ Koruyucu olarak kervanlara katilabilirsin (10% pay)
                </span>
              )}
              {playerFlag === 'red' && (
                <span className="text-red-400">
                  ⚔️ Haydut olarak kervanlara saldirabilirsin
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {onCreateCaravan && playerLevel >= 10 && (
                <button
                  onClick={onCreateCaravan}
                  className="px-6 py-2 bg-gradient-to-b from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-bold rounded-lg transition-colors"
                >
                  🐪 Yeni Kervan
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

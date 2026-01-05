import { useState, useMemo } from 'react';
import {
  CARAVAN_TYPES,
  CARAVAN_ROUTES,
  NPC_GUARD_TYPES,
  getDangerColor,
  calculateCaravanRewards,
  formatGold,
  getDistanceText,
} from '../../types/caravan';
import type { CaravanType, CaravanRoute, NPCGuardType } from '../../types/caravan';

interface CaravanCreateModalProps {
  playerGold: number;
  playerLevel: number;
  onClose: () => void;
  onCreate: (typeId: string, routeId: string) => void;
}

export default function CaravanCreateModal({
  playerGold,
  playerLevel,
  onClose,
  onCreate,
}: CaravanCreateModalProps) {
  const [selectedType, setSelectedType] = useState<CaravanType | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<CaravanRoute | null>(null);
  const [selectedGuards, setSelectedGuards] = useState<NPCGuardType[]>([]);
  const [activeTab, setActiveTab] = useState<'type' | 'route' | 'guards'>('type');

  const calculations = useMemo(() => {
    if (!selectedType || !selectedRoute) return null;

    const { baseReward, routeBonus, totalReward, estimatedTime } = calculateCaravanRewards(
      selectedType,
      selectedRoute
    );

    const guardCost = selectedGuards.reduce((sum, g) => sum + g.costPerHour * 2, 0); // 2 saat için
    const totalInvestment = selectedType.investment + guardCost;

    return {
      investment: selectedType.investment,
      guardCost,
      totalInvestment,
      baseReward,
      routeBonus,
      totalReward,
      profit: totalReward - totalInvestment,
      estimatedTime,
      hp: selectedType.hp,
    };
  }, [selectedType, selectedRoute, selectedGuards]);

  const canCreate =
    selectedType &&
    selectedRoute &&
    calculations &&
    playerGold >= calculations.totalInvestment &&
    playerLevel >= selectedType.minLevel;

  const handleCreate = () => {
    if (canCreate && selectedType && selectedRoute) {
      onCreate(selectedType.id, selectedRoute.id);
    }
  };

  const toggleGuard = (guard: NPCGuardType) => {
    if (selectedGuards.some((g) => g.id === guard.id)) {
      setSelectedGuards(selectedGuards.filter((g) => g.id !== guard.id));
    } else if (selectedGuards.length < 3) {
      setSelectedGuards([...selectedGuards, guard]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl border-2 border-yellow-600/50 shadow-2xl w-[950px] max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="text-center py-5 border-b border-yellow-600/30 bg-gradient-to-r from-yellow-900/30 to-orange-900/30">
          <h2
            className="text-yellow-400 text-2xl font-bold"
            style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}
          >
            🚚 KERVAN OLUSTUR
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Silkroad tarzı kervan ticareti - Risk al, zengin ol!
          </p>
          <div className="text-yellow-400 mt-2 font-bold">
            💰 Mevcut Gold: {playerGold.toLocaleString()}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {['type', 'route', 'guards'].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-bold transition-all ${
                activeTab === tab
                  ? 'bg-yellow-900/30 text-yellow-400 border-b-2 border-yellow-500'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {idx + 1}. {tab === 'type' ? 'KERVAN TiPi' : tab === 'route' ? 'ROTA SEC' : 'MUHAFIZ'}
              {tab === 'type' && selectedType && (
                <span className="ml-2 text-green-400">✓</span>
              )}
              {tab === 'route' && selectedRoute && (
                <span className="ml-2 text-green-400">✓</span>
              )}
              {tab === 'guards' && selectedGuards.length > 0 && (
                <span className="ml-2 text-green-400">({selectedGuards.length})</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Kervan Tipi Seçimi */}
          {activeTab === 'type' && (
            <div className="grid grid-cols-1 gap-3">
              {CARAVAN_TYPES.map((type) => {
                const isLocked = playerLevel < type.minLevel;
                const isSelected = selectedType?.id === type.id;

                return (
                  <div
                    key={type.id}
                    onClick={() => !isLocked && setSelectedType(type)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                      isLocked
                        ? 'opacity-50 cursor-not-allowed border-gray-800 bg-gray-900/50'
                        : isSelected
                        ? 'border-yellow-500 bg-yellow-900/30 shadow-lg shadow-yellow-500/20'
                        : 'border-gray-700 bg-black/30 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="text-center">
                        <span className="text-4xl">{type.icon}</span>
                        <div className="text-lg mt-1">{type.emoji}</div>
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-lg">{type.name}</span>
                          {isLocked && (
                            <span className="text-red-400 text-xs bg-red-900/50 px-2 py-0.5 rounded">
                              🔒 Lv.{type.minLevel}+
                            </span>
                          )}
                        </div>
                        <div className="flex gap-4 mt-1 text-sm text-gray-400">
                          <span>❤️ HP: {formatGold(type.hp)}</span>
                          <span>🛡️ Max Koruyucu: {type.maxGuards}</span>
                          <span>⏱️ ~{type.duration} dk</span>
                        </div>
                      </div>

                      {/* Investment & Reward */}
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold text-lg">
                          {formatGold(type.investment)} G
                        </div>
                        <div className="text-green-400 text-sm">
                          +{type.profitPercent}% kar → {formatGold(type.reward)} G
                        </div>
                        <div className="text-blue-400 text-xs mt-1">
                          Net kar: {formatGold(type.profit)} G
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rota Seçimi */}
          {activeTab === 'route' && (
            <div className="grid grid-cols-1 gap-3">
              {CARAVAN_ROUTES.map((route) => {
                const isSelected = selectedRoute?.id === route.id;

                return (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                      isSelected
                        ? 'border-yellow-500 bg-yellow-900/30 shadow-lg shadow-yellow-500/20'
                        : 'border-gray-700 bg-black/30 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold text-lg">{route.name}</div>
                        <div className="flex gap-4 mt-1 text-sm text-gray-400">
                          <span>📏 {getDistanceText(route.distance)}</span>
                          <span>⏱️ {route.duration} dk</span>
                          <span>📍 {route.checkpoints.length} checkpoint</span>
                        </div>
                        {/* Checkpoints */}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded">
                            📍 {route.startPoint.name}
                          </span>
                          {route.checkpoints.map((cp, idx) => (
                            <span
                              key={idx}
                              className="text-xs text-gray-400 bg-gray-800/50 px-2 py-0.5 rounded"
                            >
                              → {cp.name}
                            </span>
                          ))}
                          <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">
                            🎯 {route.endPoint.name}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div style={{ color: getDangerColor(route.dangerLevel) }}>
                          <span className="text-lg">{route.dangerStars}</span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          Tehlike: {route.dangerLevel}/5
                        </div>
                        {route.bonusPercent > 0 && (
                          <div className="text-green-400 text-sm mt-1">
                            +{route.bonusPercent}% bonus
                          </div>
                        )}
                        <div className="text-orange-400 text-xs mt-1">
                          Haydut: %{Math.round(route.banditSpawnChance * 100)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* NPC Muhafız Seçimi */}
          {activeTab === 'guards' && (
            <div>
              <div className="text-gray-400 text-sm mb-4">
                NPC muhafız kiralayarak kervanını haydutlara karşı koruyabilirsin. Maksimum 3 NPC muhafız.
              </div>
              <div className="grid grid-cols-1 gap-3">
                {NPC_GUARD_TYPES.map((guard) => {
                  const isSelected = selectedGuards.some((g) => g.id === guard.id);
                  const cost = guard.costPerHour * 2; // 2 saat için

                  return (
                    <div
                      key={guard.id}
                      onClick={() => toggleGuard(guard)}
                      className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-900/30 shadow-lg shadow-blue-500/20'
                          : 'border-gray-700 bg-black/30 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{guard.emoji}</span>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{guard.name}</span>
                            <span className="text-yellow-400 text-xs">
                              {'⭐'.repeat(guard.power)}
                            </span>
                          </div>
                          <div className="text-gray-400 text-sm">{guard.description}</div>
                          <div className="flex gap-3 mt-1 text-xs">
                            <span className="text-red-400">❤️ {formatGold(guard.hp)} HP</span>
                            <span className="text-orange-400">⚔️ {guard.atk} ATK</span>
                            <span className="text-blue-400">🛡️ {guard.def} DEF</span>
                          </div>
                          <div className="flex gap-1 mt-1">
                            {guard.abilities.map((ability, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-gray-700 px-1.5 py-0.5 rounded text-gray-300"
                              >
                                {ability.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-yellow-400 font-bold">{formatGold(cost)} G</div>
                          <div className="text-gray-500 text-xs">2 saat</div>
                          {isSelected && (
                            <div className="text-green-400 text-sm mt-1">✓ Secildi</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Summary & Actions */}
        <div className="p-4 border-t border-yellow-600/30 bg-black/40">
          {calculations && (
            <div className="grid grid-cols-6 gap-4 mb-4 text-center">
              <div>
                <div className="text-gray-500 text-xs">Yatirim</div>
                <div className="text-yellow-400 font-bold">{formatGold(calculations.investment)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Muhafiz</div>
                <div className="text-blue-400 font-bold">{formatGold(calculations.guardCost)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Toplam</div>
                <div className="text-red-400 font-bold">{formatGold(calculations.totalInvestment)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Odul</div>
                <div className="text-green-400 font-bold">{formatGold(calculations.totalReward)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Net Kar</div>
                <div
                  className={`font-bold ${
                    calculations.profit > 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {calculations.profit > 0 ? '+' : ''}{formatGold(calculations.profit)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Kervan HP</div>
                <div className="text-red-400 font-bold">❤️ {formatGold(calculations.hp)}</div>
              </div>
            </div>
          )}

          {/* Warnings */}
          <div className="text-sm space-y-1 mb-4">
            {selectedType && playerLevel < selectedType.minLevel && (
              <div className="text-red-400">
                ⚠️ Bu kervan icin minimum Level {selectedType.minLevel} gerekli!
              </div>
            )}
            {calculations && playerGold < calculations.totalInvestment && (
              <div className="text-red-400">
                ⚠️ Yetersiz gold! {formatGold(calculations.totalInvestment - playerGold)} G daha lazim.
              </div>
            )}
            {!selectedType && <div className="text-yellow-400">💡 Kervan tipi sec</div>}
            {selectedType && !selectedRoute && (
              <div className="text-yellow-400">💡 Rota sec</div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
            >
              Iptal
            </button>
            <button
              onClick={handleCreate}
              disabled={!canCreate}
              className={`px-8 py-3 font-bold rounded-lg transition-all ${
                canCreate
                  ? 'bg-gradient-to-b from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              🚚 Kervani Baslat! ({formatGold(calculations?.totalInvestment || 0)} G)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

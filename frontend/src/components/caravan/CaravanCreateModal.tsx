import { useState, useMemo } from 'react';
import { CARAVAN_TYPES, CARAVAN_ROUTES, getDangerColor, calculateCaravanRewards } from '../../types/caravan';
import type { CaravanType, CaravanRoute } from '../../types/caravan';

interface CaravanCreateModalProps {
  playerGold: number;
  playerLevel: number;
  onClose: () => void;
  onCreate: (typeId: number, routeId: number, investment: number) => void;
}

export default function CaravanCreateModal({
  playerGold,
  playerLevel,
  onClose,
  onCreate,
}: CaravanCreateModalProps) {
  const [selectedType, setSelectedType] = useState<CaravanType | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<CaravanRoute | null>(null);
  const [investment, setInvestment] = useState(0);

  const calculations = useMemo(() => {
    if (!selectedType || !selectedRoute) return null;

    const baseCost = selectedType.baseCost;
    const totalInvestment = baseCost + investment;
    const { cargoValue, potentialReward, estimatedTime } = calculateCaravanRewards(selectedType, selectedRoute, investment);
    const riskLevel = selectedRoute.dangerLevel;

    return {
      baseCost,
      totalInvestment,
      cargoValue,
      potentialReward,
      estimatedTime,
      riskLevel,
      potentialProfit: potentialReward - totalInvestment,
    };
  }, [selectedType, selectedRoute, investment]);

  const canCreate = selectedType && selectedRoute && calculations &&
    playerGold >= calculations.totalInvestment &&
    playerLevel >= 10;

  const handleCreate = () => {
    if (canCreate && selectedType && selectedRoute) {
      onCreate(selectedType.id, selectedRoute.id, investment);
    }
  };

  const maxInvestment = selectedType
    ? Math.max(0, Math.min(playerGold - selectedType.baseCost, 100000))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl border-2 border-yellow-600/50 shadow-2xl w-[900px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center py-5 border-b border-yellow-600/30 bg-gradient-to-r from-yellow-900/30 to-orange-900/30">
          <h2 className="text-yellow-400 text-2xl font-bold" style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
            KERVAN OLUSTUR
          </h2>
          <p className="text-gray-400 text-sm mt-1">Ticaret kervani baslat, koruyucular bul, zengin ol!</p>
          <div className="text-yellow-400 mt-2 font-bold">
            Mevcut Gold: {playerGold.toLocaleString()}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Kervan Tipi Secimi */}
            <div>
              <h3 className="text-white font-bold mb-3">1. Kervan Tipi Sec</h3>
              <div className="flex flex-col gap-3">
                {CARAVAN_TYPES.map(type => (
                  <div
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type);
                      setInvestment(0);
                    }}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedType?.id === type.id
                        ? 'bg-yellow-900/30 border-2 border-yellow-500'
                        : 'bg-black/30 border-2 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{type.icon}</span>
                        <div>
                          <div className="text-white font-bold">{type.name}</div>
                          <div className="text-gray-500 text-xs">
                            Hiz: {'⚡'.repeat(Math.ceil(type.speed / 2))} | Koruyucu: {type.minGuards}-{type.maxGuards}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold">{type.baseCost.toLocaleString()} G</div>
                        <div className="text-green-400 text-xs">x{type.rewardMultiplier} odul</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rota Secimi */}
            <div>
              <h3 className="text-white font-bold mb-3">2. Rota Sec</h3>
              <div className="flex flex-col gap-3">
                {CARAVAN_ROUTES.map(route => (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedRoute?.id === route.id
                        ? 'bg-yellow-900/30 border-2 border-yellow-500'
                        : 'bg-black/30 border-2 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-white font-bold">{route.name}</div>
                        <div className="text-gray-500 text-xs">{route.startCity} → {route.endCity}</div>
                      </div>
                      <div className="text-right">
                        <div style={{ color: getDangerColor(route.dangerLevel) }} className="text-xs">
                          Tehlike: {'💀'.repeat(Math.ceil(route.dangerLevel / 2))}
                        </div>
                        <div className="text-green-400 text-xs">x{route.rewardBonus} bonus</div>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-600">
                      <span>📏 {route.distance} mesafe</span>
                      <span>⏱️ ~{route.estimatedMinutes} dk</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Yatirim Miktari */}
          <div className="mt-6">
            <h3 className="text-white font-bold mb-3">3. Ekstra Yatirim (Opsiyonel)</h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={maxInvestment}
                step={100}
                value={investment}
                onChange={(e) => setInvestment(Number(e.target.value))}
                className="flex-1"
                disabled={!selectedType}
              />
              <input
                type="number"
                value={investment}
                onChange={(e) => setInvestment(Math.min(maxInvestment, Math.max(0, Number(e.target.value))))}
                disabled={!selectedType}
                className="w-32 bg-black/50 border border-gray-600 rounded px-3 py-2 text-yellow-400 text-right"
              />
              <span className="text-gray-500">Gold</span>
            </div>
            <p className="text-gray-600 text-xs mt-2">
              Daha fazla yatirim = Daha fazla kargo = Daha fazla odul (ve risk!)
            </p>
          </div>

          {/* Ozet */}
          {calculations && (
            <div className="mt-6 bg-black/40 rounded-lg p-5">
              <h3 className="text-yellow-400 font-bold mb-4">📊 Kervan Ozeti</h3>
              <div className="grid grid-cols-4 gap-4">
                <SummaryItem label="Toplam Maliyet" value={`${calculations.totalInvestment.toLocaleString()} G`} color="text-red-400" />
                <SummaryItem label="Kargo Degeri" value={`${calculations.cargoValue.toLocaleString()} G`} color="text-yellow-400" />
                <SummaryItem label="Potansiyel Odul" value={`${calculations.potentialReward.toLocaleString()} G`} color="text-green-400" />
                <SummaryItem
                  label="Tahmini Kar"
                  value={`${calculations.potentialProfit.toLocaleString()} G`}
                  color={calculations.potentialProfit > 0 ? 'text-green-400' : 'text-red-400'}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <SummaryItem label="Tahmini Sure" value={`~${calculations.estimatedTime} dk`} color="text-cyan-400" />
                <SummaryItem
                  label="Risk Seviyesi"
                  value={'⚠️'.repeat(Math.ceil(calculations.riskLevel / 3))}
                  color={getDangerColor(calculations.riskLevel)}
                  isRaw
                />
                <SummaryItem label="Min. Koruyucu" value={`${selectedType?.minGuards} kisi`} color="text-blue-400" />
              </div>
            </div>
          )}

          {/* Uyarilar */}
          <div className="mt-4 text-sm space-y-1">
            {playerLevel < 10 && (
              <div className="text-red-400">⚠️ Kervan baslatmak icin minimum 10. seviye gerekli!</div>
            )}
            {calculations && playerGold < calculations.totalInvestment && (
              <div className="text-red-400">
                ⚠️ Yetersiz gold! {(calculations.totalInvestment - playerGold).toLocaleString()} G daha lazim.
              </div>
            )}
            <div className="text-orange-400">⚠️ Kervan yagmalanirsa tum yatirimini kaybedersin!</div>
            <div className="text-blue-400">💡 Mavi puseli koruyucular kervanini haydutlardan korur.</div>
          </div>

          {/* Butonlar */}
          <div className="flex gap-4 justify-center mt-6">
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
              🐪 Kervani Baslat!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  color,
  isRaw = false,
}: {
  label: string;
  value: string;
  color: string;
  isRaw?: boolean;
}) {
  return (
    <div className="text-center">
      <div className="text-gray-500 text-xs">{label}</div>
      <div className={`font-bold text-lg ${isRaw ? '' : color}`} style={isRaw ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import type {
  EnhanceableItem,
  EnhancementResult,
  PlayerProtectionItem,
} from '../../types/enhancement';
import {
  ENHANCEMENT_LEVELS,
  PROTECTION_ITEMS,
  getRarityColor,
  getSuccessRateColor,
} from '../../types/enhancement';

interface EnhancementModalProps {
  playerGold: number;
  playerItems: EnhanceableItem[];
  protectionItems: PlayerProtectionItem[];
  enhancementStones: number;
  onEnhance: (itemId: string, useProtections: string[]) => { result: EnhancementResult; newLevel: number };
  onSpendGold: (amount: number) => void;
  onClose: () => void;
}

export default function EnhancementModal({
  playerGold,
  playerItems,
  protectionItems,
  enhancementStones,
  onEnhance,
  onSpendGold,
  onClose,
}: EnhancementModalProps) {
  const [selectedItem, setSelectedItem] = useState<EnhanceableItem | null>(null);
  const [selectedProtections, setSelectedProtections] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [result, setResult] = useState<{ type: EnhancementResult; newLevel: number } | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Get next level info for selected item
  const nextLevelInfo = useMemo(() => {
    if (!selectedItem) return null;
    const nextLevel = selectedItem.currentLevel + 1;
    if (nextLevel > 15) return null;
    return ENHANCEMENT_LEVELS.find(l => l.level === nextLevel);
  }, [selectedItem]);

  // Calculate final success rate with protections
  const finalSuccessRate = useMemo(() => {
    if (!nextLevelInfo) return 0;
    let rate = nextLevelInfo.successRate;

    if (selectedProtections.includes('luck_stone')) {
      rate = Math.min(100, rate + 10);
    }

    return rate;
  }, [nextLevelInfo, selectedProtections]);

  // Check if can enhance
  const canEnhance = useMemo(() => {
    if (!selectedItem || !nextLevelInfo) return { can: false, reason: 'Item sec' };
    if (selectedItem.isBroken) return { can: false, reason: 'Item kirik!' };
    if (selectedItem.currentLevel >= 15) return { can: false, reason: 'Maksimum seviye!' };
    if (playerGold < nextLevelInfo.goldCost) return { can: false, reason: 'Yetersiz gold!' };
    if (enhancementStones < nextLevelInfo.stoneRequired) return { can: false, reason: 'Yetersiz Basma Tasi!' };
    return { can: true, reason: '' };
  }, [selectedItem, nextLevelInfo, playerGold, enhancementStones]);

  // Toggle protection item
  const toggleProtection = (protectionId: string) => {
    if (selectedProtections.includes(protectionId)) {
      setSelectedProtections(prev => prev.filter(p => p !== protectionId));
    } else {
      const hasItem = protectionItems.find(p => p.id === protectionId && p.count > 0);
      if (hasItem) {
        setSelectedProtections(prev => [...prev, protectionId]);
      }
    }
  };

  // Handle enhancement
  const handleEnhance = () => {
    if (!canEnhance.can || !selectedItem || !nextLevelInfo) return;

    setIsEnhancing(true);

    // Spend gold
    onSpendGold(nextLevelInfo.goldCost);

    // Animation delay
    setTimeout(() => {
      const enhanceResult = onEnhance(selectedItem.id, selectedProtections);

      setResult({ type: enhanceResult.result, newLevel: enhanceResult.newLevel });
      setShowResult(true);
      setIsEnhancing(false);

      // Update selected item reference
      if (enhanceResult.result === 'broken') {
        setSelectedItem(null);
      } else {
        setSelectedItem(prev => prev ? { ...prev, currentLevel: enhanceResult.newLevel } : null);
      }

      // Clear protections
      setSelectedProtections([]);
    }, 2000);
  };

  // Enhanceable items (not broken, not max level)
  const enhanceableItems = playerItems.filter(item => !item.isBroken && item.currentLevel < 15);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl border-2 border-yellow-600/50 shadow-2xl w-[900px] max-w-[95vw] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="text-center py-5 border-b border-yellow-600/30 bg-gradient-to-r from-orange-900/30 to-yellow-900/30">
          <h2 className="text-yellow-400 text-2xl font-bold" style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
            +BASMA ATOLYESI
          </h2>
          <p className="text-gray-400 text-sm mt-1">Ekipmanlarini guclendir, efsane yarat!</p>
          <div className="flex justify-center gap-8 mt-3">
            <span className="text-yellow-400 font-bold">💰 {playerGold.toLocaleString()} Gold</span>
            <span className="text-cyan-400 font-bold">💎 {enhancementStones} Basma Tasi</span>
          </div>
        </div>

        {/* Result Overlay */}
        {showResult && result && (
          <EnhancementResultDisplay
            result={result.type}
            newLevel={result.newLevel}
            itemName={selectedItem?.name || ''}
            onClose={() => {
              setShowResult(false);
              setResult(null);
            }}
          />
        )}

        {/* Main Content */}
        {!showResult && (
          <div className="p-6">
            <div className="flex gap-6">
              {/* Left: Item Selection */}
              <div className="flex-1">
                <h3 className="text-white font-bold mb-3">📦 Ekipman Sec</h3>
                <div className="grid grid-cols-4 gap-3 max-h-[350px] overflow-y-auto p-3 bg-black/30 rounded-lg">
                  {enhanceableItems.map(item => (
                    <ItemSlot
                      key={item.id}
                      item={item}
                      isSelected={selectedItem?.id === item.id}
                      onClick={() => {
                        setSelectedItem(item);
                        setSelectedProtections([]);
                      }}
                    />
                  ))}
                  {enhanceableItems.length === 0 && (
                    <div className="col-span-4 text-center text-gray-500 py-10">
                      Basilabilir ekipman yok
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Enhancement Details */}
              <div className="flex-1">
                {selectedItem ? (
                  <>
                    {/* Selected Item Display */}
                    <div className="bg-black/40 rounded-xl p-5 text-center mb-4">
                      <div className="text-5xl mb-3">{selectedItem.icon}</div>
                      <div
                        className="text-lg font-bold"
                        style={{ color: getRarityColor(selectedItem.rarity) }}
                      >
                        {selectedItem.name} +{selectedItem.currentLevel}
                      </div>
                      <div className="text-gray-500 text-sm mt-1">
                        {selectedItem.currentLevel < 15 ? `Sonraki: +${selectedItem.currentLevel + 1}` : 'MAX SEVIYE'}
                      </div>
                    </div>

                    {/* Success Rate */}
                    {nextLevelInfo && (
                      <div className="mb-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400 text-sm">Basari Orani</span>
                          <span
                            className="font-bold"
                            style={{ color: getSuccessRateColor(finalSuccessRate) }}
                          >
                            %{finalSuccessRate}
                          </span>
                        </div>
                        <div className="h-5 bg-black/50 rounded-full overflow-hidden border border-gray-700">
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: `${finalSuccessRate}%`,
                              background: `linear-gradient(90deg, ${getSuccessRateColor(finalSuccessRate)}, ${getSuccessRateColor(finalSuccessRate)}88)`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Cost */}
                    {nextLevelInfo && (
                      <div className="bg-black/30 rounded-lg p-4 mb-4">
                        <div className="text-yellow-400 font-bold mb-2">💰 Maliyet</div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Gold:</span>
                          <span className={playerGold >= nextLevelInfo.goldCost ? 'text-green-400' : 'text-red-400'}>
                            {nextLevelInfo.goldCost.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-400">Basma Tasi:</span>
                          <span className={enhancementStones >= nextLevelInfo.stoneRequired ? 'text-green-400' : 'text-red-400'}>
                            {nextLevelInfo.stoneRequired}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Protection Items */}
                    {nextLevelInfo && (
                      <div className="mb-4">
                        <div className="text-gray-400 text-sm mb-2">🛡️ Koruma (Opsiyonel)</div>
                        <div className="flex gap-2 flex-wrap">
                          {PROTECTION_ITEMS.filter(p =>
                            selectedItem.currentLevel + 1 >= p.usableFromLevel &&
                            selectedItem.currentLevel + 1 <= p.usableToLevel
                          ).map(protection => {
                            const hasItem = protectionItems.find(p => p.id === protection.id && p.count > 0);
                            const isSelected = selectedProtections.includes(protection.id);

                            return (
                              <div
                                key={protection.id}
                                onClick={() => hasItem && toggleProtection(protection.id)}
                                className={`flex-1 p-3 rounded-lg text-center cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-yellow-900/30 border-2 border-yellow-500'
                                    : 'bg-black/30 border-2 border-gray-700 hover:border-gray-500'
                                } ${!hasItem ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <div className="text-xl">{protection.icon}</div>
                                <div className="text-white text-xs mt-1">{protection.name}</div>
                                <div className="text-gray-500 text-xs">
                                  {hasItem ? `x${hasItem.count}` : 'Yok'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Warnings */}
                    {nextLevelInfo && (
                      <div className="text-xs mb-4 space-y-1">
                        {nextLevelInfo.failurePenalty !== 'none' && (
                          <div className="text-orange-400">
                            ⚠️ Basarisizlikta seviye{' '}
                            {nextLevelInfo.failurePenalty === 'minus1' ? '1' :
                             nextLevelInfo.failurePenalty === 'minus2' ? '2' : '3'}{' '}
                            duser!
                          </div>
                        )}
                        {nextLevelInfo.breakChance > 0 && (
                          <div className="text-red-400">
                            💀 %{nextLevelInfo.breakChance} kirilma riski!
                          </div>
                        )}
                      </div>
                    )}

                    {/* Enhance Button */}
                    <button
                      onClick={handleEnhance}
                      disabled={!canEnhance.can || isEnhancing}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                        !canEnhance.can || isEnhancing
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-b from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black'
                      }`}
                    >
                      {isEnhancing ? (
                        <span className="animate-pulse">⚡ BASILIYOR... ⚡</span>
                      ) : canEnhance.can ? (
                        `🔨 +${selectedItem.currentLevel + 1} YAP!`
                      ) : (
                        canEnhance.reason
                      )}
                    </button>
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-20">
                    ← Soldan ekipman sec
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {!isEnhancing && !showResult && (
          <div className="p-4 border-t border-yellow-600/30 bg-black/30 text-center">
            <button
              onClick={onClose}
              className="px-8 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
            >
              Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Item Slot Component
function ItemSlot({
  item,
  isSelected,
  onClick,
}: {
  item: EnhanceableItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`w-[70px] h-[70px] rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all relative ${
        isSelected
          ? 'bg-yellow-900/40 scale-105'
          : 'bg-black/50 hover:bg-black/70'
      }`}
      style={{
        border: `2px solid ${isSelected ? '#ffd700' : getRarityColor(item.rarity)}`,
      }}
    >
      <span className="text-3xl">{item.icon}</span>
      <span
        className="absolute bottom-1 right-1 text-xs font-bold"
        style={{ color: '#ffd700', textShadow: '0 0 3px #000' }}
      >
        +{item.currentLevel}
      </span>
    </div>
  );
}

// Enhancement Result Display
function EnhancementResultDisplay({
  result,
  newLevel,
  itemName,
  onClose,
}: {
  result: EnhancementResult;
  newLevel: number;
  itemName: string;
  onClose: () => void;
}) {
  const resultConfig = {
    success: {
      icon: '✨',
      title: 'BASARILI!',
      color: '#44ff44',
      message: `${itemName} +${newLevel} oldu!`,
      bgClass: 'from-green-900/50 to-green-950/50',
    },
    failure: {
      icon: '💨',
      title: 'BASARISIZ',
      color: '#ff8800',
      message: 'Seviye degismedi.',
      bgClass: 'from-orange-900/50 to-orange-950/50',
    },
    downgrade: {
      icon: '📉',
      title: 'SEVIYE DUSTU!',
      color: '#ff4444',
      message: `${itemName} +${newLevel} seviyesine dustu!`,
      bgClass: 'from-red-900/50 to-red-950/50',
    },
    broken: {
      icon: '💔',
      title: 'KIRILDI!',
      color: '#ff0000',
      message: `${itemName} kirildi ve yok oldu!`,
      bgClass: 'from-red-900/80 to-black/80',
    },
  };

  const config = resultConfig[result];

  return (
    <div className={`absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-b ${config.bgClass}`}>
      <div
        className={`text-center ${
          result === 'success' ? 'animate-bounce' : result === 'broken' ? 'animate-pulse' : ''
        }`}
      >
        <div className="text-8xl mb-6">{config.icon}</div>
        <div
          className="text-4xl font-bold mb-4"
          style={{ color: config.color, textShadow: `0 0 20px ${config.color}` }}
        >
          {config.title}
        </div>
        <div className="text-white text-xl mb-8">{config.message}</div>
        <button
          onClick={onClose}
          className="px-10 py-3 rounded-xl font-bold text-lg transition-all"
          style={{
            background: config.color,
            color: result === 'success' ? '#000' : '#fff',
          }}
        >
          Tamam
        </button>
      </div>
    </div>
  );
}

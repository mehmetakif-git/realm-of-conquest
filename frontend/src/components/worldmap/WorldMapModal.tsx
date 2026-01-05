import React, { useState } from 'react';
import {
  WORLD_REGIONS,
  WorldRegion,
  canEnterRegion,
  getExpBonusText,
  getDifficultyColor,
  getDifficultyText,
  getRegionProgressColor,
  formatGearScore
} from '../../types/worldmap';

interface WorldMapModalProps {
  playerLevel: number;
  playerGearScore: number;
  currentRegion?: string;
  onClose: () => void;
  onTravelTo?: (regionId: string) => void;
}

const WorldMapModal: React.FC<WorldMapModalProps> = ({
  playerLevel,
  playerGearScore,
  currentRegion = 'starter_forest',
  onClose,
  onTravelTo
}) => {
  const [selectedRegion, setSelectedRegion] = useState<WorldRegion | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const handleRegionClick = (region: WorldRegion) => {
    setSelectedRegion(region);
  };

  const handleTravel = () => {
    if (selectedRegion && onTravelTo) {
      const check = canEnterRegion(playerLevel, playerGearScore, selectedRegion);
      if (check.allowed) {
        onTravelTo(selectedRegion.id);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden border border-amber-600/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900/80 to-gray-900 px-6 py-4 border-b border-amber-600/30 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🗺️</span>
            <div>
              <h2 className="text-xl font-bold text-amber-400">DUNYA HARITASI</h2>
              <p className="text-gray-400 text-sm">9 Bolgeli Acik Dunya</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-400">Senin Konumun</p>
              <p className="text-amber-400 font-bold">
                {WORLD_REGIONS.find(r => r.id === currentRegion)?.emoji}{' '}
                {WORLD_REGIONS.find(r => r.id === currentRegion)?.name}
              </p>
            </div>
            <div className="text-right border-l border-gray-600 pl-4">
              <p className="text-xs text-gray-400">Level / Gear Score</p>
              <p className="text-white font-bold">
                LV {playerLevel} / GS {formatGearScore(playerGearScore)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl ml-2"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Left - Region List */}
          <div className="w-80 border-r border-gray-700 overflow-y-auto">
            <div className="p-3 bg-gray-800/50 border-b border-gray-700">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Bolgeler (Level Sirasina Gore)</p>
            </div>

            <div className="p-2 space-y-1">
              {WORLD_REGIONS.map((region, index) => {
                const check = canEnterRegion(playerLevel, playerGearScore, region);
                const isCurrentRegion = region.id === currentRegion;
                const isSelected = selectedRegion?.id === region.id;
                const isHovered = hoveredRegion === region.id;

                return (
                  <div
                    key={region.id}
                    onClick={() => handleRegionClick(region)}
                    onMouseEnter={() => setHoveredRegion(region.id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-all
                      ${isSelected ? 'bg-amber-900/50 border border-amber-500' : 'bg-gray-800/50 border border-transparent'}
                      ${isHovered && !isSelected ? 'bg-gray-700/50' : ''}
                      ${!check.allowed ? 'opacity-60' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {/* Region Number */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: getRegionProgressColor(index) }}
                      >
                        {index + 1}
                      </div>

                      {/* Region Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{region.emoji}</span>
                          <span className="font-medium text-white truncate">{region.name}</span>
                          {isCurrentRegion && (
                            <span className="text-xs bg-green-600 px-1.5 rounded">SEN</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <span>LV {region.requirements.minLevel}+</span>
                          <span>•</span>
                          <span>GS {formatGearScore(region.requirements.minGearScore)}+</span>
                          {region.features.worldBoss && (
                            <>
                              <span>•</span>
                              <span className="text-red-400">👹 Boss</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        {check.allowed ? (
                          <span className="text-green-400 text-lg">✓</span>
                        ) : (
                          <span className="text-red-400 text-lg">🔒</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Middle - Visual Map */}
          <div className="flex-1 bg-gray-950 p-4 overflow-hidden relative">
            {/* Region Flow Visualization */}
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-500 text-sm mb-4">Bolge Progresyonu</p>

              {/* Visual Map - 3x3 Grid Style */}
              <div className="relative w-full max-w-lg aspect-square">
                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 300">
                  {/* Horizontal lines */}
                  <line x1="75" y1="50" x2="150" y2="50" stroke="#444" strokeWidth="2" />
                  <line x1="150" y1="50" x2="225" y2="50" stroke="#444" strokeWidth="2" />
                  <line x1="75" y1="150" x2="150" y2="150" stroke="#444" strokeWidth="2" />
                  <line x1="150" y1="150" x2="225" y2="150" stroke="#444" strokeWidth="2" />
                  <line x1="75" y1="250" x2="150" y2="250" stroke="#444" strokeWidth="2" />
                  <line x1="150" y1="250" x2="225" y2="250" stroke="#444" strokeWidth="2" />
                  {/* Vertical lines */}
                  <line x1="225" y1="50" x2="225" y2="150" stroke="#444" strokeWidth="2" />
                  <line x1="75" y1="150" x2="75" y2="250" stroke="#444" strokeWidth="2" />
                </svg>

                {/* Region Nodes */}
                <div className="absolute grid grid-cols-3 gap-4 w-full h-full p-4">
                  {/* Row 1: 1-3 */}
                  {[0, 1, 2].map(idx => {
                    const region = WORLD_REGIONS[idx];
                    const check = canEnterRegion(playerLevel, playerGearScore, region);
                    const isSelected = selectedRegion?.id === region.id;
                    const isCurrent = region.id === currentRegion;

                    return (
                      <div
                        key={region.id}
                        onClick={() => handleRegionClick(region)}
                        className={`
                          flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all
                          ${isSelected ? 'bg-amber-900/60 ring-2 ring-amber-500' : 'bg-gray-800/50'}
                          ${!check.allowed ? 'opacity-40' : 'hover:bg-gray-700/50'}
                          ${isCurrent ? 'ring-2 ring-green-500' : ''}
                        `}
                      >
                        <span className="text-3xl mb-1">{region.emoji}</span>
                        <span className="text-xs text-center text-gray-300 px-1 truncate w-full">{region.name}</span>
                        <span className="text-[10px] text-gray-500">LV {region.requirements.minLevel}+</span>
                      </div>
                    );
                  })}

                  {/* Row 2: 4-6 */}
                  {[3, 4, 5].map(idx => {
                    const region = WORLD_REGIONS[idx];
                    const check = canEnterRegion(playerLevel, playerGearScore, region);
                    const isSelected = selectedRegion?.id === region.id;
                    const isCurrent = region.id === currentRegion;

                    return (
                      <div
                        key={region.id}
                        onClick={() => handleRegionClick(region)}
                        className={`
                          flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all
                          ${isSelected ? 'bg-amber-900/60 ring-2 ring-amber-500' : 'bg-gray-800/50'}
                          ${!check.allowed ? 'opacity-40' : 'hover:bg-gray-700/50'}
                          ${isCurrent ? 'ring-2 ring-green-500' : ''}
                        `}
                      >
                        <span className="text-3xl mb-1">{region.emoji}</span>
                        <span className="text-xs text-center text-gray-300 px-1 truncate w-full">{region.name}</span>
                        <span className="text-[10px] text-gray-500">LV {region.requirements.minLevel}+</span>
                      </div>
                    );
                  })}

                  {/* Row 3: 7-9 */}
                  {[6, 7, 8].map(idx => {
                    const region = WORLD_REGIONS[idx];
                    const check = canEnterRegion(playerLevel, playerGearScore, region);
                    const isSelected = selectedRegion?.id === region.id;
                    const isCurrent = region.id === currentRegion;

                    return (
                      <div
                        key={region.id}
                        onClick={() => handleRegionClick(region)}
                        className={`
                          flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all
                          ${isSelected ? 'bg-amber-900/60 ring-2 ring-amber-500' : 'bg-gray-800/50'}
                          ${!check.allowed ? 'opacity-40' : 'hover:bg-gray-700/50'}
                          ${isCurrent ? 'ring-2 ring-green-500' : ''}
                        `}
                      >
                        <span className="text-3xl mb-1">{region.emoji}</span>
                        <span className="text-xs text-center text-gray-300 px-1 truncate w-full">{region.name}</span>
                        <span className="text-[10px] text-gray-500">LV {region.requirements.minLevel}+</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded ring-2 ring-green-500"></div>
                  <span>Suanki Konum</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded ring-2 ring-amber-500"></div>
                  <span>Secili</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-gray-600 opacity-40"></div>
                  <span>Kilitli</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Region Detail */}
          <div className="w-96 border-l border-gray-700 bg-gray-800/30 overflow-y-auto">
            {selectedRegion ? (
              <div className="p-4">
                {/* Region Header */}
                <div className="text-center mb-4 pb-4 border-b border-gray-700">
                  <span className="text-5xl mb-2 block">{selectedRegion.emoji}</span>
                  <h3 className="text-xl font-bold text-white">{selectedRegion.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{selectedRegion.description}</p>
                </div>

                {/* Requirements */}
                <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Gereksinimler</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Min. Level</p>
                      <p className={`font-bold ${playerLevel >= selectedRegion.requirements.minLevel ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedRegion.requirements.minLevel}
                        <span className="text-xs text-gray-500 ml-1">(Sen: {playerLevel})</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Min. Gear Score</p>
                      <p className={`font-bold ${playerGearScore >= selectedRegion.requirements.minGearScore ? 'text-green-400' : 'text-red-400'}`}>
                        {formatGearScore(selectedRegion.requirements.minGearScore)}
                        <span className="text-xs text-gray-500 ml-1">(Sen: {formatGearScore(playerGearScore)})</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Mob Leveli</p>
                    <p className="text-white font-bold">{selectedRegion.mobLevels.min}-{selectedRegion.mobLevels.max}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">EXP Bonus</p>
                    <p className={`font-bold ${selectedRegion.expMultiplier > 1 ? 'text-green-400' : 'text-white'}`}>
                      {getExpBonusText(selectedRegion.expMultiplier)}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Ozellikler</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRegion.features.pvp && (
                      <span className="px-2 py-1 rounded bg-red-900/50 text-red-400 text-xs">
                        ⚔️ PvP {selectedRegion.features.forcesPvp ? '(Zorunlu)' : 'Aktif'}
                      </span>
                    )}
                    {selectedRegion.features.safeZone && (
                      <span className="px-2 py-1 rounded bg-green-900/50 text-green-400 text-xs">
                        🛡️ Guvenli Bolge
                      </span>
                    )}
                    {selectedRegion.features.worldBoss && (
                      <span className="px-2 py-1 rounded bg-purple-900/50 text-purple-400 text-xs">
                        👹 World Boss
                      </span>
                    )}
                    {selectedRegion.features.dungeonEntrance && (
                      <span className="px-2 py-1 rounded bg-blue-900/50 text-blue-400 text-xs">
                        🏰 Dungeon Girisi
                      </span>
                    )}
                    {selectedRegion.features.caravanRoute && (
                      <span className="px-2 py-1 rounded bg-amber-900/50 text-amber-400 text-xs">
                        🚚 Kervan Rotasi
                      </span>
                    )}
                    {selectedRegion.features.fishing && (
                      <span className="px-2 py-1 rounded bg-cyan-900/50 text-cyan-400 text-xs">
                        🎣 Balik Tutma
                      </span>
                    )}
                    {selectedRegion.features.guildWarZone && (
                      <span className="px-2 py-1 rounded bg-orange-900/50 text-orange-400 text-xs">
                        🏴 Lonca Savasi
                      </span>
                    )}
                  </div>
                </div>

                {/* Zones */}
                <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Alt Bolgeler</h4>
                  <div className="space-y-2">
                    {selectedRegion.zones.map((zone, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300">{zone.name}</span>
                          {zone.pvpEnabled && <span className="text-red-400 text-xs">⚔️</span>}
                          {zone.safeZone && <span className="text-green-400 text-xs">🛡️</span>}
                          {zone.worldBoss && <span className="text-purple-400 text-xs">👹</span>}
                        </div>
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: getDifficultyColor(zone.difficulty) + '20',
                            color: getDifficultyColor(zone.difficulty)
                          }}
                        >
                          {getDifficultyText(zone.difficulty)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Environmental Hazards */}
                {selectedRegion.environmentalHazards.length > 0 && (
                  <div className="bg-red-900/20 rounded-lg p-3 mb-4 border border-red-900/30">
                    <h4 className="text-xs text-red-400 uppercase tracking-wider mb-2">⚠️ Cevre Tehlikeleri</h4>
                    <div className="space-y-1">
                      {selectedRegion.environmentalHazards.map((hazard, idx) => (
                        <div key={idx} className="text-sm text-red-300">
                          • {hazard.type}: {hazard.effect} (%{Math.round(hazard.chance * 100)} sans)
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resistance Warning */}
                {selectedRegion.resistanceRequired && (
                  <div className="bg-yellow-900/20 rounded-lg p-3 mb-4 border border-yellow-900/30">
                    <p className="text-yellow-400 text-sm">
                      ⚠️ Onerilen: %{selectedRegion.resistanceRequired.percent}{' '}
                      {selectedRegion.resistanceRequired.type === 'fire' ? 'Ates' : 'Soguk'} Direnci
                    </p>
                  </div>
                )}

                {/* Resources */}
                <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Kaynaklar</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedRegion.resources.map((res, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
                        {res}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Travel Button */}
                {(() => {
                  const check = canEnterRegion(playerLevel, playerGearScore, selectedRegion);
                  const isCurrent = selectedRegion.id === currentRegion;

                  if (isCurrent) {
                    return (
                      <div className="bg-green-900/30 text-green-400 text-center py-3 rounded-lg">
                        ✓ Su anda buradasin
                      </div>
                    );
                  }

                  if (!check.allowed) {
                    return (
                      <div className="bg-red-900/30 text-red-400 text-center py-3 rounded-lg">
                        🔒 {check.reason}
                      </div>
                    );
                  }

                  return (
                    <button
                      onClick={handleTravel}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3 rounded-lg transition-all"
                    >
                      🚀 Bu Bolgeye Git
                    </button>
                  );
                })()}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <span className="text-4xl block mb-2">👈</span>
                  <p>Detay gormek icin bir bolge sec</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMapModal;

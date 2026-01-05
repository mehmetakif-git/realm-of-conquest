import React, { useState } from 'react';
import { useTaxiStore } from '../../stores/taxiStore';
import {
  TaxiDriver,
  TaxiServiceType,
  ZONE_TAXI_RATES,
  TAXI_RULES,
  getRatingColor,
  formatTaxiRate,
  getDifficultyStars
} from '../../types/taxi';
import { WORLD_REGIONS } from '../../types/worldmap';

type TabType = 'drivers' | 'request' | 'myRides' | 'beDriver';

interface TaxiModalProps {
  playerId: string;
  playerName: string;
  playerLevel: number;
  playerGold: number;
  currentRegion: string;
  onClose: () => void;
}

const TaxiModal: React.FC<TaxiModalProps> = ({
  playerId,
  playerName,
  playerLevel,
  playerGold,
  currentRegion,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('drivers');
  const [selectedDriver, setSelectedDriver] = useState<TaxiDriver | null>(null);

  // Request form state
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [selectedBudget, setSelectedBudget] = useState<number>(500);
  const [selectedServices, setSelectedServices] = useState<TaxiServiceType[]>([]);

  const {
    filters,
    setFilters,
    getFilteredDrivers,
    getFeaturedDrivers,
    passengerMode,
    createRequest,
    leaveRide
  } = useTaxiStore();

  const filteredDrivers = getFilteredDrivers();
  const featuredDrivers = getFeaturedDrivers();

  const tabs = [
    { id: 'drivers' as TabType, label: 'Surucu Panosu', icon: '🚕' },
    { id: 'request' as TabType, label: 'Taksi Cagir', icon: '📍' },
    { id: 'myRides' as TabType, label: 'Yolculuklarim', icon: '📋' },
    { id: 'beDriver' as TabType, label: 'Surucu Ol', icon: '🎖️' }
  ];

  const handleRequestTaxi = () => {
    if (!selectedDestination || selectedBudget <= 0) return;

    createRequest(
      playerId,
      playerName,
      playerLevel,
      selectedDestination,
      selectedBudget,
      selectedServices
    );

    // Switch to my rides tab
    setActiveTab('myRides');
  };

  const toggleService = (service: TaxiServiceType) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const renderDriverCard = (driver: TaxiDriver, featured: boolean = false) => {
    const canHire = playerLevel + TAXI_RULES.minLevelDifference <= driver.level;

    return (
      <div
        key={driver.playerId}
        onClick={() => setSelectedDriver(driver)}
        className={`
          p-4 rounded-lg cursor-pointer transition-all border
          ${selectedDriver?.playerId === driver.playerId
            ? 'bg-amber-900/50 border-amber-500'
            : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'}
          ${featured ? 'ring-1 ring-amber-500/30' : ''}
        `}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-2xl">
            {driver.class === 'warrior' ? '⚔️' : driver.class === 'healer' ? '💚' : driver.class === 'ninja' ? '🗡️' : '🏹'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{driver.playerName}</span>
              {featured && <span className="text-xs bg-amber-600 px-1.5 rounded">ONE CIKAN</span>}
              <span className={`text-xs px-1.5 rounded ${
                driver.status === 'available' ? 'bg-green-600' :
                driver.status === 'busy' ? 'bg-yellow-600' : 'bg-gray-600'
              }`}>
                {driver.status === 'available' ? 'Musait' :
                 driver.status === 'busy' ? 'Mesgul' : 'Cevrimdisi'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400 mt-0.5">
              <span>🎖️ Level {driver.level}</span>
              <span>•</span>
              <span style={{ color: getRatingColor(driver.stats.rating) }}>
                ⭐ {driver.stats.rating.toFixed(1)}
              </span>
              <span>•</span>
              <span>%{driver.stats.successRate} basari</span>
            </div>

            <div className="flex items-center gap-2 text-sm mt-1">
              <span className="text-amber-400">💰 {formatTaxiRate(driver.baseRate)} gold/dk</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">🚗 {driver.stats.totalRides} yolculuk</span>
            </div>

            {/* Services */}
            <div className="flex flex-wrap gap-1 mt-2">
              {driver.services.powerLeveling && (
                <span className="px-1.5 py-0.5 bg-blue-900/50 text-blue-400 text-xs rounded">PL</span>
              )}
              {driver.services.escort && (
                <span className="px-1.5 py-0.5 bg-purple-900/50 text-purple-400 text-xs rounded">Escort</span>
              )}
              {driver.services.dungeon && (
                <span className="px-1.5 py-0.5 bg-green-900/50 text-green-400 text-xs rounded">Dungeon</span>
              )}
              {driver.services.boss && (
                <span className="px-1.5 py-0.5 bg-red-900/50 text-red-400 text-xs rounded">Boss</span>
              )}
            </div>
          </div>

          {/* Call Button */}
          <div className="text-right">
            {driver.status === 'available' && canHire ? (
              <button
                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDestination('');
                  setActiveTab('request');
                }}
              >
                CAGIR
              </button>
            ) : !canHire ? (
              <span className="text-xs text-gray-500">Level {playerLevel + TAXI_RULES.minLevelDifference}+ gerekli</span>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden border border-amber-600/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900/80 to-gray-900 px-6 py-4 border-b border-amber-600/30 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚕</span>
            <div>
              <h2 className="text-xl font-bold text-amber-400">TAKSI SISTEMI</h2>
              <p className="text-gray-400 text-sm">Power Leveling & Oyuncu Tasima</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-400">Bakiye</p>
              <p className="text-amber-400 font-bold">💰 {playerGold.toLocaleString()}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
          </div>
        </div>

        {/* Active Ride Banner */}
        {passengerMode.currentRide && (
          <div className="bg-green-900/30 border-b border-green-600/30 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">🚕</span>
              <div>
                <p className="text-green-400 font-medium">Aktif Yolculuk</p>
                <p className="text-sm text-gray-300">
                  Surucu: {passengerMode.currentRide.driverName} | Hedef: {passengerMode.currentRide.destination}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Odenen</p>
                <p className="text-amber-400">{passengerMode.currentRide.totalPaid.toLocaleString()} gold</p>
              </div>
              <button
                onClick={leaveRide}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg"
              >
                INDIR
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-gray-800/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2
                ${activeTab === tab.id
                  ? 'text-amber-400 border-b-2 border-amber-400 bg-gray-800'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* DRIVERS TAB */}
          {activeTab === 'drivers' && (
            <div className="p-4">
              {/* Filters */}
              <div className="bg-gray-800/50 rounded-lg p-3 mb-4 flex flex-wrap gap-3 items-center">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Bolge</label>
                  <select
                    value={filters.zone}
                    onChange={(e) => setFilters({ zone: e.target.value })}
                    className="bg-gray-700 text-white px-3 py-1.5 rounded text-sm"
                  >
                    <option value="all">Tumu</option>
                    {WORLD_REGIONS.map(region => (
                      <option key={region.id} value={region.id}>{region.emoji} {region.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Min Rating</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({ minRating: Number(e.target.value) })}
                    className="bg-gray-700 text-white px-3 py-1.5 rounded text-sm"
                  >
                    <option value={0}>Tumu</option>
                    <option value={4.0}>4.0+</option>
                    <option value={4.5}>4.5+</option>
                    <option value={4.8}>4.8+</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Max Ucret</label>
                  <select
                    value={filters.maxRate}
                    onChange={(e) => setFilters({ maxRate: Number(e.target.value) })}
                    className="bg-gray-700 text-white px-3 py-1.5 rounded text-sm"
                  >
                    <option value={10000}>Tumu</option>
                    <option value={500}>500g/dk</option>
                    <option value={1000}>1K/dk</option>
                    <option value={2000}>2K/dk</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="checkbox"
                    id="onlineOnly"
                    checked={filters.onlineOnly}
                    onChange={(e) => setFilters({ onlineOnly: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="onlineOnly" className="text-sm text-gray-300">Sadece Online</label>
                </div>
              </div>

              {/* Featured Drivers */}
              {featuredDrivers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                    ⭐ ONE CIKANLAR ({featuredDrivers.length})
                  </h3>
                  <div className="space-y-2">
                    {featuredDrivers.map(driver => renderDriverCard(driver, true))}
                  </div>
                </div>
              )}

              {/* All Drivers */}
              <div>
                <h3 className="text-gray-300 font-medium mb-3">
                  TUM SURUCULER ({filteredDrivers.length} {filters.onlineOnly ? 'Online' : 'Toplam'})
                </h3>
                <div className="space-y-2">
                  {filteredDrivers.map(driver => renderDriverCard(driver))}
                </div>
              </div>
            </div>
          )}

          {/* REQUEST TAB */}
          {activeTab === 'request' && (
            <div className="p-6">
              <div className="max-w-xl mx-auto">
                <h3 className="text-xl font-bold text-white mb-6 text-center">🚕 TAKSI CAGIR</h3>

                {/* Current Location */}
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-400 mb-1">Mevcut Konumun</p>
                  <p className="text-lg text-white">
                    {WORLD_REGIONS.find(r => r.id === currentRegion)?.emoji}{' '}
                    {WORLD_REGIONS.find(r => r.id === currentRegion)?.name || 'Bilinmiyor'}
                  </p>
                </div>

                {/* Destination Selection */}
                <div className="mb-4">
                  <label className="text-sm text-gray-400 block mb-2">Nereye Gitmek Istiyorsun?</label>
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700"
                  >
                    <option value="">Bolge Sec...</option>
                    {WORLD_REGIONS.filter(r => r.id !== currentRegion).map(region => {
                      const needsTaxi = playerLevel < region.requirements.minLevel;
                      return (
                        <option key={region.id} value={region.id}>
                          {region.emoji} {region.name} (LV {region.requirements.minLevel}+)
                          {needsTaxi ? ' - TAKSI GEREKLI' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Destination Info */}
                {selectedDestination && (
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                    {(() => {
                      const dest = WORLD_REGIONS.find(r => r.id === selectedDestination);
                      const rateInfo = ZONE_TAXI_RATES[selectedDestination];
                      const needsTaxi = dest && playerLevel < dest.requirements.minLevel;

                      return dest ? (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Hedef</span>
                            <span className="text-white">{dest.emoji} {dest.name}</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Zorluk</span>
                            <span className="text-amber-400">{getDifficultyStars(rateInfo?.difficulty || 1)}</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Onerilen Ucret</span>
                            <span className="text-amber-400">{rateInfo?.rate || 100} gold/dk</span>
                          </div>
                          {needsTaxi && (
                            <div className="mt-3 p-2 bg-yellow-900/30 rounded border border-yellow-600/30">
                              <p className="text-yellow-400 text-sm">
                                ⚠️ Senin Level: {playerLevel} | Gereken: {dest.requirements.minLevel}
                              </p>
                              <p className="text-yellow-300 text-xs mt-1">TAKSİ GEREKLİ!</p>
                            </div>
                          )}
                        </>
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Budget */}
                <div className="mb-4">
                  <label className="text-sm text-gray-400 block mb-2">Butce (gold/dakika)</label>
                  <input
                    type="range"
                    min={100}
                    max={3000}
                    step={100}
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">100</span>
                    <span className="text-amber-400 font-bold">{selectedBudget} gold/dk</span>
                    <span className="text-gray-500">3000</span>
                  </div>
                </div>

                {/* Services */}
                <div className="mb-6">
                  <label className="text-sm text-gray-400 block mb-2">Ozel Hizmetler</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'powerLeveling' as TaxiServiceType, label: 'Power Leveling', bonus: '+20%' },
                      { id: 'escort' as TaxiServiceType, label: 'Escort (Koruma)', bonus: '+30%' },
                      { id: 'questHelp' as TaxiServiceType, label: 'Quest Yardimi', bonus: '+10%' },
                      { id: 'dungeon' as TaxiServiceType, label: 'Dungeon', bonus: '+15%' }
                    ].map(service => (
                      <button
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={`
                          p-3 rounded-lg border text-left transition-all
                          ${selectedServices.includes(service.id)
                            ? 'bg-amber-900/50 border-amber-500 text-amber-400'
                            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span>{service.label}</span>
                          <span className="text-xs">{service.bonus}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleRequestTaxi}
                  disabled={!selectedDestination}
                  className={`
                    w-full py-4 rounded-lg font-bold text-lg transition-all
                    ${selectedDestination
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
                  `}
                >
                  🚕 SURUCU ARA - {selectedBudget}g/dk
                </button>
              </div>
            </div>
          )}

          {/* MY RIDES TAB */}
          {activeTab === 'myRides' && (
            <div className="p-4">
              <h3 className="text-gray-300 font-medium mb-4">Yolculuk Gecmisim</h3>

              {/* Placeholder - would show ride history */}
              <div className="text-center py-12 text-gray-500">
                <span className="text-4xl block mb-2">📋</span>
                <p>Henuz yolculuk gecmisin yok</p>
                <p className="text-sm mt-1">Taksi cagirarak basla!</p>
              </div>
            </div>
          )}

          {/* BE DRIVER TAB */}
          {activeTab === 'beDriver' && (
            <div className="p-6">
              <div className="max-w-xl mx-auto text-center">
                <span className="text-6xl block mb-4">🎖️</span>
                <h3 className="text-xl font-bold text-white mb-2">Surucu Ol</h3>
                <p className="text-gray-400 mb-6">
                  Dusuk level oyunculari tasiyarak gold kazan!
                </p>

                <div className="bg-gray-800/50 rounded-lg p-4 mb-6 text-left">
                  <h4 className="text-amber-400 font-medium mb-3">Gereksinimler</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-center gap-2">
                      <span className={playerLevel >= 20 ? 'text-green-400' : 'text-red-400'}>
                        {playerLevel >= 20 ? '✓' : '✗'}
                      </span>
                      Minimum Level 20 (Sen: {playerLevel})
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Hesap en az 7 gun eski
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Ceza puani yok
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-900/20 rounded-lg p-4 mb-6 text-left border border-amber-600/30">
                  <h4 className="text-amber-400 font-medium mb-2">Kazanclar</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>💰 Dakika basina gold kazan</li>
                    <li>⭐ Rating sistemi ile one cik</li>
                    <li>🏆 Basarili surucu rozetleri</li>
                    <li>🤝 Topluluga yardim et</li>
                  </ul>
                </div>

                <button
                  disabled={playerLevel < 20}
                  className={`
                    px-8 py-3 rounded-lg font-bold transition-all
                    ${playerLevel >= 20
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
                  `}
                >
                  {playerLevel >= 20 ? 'SURUCU MODUNU AC' : `Level ${20 - playerLevel} daha kazan`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected Driver Panel (Sidebar) */}
        {selectedDriver && activeTab === 'drivers' && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-900 border-l border-gray-700 overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white">Surucu Profili</h3>
                <button onClick={() => setSelectedDriver(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              {/* Driver Info */}
              <div className="text-center mb-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-4xl mb-2">
                  {selectedDriver.class === 'warrior' ? '⚔️' : selectedDriver.class === 'healer' ? '💚' : '🗡️'}
                </div>
                <h4 className="text-xl font-bold text-white">{selectedDriver.playerName}</h4>
                <p className="text-gray-400">Level {selectedDriver.level} {selectedDriver.class}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-800/50 rounded p-2 text-center">
                  <p className="text-xs text-gray-400">Rating</p>
                  <p className="text-lg font-bold" style={{ color: getRatingColor(selectedDriver.stats.rating) }}>
                    ⭐ {selectedDriver.stats.rating.toFixed(1)}
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded p-2 text-center">
                  <p className="text-xs text-gray-400">Basari</p>
                  <p className="text-lg font-bold text-green-400">%{selectedDriver.stats.successRate}</p>
                </div>
                <div className="bg-gray-800/50 rounded p-2 text-center">
                  <p className="text-xs text-gray-400">Yolculuk</p>
                  <p className="text-lg font-bold text-white">{selectedDriver.stats.totalRides}</p>
                </div>
                <div className="bg-gray-800/50 rounded p-2 text-center">
                  <p className="text-xs text-gray-400">Cevap</p>
                  <p className="text-lg font-bold text-white">~{selectedDriver.stats.responseTime}sn</p>
                </div>
              </div>

              {/* Rate */}
              <div className="bg-amber-900/30 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-400 mb-1">Ucret</p>
                <p className="text-2xl font-bold text-amber-400">{selectedDriver.baseRate} gold/dk</p>
                {selectedDriver.negotiable && (
                  <p className="text-xs text-gray-400 mt-1">Pazarlik yapilabilir</p>
                )}
              </div>

              {/* Accessible Zones */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Gidebildigi Bolgeler</p>
                <div className="flex flex-wrap gap-1">
                  {selectedDriver.accessibleZones.map(zoneId => {
                    const zone = WORLD_REGIONS.find(r => r.id === zoneId);
                    return zone ? (
                      <span key={zoneId} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
                        {zone.emoji} {zone.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Call Button */}
              {selectedDriver.status === 'available' && (
                <button
                  onClick={() => {
                    setActiveTab('request');
                  }}
                  className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold"
                >
                  🚕 BU SURUCUYU CAGIR
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxiModal;

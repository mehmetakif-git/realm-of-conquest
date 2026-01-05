import { useState, useMemo } from 'react';
import {
  CARAVAN_TYPES,
  CARAVAN_ROUTES,
  getDangerColor,
  getStatusColor,
  getStatusText,
  calculateCaravanRewards,
  formatGold,
} from '../../types/caravan';
import type { CaravanType, CaravanRoute, Caravan } from '../../types/caravan';
import type { FlagType } from '../../types';

interface CaravanCreateModalProps {
  playerGold: number;
  playerLevel: number;
  playerId: string;
  playerFlag: FlagType;
  caravans: Caravan[];
  onClose: () => void;
  onCreate: (typeId: string, routeId: string) => void;
  onJoinAsGuard: (caravanId: string) => void;
  onAttack: (caravanId: string) => void;
  onLeaveGuard: (caravanId: string) => void;
}

type TabType = 'active' | 'create' | 'panel' | 'pvp' | 'map';

// Mock Guardian Data
interface Guardian {
  id: string;
  name: string;
  avatar: string;
  classType: string;
  subClass: string;
  level: number;
  specialty: string;
  rating: number;
  totalGuards: number;
  successRate: number;
  availability: string;
  isOnline: boolean;
  fee: number;
  afkDefense: 'active' | 'partial' | 'inactive';
  afkLevel?: number;
}

const MOCK_GUARDIANS: Guardian[] = [
  {
    id: '1',
    name: 'ShadowBlade',
    avatar: '🥷',
    classType: 'Ninja',
    subClass: 'Golge Dancisi',
    level: 48,
    specialty: 'Kacis Bonusu +25%',
    rating: 5.0,
    totalGuards: 127,
    successRate: 94,
    availability: 'Her Zaman (24/7)',
    isOnline: true,
    fee: 12,
    afkDefense: 'active',
  },
  {
    id: '2',
    name: 'HolyLight',
    avatar: '🧙',
    classType: 'Sifaci',
    subClass: 'Rahip',
    level: 45,
    specialty: 'Kervan HP Regen',
    rating: 4.6,
    totalGuards: 89,
    successRate: 91,
    availability: '08:00-22:00',
    isOnline: true,
    fee: 10,
    afkDefense: 'active',
  },
  {
    id: '3',
    name: 'IronFist',
    avatar: '🛡️',
    classType: 'Savasci',
    subClass: 'Paladin',
    level: 52,
    specialty: 'Kervan Hasari +20',
    rating: 4.9,
    totalGuards: 203,
    successRate: 96,
    availability: '18:00-02:00',
    isOnline: false,
    fee: 15,
    afkDefense: 'partial',
    afkLevel: 80,
  },
  {
    id: '4',
    name: 'Firestorm',
    avatar: '🔥',
    classType: 'Buyucu',
    subClass: 'Elementalist',
    level: 43,
    specialty: 'Element Kalkani',
    rating: 4.6,
    totalGuards: 64,
    successRate: 88,
    availability: 'Her Zaman',
    isOnline: true,
    fee: 11,
    afkDefense: 'active',
  },
  {
    id: '5',
    name: 'Quickshot',
    avatar: '🏹',
    classType: 'Okcu',
    subClass: 'Tuzakci',
    level: 47,
    specialty: 'Otomatik Tuzak Kurma',
    rating: 4.7,
    totalGuards: 112,
    successRate: 92,
    availability: '14:00-00:00',
    isOnline: true,
    fee: 13,
    afkDefense: 'active',
  },
];

export default function CaravanCreateModal({
  playerGold,
  playerLevel,
  playerId,
  playerFlag,
  caravans,
  onClose,
  onCreate,
  onJoinAsGuard,
  onAttack,
  onLeaveGuard,
}: CaravanCreateModalProps) {
  const [selectedType, setSelectedType] = useState<CaravanType | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<CaravanRoute | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [guardianFilter, setGuardianFilter] = useState<'all' | 'online' | 'top'>('all');

  // Active caravans
  const activeCaravans = useMemo(() => {
    return caravans.filter(
      (c) => c.status === 'traveling' || c.status === 'under_attack' || c.status === 'preparing'
    );
  }, [caravans]);

  const calculations = useMemo(() => {
    if (!selectedType || !selectedRoute) return null;

    const { baseReward, routeBonus, totalReward, estimatedTime } = calculateCaravanRewards(
      selectedType,
      selectedRoute
    );

    const totalInvestment = selectedType.investment;

    return {
      investment: selectedType.investment,
      totalInvestment,
      baseReward,
      routeBonus,
      totalReward,
      profit: totalReward - totalInvestment,
      profitPercent: Math.round(((totalReward - totalInvestment) / totalInvestment) * 100),
      estimatedTime,
      hp: selectedType.hp,
      dangerLevel: selectedRoute.dangerLevel,
    };
  }, [selectedType, selectedRoute]);

  const filteredGuardians = useMemo(() => {
    let result = [...MOCK_GUARDIANS];
    if (guardianFilter === 'online') {
      result = result.filter(g => g.isOnline);
    } else if (guardianFilter === 'top') {
      result = result.sort((a, b) => b.rating - a.rating);
    }
    return result;
  }, [guardianFilter]);

  // Caravan helpers
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

  const getDangerText = (level: number) => {
    if (level <= 1) return 'Guvenli';
    if (level <= 2) return 'Dusuk';
    if (level <= 3) return 'Orta';
    if (level <= 4) return 'Yuksek';
    return 'Cok Yuksek';
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
      <span className="text-yellow-400">
        {'★'.repeat(fullStars)}
        {hasHalf && '½'}
        {'☆'.repeat(5 - fullStars - (hasHalf ? 1 : 0))}
      </span>
    );
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'active', label: 'Aktif Kervanlar', icon: '🚚' },
    { id: 'create', label: 'Kervan Baslat', icon: '➕' },
    { id: 'panel', label: 'Koruyucu Panosu', icon: '🛡️' },
    { id: 'pvp', label: 'Puse Sec', icon: '🚩' },
    { id: 'map', label: 'Harita', icon: '🗺️' },
  ];

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'active': return 'AKTİF KERVANLAR';
      case 'create': return 'KERVAN BAŞLAT';
      case 'panel': return 'KORUYUCU PANOSU';
      case 'pvp': return 'PUŞE (BAYRAK) SEÇ';
      case 'map': return 'KERVAN HARİTASI';
      default: return 'KERVAN SİSTEMİ';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 rounded-xl border-2 border-purple-600/50 shadow-2xl w-[1000px] max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="text-center py-4 border-b border-purple-600/30 bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-purple-900/40">
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">🏰</span>
            <h2
              className="text-purple-300 text-2xl font-bold tracking-wider"
              style={{ textShadow: '0 0 10px rgba(168,85,247,0.5)' }}
            >
              {getHeaderTitle()}
            </h2>
            <span className="text-2xl">🏰</span>
          </div>
          {activeTab === 'active' && (
            <p className="text-gray-400 text-sm mt-1">
              {playerFlag === 'blue' && '🛡️ Mavi Puse - Koruyucu olarak katil ve odul kazan!'}
              {playerFlag === 'red' && '⚔️ Kirmizi Puse - Kervanlara saldir ve yagmala!'}
              {playerFlag === 'neutral' && '⚪ Tarafsiz - Bayrak sec: Koruyucu veya Haydut ol!'}
            </p>
          )}
          {activeTab === 'panel' && (
            <p className="text-gray-400 text-sm mt-1">Oyunculardan kervanini koruyacak koruyucu bul!</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-black/30">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-2 text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === tab.id
                  ? 'bg-purple-900/40 text-purple-300 border-b-2 border-purple-500'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
          <button
            onClick={onClose}
            className="px-4 text-gray-500 hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Aktif Kervanlar Tab */}
        {activeTab === 'active' && (
          <div className="flex-1 overflow-y-auto p-4">
            {activeCaravans.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🚚</div>
                <div className="text-xl">Aktif kervan yok</div>
                <div className="text-sm mt-2">Kendi kervanini baslat veya bekle!</div>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 px-6 py-2 bg-gradient-to-b from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-bold rounded-lg transition-colors"
                >
                  ➕ Yeni Kervan Olustur
                </button>
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
                        <div
                          className="flex items-center gap-1"
                          style={{ color: getDangerColor(caravan.route.dangerLevel) }}
                        >
                          <span>⚠️</span>
                          <span className="font-bold">{caravan.route.dangerStars}</span>
                          <span className="text-gray-500">tehlike</span>
                        </div>
                      </div>

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
                            ⚔️ Saldir!
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Kervan Baslat Tab */}
        {activeTab === 'create' && (
          <div className="flex-1 overflow-y-auto p-4">
            {/* Kervan Tipi Sec */}
            <div className="mb-6">
              <h3 className="text-center text-yellow-400 font-bold mb-3 text-lg">KERVAN TIPI SEC</h3>
              <div className="grid grid-cols-5 gap-3">
                {CARAVAN_TYPES.map((type) => {
                  const isLocked = playerLevel < type.minLevel;
                  const isSelected = selectedType?.id === type.id;
                  const stars = type.id === 'bronze' ? 1 : type.id === 'silver' ? 2 : type.id === 'gold' ? 3 : type.id === 'diamond' ? 4 : 5;

                  return (
                    <div
                      key={type.id}
                      onClick={() => !isLocked && setSelectedType(type)}
                      className={`relative p-3 rounded-lg cursor-pointer transition-all border-2 text-center ${
                        isLocked
                          ? 'opacity-40 cursor-not-allowed border-gray-800 bg-gray-900/50'
                          : isSelected
                          ? 'border-yellow-500 bg-gradient-to-b from-yellow-900/40 to-orange-900/30 shadow-lg shadow-yellow-500/20'
                          : 'border-gray-700 bg-gradient-to-b from-gray-800/50 to-gray-900/50 hover:border-gray-500'
                      }`}
                    >
                      <div className="w-full h-16 bg-gradient-to-b from-gray-700/50 to-gray-800/50 rounded mb-2 flex items-center justify-center">
                        <span className="text-3xl">{type.icon}</span>
                      </div>
                      <div className={`font-bold text-sm mb-1 ${
                        type.id === 'bronze' ? 'text-amber-600' :
                        type.id === 'silver' ? 'text-gray-300' :
                        type.id === 'gold' ? 'text-yellow-400' :
                        type.id === 'diamond' ? 'text-cyan-400' :
                        'text-purple-400'
                      }`}>
                        {type.name.toUpperCase()}
                      </div>
                      <div className="text-xs space-y-0.5 text-gray-400">
                        <div>Investment: <span className="text-yellow-400">{formatGold(type.investment)}+</span></div>
                        <div>Reward: <span className="text-green-400">{formatGold(type.reward)}</span> <span className="text-green-300">(+{type.profitPercent}%)</span></div>
                      </div>
                      <div className="mt-2 text-xs">
                        <span className="text-red-400">HP {formatGold(type.hp)}</span>
                      </div>
                      <div className="text-xs text-gray-500">Duration: ~{type.duration} dk</div>
                      <div className="mt-1 text-yellow-400 text-xs">
                        {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                      </div>
                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                          <span className="text-red-400 text-xs">🔒 Lv.{type.minLevel}+</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rota Sec */}
            <div className="mb-4">
              <h3 className="text-center text-yellow-400 font-bold mb-3 text-lg">ROTA SEC</h3>
              <div className="grid grid-cols-5 gap-3">
                {CARAVAN_ROUTES.map((route) => {
                  const isSelected = selectedRoute?.id === route.id;

                  return (
                    <div
                      key={route.id}
                      onClick={() => setSelectedRoute(route)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border-2 text-center ${
                        isSelected
                          ? 'border-yellow-500 bg-gradient-to-b from-yellow-900/40 to-orange-900/30 shadow-lg shadow-yellow-500/20'
                          : 'border-gray-700 bg-gradient-to-b from-gray-800/50 to-gray-900/50 hover:border-gray-500'
                      }`}
                    >
                      <div className="w-full h-12 bg-gradient-to-b from-gray-700/50 to-gray-800/50 rounded mb-2 flex items-center justify-center">
                        <span className="text-xl">
                          {route.id === 'route1' ? '🏘️' :
                           route.id === 'route2' ? '🏙️' :
                           route.id === 'route3' ? '🏛️' :
                           route.id === 'route4' ? '⚓' :
                           '🐉'}
                        </span>
                      </div>
                      <div className="text-white font-bold text-xs mb-1">
                        {route.startPoint.name.split(' ')[0]} → {route.endPoint.name.split(' ')[0]}
                      </div>
                      <div className="text-xs space-y-0.5 text-gray-400">
                        <div><span className="text-blue-400">{route.duration} dk</span></div>
                        <div className="text-green-400">+{route.bonusPercent}%</div>
                      </div>
                      <div className="mt-1" style={{ color: getDangerColor(route.dangerLevel) }}>
                        <span className="text-xs">{'★'.repeat(route.dangerLevel)}{'☆'.repeat(5 - route.dangerLevel)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Koruyucu Panosu Tab */}
        {activeTab === 'panel' && (
          <div className="flex-1 overflow-hidden flex">
            <div className="flex-1 flex flex-col border-r border-gray-700">
              <div className="flex gap-2 p-3 border-b border-gray-700 bg-black/20">
                <span className="text-gray-400 text-sm">Filtrele:</span>
                <button
                  onClick={() => setGuardianFilter('all')}
                  className={`px-3 py-1 text-xs rounded ${
                    guardianFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  Tumu
                </button>
                <button
                  onClick={() => setGuardianFilter('online')}
                  className={`px-3 py-1 text-xs rounded flex items-center gap-1 ${
                    guardianFilter === 'online' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  Sadece Online
                </button>
                <button
                  onClick={() => setGuardianFilter('top')}
                  className={`px-3 py-1 text-xs rounded ${
                    guardianFilter === 'top' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  ⭐ En Yuksek Puan
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {filteredGuardians.map((guardian) => (
                  <div
                    key={guardian.id}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      guardian.isOnline
                        ? 'border-green-700/50 bg-gradient-to-r from-gray-800/80 to-gray-900/80'
                        : 'border-orange-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-3xl border-2 ${
                        guardian.isOnline ? 'border-green-500 bg-green-900/30' : 'border-orange-500 bg-orange-900/30'
                      }`}>
                        {guardian.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{guardian.name}</span>
                          <span className={`w-2 h-2 rounded-full ${guardian.isOnline ? 'bg-green-400' : 'bg-orange-400'}`}></span>
                        </div>
                        <div className="text-gray-400 text-xs">
                          ⚔️ {guardian.classType} - {guardian.subClass} | Level {guardian.level}
                        </div>
                        <div className="text-cyan-400 text-xs">Specialty: {guardian.specialty}</div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="flex items-center gap-1 justify-end">
                          {renderStars(guardian.rating)}
                          <span className="text-white">({guardian.rating})</span>
                          <span className="text-gray-400">- {guardian.totalGuards} koruma</span>
                        </div>
                        <div className="text-green-400">%{guardian.successRate} Basari</div>
                        <div className="text-gray-400">Available: {guardian.availability}</div>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <div className="text-yellow-400 text-sm font-bold">Ucret: 1:{guardian.fee}</div>
                        <div className={`text-xs mt-1 ${
                          guardian.afkDefense === 'active' ? 'text-green-400' :
                          guardian.afkDefense === 'partial' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          AFK: {guardian.afkDefense === 'active' ? 'Aktif' : guardian.afkDefense === 'partial' ? `%${guardian.afkLevel}` : 'Pasif'}
                        </div>
                        <button className="mt-2 px-4 py-1.5 bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white text-sm font-bold rounded transition-all">
                          Kirala
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-[260px] p-4 bg-gradient-to-b from-amber-900/20 to-amber-950/20 overflow-y-auto">
              <div className="mb-6">
                <h4 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
                  <span>❓</span> NASIL CALISIR?
                </h4>
                <ol className="text-gray-300 text-xs space-y-2">
                  <li className="flex gap-2"><span className="text-yellow-400 font-bold">1.</span><span>Koruyucu sec ve kirala</span></li>
                  <li className="flex gap-2"><span className="text-yellow-400 font-bold">2.</span><span>Kervan basladiginda bilgilendirilir</span></li>
                  <li className="flex gap-2"><span className="text-yellow-400 font-bold">3.</span><span>Koruyucu kervani takip eder</span></li>
                  <li className="flex gap-2"><span className="text-yellow-400 font-bold">4.</span><span>Haydut saldirisinda savunur</span></li>
                </ol>
              </div>
              <div>
                <h4 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
                  <span>💰</span> UCRETLENDIRME
                </h4>
                <div className="text-xs space-y-2">
                  <div className="p-2 bg-green-900/30 rounded border border-green-700/50">
                    <div className="text-green-400 font-bold">Basari:</div>
                    <div className="text-gray-300">Ucret odenir</div>
                  </div>
                  <div className="p-2 bg-red-900/30 rounded border border-red-700/50">
                    <div className="text-red-400 font-bold">Yagmalanirsa:</div>
                    <div className="text-gray-300">Ucret odenmez</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Puse (Bayrak) Sec Tab */}
        {activeTab === 'pvp' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="text-center mb-6">
              <p className="text-gray-400 text-sm">Bir taraf sec ve o role gore oyna</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {/* Kirmizi Puse */}
              <div className="rounded-xl border-2 border-red-600/50 bg-gradient-to-b from-red-950/50 to-gray-900/80 overflow-hidden">
                <div className="bg-gradient-to-r from-red-900/80 to-red-800/50 p-4 text-center border-b border-red-600/30">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-4xl">🏴‍☠️</span>
                    <div>
                      <h4 className="text-red-400 text-xl font-bold">KIRMIZI PUSE</h4>
                      <p className="text-red-300/70 text-xs">(HAYDUT - Saldirgan)</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 text-center border-b border-red-900/30">
                  <div className="text-gray-400 text-xs mb-1">ROL</div>
                  <div className="text-white font-bold">Kervanlari bas ve yagmala!</div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-green-400 font-bold text-sm mb-2">✓ AVANTAJLAR</div>
                    <ul className="text-xs space-y-1.5 text-gray-300">
                      <li>• %40-60 yagma</li>
                      <li>• PvP EXP kazanimi</li>
                      <li>• Haydut ozel itemleri</li>
                      <li>• Yuksek kazanc</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-red-400 font-bold text-sm mb-2">✗ DEZAVANTAJLAR</div>
                    <ul className="text-xs space-y-1.5 text-gray-300">
                      <li>• Sehir girisi yasak</li>
                      <li>• Haritada gorunur</li>
                      <li>• -15% DEF debuff</li>
                      <li>• Olum cezasi 2x</li>
                    </ul>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <button className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold rounded-lg">
                    🏴‍☠️ KIRMIZI PUSE GIY
                  </button>
                </div>
              </div>
              {/* Mavi Puse */}
              <div className="rounded-xl border-2 border-blue-600/50 bg-gradient-to-b from-blue-950/50 to-gray-900/80 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-900/80 to-blue-800/50 p-4 text-center border-b border-blue-600/30">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-4xl">🛡️</span>
                    <div>
                      <h4 className="text-blue-400 text-xl font-bold">MAVI PUSE</h4>
                      <p className="text-blue-300/70 text-xs">(KORUYUCU - Savunmaci)</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 text-center border-b border-blue-900/30">
                  <div className="text-gray-400 text-xs mb-1">ROL</div>
                  <div className="text-white font-bold">Kervanlari koru ve ucret kazan!</div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-green-400 font-bold text-sm mb-2">✓ AVANTAJLAR</div>
                    <ul className="text-xs space-y-1.5 text-gray-300">
                      <li>• Koruma ucreti 1:10-15</li>
                      <li>• +20% DEF bonus</li>
                      <li>• Haydut radari</li>
                      <li>• Sehir erisimi</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-red-400 font-bold text-sm mb-2">✗ DEZAVANTAJLAR</div>
                    <ul className="text-xs space-y-1.5 text-gray-300">
                      <li>• Ilk saldiramaz</li>
                      <li>• Max 100m uzaklasabilir</li>
                      <li>• Kervan olurse ucret yok</li>
                    </ul>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <button className="w-full py-3 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold rounded-lg">
                    🛡️ MAVI PUSE GIY
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg text-center">
              <span className="text-yellow-400 text-sm">⚠️ Puse degistirmek <span className="font-bold">24 saat</span> bekleme suresi gerektirir!</span>
            </div>
          </div>
        )}

        {/* Harita Tab */}
        {activeTab === 'map' && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <span className="text-4xl">🗺️</span>
              <p className="mt-2">Kervan Haritasi - Yakinda</p>
            </div>
          </div>
        )}

        {/* Footer - Sadece create tab'da */}
        {activeTab === 'create' && (
          <div className="p-4 border-t border-purple-600/30 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex gap-8">
                <div>
                  <div className="text-gray-500 text-xs">TOPLAM YATIRIM:</div>
                  <div className="text-yellow-400 font-bold text-lg">
                    {calculations ? formatGold(calculations.totalInvestment) : '0'} Gold
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">TAHMINI KAZANC:</div>
                  <div className="text-green-400 font-bold text-lg">
                    {calculations ? `${formatGold(calculations.totalReward)} Gold (+${calculations.profitPercent}%)` : '0 Gold'}
                  </div>
                </div>
              </div>
              <div className="flex gap-8">
                <div>
                  <div className="text-gray-500 text-xs">SURE:</div>
                  <div className="text-blue-400 font-bold">⏱️ {calculations ? calculations.estimatedTime : 0} dk</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">TEHLIKE:</div>
                  <div style={{ color: calculations ? getDangerColor(calculations.dangerLevel) : '#888' }} className="font-bold">
                    {'★'.repeat(calculations?.dangerLevel || 0)}{'☆'.repeat(5 - (calculations?.dangerLevel || 0))} {calculations ? getDangerText(calculations.dangerLevel) : 'Yok'}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-red-900/50 hover:bg-red-800/50 text-red-400 font-bold rounded-lg border border-red-700/50"
                >
                  ✕ Iptal
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!canCreate}
                  className={`px-6 py-2 font-bold rounded-lg border ${
                    canCreate
                      ? 'bg-gradient-to-b from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white border-green-500'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed border-gray-600'
                  }`}
                >
                  KERVANI BASLAT - {formatGold(calculations?.totalInvestment || 0)}
                </button>
              </div>
            </div>
            {selectedType && playerLevel < selectedType.minLevel && (
              <div className="text-red-400 text-sm mt-2">⚠️ Bu kervan icin minimum Level {selectedType.minLevel} gerekli!</div>
            )}
            {calculations && playerGold < calculations.totalInvestment && (
              <div className="text-red-400 text-sm mt-2">⚠️ Yetersiz gold! {formatGold(calculations.totalInvestment - playerGold)} G daha lazim.</div>
            )}
            {!selectedType && <div className="text-yellow-400 text-sm mt-2">💡 Kervan tipi sec</div>}
            {selectedType && !selectedRoute && <div className="text-yellow-400 text-sm mt-2">💡 Rota sec</div>}
          </div>
        )}

        {/* Footer - Active tab icin */}
        {activeTab === 'active' && (
          <div className="p-4 border-t border-purple-600/30 bg-black/30">
            <div className="flex justify-between items-center">
              <div className="text-sm">
                {playerFlag === 'neutral' && <span className="text-gray-400">⚪ Bayrak sec: 🔵 Mavi koruyucu, 🔴 Kirmizi haydut olabilirsin</span>}
                {playerFlag === 'blue' && <span className="text-blue-400">🛡️ Mavi Puse - Kervanlara koruyucu olarak katilabilirsin</span>}
                {playerFlag === 'red' && <span className="text-red-400">⚔️ Kirmizi Puse - Kervanlara saldirir ve yagmalarsın!</span>}
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

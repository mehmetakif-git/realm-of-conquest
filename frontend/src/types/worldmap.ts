// Difficulty levels
export type ZoneDifficulty = 'very_easy' | 'easy' | 'normal' | 'hard' | 'very_hard' | 'extreme' | 'nightmare' | 'impossible';

// Environmental hazard types
export interface EnvironmentalHazard {
  type: string;
  chance: number;
  effect: string;
  damage?: number;
  duration?: number;
  warning?: boolean;
  warningTime?: number;
}

// Mini Boss
export interface MiniBoss {
  name: string;
  level: number;
  respawnTime: number; // dakika
}

// World Boss
export interface WorldBoss {
  name: string;
  level: number;
  respawnTime: number; // dakika
  announceServer: boolean;
  crossServer?: boolean;
  requiresRaid?: boolean;
  mythicDropGuaranteed?: boolean;
}

// Zone içindeki alt bölge
export interface SubZone {
  name: string;
  mobTypes: string[];
  difficulty: ZoneDifficulty;
  pvpEnabled: boolean;
  safeZone?: boolean;
  miniBoss?: MiniBoss;
  worldBoss?: WorldBoss;
  environmentalHazard?: string;
  environmentalDamage?: { type: string; damage: number; perSecond: boolean };
  movementSlow?: number;
  freezeChance?: number;
  cursed?: boolean;
  type?: string;
}

// Region (Ana Bölge)
export interface WorldRegion {
  id: string;
  name: string;
  emoji: string;

  requirements: {
    minLevel: number;
    minGearScore: number;
  };

  mobLevels: { min: number; max: number };
  expMultiplier: number;

  zones: SubZone[];

  features: {
    tutorial?: boolean;
    safeZone?: boolean;
    pvp: boolean;
    forcesPvp?: boolean;
    noPvpDebuff?: boolean;
    questHub: string;
    respawnPoint: { x: number; y: number };
    caravanRoute?: boolean;
    caravanAmbushHotspot?: boolean;
    worldBoss?: boolean;
    dungeonEntrance?: string;
    multipleDungeons?: boolean;
    fishing?: boolean;
    portCity?: boolean;
    guildWarZone?: boolean;
    crossServerBoss?: boolean;
    ultimateEndgame?: boolean;
    mythicItemDrops?: boolean;
  };

  environmentalHazards: EnvironmentalHazard[];
  resources: string[];
  description: string;

  // Önerilen direnç
  resistanceRequired?: { type: string; percent: number };
}

// 9 Bölge Tanımları
export const WORLD_REGIONS: WorldRegion[] = [
  {
    id: 'starter_forest',
    name: 'Baslangic Ormani',
    emoji: '🌲',
    requirements: { minLevel: 1, minGearScore: 0 },
    mobLevels: { min: 1, max: 10 },
    expMultiplier: 1.0,
    zones: [
      { name: 'Koy Cevresi', mobTypes: ['Kurt Yavrusu', 'Tavsan', 'Yaban Kedisi'], difficulty: 'very_easy', pvpEnabled: false },
      { name: 'Orman Ici', mobTypes: ['Kurt', 'Yaban Domuzu', 'Zehirli Orumcek'], difficulty: 'easy', pvpEnabled: false },
      { name: 'Goblin Kampi', mobTypes: ['Goblin Caylak', 'Goblin Savasci'], difficulty: 'normal', pvpEnabled: false, miniBoss: { name: 'Goblin Sefi', level: 10, respawnTime: 30 } }
    ],
    features: { tutorial: true, safeZone: true, pvp: false, questHub: 'Baslangic Koyu', respawnPoint: { x: 100, y: 100 } },
    environmentalHazards: [],
    resources: ['Odun', 'Kizil Otlar', 'Bakir Cevheri'],
    description: 'Yeni maceracilarin egitim aldigi guvenli orman bolgesi. PvP yok, ogrenmeye odakli.'
  },
  {
    id: 'sand_desert',
    name: 'Kum Colu',
    emoji: '🏜️',
    requirements: { minLevel: 10, minGearScore: 50 },
    mobLevels: { min: 10, max: 20 },
    expMultiplier: 1.0,
    zones: [
      { name: 'Col Girisi', mobTypes: ['Col Kertenkele', 'Akrep', 'Gocebe Haydut'], difficulty: 'easy', pvpEnabled: true },
      { name: 'Vaha', mobTypes: ['Col Kaplani', 'Zehirli Yilan'], difficulty: 'normal', pvpEnabled: true, safeZone: true },
      { name: 'Antik Harabe', mobTypes: ['Mumya', 'Kum Devleri', 'Lanetli Ruh'], difficulty: 'hard', pvpEnabled: true, miniBoss: { name: 'Col Krali', level: 20, respawnTime: 60 } }
    ],
    features: { pvp: true, questHub: 'Vaha Kampi', respawnPoint: { x: 400, y: 400 }, caravanRoute: true },
    environmentalHazards: [
      { type: 'sandstorm', chance: 0.1, effect: '-30% gorus menzili' },
      { type: 'heat_wave', chance: 0.05, effect: '-10 HP/saniye' }
    ],
    resources: ['Kum Kristali', 'Col Gulu', 'Eski Parsomen'],
    description: 'Ilk PvP deneyimi. Sicaklik debuffi var. Kervan rotasi gecer.'
  },
  {
    id: 'coastal_region',
    name: 'Kiyi Bolgesi',
    emoji: '🌊',
    requirements: { minLevel: 20, minGearScore: 150 },
    mobLevels: { min: 20, max: 35 },
    expMultiplier: 1.0,
    zones: [
      { name: 'Balikci Koyu', mobTypes: ['Yengec', 'Deniz Yilani'], difficulty: 'easy', pvpEnabled: false, safeZone: true },
      { name: 'Sahil Seridi', mobTypes: ['Korsan', 'Deniz Korsani', 'Sirena'], difficulty: 'normal', pvpEnabled: true },
      { name: 'Batik Gemi', mobTypes: ['Hayalet Korsan', 'Su Elementi', 'Kraken Kolu'], difficulty: 'hard', pvpEnabled: true, miniBoss: { name: 'Korsan Kaptani', level: 35, respawnTime: 90 } }
    ],
    features: { pvp: true, questHub: 'Balikci Koyu', respawnPoint: { x: 800, y: 600 }, fishing: true, portCity: true },
    environmentalHazards: [],
    resources: ['Deniz Kabugu', 'Inci', 'Tuzlu Su', 'Balik'],
    description: 'Balik tutma mekaniklerinin oldugu bolge. PvP balik bolgeleri mevcut.'
  },
  {
    id: 'mountain_pass',
    name: 'Dag Gecidi',
    emoji: '⛰️',
    requirements: { minLevel: 35, minGearScore: 400 },
    mobLevels: { min: 35, max: 50 },
    expMultiplier: 1.1,
    zones: [
      { name: 'Dag Etegi', mobTypes: ['Dag Kecisi', 'Kaplan', 'Harpiler'], difficulty: 'normal', pvpEnabled: true },
      { name: 'Yuksek Gecit', mobTypes: ['Kaya Devleri', 'Buzul Trolu', 'Dag Ejderhasi'], difficulty: 'hard', pvpEnabled: true, environmentalHazard: 'Kaya dusmesi' },
      { name: 'Kervan Yolu', mobTypes: ['Dag Haydutlari', 'Kacak Tuccar'], difficulty: 'very_hard', pvpEnabled: true, type: 'caravan_route' }
    ],
    features: { pvp: true, questHub: 'Dag Kampi', respawnPoint: { x: 1200, y: 800 }, caravanRoute: true, caravanAmbushHotspot: true },
    environmentalHazards: [
      { type: 'rockslide', chance: 0.08, effect: '200-500 hasar' },
      { type: 'avalanche', chance: 0.03, effect: 'Tum bolgeye 1000 hasar' }
    ],
    resources: ['Demir Cevheri', 'Sert Tas', 'Dag Kristali'],
    description: 'Ana kervan rotasi. Haydutlar icin ideal ambush noktasi. Yuksek risk/odul.'
  },
  {
    id: 'volcano_valley',
    name: 'Volkan Vadisi',
    emoji: '🌋',
    requirements: { minLevel: 50, minGearScore: 800 },
    mobLevels: { min: 50, max: 65 },
    expMultiplier: 1.2,
    zones: [
      { name: 'Lav Kiyisi', mobTypes: ['Ates Elementi', 'Lav Canavari'], difficulty: 'hard', pvpEnabled: true, environmentalDamage: { type: 'fire', damage: 10, perSecond: true } },
      { name: 'Volkan Krateri', mobTypes: ['Ates Devleri', 'Magma Golemi', 'Ates Draki'], difficulty: 'very_hard', pvpEnabled: true, environmentalDamage: { type: 'fire', damage: 20, perSecond: true }, worldBoss: { name: 'Ifrit Sultan', level: 65, respawnTime: 180, announceServer: true } }
    ],
    features: { pvp: true, questHub: 'Yanardag Kampi', respawnPoint: { x: 1600, y: 1000 }, worldBoss: true, dungeonEntrance: 'Volkan Kalesi (LV 70)' },
    environmentalHazards: [
      { type: 'lava_eruption', chance: 0.15, effect: '500-1000 ates hasari' },
      { type: 'toxic_gas', chance: 0.1, effect: 'Zehir DoT 5 tur' }
    ],
    resources: ['Ates Kristali', 'Obsidyen', 'Volkanik Kul'],
    description: 'World Boss bolgesi. Surekli ates hasari. Dungeon girisi var.',
    resistanceRequired: { type: 'fire', percent: 30 }
  },
  {
    id: 'ice_wasteland',
    name: 'Buzul Diyari',
    emoji: '❄️',
    requirements: { minLevel: 65, minGearScore: 1500 },
    mobLevels: { min: 65, max: 80 },
    expMultiplier: 1.3,
    zones: [
      { name: 'Buz Ovalari', mobTypes: ['Kar Kurdu', 'Buz Yeti', 'Donmus Ruh'], difficulty: 'hard', pvpEnabled: true, movementSlow: 0.7 },
      { name: 'Kristal Magarasi', mobTypes: ['Buz Elementi', 'Kristal Golem', 'Buzul Ejderhasi'], difficulty: 'very_hard', pvpEnabled: true, freezeChance: 0.2 },
      { name: 'Buz Krali Kalesi', mobTypes: ['Buz Sovalyesi', 'Buzul Buyucusu'], difficulty: 'extreme', pvpEnabled: true, type: 'elite_zone', worldBoss: { name: 'Buz Krali', level: 80, respawnTime: 240, announceServer: true } }
    ],
    features: { pvp: true, questHub: 'Donmus Kamp', respawnPoint: { x: 2000, y: 1200 }, worldBoss: true, dungeonEntrance: 'Buzul Tapinagi (LV 60)' },
    environmentalHazards: [
      { type: 'blizzard', chance: 0.2, effect: '-50% gorus, %30 yavaslama' },
      { type: 'freeze', chance: 0.1, effect: '3 saniye donma' },
      { type: 'frostbite', chance: 0.15, effect: '-5% Max HP/dakika' }
    ],
    resources: ['Buz Kristali', 'Donmus Altin', 'Saf Kar'],
    description: 'Soguk direnc sart. Hareket yavaslamas. World Boss ve Dungeon var.',
    resistanceRequired: { type: 'cold', percent: 40 }
  },
  {
    id: 'abandoned_city',
    name: 'Terk Edilmis Sehir',
    emoji: '🏚️',
    requirements: { minLevel: 80, minGearScore: 3000 },
    mobLevels: { min: 80, max: 95 },
    expMultiplier: 1.4,
    zones: [
      { name: 'Dis Mahalle', mobTypes: ['Zombi', 'Iskelet Savasci', 'Hayalet'], difficulty: 'hard', pvpEnabled: true },
      { name: 'Sehir Merkezi', mobTypes: ['Vampir', 'Lich', 'Karanlik Sovalye'], difficulty: 'very_hard', pvpEnabled: true, cursed: true },
      { name: 'Eski Saray', mobTypes: ['Karanlik Lord', 'Olumsuz Muhafiz'], difficulty: 'extreme', pvpEnabled: true, type: 'elite_zone', worldBoss: { name: 'Lanetli Kral', level: 95, respawnTime: 300, announceServer: true } }
    ],
    features: { pvp: true, questHub: 'Hayatta Kalan Kampi', respawnPoint: { x: 2400, y: 1400 }, worldBoss: true, multipleDungeons: true },
    environmentalHazards: [
      { type: 'curse', chance: 0.3, effect: '-10% tum stats 10 dakika' },
      { type: 'undead_swarm', chance: 0.1, effect: '10 zombi spawn' },
      { type: 'dark_ritual', chance: 0.05, effect: 'Tum bolgede moblar 2x guclu 5 dakika' }
    ],
    resources: ['Karanlik Kristal', 'Lanetli Kemik', 'Eski Altin'],
    description: 'Undead temali. Coklu dungeon girisleri. Hapishane burada. Lanetli bolge.'
  },
  {
    id: 'demon_lands',
    name: 'Seytan Topraklari',
    emoji: '👹',
    requirements: { minLevel: 95, minGearScore: 5500 },
    mobLevels: { min: 95, max: 110 },
    expMultiplier: 1.5,
    zones: [
      { name: 'Cehennem Kapisi', mobTypes: ['Seytan Askeri', 'Ates Iblis', 'Karanlik Melek'], difficulty: 'very_hard', pvpEnabled: true },
      { name: 'Kan Nehri', mobTypes: ['Kan Seytani', 'Ruh Emici', 'Cehennem Kopegi'], difficulty: 'extreme', pvpEnabled: true },
      { name: 'Karanlik Taht', mobTypes: ['Seytan Lordu', 'Cehennem Ejderhasi'], difficulty: 'nightmare', pvpEnabled: true, type: 'elite_zone', worldBoss: { name: 'Seytan Krali', level: 110, respawnTime: 360, announceServer: true } }
    ],
    features: { pvp: true, forcesPvp: true, noPvpDebuff: true, questHub: 'Son Kale', respawnPoint: { x: 2800, y: 1600 }, worldBoss: true, guildWarZone: true },
    environmentalHazards: [
      { type: 'hellfire', chance: 0.4, effect: '1000 ates hasari' },
      { type: 'demon_portal', chance: 0.2, effect: '5 Elite demon spawn' },
      { type: 'blood_moon', chance: 0.05, effect: 'Tum moblar 3x guclu 10 dakika' }
    ],
    resources: ['Seytan Kani', 'Cehennem Tasi', 'Karanlik Ruh'],
    description: 'End-game PvP bolgesi. Surekli savas. Lonca savaslari. Cok tehlikeli.'
  },
  {
    id: 'dragon_nest',
    name: 'Ejderha Yuvasi',
    emoji: '🐉',
    requirements: { minLevel: 110, minGearScore: 9000 },
    mobLevels: { min: 110, max: 120 },
    expMultiplier: 1.7,
    zones: [
      { name: 'Ejderha Kiyisi', mobTypes: ['Dragonborn Savasci', 'Wyvern', 'Kucuk Ejderha'], difficulty: 'extreme', pvpEnabled: true },
      { name: 'Antik Ejderha Tapinagi', mobTypes: ['Eski Ejderha', 'Ejderha Rahibi'], difficulty: 'nightmare', pvpEnabled: true },
      { name: 'Ana Yuva', mobTypes: ['Elder Dragon', 'Ejderha Atalari'], difficulty: 'impossible', pvpEnabled: true, type: 'ultimate_zone', worldBoss: { name: 'Ejderha Tanrisi', level: 120, respawnTime: 1440, announceServer: true, crossServer: true, requiresRaid: true, mythicDropGuaranteed: true } }
    ],
    features: { pvp: true, questHub: 'Ejderha Avcilari Kampi', respawnPoint: { x: 3200, y: 1800 }, worldBoss: true, crossServerBoss: true, ultimateEndgame: true, mythicItemDrops: true, dungeonEntrance: 'Ejderha Yuvasi Dungeon (LV 90)' },
    environmentalHazards: [
      { type: 'dragon_roar', chance: 0.5, effect: '5 saniye stun + 1500 hasar' },
      { type: 'meteor_shower', chance: 0.3, effect: 'Rastgele 3000 hasar' },
      { type: 'dragon_swarm', chance: 0.1, effect: '3 Wild Dragon spawn' }
    ],
    resources: ['Ejderha Pulu', 'Ejderha Kani', 'Ejderha Kalbi', 'Mythic Crystal'],
    description: 'Ultimate end-game bolgesi. Cross-server world boss. Mythic itemler. Cap sistemi.'
  }
];

// Helper functions
export function getRegionById(id: string): WorldRegion | undefined {
  return WORLD_REGIONS.find(r => r.id === id);
}

export function getDifficultyColor(difficulty: ZoneDifficulty): string {
  switch (difficulty) {
    case 'very_easy': return '#44ff44';
    case 'easy': return '#88ff44';
    case 'normal': return '#ffff44';
    case 'hard': return '#ff8844';
    case 'very_hard': return '#ff4444';
    case 'extreme': return '#ff00ff';
    case 'nightmare': return '#aa00ff';
    case 'impossible': return '#ff0000';
    default: return '#ffffff';
  }
}

export function getDifficultyText(difficulty: ZoneDifficulty): string {
  switch (difficulty) {
    case 'very_easy': return 'Cok Kolay';
    case 'easy': return 'Kolay';
    case 'normal': return 'Normal';
    case 'hard': return 'Zor';
    case 'very_hard': return 'Cok Zor';
    case 'extreme': return 'Ekstrem';
    case 'nightmare': return 'Kabus';
    case 'impossible': return 'Imkansiz';
    default: return difficulty;
  }
}

export function canEnterRegion(playerLevel: number, playerGearScore: number, region: WorldRegion): { allowed: boolean; reason?: string } {
  if (playerLevel < region.requirements.minLevel) {
    return {
      allowed: false,
      reason: `Minimum Level ${region.requirements.minLevel} gerekli (Sen: ${playerLevel})`
    };
  }

  if (playerGearScore < region.requirements.minGearScore) {
    return {
      allowed: false,
      reason: `Minimum Gear Score ${region.requirements.minGearScore} gerekli (Sen: ${playerGearScore})`
    };
  }

  return { allowed: true };
}

// Gear Score hesaplama (basit versiyon)
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface EquipmentItem {
  baseGearScore: number;
  level: number;
  rarity: ItemRarity;
  enhancement: number;
}

export function calculateGearScore(equipment: Record<string, EquipmentItem | null>): number {
  let totalGS = 0;

  const rarityMultipliers: Record<ItemRarity, number> = {
    common: 1.0,
    uncommon: 1.2,
    rare: 1.5,
    epic: 2.0,
    legendary: 3.0,
    mythic: 5.0
  };

  for (const slot in equipment) {
    const item = equipment[slot];
    if (!item) continue;

    let itemGS = item.baseGearScore || 0;
    itemGS += (item.level || 1) * 5;
    itemGS *= rarityMultipliers[item.rarity] || 1.0;

    if (item.enhancement > 0) {
      itemGS += item.enhancement * 10;
    }

    totalGS += itemGS;
  }

  return Math.floor(totalGS);
}

export function formatGearScore(gs: number): string {
  if (gs >= 10000) return `${(gs / 1000).toFixed(1)}K`;
  return gs.toLocaleString();
}

export function getExpBonusText(multiplier: number): string {
  if (multiplier === 1.0) return 'Normal';
  const bonus = Math.round((multiplier - 1) * 100);
  return `+${bonus}%`;
}

export function getRegionProgressColor(index: number): string {
  const colors = [
    '#4ade80', // yeşil - starter
    '#fbbf24', // sarı - desert
    '#3b82f6', // mavi - coastal
    '#9ca3af', // gri - mountain
    '#ef4444', // kırmızı - volcano
    '#06b6d4', // cyan - ice
    '#6b7280', // koyu gri - abandoned
    '#dc2626', // koyu kırmızı - demon
    '#a855f7', // mor - dragon
  ];
  return colors[index] || '#ffffff';
}

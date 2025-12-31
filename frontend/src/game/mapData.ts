import type { MapData, TileData, MobTemplate } from './types';

// Helper to create tile grid
function createTileGrid(
  width: number,
  height: number,
  defaultType: TileData['type'] = 'grass'
): TileData[][] {
  const tiles: TileData[][] = [];
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = {
        id: `tile_${x}_${y}`,
        type: defaultType,
        walkable: defaultType !== 'water' && defaultType !== 'obstacle',
      };
    }
  }
  return tiles;
}

// Helper to set tile types in a region
function setTileRegion(
  tiles: TileData[][],
  startX: number,
  startY: number,
  width: number,
  height: number,
  type: TileData['type'],
  walkable = true
) {
  for (let y = startY; y < startY + height && y < tiles.length; y++) {
    for (let x = startX; x < startX + width && x < tiles[y].length; x++) {
      tiles[y][x] = {
        id: `tile_${x}_${y}`,
        type,
        walkable,
      };
    }
  }
}

// Baslangic Koyu - Starting Village
const startingVillageTiles = createTileGrid(20, 15, 'grass');

// Add road through center
setTileRegion(startingVillageTiles, 0, 7, 20, 2, 'road');
setTileRegion(startingVillageTiles, 9, 0, 2, 15, 'road');

// Add buildings
setTileRegion(startingVillageTiles, 2, 2, 3, 3, 'building', false); // Shop
setTileRegion(startingVillageTiles, 15, 2, 3, 3, 'building', false); // Blacksmith
setTileRegion(startingVillageTiles, 2, 10, 3, 3, 'building', false); // Inn
setTileRegion(startingVillageTiles, 15, 10, 3, 3, 'building', false); // Guild

// Add water pond
setTileRegion(startingVillageTiles, 12, 5, 3, 2, 'water', false);

// Add some obstacles (trees, rocks)
startingVillageTiles[1][6] = { id: 'tile_6_1', type: 'obstacle', walkable: false };
startingVillageTiles[1][13] = { id: 'tile_13_1', type: 'obstacle', walkable: false };
startingVillageTiles[13][6] = { id: 'tile_6_13', type: 'obstacle', walkable: false };
startingVillageTiles[13][13] = { id: 'tile_13_13', type: 'obstacle', walkable: false };

export const STARTING_VILLAGE: MapData = {
  id: 'starting_village',
  name: 'Starting Village',
  nameTR: 'Baslangic Koyu',
  width: 20,
  height: 15,
  tileSize: 40,
  tiles: startingVillageTiles,
  spawnPoint: { x: 10, y: 7 },
  portals: [
    {
      id: 'portal_to_forest',
      position: { x: 19, y: 7 },
      targetMapId: 'mystic_forest',
      targetPosition: { x: 1, y: 7 },
      label: 'Gizemli Orman',
    },
    {
      id: 'portal_to_plains',
      position: { x: 10, y: 0 },
      targetMapId: 'training_plains',
      targetPosition: { x: 10, y: 13 },
      label: 'Egitim Ovasi',
    },
  ],
  npcs: [
    {
      id: 'npc_merchant',
      name: 'Tüccar Ahmet',
      type: 'merchant',
      position: { x: 3, y: 5 },
      shopId: 'basic_shop',
    },
    {
      id: 'npc_blacksmith',
      name: 'Demirci Usta',
      type: 'blacksmith',
      position: { x: 16, y: 5 },
      shopId: 'blacksmith_shop',
    },
    {
      id: 'npc_trainer',
      name: 'Egitmen Kemal',
      type: 'trainer',
      position: { x: 10, y: 10 },
      questIds: ['tutorial_quest'],
    },
    {
      id: 'npc_guild_master',
      name: 'Lonca Ustasi',
      type: 'guild_master',
      position: { x: 16, y: 12 },
    },
  ],
  mobs: [], // No mobs in starting village
};

// Training Plains - For low level players
const trainingPlainsTiles = createTileGrid(25, 15, 'grass');

// Roads
setTileRegion(trainingPlainsTiles, 10, 0, 2, 15, 'road');
setTileRegion(trainingPlainsTiles, 0, 7, 25, 2, 'road');

// Some stone areas
setTileRegion(trainingPlainsTiles, 3, 3, 4, 3, 'stone');
setTileRegion(trainingPlainsTiles, 18, 10, 4, 3, 'stone');

// Obstacles
for (let i = 0; i < 10; i++) {
  const x = Math.floor(Math.random() * 25);
  const y = Math.floor(Math.random() * 15);
  if (trainingPlainsTiles[y][x].type === 'grass') {
    trainingPlainsTiles[y][x] = { id: `tile_${x}_${y}`, type: 'obstacle', walkable: false };
  }
}

export const TRAINING_PLAINS: MapData = {
  id: 'training_plains',
  name: 'Training Plains',
  nameTR: 'Egitim Ovasi',
  width: 25,
  height: 15,
  tileSize: 40,
  tiles: trainingPlainsTiles,
  spawnPoint: { x: 10, y: 13 },
  portals: [
    {
      id: 'portal_to_village',
      position: { x: 10, y: 14 },
      targetMapId: 'starting_village',
      targetPosition: { x: 10, y: 1 },
      label: 'Baslangic Koyu',
    },
    {
      id: 'portal_to_dungeon',
      position: { x: 0, y: 7 },
      targetMapId: 'goblin_cave',
      targetPosition: { x: 18, y: 7 },
      label: 'Goblin Magarasi',
    },
  ],
  npcs: [
    {
      id: 'npc_quest_giver',
      name: 'Koylu Mehmet',
      type: 'quest_giver',
      position: { x: 5, y: 5 },
      questIds: ['kill_slimes', 'gather_herbs'],
    },
  ],
  mobs: [
    { id: 'mob_slime_1', mobTemplateId: 'slime', position: { x: 4, y: 2 }, respawnTime: 30, level: 1 },
    { id: 'mob_slime_2', mobTemplateId: 'slime', position: { x: 7, y: 4 }, respawnTime: 30, level: 1 },
    { id: 'mob_slime_3', mobTemplateId: 'slime', position: { x: 15, y: 3 }, respawnTime: 30, level: 2 },
    { id: 'mob_wolf_1', mobTemplateId: 'wolf', position: { x: 20, y: 5 }, respawnTime: 45, level: 3 },
    { id: 'mob_wolf_2', mobTemplateId: 'wolf', position: { x: 22, y: 10 }, respawnTime: 45, level: 3 },
    { id: 'mob_boar_1', mobTemplateId: 'wild_boar', position: { x: 3, y: 11 }, respawnTime: 60, level: 4 },
  ],
};

// Mystic Forest - Medium level area
const mysticForestTiles = createTileGrid(30, 20, 'grass');

// Paths through forest
setTileRegion(mysticForestTiles, 0, 7, 30, 2, 'road');
setTileRegion(mysticForestTiles, 15, 0, 2, 20, 'road');

// Water stream
setTileRegion(mysticForestTiles, 0, 15, 12, 2, 'water', false);
setTileRegion(mysticForestTiles, 20, 3, 2, 8, 'water', false);

// Dense forest areas (obstacles/trees)
for (let i = 0; i < 40; i++) {
  const x = Math.floor(Math.random() * 30);
  const y = Math.floor(Math.random() * 20);
  if (mysticForestTiles[y][x].type === 'grass') {
    mysticForestTiles[y][x] = { id: `tile_${x}_${y}`, type: 'obstacle', walkable: false };
  }
}

export const MYSTIC_FOREST: MapData = {
  id: 'mystic_forest',
  name: 'Mystic Forest',
  nameTR: 'Gizemli Orman',
  width: 30,
  height: 20,
  tileSize: 40,
  tiles: mysticForestTiles,
  spawnPoint: { x: 1, y: 7 },
  portals: [
    {
      id: 'portal_to_village',
      position: { x: 0, y: 7 },
      targetMapId: 'starting_village',
      targetPosition: { x: 18, y: 7 },
      label: 'Baslangic Koyu',
    },
    {
      id: 'portal_to_dungeon',
      position: { x: 15, y: 0 },
      targetMapId: 'dark_temple',
      targetPosition: { x: 10, y: 18 },
      label: 'Karanlik Tapinak',
    },
  ],
  npcs: [
    {
      id: 'npc_herbalist',
      name: 'Sifaci Elif',
      type: 'merchant',
      position: { x: 5, y: 10 },
      shopId: 'herb_shop',
    },
  ],
  mobs: [
    { id: 'mob_treant_1', mobTemplateId: 'treant', position: { x: 5, y: 3 }, respawnTime: 60, level: 5 },
    { id: 'mob_treant_2', mobTemplateId: 'treant', position: { x: 25, y: 5 }, respawnTime: 60, level: 6 },
    { id: 'mob_spider_1', mobTemplateId: 'forest_spider', position: { x: 10, y: 12 }, respawnTime: 45, level: 5 },
    { id: 'mob_spider_2', mobTemplateId: 'forest_spider', position: { x: 23, y: 15 }, respawnTime: 45, level: 6 },
    { id: 'mob_fairy_1', mobTemplateId: 'corrupted_fairy', position: { x: 8, y: 5 }, respawnTime: 90, level: 7 },
    { id: 'mob_boss_1', mobTemplateId: 'forest_guardian', position: { x: 15, y: 10 }, respawnTime: 300, level: 10, isBoss: true },
  ],
};

// Mob Templates
export const MOB_TEMPLATES: Record<string, MobTemplate> = {
  slime: {
    id: 'slime',
    name: 'Slime',
    level: 1,
    hp: 50,
    attack: 5,
    defense: 2,
    speed: 3,
    experience: 10,
    goldDrop: [5, 15],
    lootTable: [
      { itemId: 'slime_jelly', dropChance: 0.5, minQuantity: 1, maxQuantity: 2 },
    ],
  },
  wolf: {
    id: 'wolf',
    name: 'Kurt',
    level: 3,
    hp: 100,
    attack: 15,
    defense: 5,
    speed: 8,
    experience: 25,
    goldDrop: [10, 30],
    lootTable: [
      { itemId: 'wolf_pelt', dropChance: 0.3, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'wolf_fang', dropChance: 0.2, minQuantity: 1, maxQuantity: 2 },
    ],
  },
  wild_boar: {
    id: 'wild_boar',
    name: 'Yaban Domuzu',
    level: 4,
    hp: 150,
    attack: 20,
    defense: 10,
    speed: 5,
    experience: 35,
    goldDrop: [15, 40],
    lootTable: [
      { itemId: 'boar_meat', dropChance: 0.6, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'boar_tusk', dropChance: 0.15, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  treant: {
    id: 'treant',
    name: 'Agac Ruhu',
    level: 5,
    hp: 200,
    attack: 18,
    defense: 15,
    speed: 3,
    experience: 50,
    goldDrop: [20, 50],
    lootTable: [
      { itemId: 'ancient_bark', dropChance: 0.4, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'treant_heart', dropChance: 0.1, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  forest_spider: {
    id: 'forest_spider',
    name: 'Orman Orumcegi',
    level: 5,
    hp: 120,
    attack: 25,
    defense: 8,
    speed: 10,
    experience: 45,
    goldDrop: [18, 45],
    lootTable: [
      { itemId: 'spider_silk', dropChance: 0.5, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'spider_venom', dropChance: 0.2, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  corrupted_fairy: {
    id: 'corrupted_fairy',
    name: 'Bozulmus Peri',
    level: 7,
    hp: 100,
    attack: 35,
    defense: 5,
    speed: 15,
    experience: 60,
    goldDrop: [25, 60],
    lootTable: [
      { itemId: 'fairy_dust', dropChance: 0.6, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'corrupted_crystal', dropChance: 0.15, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  forest_guardian: {
    id: 'forest_guardian',
    name: 'Orman Koruyucusu',
    level: 10,
    hp: 1000,
    attack: 50,
    defense: 30,
    speed: 6,
    experience: 500,
    goldDrop: [100, 300],
    lootTable: [
      { itemId: 'guardian_essence', dropChance: 1.0, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'forest_crown', dropChance: 0.05, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'ancient_bark', dropChance: 0.8, minQuantity: 3, maxQuantity: 5 },
    ],
  },
};

// Map registry
export const MAPS: Record<string, MapData> = {
  starting_village: STARTING_VILLAGE,
  training_plains: TRAINING_PLAINS,
  mystic_forest: MYSTIC_FOREST,
};

export function getMapById(mapId: string): MapData | undefined {
  return MAPS[mapId];
}

export function getMobTemplate(templateId: string): MobTemplate | undefined {
  return MOB_TEMPLATES[templateId];
}

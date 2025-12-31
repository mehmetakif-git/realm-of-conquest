// Game Types for PixiJS rendering

export interface Position {
  x: number;
  y: number;
}

export interface TileData {
  id: string;
  type: TileType;
  walkable: boolean;
  sprite?: string;
}

export type TileType =
  | 'grass'
  | 'water'
  | 'stone'
  | 'road'
  | 'building'
  | 'portal'
  | 'npc'
  | 'obstacle';

export interface MapData {
  id: string;
  name: string;
  nameTR: string;
  width: number;
  height: number;
  tileSize: number;
  tiles: TileData[][];
  spawnPoint: Position;
  portals: Portal[];
  npcs: MapNPC[];
  mobs: MapMob[];
}

export interface Portal {
  id: string;
  position: Position;
  targetMapId: string;
  targetPosition: Position;
  label: string;
}

export interface MapNPC {
  id: string;
  name: string;
  type: NPCType;
  position: Position;
  dialogueId?: string;
  shopId?: string;
  questIds?: string[];
}

export type NPCType =
  | 'merchant'
  | 'quest_giver'
  | 'blacksmith'
  | 'trainer'
  | 'banker'
  | 'guild_master';

export interface MapMob {
  id: string;
  mobTemplateId: string;
  position: Position;
  respawnTime: number;
  level: number;
  isElite?: boolean;
  isBoss?: boolean;
}

export interface MobTemplate {
  id: string;
  name: string;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  experience: number;
  goldDrop: [number, number]; // min-max
  lootTable: LootEntry[];
  sprite?: string;
}

export interface LootEntry {
  itemId: string;
  dropChance: number;
  minQuantity: number;
  maxQuantity: number;
}

// Combat Types
export interface CombatUnit {
  id: string;
  name: string;
  isPlayer: boolean;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  critRate: number;
  position: 'front' | 'middle' | 'back';
  skills: CombatSkill[];
  buffs: Buff[];
  debuffs: Debuff[];
  sprite?: string;
}

export interface CombatSkill {
  id: string;
  name: string;
  type: 'attack' | 'heal' | 'buff' | 'debuff';
  damage?: number;
  healing?: number;
  mpCost: number;
  cooldown: number;
  currentCooldown: number;
  targetType: 'single' | 'all' | 'self' | 'ally' | 'allies';
}

export interface Buff {
  id: string;
  name: string;
  type: 'attack' | 'defense' | 'speed' | 'crit' | 'regen';
  value: number;
  duration: number;
  turnsRemaining: number;
}

export interface Debuff {
  id: string;
  name: string;
  type: 'attack_down' | 'defense_down' | 'slow' | 'poison' | 'stun';
  value: number;
  duration: number;
  turnsRemaining: number;
}

export interface CombatState {
  turn: number;
  phase: 'player_turn' | 'enemy_turn' | 'victory' | 'defeat';
  playerUnits: CombatUnit[];
  enemyUnits: CombatUnit[];
  turnOrder: string[];
  currentUnitId: string;
  log: CombatLogEntry[];
}

export interface CombatLogEntry {
  turn: number;
  message: string;
  type: 'attack' | 'skill' | 'heal' | 'buff' | 'debuff' | 'death' | 'system';
}

// UI States
export interface GameUIState {
  activeDialog: DialogState | null;
  activeShop: ShopState | null;
  activeCombat: CombatState | null;
  notifications: Notification[];
  minimap: {
    visible: boolean;
    zoom: number;
  };
}

export interface DialogState {
  npcId: string;
  npcName: string;
  currentNode: string;
  dialogueTree: DialogueNode[];
}

export interface DialogueNode {
  id: string;
  text: string;
  choices: DialogueChoice[];
}

export interface DialogueChoice {
  text: string;
  nextNodeId?: string;
  action?: string;
}

export interface ShopState {
  shopId: string;
  shopName: string;
  items: ShopItem[];
  selectedItemIndex: number;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  icon?: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration: number;
  createdAt: number;
}

// Color constants for rendering
export const TILE_COLORS: Record<TileType, number> = {
  grass: 0x3d8b3d,
  water: 0x3366cc,
  stone: 0x808080,
  road: 0x8b7355,
  building: 0x8b4513,
  portal: 0x9933ff,
  npc: 0xffcc00,
  obstacle: 0x444444,
};

export const CLASS_SPRITE_COLORS: Record<string, number> = {
  warrior: 0xcc3333,
  archer: 0x33cc33,
  mage: 0x3333cc,
  healer: 0xcccc33,
  ninja: 0x9933cc,
};

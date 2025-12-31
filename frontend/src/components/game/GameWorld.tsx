import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { Character, FlagType } from '../../types';
import type { Caravan } from '../../types/caravan';
import { getClassColor } from '../../styles/theme';
import { FlagIndicator } from '../flag';
import { CaravanMarker, CaravanRouteLines } from '../caravan';

// Other player type
export interface OtherPlayer {
  id: string;
  name: string;
  level: number;
  x: number;
  y: number;
  flag: FlagType;
  classType: string;
  icon: string;
}

// Mob type definition
export interface Mob {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  icon: string;
  type: 'normal' | 'elite' | 'boss';
  attack: number;
  defense: number;
}

// NPC type definition
export interface NPC {
  id: string;
  name: string;
  type: 'merchant' | 'blacksmith' | 'quest_giver' | 'healer' | 'teleporter';
  x: number;
  y: number;
  icon: string;
  dialogue?: string;
}

interface GameWorldProps {
  character: Character;
  mobs?: Mob[];
  npcs?: NPC[];
  otherPlayers?: OtherPlayer[];
  caravans?: Caravan[];
  onMobClick?: (mob: Mob) => void;
  onNPCClick?: (npc: NPC) => void;
  onPlayerMove?: (x: number, y: number) => void;
  onPlayerClick?: (player: OtherPlayer) => void;
  onCaravanClick?: (caravan: Caravan) => void;
}

// Default other players for demo
const DEFAULT_OTHER_PLAYERS: OtherPlayer[] = [
  { id: 'p1', name: 'RedWarrior', level: 15, x: 30, y: 40, flag: 'red', classType: 'warrior', icon: '⚔️' },
  { id: 'p2', name: 'BlueGuard', level: 12, x: 70, y: 25, flag: 'blue', classType: 'paladin', icon: '🛡️' },
  { id: 'p3', name: 'NeutralMage', level: 8, x: 55, y: 50, flag: 'neutral', classType: 'mage', icon: '🔮' },
];

// Default mobs for demo
const DEFAULT_MOBS: Mob[] = [
  { id: 'mob1', name: 'Forest Wolf', level: 3, hp: 80, maxHp: 100, x: 25, y: 30, icon: '🐺', type: 'normal', attack: 15, defense: 5 },
  { id: 'mob2', name: 'Wild Boar', level: 2, hp: 120, maxHp: 120, x: 60, y: 20, icon: '🐗', type: 'normal', attack: 12, defense: 8 },
  { id: 'mob3', name: 'Goblin Scout', level: 4, hp: 60, maxHp: 80, x: 75, y: 55, icon: '👺', type: 'normal', attack: 18, defense: 4 },
  { id: 'mob4', name: 'Forest Spider', level: 3, hp: 70, maxHp: 70, x: 40, y: 65, icon: '🕷️', type: 'normal', attack: 14, defense: 3 },
  { id: 'mob5', name: 'Stone Golem', level: 8, hp: 250, maxHp: 300, x: 85, y: 75, icon: '🗿', type: 'elite', attack: 35, defense: 25 },
  { id: 'mob6', name: 'Dark Witch', level: 10, hp: 400, maxHp: 500, x: 15, y: 80, icon: '🧙', type: 'boss', attack: 50, defense: 15 },
];

// Default NPCs for demo
const DEFAULT_NPCS: NPC[] = [
  { id: 'npc1', name: 'Merchant Arin', type: 'merchant', x: 50, y: 85, icon: '🧔', dialogue: 'Finest goods in the realm!' },
  { id: 'npc2', name: 'Blacksmith Borin', type: 'blacksmith', x: 35, y: 90, icon: '⚒️', dialogue: 'Need something forged?' },
  { id: 'npc3', name: 'Elder Mira', type: 'quest_giver', x: 65, y: 88, icon: '👵', dialogue: 'Hero! I have a task for you...' },
  { id: 'npc4', name: 'Healer Luna', type: 'healer', x: 45, y: 92, icon: '💚', dialogue: 'Let me tend to your wounds.' },
];

// Get type color for mobs
function getMobTypeColor(type: Mob['type']): { bg: string; border: string; text: string } {
  switch (type) {
    case 'elite':
      return { bg: 'from-purple-600 to-purple-800', border: 'border-purple-400', text: 'text-purple-300' };
    case 'boss':
      return { bg: 'from-red-600 to-red-900', border: 'border-red-400', text: 'text-red-300' };
    default:
      return { bg: 'from-gray-600 to-gray-800', border: 'border-gray-400', text: 'text-gray-300' };
  }
}

// Get NPC type color
function getNPCTypeColor(type: NPC['type']): { bg: string; border: string } {
  switch (type) {
    case 'merchant':
      return { bg: 'from-yellow-600 to-yellow-800', border: 'border-yellow-400' };
    case 'blacksmith':
      return { bg: 'from-orange-600 to-orange-800', border: 'border-orange-400' };
    case 'quest_giver':
      return { bg: 'from-blue-600 to-blue-800', border: 'border-blue-400' };
    case 'healer':
      return { bg: 'from-green-600 to-green-800', border: 'border-green-400' };
    case 'teleporter':
      return { bg: 'from-cyan-600 to-cyan-800', border: 'border-cyan-400' };
    default:
      return { bg: 'from-gray-600 to-gray-800', border: 'border-gray-400' };
  }
}

export default function GameWorld({
  character,
  mobs = DEFAULT_MOBS,
  npcs = DEFAULT_NPCS,
  otherPlayers = DEFAULT_OTHER_PLAYERS,
  caravans = [],
  onMobClick,
  onNPCClick,
  onPlayerMove,
  onPlayerClick,
  onCaravanClick,
}: GameWorldProps) {
  const worldRef = useRef<HTMLDivElement>(null);
  const [playerPos, setPlayerPos] = useState({ x: character.position_x, y: character.position_y });
  const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [clickEffect, setClickEffect] = useState<{ x: number; y: number } | null>(null);

  const classColor = getClassColor(character.class);
  const myFlag = character.flag_type || 'neutral';

  // Get active caravan routes for route lines
  const activeRoutes = useMemo(() => {
    return [...new Set(caravans.filter(c => c.status === 'traveling' || c.status === 'under_attack').map(c => c.route.id))];
  }, [caravans]);

  // Handle world click for movement
  const handleWorldClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!worldRef.current) return;

    const rect = worldRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Show click effect
    setClickEffect({ x, y });
    setTimeout(() => setClickEffect(null), 500);

    // Set target position
    setTargetPos({ x, y });
    setIsMoving(true);

    if (onPlayerMove) {
      onPlayerMove(x, y);
    }
  }, [onPlayerMove]);

  // Animate player movement
  useEffect(() => {
    if (!targetPos || !isMoving) return;

    const moveInterval = setInterval(() => {
      setPlayerPos((current) => {
        const dx = targetPos.x - current.x;
        const dy = targetPos.y - current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 1) {
          setIsMoving(false);
          setTargetPos(null);
          return { x: targetPos.x, y: targetPos.y };
        }

        const speed = 2;
        const ratio = speed / distance;
        return {
          x: current.x + dx * ratio,
          y: current.y + dy * ratio,
        };
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [targetPos, isMoving]);

  // Handle mob click
  const handleMobClick = useCallback((e: React.MouseEvent, mob: Mob) => {
    e.stopPropagation();
    if (onMobClick) {
      onMobClick(mob);
    }
  }, [onMobClick]);

  // Handle NPC click
  const handleNPCClick = useCallback((e: React.MouseEvent, npc: NPC) => {
    e.stopPropagation();
    if (onNPCClick) {
      onNPCClick(npc);
    }
  }, [onNPCClick]);

  // Handle other player click
  const handleOtherPlayerClick = useCallback((e: React.MouseEvent, player: OtherPlayer) => {
    e.stopPropagation();
    if (onPlayerClick) {
      onPlayerClick(player);
    }
  }, [onPlayerClick]);

  // Handle caravan click
  const handleCaravanClick = useCallback((caravan: Caravan) => {
    if (onCaravanClick) {
      onCaravanClick(caravan);
    }
  }, [onCaravanClick]);

  // Get player color based on flag
  const getPlayerFlagColors = (flag: FlagType) => {
    switch (flag) {
      case 'red':
        return { bg: 'from-red-700 to-red-900', border: 'border-red-500', name: 'bg-red-900/90' };
      case 'blue':
        return { bg: 'from-blue-700 to-blue-900', border: 'border-blue-500', name: 'bg-blue-900/90' };
      default:
        return { bg: 'from-gray-600 to-gray-800', border: 'border-gray-500', name: 'bg-black/80' };
    }
  };

  return (
    <div
      ref={worldRef}
      className="w-full h-full relative overflow-hidden cursor-pointer"
      onClick={handleWorldClick}
      style={{
        background: `
          linear-gradient(180deg,
            rgba(34, 85, 34, 0.3) 0%,
            rgba(45, 90, 45, 0.4) 30%,
            rgba(60, 100, 50, 0.3) 60%,
            rgba(80, 60, 40, 0.4) 100%
          )
        `,
      }}
    >
      {/* Ground texture overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(34, 139, 34, 0.3) 0%, transparent 40%),
            radial-gradient(circle at 70% 60%, rgba(139, 90, 43, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(34, 139, 34, 0.2) 0%, transparent 35%),
            radial-gradient(circle at 80% 20%, rgba(107, 142, 35, 0.2) 0%, transparent 30%)
          `,
        }}
      />

      {/* Grid pattern for terrain feel */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Decorative grass patches */}
      {[...Array(20)].map((_, i) => (
        <div
          key={`grass-${i}`}
          className="absolute text-green-600/40 select-none pointer-events-none"
          style={{
            left: `${(i * 17 + 5) % 95}%`,
            top: `${(i * 23 + 10) % 90}%`,
            fontSize: `${12 + (i % 3) * 4}px`,
          }}
        >
          🌿
        </div>
      ))}

      {/* Decorative rocks */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`rock-${i}`}
          className="absolute text-gray-500/30 select-none pointer-events-none"
          style={{
            left: `${(i * 31 + 15) % 90}%`,
            top: `${(i * 29 + 20) % 85}%`,
            fontSize: `${10 + (i % 2) * 6}px`,
          }}
        >
          🪨
        </div>
      ))}

      {/* Decorative trees */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`tree-${i}`}
          className="absolute select-none pointer-events-none"
          style={{
            left: `${(i * 37 + 8) % 88}%`,
            top: `${(i * 19 + 5) % 40}%`,
            fontSize: '24px',
            opacity: 0.5,
          }}
        >
          🌲
        </div>
      ))}

      {/* Click effect */}
      {clickEffect && (
        <div
          className="absolute w-8 h-8 pointer-events-none animate-ping"
          style={{
            left: `${clickEffect.x}%`,
            top: `${clickEffect.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-full h-full border-2 border-yellow-400 rounded-full" />
        </div>
      )}

      {/* Target marker */}
      {targetPos && isMoving && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${targetPos.x}%`,
            top: `${targetPos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-4 h-4 border-2 border-green-400 rounded-full animate-pulse" />
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-green-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}

      {/* NPCs */}
      {npcs.map((npc) => {
        const colors = getNPCTypeColor(npc.type);
        return (
          <div
            key={npc.id}
            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform group"
            style={{ left: `${npc.x}%`, top: `${npc.y}%` }}
            onClick={(e) => handleNPCClick(e, npc)}
          >
            {/* NPC Container */}
            <div className={`relative bg-gradient-to-b ${colors.bg} rounded-lg p-2 border-2 ${colors.border} shadow-lg`}>
              {/* NPC Icon */}
              <div className="text-2xl text-center">{npc.icon}</div>

              {/* NPC Name */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-yellow-300 text-[10px] font-bold bg-black/60 px-1 rounded">
                  {npc.name}
                </span>
              </div>

              {/* Quest indicator for quest givers */}
              {npc.type === 'quest_giver' && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-black text-xs font-bold">!</span>
                </div>
              )}

              {/* Hover tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  <div className="text-yellow-400 font-bold">{npc.name}</div>
                  <div className="text-gray-400 capitalize">{npc.type.replace('_', ' ')}</div>
                  {npc.dialogue && <div className="text-gray-300 italic mt-1">"{npc.dialogue}"</div>}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Mobs */}
      {mobs.map((mob) => {
        const colors = getMobTypeColor(mob.type);
        const hpPercent = (mob.hp / mob.maxHp) * 100;

        return (
          <div
            key={mob.id}
            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform group"
            style={{ left: `${mob.x}%`, top: `${mob.y}%` }}
            onClick={(e) => handleMobClick(e, mob)}
          >
            {/* Mob Container */}
            <div className={`relative bg-gradient-to-b ${colors.bg} rounded-lg p-1.5 border-2 ${colors.border} shadow-lg`}>
              {/* Level Badge */}
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${colors.text} text-[10px] font-bold bg-black/80 px-1.5 rounded-full border ${colors.border}`}>
                Lv.{mob.level}
              </div>

              {/* Mob Icon */}
              <div className="text-2xl text-center mt-1">{mob.icon}</div>

              {/* HP Bar */}
              <div className="w-12 h-1.5 bg-black/50 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>

              {/* Mob Name */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className={`${colors.text} text-[9px] font-bold bg-black/60 px-1 rounded`}>
                  {mob.name}
                </span>
              </div>

              {/* Elite/Boss indicator */}
              {mob.type === 'elite' && (
                <div className="absolute -top-1 -right-1 text-yellow-400 text-xs">⭐</div>
              )}
              {mob.type === 'boss' && (
                <div className="absolute -top-1 -right-1 text-red-400 text-sm">💀</div>
              )}

              {/* Hover tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  <div className={`font-bold ${colors.text}`}>{mob.name}</div>
                  <div className="text-gray-400">Level {mob.level} {mob.type !== 'normal' && `(${mob.type})`}</div>
                  <div className="text-red-400">HP: {mob.hp}/{mob.maxHp}</div>
                  <div className="text-orange-400">ATK: {mob.attack} | DEF: {mob.defense}</div>
                  <div className="text-yellow-400 mt-1">Click to attack!</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Other Players */}
      {otherPlayers.map((player) => {
        const colors = getPlayerFlagColors(player.flag);
        void myFlag; // Reference to avoid unused warning

        return (
          <div
            key={player.id}
            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform group z-15"
            style={{ left: `${player.x}%`, top: `${player.y}%` }}
            onClick={(e) => handleOtherPlayerClick(e, player)}
          >
            {/* Flag indicator above player */}
            {player.flag !== 'neutral' && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                <FlagIndicator flag={player.flag} size="small" />
              </div>
            )}

            {/* Player circle */}
            <div
              className={`w-11 h-11 rounded-full bg-gradient-to-b ${colors.bg} ${colors.border} border-2 flex items-center justify-center shadow-lg`}
              style={{
                boxShadow: player.flag === 'red'
                  ? '0 0 12px rgba(255, 68, 68, 0.5)'
                  : player.flag === 'blue'
                    ? '0 0 12px rgba(68, 68, 255, 0.5)'
                    : 'none',
              }}
            >
              <span className="text-xl">{player.icon}</span>
            </div>

            {/* Player name plate */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
              <div className={`${colors.name} px-2 py-0.5 rounded text-center`}>
                <span className="text-yellow-400 text-[9px]">Lv.{player.level} </span>
                <span className="text-white text-[10px] font-bold">{player.name}</span>
              </div>
            </div>

            {/* Hover tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-black/95 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap border border-gray-600">
                <div className="font-bold text-white">{player.name}</div>
                <div className="text-gray-400">Level {player.level}</div>
                <div className={`${player.flag === 'red' ? 'text-red-400' : player.flag === 'blue' ? 'text-blue-400' : 'text-gray-400'}`}>
                  {player.flag === 'red' ? 'Haydut' : player.flag === 'blue' ? 'Koruyucu' : 'Tarafsiz'}
                </div>
                {player.flag !== 'neutral' && (
                  <div className="text-yellow-400 mt-1 text-[10px]">Click to interact</div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Caravan Route Lines */}
      {activeRoutes.length > 0 && <CaravanRouteLines activeRoutes={activeRoutes} />}

      {/* Caravans */}
      {caravans
        .filter(c => c.status === 'traveling' || c.status === 'under_attack')
        .map((caravan) => (
          <CaravanMarker
            key={caravan.id}
            caravan={caravan}
            onClick={handleCaravanClick}
          />
        ))}

      {/* Player Character */}
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-100"
        style={{
          left: `${playerPos.x}%`,
          top: `${playerPos.y}%`,
        }}
      >
        {/* Player Container */}
        <div
          className="relative rounded-full p-1 border-3"
          style={{
            background: `linear-gradient(180deg, ${classColor.primary}90 0%, ${classColor.secondary} 100%)`,
            borderColor: classColor.primary,
            borderWidth: '3px',
            boxShadow: `0 0 15px ${classColor.primary}80, 0 0 30px ${classColor.primary}40`,
          }}
        >
          {/* Player Icon */}
          <div className="w-10 h-10 flex items-center justify-center">
            <span className="text-2xl drop-shadow-lg">{classColor.icon}</span>
          </div>

          {/* Player Name */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-green-400 text-[10px] font-bold bg-black/70 px-1.5 py-0.5 rounded border border-green-500/50">
              {character.name}
            </span>
          </div>

          {/* Level indicator */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 rounded-full"
            style={{
              background: `linear-gradient(180deg, ${classColor.primary} 0%, ${classColor.secondary} 100%)`,
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            {character.level}
          </div>

          {/* Movement indicator */}
          {isMoving && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
            </div>
          )}
        </div>
      </div>

      {/* Footer area indicator (safe zone) */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import type { Character } from '../../types';
import type { Mob } from '../game/GameWorld';
import { getClassColor } from '../../styles/theme';

interface CombatState {
  playerHp: number;
  playerMp: number;
  mobHp: number;
  turn: 'player' | 'mob';
  log: CombatLogEntry[];
  isOver: boolean;
  winner: 'player' | 'mob' | null;
}

interface CombatLogEntry {
  id: number;
  message: string;
  type: 'player_attack' | 'mob_attack' | 'skill' | 'heal' | 'system' | 'critical' | 'miss';
}

interface CombatModalProps {
  isOpen: boolean;
  character: Character;
  mob: Mob;
  onClose: () => void;
  onVictory?: (mob: Mob, expGained: number, goldGained: number) => void;
  onDefeat?: () => void;
}

// Skills based on character class
const CLASS_SKILLS: Record<string, { name: string; icon: string; mpCost: number; damage: number; type: 'attack' | 'heal' }[]> = {
  warrior: [
    { name: 'Slash', icon: '⚔️', mpCost: 10, damage: 1.5, type: 'attack' },
    { name: 'Shield Bash', icon: '🛡️', mpCost: 15, damage: 1.2, type: 'attack' },
    { name: 'Rage', icon: '💢', mpCost: 20, damage: 2.0, type: 'attack' },
  ],
  archer: [
    { name: 'Arrow Shot', icon: '🏹', mpCost: 8, damage: 1.4, type: 'attack' },
    { name: 'Multi Shot', icon: '🎯', mpCost: 18, damage: 1.8, type: 'attack' },
    { name: 'Piercing Arrow', icon: '💨', mpCost: 25, damage: 2.2, type: 'attack' },
  ],
  mage: [
    { name: 'Fireball', icon: '🔥', mpCost: 12, damage: 1.6, type: 'attack' },
    { name: 'Ice Shard', icon: '❄️', mpCost: 15, damage: 1.4, type: 'attack' },
    { name: 'Thunder', icon: '⚡', mpCost: 30, damage: 2.5, type: 'attack' },
  ],
  healer: [
    { name: 'Holy Light', icon: '✨', mpCost: 10, damage: 1.2, type: 'attack' },
    { name: 'Smite', icon: '☀️', mpCost: 15, damage: 1.5, type: 'attack' },
    { name: 'Heal', icon: '💚', mpCost: 20, damage: 0.5, type: 'heal' },
  ],
  ninja: [
    { name: 'Shuriken', icon: '🗡️', mpCost: 8, damage: 1.3, type: 'attack' },
    { name: 'Shadow Strike', icon: '👤', mpCost: 18, damage: 1.8, type: 'attack' },
    { name: 'Assassinate', icon: '💀', mpCost: 35, damage: 3.0, type: 'attack' },
  ],
};

export default function CombatModal({
  isOpen,
  character,
  mob,
  onClose,
  onVictory,
  onDefeat,
}: CombatModalProps) {
  const [combatState, setCombatState] = useState<CombatState>({
    playerHp: character.hp,
    playerMp: character.mp,
    mobHp: mob.hp,
    turn: 'player',
    log: [],
    isOver: false,
    winner: null,
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [logCounter, setLogCounter] = useState(0);
  void logCounter; // Used to generate unique IDs

  const classColor = getClassColor(character.class);
  const skills = CLASS_SKILLS[character.class] || CLASS_SKILLS.warrior;

  // Reset combat state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCombatState({
        playerHp: character.hp,
        playerMp: character.mp,
        mobHp: mob.hp,
        turn: 'player',
        log: [{ id: 0, message: `Combat started with ${mob.name}!`, type: 'system' }],
        isOver: false,
        winner: null,
      });
      setLogCounter(1);
    }
  }, [isOpen, character.hp, character.mp, mob.hp, mob.name]);

  // Add log entry
  const addLog = useCallback((message: string, type: CombatLogEntry['type']) => {
    setLogCounter((prev) => {
      const newId = prev + 1;
      setCombatState((state) => ({
        ...state,
        log: [...state.log.slice(-10), { id: newId, message, type }],
      }));
      return newId;
    });
  }, []);

  // Calculate damage with variance
  const calculateDamage = useCallback((baseDamage: number, defense: number): { damage: number; isCrit: boolean; isMiss: boolean } => {
    // Miss chance (10%)
    if (Math.random() < 0.1) {
      return { damage: 0, isCrit: false, isMiss: true };
    }

    // Crit chance (based on character's crit_rate or 15% for mobs)
    const critChance = character.crit_rate / 100 || 0.15;
    const isCrit = Math.random() < critChance;

    // Base damage calculation
    let damage = baseDamage - defense * 0.5;
    damage = Math.max(1, damage); // Minimum 1 damage

    // Add variance (80% - 120%)
    damage = damage * (0.8 + Math.random() * 0.4);

    // Apply crit multiplier
    if (isCrit) {
      damage *= 1.5;
    }

    return { damage: Math.floor(damage), isCrit, isMiss: false };
  }, [character.crit_rate]);

  // Player basic attack
  const handleBasicAttack = useCallback(() => {
    if (combatState.turn !== 'player' || combatState.isOver || isAnimating) return;

    setIsAnimating(true);

    const { damage, isCrit, isMiss } = calculateDamage(character.attack, mob.defense);

    if (isMiss) {
      addLog(`Your attack missed!`, 'miss');
    } else if (isCrit) {
      addLog(`CRITICAL HIT! You dealt ${damage} damage to ${mob.name}!`, 'critical');
    } else {
      addLog(`You attacked ${mob.name} for ${damage} damage!`, 'player_attack');
    }

    setCombatState((state) => {
      const newMobHp = Math.max(0, state.mobHp - damage);
      const isOver = newMobHp <= 0;

      return {
        ...state,
        mobHp: newMobHp,
        turn: isOver ? 'player' : 'mob',
        isOver,
        winner: isOver ? 'player' : null,
      };
    });

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  }, [combatState.turn, combatState.isOver, isAnimating, character.attack, mob.defense, mob.name, addLog, calculateDamage]);

  // Player skill attack
  const handleSkillAttack = useCallback((skillIndex: number) => {
    if (combatState.turn !== 'player' || combatState.isOver || isAnimating) return;

    const skill = skills[skillIndex];
    if (!skill || combatState.playerMp < skill.mpCost) return;

    setIsAnimating(true);

    if (skill.type === 'heal') {
      const healAmount = Math.floor(character.max_hp * skill.damage);
      addLog(`You used ${skill.name} and recovered ${healAmount} HP!`, 'heal');

      setCombatState((state) => ({
        ...state,
        playerHp: Math.min(character.max_hp, state.playerHp + healAmount),
        playerMp: state.playerMp - skill.mpCost,
        turn: 'mob',
      }));
    } else {
      const baseDamage = character.attack * skill.damage;
      const { damage, isCrit, isMiss } = calculateDamage(baseDamage, mob.defense);

      if (isMiss) {
        addLog(`${skill.name} missed!`, 'miss');
      } else if (isCrit) {
        addLog(`CRITICAL ${skill.name}! Dealt ${damage} damage!`, 'critical');
      } else {
        addLog(`${skill.name} dealt ${damage} damage to ${mob.name}!`, 'skill');
      }

      setCombatState((state) => {
        const newMobHp = Math.max(0, state.mobHp - damage);
        const isOver = newMobHp <= 0;

        return {
          ...state,
          mobHp: newMobHp,
          playerMp: state.playerMp - skill.mpCost,
          turn: isOver ? 'player' : 'mob',
          isOver,
          winner: isOver ? 'player' : null,
        };
      });
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  }, [combatState.turn, combatState.isOver, combatState.playerMp, isAnimating, skills, character.attack, character.max_hp, mob.defense, mob.name, addLog, calculateDamage]);

  // Flee from combat
  const handleFlee = useCallback(() => {
    if (combatState.turn !== 'player' || combatState.isOver || isAnimating) return;

    // 50% chance to flee
    if (Math.random() < 0.5) {
      addLog('You successfully fled from combat!', 'system');
      setTimeout(() => onClose(), 1000);
    } else {
      addLog('Failed to escape!', 'system');
      setCombatState((state) => ({ ...state, turn: 'mob' }));
    }
  }, [combatState.turn, combatState.isOver, isAnimating, addLog, onClose]);

  // Mob turn
  useEffect(() => {
    if (combatState.turn !== 'mob' || combatState.isOver || isAnimating) return;

    const mobAttackTimeout = setTimeout(() => {
      setIsAnimating(true);

      const { damage, isCrit, isMiss } = calculateDamage(mob.attack, character.defense);

      if (isMiss) {
        addLog(`${mob.name}'s attack missed!`, 'miss');
      } else if (isCrit) {
        addLog(`${mob.name} landed a CRITICAL HIT for ${damage} damage!`, 'critical');
      } else {
        addLog(`${mob.name} attacked you for ${damage} damage!`, 'mob_attack');
      }

      setCombatState((state) => {
        const newPlayerHp = Math.max(0, state.playerHp - damage);
        const isOver = newPlayerHp <= 0;

        return {
          ...state,
          playerHp: newPlayerHp,
          turn: isOver ? 'mob' : 'player',
          isOver,
          winner: isOver ? 'mob' : null,
        };
      });

      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }, 1000);

    return () => clearTimeout(mobAttackTimeout);
  }, [combatState.turn, combatState.isOver, isAnimating, mob.attack, mob.name, character.defense, addLog, calculateDamage]);

  // Handle victory/defeat
  useEffect(() => {
    if (!combatState.isOver) return;

    const resultTimeout = setTimeout(() => {
      if (combatState.winner === 'player') {
        const expGained = mob.level * 50 + (mob.type === 'elite' ? 100 : mob.type === 'boss' ? 500 : 0);
        const goldGained = mob.level * 10 + Math.floor(Math.random() * mob.level * 5);
        addLog(`Victory! Gained ${expGained} EXP and ${goldGained} Gold!`, 'system');
        if (onVictory) {
          setTimeout(() => onVictory(mob, expGained, goldGained), 2000);
        }
      } else {
        addLog('You have been defeated...', 'system');
        if (onDefeat) {
          setTimeout(() => onDefeat(), 2000);
        }
      }
    }, 500);

    return () => clearTimeout(resultTimeout);
  }, [combatState.isOver, combatState.winner, mob, addLog, onVictory, onDefeat]);

  if (!isOpen) return null;

  const playerHpPercent = (combatState.playerHp / character.max_hp) * 100;
  const playerMpPercent = (combatState.playerMp / character.max_mp) * 100;
  const mobHpPercent = (combatState.mobHp / mob.maxHp) * 100;
  const mobColors = mob.type === 'boss' ? 'from-red-600 to-red-900' : mob.type === 'elite' ? 'from-purple-600 to-purple-900' : 'from-gray-600 to-gray-900';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl border-2 border-yellow-600/50 shadow-2xl w-[800px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/80 to-orange-900/80 px-4 py-3 border-b border-yellow-600/30">
          <h2 className="text-yellow-400 text-xl font-bold text-center" style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
            ⚔️ COMBAT ⚔️
          </h2>
        </div>

        {/* Combat Arena */}
        <div className="p-4">
          <div className="flex justify-between items-start gap-4 mb-4">
            {/* Player Side */}
            <div className="flex-1">
              <div
                className={`p-4 rounded-lg border-2 ${combatState.turn === 'player' ? 'border-green-500 shadow-lg shadow-green-500/30' : 'border-gray-600'}`}
                style={{
                  background: `linear-gradient(180deg, ${classColor.primary}40 0%, ${classColor.secondary}60 100%)`,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center border-2"
                    style={{
                      background: `linear-gradient(180deg, ${classColor.primary} 0%, ${classColor.secondary} 100%)`,
                      borderColor: classColor.primary,
                    }}
                  >
                    <span className="text-3xl">{classColor.icon}</span>
                  </div>
                  <div>
                    <div className="text-white font-bold">{character.name}</div>
                    <div className="text-gray-400 text-sm">Lv.{character.level} {character.class}</div>
                  </div>
                </div>

                {/* HP Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-red-400">HP</span>
                    <span className="text-red-300">{combatState.playerHp}/{character.max_hp}</span>
                  </div>
                  <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-red-900">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                      style={{ width: `${playerHpPercent}%` }}
                    />
                  </div>
                </div>

                {/* MP Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-blue-400">MP</span>
                    <span className="text-blue-300">{combatState.playerMp}/{character.max_mp}</span>
                  </div>
                  <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-blue-900">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                      style={{ width: `${playerMpPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* VS Indicator */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl text-yellow-500 font-bold" style={{ textShadow: '0 0 20px rgba(255,215,0,0.8)' }}>
                VS
              </div>
              <div className="text-gray-500 text-xs mt-1">
                {combatState.turn === 'player' ? 'Your Turn' : 'Enemy Turn'}
              </div>
            </div>

            {/* Mob Side */}
            <div className="flex-1">
              <div
                className={`p-4 rounded-lg border-2 bg-gradient-to-b ${mobColors} ${combatState.turn === 'mob' ? 'border-red-500 shadow-lg shadow-red-500/30' : 'border-gray-600'}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center border-2 bg-gradient-to-b ${mobColors} border-gray-500`}>
                    <span className="text-3xl">{mob.icon}</span>
                  </div>
                  <div>
                    <div className="text-white font-bold">{mob.name}</div>
                    <div className="text-gray-400 text-sm">
                      Lv.{mob.level}
                      {mob.type !== 'normal' && (
                        <span className={mob.type === 'boss' ? 'text-red-400' : 'text-purple-400'}> ({mob.type})</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mob HP Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-red-400">HP</span>
                    <span className="text-red-300">{combatState.mobHp}/{mob.maxHp}</span>
                  </div>
                  <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-red-900">
                    <div
                      className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-300"
                      style={{ width: `${mobHpPercent}%` }}
                    />
                  </div>
                </div>

                {/* Mob Stats */}
                <div className="flex gap-4 mt-2 text-xs">
                  <span className="text-orange-400">ATK: {mob.attack}</span>
                  <span className="text-blue-400">DEF: {mob.defense}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Combat Log */}
          <div className="bg-black/50 rounded-lg border border-gray-700 p-3 h-32 overflow-y-auto mb-4">
            {combatState.log.map((entry) => (
              <div
                key={entry.id}
                className={`text-sm mb-1 ${
                  entry.type === 'player_attack' ? 'text-green-400' :
                  entry.type === 'mob_attack' ? 'text-red-400' :
                  entry.type === 'skill' ? 'text-blue-400' :
                  entry.type === 'heal' ? 'text-emerald-400' :
                  entry.type === 'critical' ? 'text-yellow-400 font-bold' :
                  entry.type === 'miss' ? 'text-gray-500 italic' :
                  'text-gray-300'
                }`}
              >
                {entry.message}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          {!combatState.isOver && (
            <div className="space-y-3">
              {/* Basic Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleBasicAttack}
                  disabled={combatState.turn !== 'player' || isAnimating}
                  className="flex-1 py-3 bg-gradient-to-b from-red-600 to-red-800 text-white font-bold rounded-lg border-2 border-red-400 hover:from-red-500 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  ⚔️ Attack
                </button>
                <button
                  onClick={handleFlee}
                  disabled={combatState.turn !== 'player' || isAnimating}
                  className="px-6 py-3 bg-gradient-to-b from-gray-600 to-gray-800 text-white font-bold rounded-lg border-2 border-gray-400 hover:from-gray-500 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  🏃 Flee
                </button>
              </div>

              {/* Skills */}
              <div className="flex gap-2">
                {skills.map((skill, index) => (
                  <button
                    key={skill.name}
                    onClick={() => handleSkillAttack(index)}
                    disabled={combatState.turn !== 'player' || isAnimating || combatState.playerMp < skill.mpCost}
                    className={`flex-1 py-2 px-3 bg-gradient-to-b ${skill.type === 'heal' ? 'from-green-600 to-green-800 border-green-400' : 'from-blue-600 to-blue-800 border-blue-400'} text-white text-sm font-bold rounded-lg border-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                  >
                    <div>{skill.icon} {skill.name}</div>
                    <div className="text-xs text-blue-200">MP: {skill.mpCost}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Victory/Defeat Screen */}
          {combatState.isOver && (
            <div className="text-center py-6">
              {combatState.winner === 'player' ? (
                <div>
                  <div className="text-4xl text-yellow-400 font-bold mb-2" style={{ textShadow: '0 0 20px rgba(255,215,0,0.8)' }}>
                    🏆 VICTORY! 🏆
                  </div>
                  <p className="text-gray-300">You defeated {mob.name}!</p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl text-red-400 font-bold mb-2" style={{ textShadow: '0 0 20px rgba(255,0,0,0.8)' }}>
                    💀 DEFEATED 💀
                  </div>
                  <p className="text-gray-300">You were defeated by {mob.name}...</p>
                </div>
              )}
              <button
                onClick={onClose}
                className="mt-4 px-8 py-2 bg-gradient-to-b from-yellow-600 to-yellow-800 text-white font-bold rounded-lg border-2 border-yellow-400 hover:from-yellow-500 hover:to-yellow-700 transition-all"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import type { Character } from '../types';
import { getMobTemplate } from './mapData';
import type { CombatUnit, CombatState, CombatLogEntry, MapMob, MobTemplate } from './types';

interface CombatSystemProps {
  character: Character;
  mob: MapMob;
  onVictory: (rewards: CombatRewards) => void;
  onDefeat: () => void;
  onFlee: () => void;
}

export interface CombatRewards {
  experience: number;
  gold: number;
  items: { itemId: string; quantity: number }[];
}

// Convert character to combat unit
function characterToCombatUnit(character: Character): CombatUnit {
  return {
    id: character.id,
    name: character.name,
    isPlayer: true,
    hp: character.hp,
    maxHp: character.max_hp,
    mp: character.mp,
    maxMp: character.max_mp,
    attack: character.attack,
    defense: character.defense,
    speed: character.speed,
    critRate: character.crit_rate,
    position: 'front',
    skills: [
      {
        id: 'basic_attack',
        name: 'Temel Saldiri',
        type: 'attack',
        damage: 1.0,
        mpCost: 0,
        cooldown: 0,
        currentCooldown: 0,
        targetType: 'single',
      },
      {
        id: 'power_strike',
        name: 'Guclu Vurus',
        type: 'attack',
        damage: 1.5,
        mpCost: 10,
        cooldown: 2,
        currentCooldown: 0,
        targetType: 'single',
      },
      {
        id: 'heal',
        name: 'Iyilestirme',
        type: 'heal',
        healing: 50,
        mpCost: 15,
        cooldown: 3,
        currentCooldown: 0,
        targetType: 'self',
      },
    ],
    buffs: [],
    debuffs: [],
  };
}

// Convert mob template to combat unit
function mobToCombatUnit(mob: MapMob, template: MobTemplate): CombatUnit {
  const levelMultiplier = 1 + (mob.level - template.level) * 0.1;
  return {
    id: mob.id,
    name: template.name,
    isPlayer: false,
    hp: Math.floor(template.hp * levelMultiplier),
    maxHp: Math.floor(template.hp * levelMultiplier),
    mp: 50,
    maxMp: 50,
    attack: Math.floor(template.attack * levelMultiplier),
    defense: Math.floor(template.defense * levelMultiplier),
    speed: template.speed,
    critRate: 0.05,
    position: 'front',
    skills: [
      {
        id: 'basic_attack',
        name: 'Saldiri',
        type: 'attack',
        damage: 1.0,
        mpCost: 0,
        cooldown: 0,
        currentCooldown: 0,
        targetType: 'single',
      },
    ],
    buffs: [],
    debuffs: [],
  };
}

// Calculate damage
function calculateDamage(attacker: CombatUnit, defender: CombatUnit, skillMultiplier: number = 1.0): { damage: number; isCrit: boolean } {
  const baseDamage = attacker.attack * skillMultiplier;
  const reduction = defender.defense / (defender.defense + 100); // DR formula
  const damage = Math.max(1, Math.floor(baseDamage * (1 - reduction)));

  const isCrit = Math.random() < attacker.critRate;
  const finalDamage = isCrit ? Math.floor(damage * 1.5) : damage;

  return { damage: finalDamage, isCrit };
}

export default function CombatSystem({ character, mob, onVictory, onDefeat, onFlee }: CombatSystemProps) {
  const mobTemplate = getMobTemplate(mob.mobTemplateId);

  const [combatState, setCombatState] = useState<CombatState>(() => {
    if (!mobTemplate) {
      return {
        turn: 1,
        phase: 'player_turn',
        playerUnits: [],
        enemyUnits: [],
        turnOrder: [],
        currentUnitId: '',
        log: [],
      };
    }

    const player = characterToCombatUnit(character);
    const enemy = mobToCombatUnit(mob, mobTemplate);

    // Determine turn order by speed
    const units = [player, enemy].sort((a, b) => b.speed - a.speed);
    const turnOrder = units.map((u) => u.id);

    return {
      turn: 1,
      phase: units[0].isPlayer ? 'player_turn' : 'enemy_turn',
      playerUnits: [player],
      enemyUnits: [enemy],
      turnOrder,
      currentUnitId: turnOrder[0],
      log: [{ turn: 1, message: 'Savas basladi!', type: 'system' }],
    };
  });

  const [selectedSkill, setSelectedSkill] = useState<string | null>('basic_attack');
  const [isAnimating, setIsAnimating] = useState(false);

  // Add log entry
  const addLog = useCallback((message: string, type: CombatLogEntry['type']) => {
    setCombatState((prev) => ({
      ...prev,
      log: [...prev.log, { turn: prev.turn, message, type }],
    }));
  }, []);

  // Execute player action
  const executePlayerAction = useCallback(
    (skillId: string) => {
      if (isAnimating || combatState.phase !== 'player_turn') return;

      setIsAnimating(true);

      const player = combatState.playerUnits[0];
      const skill = player.skills.find((s) => s.id === skillId);
      if (!skill) return;

      // Check MP
      if (player.mp < skill.mpCost) {
        addLog('Yeterli MP yok!', 'system');
        setIsAnimating(false);
        return;
      }

      // Check cooldown
      if (skill.currentCooldown > 0) {
        addLog(`${skill.name} bekleme suresinde!`, 'system');
        setIsAnimating(false);
        return;
      }

      setCombatState((prev) => {
        const newState = { ...prev };
        const newPlayer = { ...newState.playerUnits[0] };
        const newEnemy = { ...newState.enemyUnits[0] };

        // Deduct MP
        newPlayer.mp -= skill.mpCost;

        // Set cooldown
        const playerSkill = newPlayer.skills.find((s) => s.id === skillId);
        if (playerSkill) {
          playerSkill.currentCooldown = skill.cooldown;
        }

        if (skill.type === 'attack') {
          const { damage, isCrit } = calculateDamage(newPlayer, newEnemy, skill.damage || 1.0);
          newEnemy.hp = Math.max(0, newEnemy.hp - damage);

          const critText = isCrit ? ' (Kritik!)' : '';
          newState.log = [
            ...newState.log,
            { turn: newState.turn, message: `${newPlayer.name} ${skill.name} kullanarak ${damage} hasar verdi!${critText}`, type: 'attack' },
          ];
        } else if (skill.type === 'heal') {
          const healAmount = skill.healing || 0;
          newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + healAmount);
          newState.log = [
            ...newState.log,
            { turn: newState.turn, message: `${newPlayer.name} ${healAmount} HP iyilestirdi!`, type: 'heal' },
          ];
        }

        newState.playerUnits = [newPlayer];
        newState.enemyUnits = [newEnemy];

        // Check if enemy died
        if (newEnemy.hp <= 0) {
          newState.phase = 'victory';
          newState.log = [...newState.log, { turn: newState.turn, message: `${newEnemy.name} yenildi!`, type: 'death' }];
        } else {
          // Switch to enemy turn
          newState.phase = 'enemy_turn';
        }

        return newState;
      });

      setTimeout(() => setIsAnimating(false), 500);
    },
    [combatState, isAnimating, addLog]
  );

  // Enemy AI turn
  useEffect(() => {
    if (combatState.phase !== 'enemy_turn' || isAnimating) return;

    setIsAnimating(true);

    const timer = setTimeout(() => {
      setCombatState((prev) => {
        const newState = { ...prev };
        const enemy = { ...newState.enemyUnits[0] };
        const player = { ...newState.playerUnits[0] };

        // Enemy basic attack
        const { damage, isCrit } = calculateDamage(enemy, player);
        player.hp = Math.max(0, player.hp - damage);

        const critText = isCrit ? ' (Kritik!)' : '';
        newState.log = [
          ...newState.log,
          { turn: newState.turn, message: `${enemy.name} saldirdi ve ${damage} hasar verdi!${critText}`, type: 'attack' },
        ];

        newState.playerUnits = [player];
        newState.enemyUnits = [enemy];

        // Check if player died
        if (player.hp <= 0) {
          newState.phase = 'defeat';
          newState.log = [...newState.log, { turn: newState.turn, message: `${player.name} yenildi!`, type: 'death' }];
        } else {
          // Reduce cooldowns and switch to player turn
          newState.playerUnits[0].skills.forEach((skill) => {
            if (skill.currentCooldown > 0) skill.currentCooldown--;
          });
          newState.turn++;
          newState.phase = 'player_turn';
        }

        return newState;
      });

      setIsAnimating(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [combatState.phase, isAnimating]);

  // Handle victory/defeat
  useEffect(() => {
    if (combatState.phase === 'victory' && mobTemplate) {
      const timer = setTimeout(() => {
        // Calculate rewards
        const goldDrop = Math.floor(
          Math.random() * (mobTemplate.goldDrop[1] - mobTemplate.goldDrop[0] + 1) + mobTemplate.goldDrop[0]
        );

        const items: { itemId: string; quantity: number }[] = [];
        mobTemplate.lootTable.forEach((loot) => {
          if (Math.random() < loot.dropChance) {
            const quantity = Math.floor(
              Math.random() * (loot.maxQuantity - loot.minQuantity + 1) + loot.minQuantity
            );
            items.push({ itemId: loot.itemId, quantity });
          }
        });

        onVictory({
          experience: mobTemplate.experience,
          gold: goldDrop,
          items,
        });
      }, 2000);

      return () => clearTimeout(timer);
    }

    if (combatState.phase === 'defeat') {
      const timer = setTimeout(() => {
        onDefeat();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [combatState.phase, mobTemplate, onVictory, onDefeat]);

  // Flee attempt
  const attemptFlee = () => {
    if (isAnimating || combatState.phase !== 'player_turn') return;

    const fleeChance = 0.5; // 50% chance to flee
    if (Math.random() < fleeChance) {
      addLog('Basariyla kactiniz!', 'system');
      setTimeout(onFlee, 500);
    } else {
      addLog('Kacma basarisiz! Dusmanin saldiri sirasi!', 'system');
      setCombatState((prev) => ({ ...prev, phase: 'enemy_turn' }));
    }
  };

  if (!mobTemplate) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-red-400">Hata: Mob bulunamadi!</p>
          <button onClick={onFlee} className="mt-4 btn-secondary">Geri Don</button>
        </div>
      </div>
    );
  }

  const player = combatState.playerUnits[0];
  const enemy = combatState.enemyUnits[0];

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full mx-4 overflow-hidden">
        {/* Combat Header */}
        <div className="bg-gray-900 px-6 py-3 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-xl font-bold text-yellow-400">Savas - Tur {combatState.turn}</h2>
          <span className={`text-sm font-bold ${combatState.phase === 'player_turn' ? 'text-green-400' : 'text-red-400'}`}>
            {combatState.phase === 'player_turn' ? 'Senin Siran' :
             combatState.phase === 'enemy_turn' ? 'Dusmanin Sirasi' :
             combatState.phase === 'victory' ? 'ZAFER!' : 'YENILGI!'}
          </span>
        </div>

        {/* Combat Arena */}
        <div className="p-6 grid grid-cols-3 gap-6">
          {/* Player Side */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-center mb-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-4xl mb-2">
                {character.class === 'warrior' ? '⚔️' :
                 character.class === 'archer' ? '🏹' :
                 character.class === 'mage' ? '🔮' :
                 character.class === 'healer' ? '✨' : '🗡️'}
              </div>
              <h3 className="font-bold text-green-400">{player?.name}</h3>
              <p className="text-gray-400 text-sm">Lv.{character.level}</p>
            </div>

            {/* Player HP */}
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-400">HP</span>
                <span>{player?.hp}/{player?.maxHp}</span>
              </div>
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                  style={{ width: `${((player?.hp || 0) / (player?.maxHp || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Player MP */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400">MP</span>
                <span>{player?.mp}/{player?.maxMp}</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                  style={{ width: `${((player?.mp || 0) / (player?.maxMp || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* VS / Combat Log */}
          <div className="flex flex-col">
            <div className="text-center mb-4">
              <span className="text-4xl font-bold text-yellow-500">VS</span>
            </div>

            {/* Combat Log */}
            <div className="flex-1 bg-gray-900 rounded-lg p-3 overflow-y-auto max-h-48">
              <h4 className="text-xs font-bold text-gray-400 mb-2">Savas Kaydı</h4>
              <div className="space-y-1">
                {combatState.log.slice(-8).map((entry, index) => (
                  <p
                    key={index}
                    className={`text-xs ${
                      entry.type === 'attack' ? 'text-red-300' :
                      entry.type === 'heal' ? 'text-green-300' :
                      entry.type === 'death' ? 'text-yellow-300' :
                      'text-gray-400'
                    }`}
                  >
                    {entry.message}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Enemy Side */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-center mb-4">
              <div className={`w-24 h-24 mx-auto ${mob.isBoss ? 'bg-gradient-to-br from-orange-500 to-red-700' : 'bg-gradient-to-br from-red-500 to-red-700'} rounded-full flex items-center justify-center text-4xl mb-2`}>
                {mob.isBoss ? '👑' : '👹'}
              </div>
              <h3 className="font-bold text-red-400">{mobTemplate.name}</h3>
              <p className="text-gray-400 text-sm">Lv.{mob.level}</p>
            </div>

            {/* Enemy HP */}
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-400">HP</span>
                <span>{enemy?.hp}/{enemy?.maxHp}</span>
              </div>
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-800 to-red-600 transition-all duration-300"
                  style={{ width: `${((enemy?.hp || 0) / (enemy?.maxHp || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Enemy Stats */}
            <div className="text-xs text-gray-400 mt-3">
              <p>ATK: {enemy?.attack} | DEF: {enemy?.defense}</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-gray-900 px-6 py-4 border-t border-gray-700">
          {combatState.phase === 'player_turn' && (
            <div className="flex flex-wrap gap-3 justify-center">
              {player?.skills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => executePlayerAction(skill.id)}
                  disabled={isAnimating || skill.currentCooldown > 0 || player.mp < skill.mpCost}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    selectedSkill === skill.id
                      ? 'bg-yellow-500 text-black'
                      : skill.currentCooldown > 0 || player.mp < skill.mpCost
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                  onMouseEnter={() => setSelectedSkill(skill.id)}
                >
                  {skill.name}
                  {skill.mpCost > 0 && <span className="ml-1 text-xs text-blue-400">({skill.mpCost} MP)</span>}
                  {skill.currentCooldown > 0 && <span className="ml-1 text-xs text-red-400">({skill.currentCooldown})</span>}
                </button>
              ))}
              <button
                onClick={attemptFlee}
                disabled={isAnimating}
                className="px-4 py-2 rounded-lg font-bold bg-gray-600 hover:bg-gray-500 text-white"
              >
                Kac
              </button>
            </div>
          )}

          {combatState.phase === 'enemy_turn' && (
            <div className="text-center text-yellow-400 animate-pulse">
              Dusman saldiriyor...
            </div>
          )}

          {combatState.phase === 'victory' && (
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400 mb-2">ZAFER!</p>
              <p className="text-gray-400">Oduller hesaplaniyor...</p>
            </div>
          )}

          {combatState.phase === 'defeat' && (
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400 mb-2">YENILGI!</p>
              <p className="text-gray-400">Koye donuyorsunuz...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

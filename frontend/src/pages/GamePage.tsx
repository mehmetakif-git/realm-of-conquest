import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '../stores/characterStore';
import { useCaravanStore } from '../stores/caravanStore';
import { gameApi, type CharacterGMInfo } from '../services/gameApi';
import { GameLayout } from '../components/layout';
import { GameWorld, type Mob, type NPC } from '../components/game';
import { CombatModal } from '../components/modals';
import { FlagSelector } from '../components/flag';
import { CaravanCreateModal, CaravanListModal } from '../components/caravan';
import type { FlagType } from '../types';
import type { Caravan } from '../types/caravan';
import { CARAVAN_TYPES } from '../types/caravan';

// Initial mobs for the starting area
const STARTING_MOBS: Mob[] = [
  { id: 'mob1', name: 'Forest Wolf', level: 3, hp: 100, maxHp: 100, x: 25, y: 30, icon: '🐺', type: 'normal', attack: 15, defense: 5 },
  { id: 'mob2', name: 'Wild Boar', level: 2, hp: 120, maxHp: 120, x: 60, y: 20, icon: '🐗', type: 'normal', attack: 12, defense: 8 },
  { id: 'mob3', name: 'Goblin Scout', level: 4, hp: 80, maxHp: 80, x: 75, y: 55, icon: '👺', type: 'normal', attack: 18, defense: 4 },
  { id: 'mob4', name: 'Forest Spider', level: 3, hp: 70, maxHp: 70, x: 40, y: 65, icon: '🕷️', type: 'normal', attack: 14, defense: 3 },
  { id: 'mob5', name: 'Stone Golem', level: 8, hp: 300, maxHp: 300, x: 85, y: 75, icon: '🗿', type: 'elite', attack: 35, defense: 25 },
  { id: 'mob6', name: 'Dark Witch', level: 10, hp: 500, maxHp: 500, x: 15, y: 80, icon: '🧙', type: 'boss', attack: 50, defense: 15 },
];

// NPCs for the starting area
const STARTING_NPCS: NPC[] = [
  { id: 'npc1', name: 'Merchant Arin', type: 'merchant', x: 50, y: 85, icon: '🧔', dialogue: 'Finest goods in the realm!' },
  { id: 'npc2', name: 'Blacksmith Borin', type: 'blacksmith', x: 35, y: 90, icon: '⚒️', dialogue: 'Need something forged?' },
  { id: 'npc3', name: 'Elder Mira', type: 'quest_giver', x: 65, y: 88, icon: '👵', dialogue: 'Hero! I have a task for you...' },
  { id: 'npc4', name: 'Healer Luna', type: 'healer', x: 45, y: 92, icon: '💚', dialogue: 'Let me tend to your wounds.' },
];

export default function GamePage() {
  const navigate = useNavigate();
  const { selectedCharacter, updateCharacter } = useCharacterStore();

  // Data State
  const [myGMInfo, setMyGMInfo] = useState<CharacterGMInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Game World State
  const [mobs, setMobs] = useState<Mob[]>(STARTING_MOBS);
  const [npcs] = useState<NPC[]>(STARTING_NPCS);

  // Combat State
  const [combatMob, setCombatMob] = useState<Mob | null>(null);
  const [isCombatOpen, setIsCombatOpen] = useState(false);

  // Flag State
  const [isFlagSelectorOpen, setIsFlagSelectorOpen] = useState(false);
  const [flagCooldownRemaining, setFlagCooldownRemaining] = useState(0);

  // Caravan State
  const { caravans, createCaravan, joinAsGuard, leaveGuard, attackCaravan } = useCaravanStore();
  const [isCaravanCreateOpen, setIsCaravanCreateOpen] = useState(false);
  const [isCaravanListOpen, setIsCaravanListOpen] = useState(false);

  useEffect(() => {
    if (!selectedCharacter) {
      navigate('/characters');
      return;
    }

    fetchGameData();
    const interval = setInterval(fetchGameData, 30000);
    return () => clearInterval(interval);
  }, [selectedCharacter, navigate]);

  const fetchGameData = async () => {
    if (!selectedCharacter) return;

    try {
      const gmInfo = await gameApi.getCharacterGMInfo(selectedCharacter.id).catch(() => ({ is_gm: false }));
      setMyGMInfo(gmInfo);
    } catch (error) {
      console.error('Failed to fetch game data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mob click - start combat
  const handleMobClick = useCallback((mob: Mob) => {
    setCombatMob(mob);
    setIsCombatOpen(true);
  }, []);

  // Handle NPC click
  const handleNPCClick = useCallback((npc: NPC) => {
    console.log(`Clicked NPC: ${npc.name} (${npc.type})`);
    // TODO: Open appropriate dialog based on NPC type
    switch (npc.type) {
      case 'merchant':
        console.log('Opening shop...');
        break;
      case 'blacksmith':
        console.log('Opening forge...');
        break;
      case 'quest_giver':
        console.log('Opening quest dialog...');
        break;
      case 'healer':
        console.log('Healing player...');
        if (selectedCharacter && updateCharacter) {
          updateCharacter({
            ...selectedCharacter,
            hp: selectedCharacter.max_hp,
            mp: selectedCharacter.max_mp,
          });
        }
        break;
      default:
        break;
    }
  }, [selectedCharacter, updateCharacter]);

  // Handle player movement
  const handlePlayerMove = useCallback((x: number, y: number) => {
    if (selectedCharacter && updateCharacter) {
      updateCharacter({
        ...selectedCharacter,
        position_x: Math.round(x),
        position_y: Math.round(y),
      });
    }
  }, [selectedCharacter, updateCharacter]);

  // Handle combat victory
  const handleCombatVictory = useCallback((mob: Mob, expGained: number, goldGained: number) => {
    // Remove defeated mob
    setMobs((prev) => prev.filter((m) => m.id !== mob.id));

    // Update character stats
    if (selectedCharacter && updateCharacter) {
      const newExp = selectedCharacter.experience + expGained;
      const newGold = selectedCharacter.gold + goldGained;

      // Simple leveling logic
      let newLevel = selectedCharacter.level;
      let remainingExp = newExp;

      while (remainingExp >= newLevel * 1000) {
        remainingExp -= newLevel * 1000;
        newLevel++;
      }

      updateCharacter({
        ...selectedCharacter,
        experience: remainingExp,
        gold: newGold,
        level: newLevel,
        // Restore some HP/MP on level up
        hp: newLevel > selectedCharacter.level ? selectedCharacter.max_hp : selectedCharacter.hp,
        mp: newLevel > selectedCharacter.level ? selectedCharacter.max_mp : selectedCharacter.mp,
      });
    }

    setIsCombatOpen(false);
    setCombatMob(null);

    // Respawn mob after 30 seconds
    setTimeout(() => {
      setMobs((prev) => {
        if (!prev.find((m) => m.id === mob.id)) {
          return [...prev, { ...mob, hp: mob.maxHp }];
        }
        return prev;
      });
    }, 30000);
  }, [selectedCharacter, updateCharacter]);

  // Handle combat defeat
  const handleCombatDefeat = useCallback(() => {
    // Respawn player at starting position
    if (selectedCharacter && updateCharacter) {
      updateCharacter({
        ...selectedCharacter,
        hp: Math.floor(selectedCharacter.max_hp * 0.3), // Respawn with 30% HP
        mp: Math.floor(selectedCharacter.max_mp * 0.3), // Respawn with 30% MP
        position_x: 50,
        position_y: 50,
      });
    }

    setIsCombatOpen(false);
    setCombatMob(null);
  }, [selectedCharacter, updateCharacter]);

  // Close combat modal
  const handleCloseCombat = useCallback(() => {
    setIsCombatOpen(false);
    setCombatMob(null);
  }, []);

  // Handle flag click - open selector
  const handleFlagClick = useCallback(() => {
    // Calculate cooldown remaining
    if (selectedCharacter?.flag_changed_at) {
      const changedAt = new Date(selectedCharacter.flag_changed_at).getTime();
      const cooldownEnd = changedAt + 30 * 60 * 1000; // 30 minutes
      const remaining = Math.max(0, cooldownEnd - Date.now());
      setFlagCooldownRemaining(remaining);
    } else {
      setFlagCooldownRemaining(0);
    }
    setIsFlagSelectorOpen(true);
  }, [selectedCharacter?.flag_changed_at]);

  // Handle flag change
  const handleFlagChange = useCallback((newFlag: FlagType) => {
    if (selectedCharacter && updateCharacter) {
      updateCharacter({
        ...selectedCharacter,
        flag_type: newFlag,
        flag_changed_at: new Date().toISOString(),
      });
    }
    setIsFlagSelectorOpen(false);
  }, [selectedCharacter, updateCharacter]);

  // Handle caravan creation
  const handleCaravanCreate = useCallback((typeId: number, routeId: number, investment: number) => {
    if (selectedCharacter && updateCharacter) {
      createCaravan(
        selectedCharacter.id,
        selectedCharacter.name,
        selectedCharacter.level,
        typeId,
        routeId,
        investment
      );

      // Deduct gold from player
      const type = CARAVAN_TYPES.find(t => t.id === typeId);
      if (type) {
        const totalCost = type.baseCost + investment;
        updateCharacter({
          ...selectedCharacter,
          gold: selectedCharacter.gold - totalCost,
        });
      }
    }
    setIsCaravanCreateOpen(false);
  }, [selectedCharacter, updateCharacter, createCaravan]);

  // Handle joining caravan as guard
  const handleJoinAsGuard = useCallback((caravanId: string) => {
    if (selectedCharacter) {
      joinAsGuard(
        caravanId,
        selectedCharacter.id,
        selectedCharacter.name,
        selectedCharacter.level,
        selectedCharacter.class
      );
    }
  }, [selectedCharacter, joinAsGuard]);

  // Handle leaving caravan guard
  const handleLeaveGuard = useCallback((caravanId: string) => {
    if (selectedCharacter) {
      leaveGuard(caravanId, selectedCharacter.id);
    }
  }, [selectedCharacter, leaveGuard]);

  // Handle attacking caravan
  const handleAttackCaravan = useCallback((caravanId: string) => {
    if (selectedCharacter) {
      attackCaravan(caravanId, selectedCharacter.id);
    }
  }, [selectedCharacter, attackCaravan]);

  // Handle caravan click from map
  const handleCaravanClick = useCallback((_caravan: Caravan) => {
    setIsCaravanListOpen(true);
  }, []);

  if (!selectedCharacter) {
    return null;
  }

  // Event Handlers
  const handleSettingsClick = () => {
    console.log('Settings clicked');
  };

  const handleNotificationsClick = () => {
    console.log('Notifications clicked');
  };

  const handleRechargeClick = () => {
    console.log('Recharge clicked');
  };

  const handleMapClick = () => {
    console.log('Map clicked');
  };

  const handleFullMapClick = () => {
    console.log('Full map clicked');
  };

  const handleGoNowClick = () => {
    console.log('Go now clicked');
  };

  const handleQuestClick = () => {
    console.log('Quest clicked');
  };

  return (
    <>
      <GameLayout
        character={selectedCharacter}
        isGM={myGMInfo?.is_gm || false}
        gmRole={myGMInfo?.role}
        isLoading={isLoading}
        serverName="Pantheon"
        serverNumber={1}
        // Event handlers
        onSettingsClick={handleSettingsClick}
        onNotificationsClick={handleNotificationsClick}
        onRechargeClick={handleRechargeClick}
        onMapClick={handleMapClick}
        onFullMapClick={handleFullMapClick}
        onGoNowClick={handleGoNowClick}
        onQuestClick={handleQuestClick}
        onFlagClick={handleFlagClick}
        onCaravanClick={() => setIsCaravanListOpen(true)}
      >
        {/* Game World */}
        <GameWorld
          character={selectedCharacter}
          mobs={mobs}
          npcs={npcs}
          caravans={caravans}
          onMobClick={handleMobClick}
          onNPCClick={handleNPCClick}
          onPlayerMove={handlePlayerMove}
          onCaravanClick={handleCaravanClick}
        />
      </GameLayout>

      {/* Combat Modal */}
      {combatMob && (
        <CombatModal
          isOpen={isCombatOpen}
          character={selectedCharacter}
          mob={combatMob}
          onClose={handleCloseCombat}
          onVictory={handleCombatVictory}
          onDefeat={handleCombatDefeat}
        />
      )}

      {/* Flag Selector Modal */}
      {isFlagSelectorOpen && (
        <FlagSelector
          currentFlag={selectedCharacter.flag_type || 'neutral'}
          infamy={selectedCharacter.infamy || 0}
          karma={selectedCharacter.karma || 0}
          cooldownRemaining={flagCooldownRemaining}
          onSelectFlag={handleFlagChange}
          onClose={() => setIsFlagSelectorOpen(false)}
        />
      )}

      {/* Caravan Create Modal */}
      {isCaravanCreateOpen && (
        <CaravanCreateModal
          playerGold={selectedCharacter.gold}
          playerLevel={selectedCharacter.level}
          onClose={() => setIsCaravanCreateOpen(false)}
          onCreate={handleCaravanCreate}
        />
      )}

      {/* Caravan List Modal */}
      {isCaravanListOpen && (
        <CaravanListModal
          caravans={caravans}
          playerFlag={selectedCharacter.flag_type || 'neutral'}
          playerLevel={selectedCharacter.level}
          playerId={selectedCharacter.id}
          onClose={() => setIsCaravanListOpen(false)}
          onJoinAsGuard={handleJoinAsGuard}
          onAttack={handleAttackCaravan}
          onLeaveGuard={handleLeaveGuard}
          onCreateCaravan={() => {
            setIsCaravanListOpen(false);
            setIsCaravanCreateOpen(true);
          }}
        />
      )}
    </>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '../stores/characterStore';
import { gameApi, type OnlineGM, type CharacterGMInfo } from '../services/gameApi';
import { messageApi } from '../services/messageApi';
import { GameLayout } from '../components/layout';

export default function GamePage() {
  const navigate = useNavigate();
  const { selectedCharacter, selectCharacter } = useCharacterStore();

  // Data State
  const [onlineGMs, setOnlineGMs] = useState<OnlineGM[]>([]);
  const [myGMInfo, setMyGMInfo] = useState<CharacterGMInfo | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState<string>('');
  const [showChat, setShowChat] = useState(false);

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
      const [gms, gmInfo, unread] = await Promise.all([
        gameApi.getOnlineGMs().catch(() => []),
        gameApi.getCharacterGMInfo(selectedCharacter.id).catch(() => ({ is_gm: false })),
        messageApi.getUnreadCount().catch(() => 0),
      ]);

      setOnlineGMs(gms);
      setMyGMInfo(gmInfo);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch game data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedCharacter) {
    return null;
  }

  // Event Handlers
  const handleBackClick = () => {
    selectCharacter(null);
    navigate('/characters');
  };

  const handleBattleClick = () => {
    setActiveTab(activeTab === 'battle' ? '' : 'battle');
  };

  const handleMapClick = () => {
    setActiveTab(activeTab === 'map' ? '' : 'map');
  };

  const handleChatClick = () => {
    setShowChat(!showChat);
    setActiveTab(showChat ? '' : 'chat');
  };

  const handleSettingsClick = () => {
    // TODO: Open settings modal
    console.log('Settings clicked');
  };

  const handleNotificationsClick = () => {
    // TODO: Open notifications modal
    console.log('Notifications clicked');
  };

  const handleInventoryClick = () => {
    // TODO: Open inventory modal
    console.log('Inventory clicked');
  };

  const handleQuestsClick = () => {
    // TODO: Open quests modal
    console.log('Quests clicked');
  };

  const handleSkillsClick = () => {
    // TODO: Open skills modal
    console.log('Skills clicked');
  };

  const handlePartyClick = () => {
    // TODO: Open party modal
    console.log('Party clicked');
  };

  const handleMarketClick = () => {
    // TODO: Open market modal
    console.log('Market clicked');
  };

  const handleGuildClick = () => {
    // TODO: Open guild modal
    console.log('Guild clicked');
  };

  const handleMenuClick = () => {
    // TODO: Open menu dropdown
    console.log('Menu clicked');
  };

  return (
    <GameLayout
      character={selectedCharacter}
      isGM={myGMInfo?.is_gm || false}
      gmRole={myGMInfo?.role}
      onlineGMs={onlineGMs}
      activeTab={activeTab}
      unreadMessages={unreadCount}
      isLoading={isLoading}
      // Event handlers
      onBackClick={handleBackClick}
      onSettingsClick={handleSettingsClick}
      onNotificationsClick={handleNotificationsClick}
      onInventoryClick={handleInventoryClick}
      onQuestsClick={handleQuestsClick}
      onSkillsClick={handleSkillsClick}
      onPartyClick={handlePartyClick}
      onBattleClick={handleBattleClick}
      onMapClick={handleMapClick}
      onMarketClick={handleMarketClick}
      onGuildClick={handleGuildClick}
      onChatClick={handleChatClick}
      onMenuClick={handleMenuClick}
    />
  );
}

import { ReactNode } from 'react';
import type { Character } from '../../types';
import Header from './Header';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import BottomBar from './BottomBar';
import GameArea from './GameArea';

interface GameLayoutProps {
  character: Character;
  children?: ReactNode;
  // Header props
  isGM?: boolean;
  gmRole?: string;
  // Left panel props
  onlineGMs?: { gm_name: string; role: string }[];
  // Right panel props
  activeQuests?: { id: string; title: string; progress: string }[];
  activeBuffs?: { id: string; name: string; icon: string; duration: number }[];
  // Bottom bar props
  activeTab?: string;
  unreadMessages?: number;
  // Event handlers
  onBackClick?: () => void;
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  onInventoryClick?: () => void;
  onQuestsClick?: () => void;
  onSkillsClick?: () => void;
  onPartyClick?: () => void;
  onBattleClick?: () => void;
  onMapClick?: () => void;
  onMarketClick?: () => void;
  onGuildClick?: () => void;
  onChatClick?: () => void;
  onMenuClick?: () => void;
  // Content options
  showGameArea?: boolean;
  isLoading?: boolean;
}

export default function GameLayout({
  character,
  children,
  isGM = false,
  gmRole,
  onlineGMs = [],
  activeQuests,
  activeBuffs,
  activeTab,
  unreadMessages = 0,
  onBackClick,
  onSettingsClick,
  onNotificationsClick,
  onInventoryClick,
  onQuestsClick,
  onSkillsClick,
  onPartyClick,
  onBattleClick,
  onMapClick,
  onMarketClick,
  onGuildClick,
  onChatClick,
  onMenuClick,
  showGameArea = true,
  isLoading = false,
}: GameLayoutProps) {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0f0f1a]">
      {/* Header */}
      <Header
        character={character}
        isGM={isGM}
        gmRole={gmRole}
        onSettingsClick={onSettingsClick}
        onNotificationsClick={onNotificationsClick}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <LeftPanel
          character={character}
          onlineGMs={onlineGMs}
          onBackClick={onBackClick}
          onSettingsClick={onSettingsClick}
          onInventoryClick={onInventoryClick}
          onQuestsClick={onQuestsClick}
          onSkillsClick={onSkillsClick}
          onPartyClick={onPartyClick}
        />

        {/* Game Area or Custom Content */}
        {children ? (
          <main className="flex-1 bg-[#0a0a12] overflow-hidden">
            {children}
          </main>
        ) : showGameArea ? (
          <GameArea character={character} isLoading={isLoading} />
        ) : (
          <main className="flex-1 bg-[#0a0a12]" />
        )}

        {/* Right Panel */}
        <RightPanel
          character={character}
          activeQuests={activeQuests}
          activeBuffs={activeBuffs}
        />
      </div>

      {/* Bottom Bar */}
      <BottomBar
        activeTab={activeTab}
        unreadMessages={unreadMessages}
        onBattleClick={onBattleClick}
        onMapClick={onMapClick}
        onMarketClick={onMarketClick}
        onGuildClick={onGuildClick}
        onChatClick={onChatClick}
        onMenuClick={onMenuClick}
      />
    </div>
  );
}

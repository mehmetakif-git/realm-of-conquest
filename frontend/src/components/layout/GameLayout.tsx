import { ReactNode } from 'react';
import type { Character } from '../../types';
import Header from './Header';
import { CharacterPanel, MiniMap, QuestPanel, ChatPanel, SkillBar, MenuBar } from '../overlay';

interface Quest {
  id: string;
  title: string;
  chapter?: string;
  description: string;
  progress?: number;
  maxProgress?: number;
  nextStep?: string;
  isComplete?: boolean;
}

interface GameLayoutProps {
  character: Character;
  children?: ReactNode;
  // Header props
  isGM?: boolean;
  gmRole?: string;
  // Character panel props
  battleRating?: number;
  // Mini map props
  serverName?: string;
  serverNumber?: number;
  // Quest props
  activeQuest?: Quest;
  // Event handlers
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  onRechargeClick?: () => void;
  onMapClick?: () => void;
  onFullMapClick?: () => void;
  onGoNowClick?: () => void;
  onQuestClick?: () => void;
  onSendMessage?: (message: string, channel: string) => void;
  onSkillClick?: (skillId: string) => void;
  onCharacterClick?: () => void;
  onInventoryClick?: () => void;
  onMarketClick?: () => void;
  onCaravanClick?: () => void;
  onEnhancementClick?: () => void;
  onTitleClick?: () => void;
  onFlagClick?: () => void;
  // Content options
  isLoading?: boolean;
}

export default function GameLayout({
  character,
  children,
  isGM = false,
  gmRole,
  battleRating,
  serverName,
  serverNumber,
  activeQuest,
  onSettingsClick,
  onNotificationsClick,
  onRechargeClick,
  onMapClick,
  onFullMapClick,
  onGoNowClick,
  onQuestClick,
  onSendMessage,
  onSkillClick,
  onCharacterClick,
  onInventoryClick,
  onMarketClick,
  onCaravanClick,
  onEnhancementClick,
  onTitleClick,
  onFlagClick,
  isLoading = false,
}: GameLayoutProps) {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0f0f1a]">
      {/* Header - Outside game area */}
      <Header
        character={character}
        isGM={isGM}
        gmRole={gmRole}
        onSettingsClick={onSettingsClick}
        onNotificationsClick={onNotificationsClick}
      />

      {/* Game Area Container - Full screen minus header */}
      <div className="flex-1 relative overflow-hidden">
        {/* Game Area Background - Fills entire space */}
        <div className="absolute inset-0 bg-[#0a0a12]">
          {children || <DefaultGameArea character={character} isLoading={isLoading} />}
        </div>

        {/* Overlay UI Elements */}
        {/* Top-Left: Character Panel */}
        <CharacterPanel
          character={character}
          battleRating={battleRating}
          onRechargeClick={onRechargeClick}
          onTitleClick={onTitleClick}
          onFlagClick={onFlagClick}
        />

        {/* Top-Right: Mini Map */}
        <MiniMap
          character={character}
          serverName={serverName}
          serverNumber={serverNumber}
          onMapClick={onMapClick}
          onFullMapClick={onFullMapClick}
        />

        {/* Right Side Below Mini Map: Quest Panel */}
        <QuestPanel
          activeQuest={activeQuest}
          onGoNowClick={onGoNowClick}
          onQuestClick={onQuestClick}
        />

        {/* Bottom-Left: Chat Panel */}
        <ChatPanel onSendMessage={onSendMessage} />

        {/* Bottom-Center: Skill Bar with HP/MP/EXP */}
        <SkillBar character={character} onSkillClick={onSkillClick} />

        {/* Bottom-Right: Menu Buttons */}
        <MenuBar
          onCharacterClick={onCharacterClick}
          onInventoryClick={onInventoryClick}
          onMarketClick={onMarketClick}
          onCaravanClick={onCaravanClick}
          onEnhancementClick={onEnhancementClick}
        />
      </div>
    </div>
  );
}

// Default Game Area Content
function DefaultGameArea({ character, isLoading }: { character: Character; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-yellow-400 font-bold">Harita yukleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,215,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,215,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Fantasy Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at center, rgba(30,30,60,0.8) 0%, rgba(10,10,20,1) 100%),
            linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)
          `,
        }}
      />

      {/* Center Glow Effect */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)',
        }}
      />

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-500/50 rounded-full animate-ping" />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-blue-500/30 rounded-full animate-pulse" />
      <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-purple-500/40 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-green-500/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />

      {/* Center placeholder text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-sm">Oyun alani</p>
          <p className="text-gray-700 text-xs mt-1">{character.map_id || 'Starting Village'}</p>
        </div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-yellow-500/20" />
      <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-yellow-500/20" />
      <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-yellow-500/20" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-yellow-500/20" />
    </div>
  );
}

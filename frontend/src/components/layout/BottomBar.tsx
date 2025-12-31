import { FantasyButton } from '../ui';

interface BottomBarProps {
  onBattleClick?: () => void;
  onMapClick?: () => void;
  onMarketClick?: () => void;
  onGuildClick?: () => void;
  onChatClick?: () => void;
  onMenuClick?: () => void;
  activeTab?: string;
  unreadMessages?: number;
}

export default function BottomBar({
  onBattleClick,
  onMapClick,
  onMarketClick,
  onGuildClick,
  onChatClick,
  onMenuClick,
  activeTab,
  unreadMessages = 0,
}: BottomBarProps) {
  return (
    <footer className="h-16 bg-gradient-to-t from-[#0f0f1a] to-[#1a1a2e] border-t-2 border-[#333355] px-4 flex items-center justify-center">
      <div className="flex items-center gap-3">
        {/* Battle */}
        <FantasyButton
          variant={activeTab === 'battle' ? 'red' : 'dark'}
          size="medium"
          icon="⚔️"
          onClick={onBattleClick}
          glowing={activeTab === 'battle'}
        >
          Savas
        </FantasyButton>

        {/* Map */}
        <FantasyButton
          variant={activeTab === 'map' ? 'blue' : 'dark'}
          size="medium"
          icon="🗺️"
          onClick={onMapClick}
        >
          Harita
        </FantasyButton>

        {/* Market */}
        <FantasyButton
          variant="dark"
          size="medium"
          icon="🏪"
          onClick={onMarketClick}
        >
          Market
        </FantasyButton>

        {/* Guild */}
        <FantasyButton
          variant="dark"
          size="medium"
          icon="🏰"
          onClick={onGuildClick}
        >
          Lonca
        </FantasyButton>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-600 mx-2" />

        {/* Chat */}
        <div className="relative">
          <FantasyButton
            variant={activeTab === 'chat' ? 'gold' : 'dark'}
            size="medium"
            icon="💬"
            onClick={onChatClick}
          >
            Chat
          </FantasyButton>
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
              {unreadMessages > 9 ? '9+' : unreadMessages}
            </span>
          )}
        </div>

        {/* Menu */}
        <FantasyButton
          variant="dark"
          size="medium"
          icon="📋"
          onClick={onMenuClick}
        >
          Menu
        </FantasyButton>
      </div>

      {/* Skill Bar - placeholder for combat */}
      {activeTab === 'battle' && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-20 flex items-center gap-2 bg-black/80 px-4 py-2 rounded-lg border border-red-500/30">
          {[1, 2, 3, 4, 5, 6].map((slot) => (
            <div
              key={slot}
              className="w-12 h-12 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg border-2 border-gray-600 hover:border-yellow-500 flex items-center justify-center cursor-pointer transition-colors"
              title={`Skill ${slot}`}
            >
              <span className="text-gray-500 text-xs">{slot}</span>
            </div>
          ))}
        </div>
      )}
    </footer>
  );
}

interface MenuBarProps {
  onCharacterClick?: () => void;
  onInventoryClick?: () => void;
  onMarketClick?: () => void;
  onCaravanClick?: () => void;
}

interface MenuButton {
  id: string;
  label: string;
  icon: string;
  onClick?: () => void;
}

export default function MenuBar({
  onCharacterClick,
  onInventoryClick,
  onMarketClick,
  onCaravanClick,
}: MenuBarProps) {
  const menuButtons: MenuButton[] = [
    { id: 'character', label: 'CHARACTER', icon: '👤', onClick: onCharacterClick },
    { id: 'inventory', label: 'INVENTORY', icon: '🎒', onClick: onInventoryClick },
    { id: 'market', label: 'MARKET', icon: '🏪', onClick: onMarketClick },
    { id: 'caravan', label: 'KERVAN', icon: '🐪', onClick: onCaravanClick },
  ];

  return (
    <div className="absolute bottom-2 right-2 z-30">
      <div className="flex items-end gap-2">
        {menuButtons.map((button) => (
          <button
            key={button.id}
            onClick={button.onClick}
            className="group flex flex-col items-center"
          >
            {/* Icon Container */}
            <div className="w-14 h-14 bg-gradient-to-b from-yellow-700 to-yellow-900 rounded-lg border-2 border-yellow-600 flex items-center justify-center hover:from-yellow-600 hover:to-yellow-800 hover:scale-105 transition-all shadow-lg">
              <span className="text-2xl">{button.icon}</span>
            </div>
            {/* Label */}
            <span className="text-[9px] text-yellow-400 font-bold mt-1 group-hover:text-yellow-300">
              {button.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

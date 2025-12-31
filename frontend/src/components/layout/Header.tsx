import type { Character } from '../../types';
import { getClassColor } from '../../styles/theme';

interface HeaderProps {
  character: Character;
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  isGM?: boolean;
  gmRole?: string;
}

const GM_ROLE_COLORS: Record<string, string> = {
  helper: 'text-blue-400 border-blue-500',
  moderator: 'text-green-400 border-green-500',
  game_master: 'text-purple-400 border-purple-500',
  admin: 'text-orange-400 border-orange-500',
  owner: 'text-red-400 border-red-500',
};

const GM_ROLE_NAMES: Record<string, string> = {
  helper: 'Helper',
  moderator: 'Mod',
  game_master: 'GM',
  admin: 'Admin',
  owner: 'Owner',
};

export default function Header({
  character,
  onSettingsClick,
  onNotificationsClick,
  isGM = false,
  gmRole,
}: HeaderProps) {
  const classColor = getClassColor(character.class);

  return (
    <header className="h-14 bg-gradient-to-r from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] border-b-2 border-[#333355] px-4 flex items-center justify-between shadow-lg">
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        <h1 className="font-bold text-xl tracking-wide">
          <span className="text-yellow-500">REALM</span>
          <span className="text-white mx-1">of</span>
          <span className="text-orange-500">CONQUEST</span>
        </h1>
      </div>

      {/* Center: Character Info */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{classColor.icon}</span>
          <div className="text-center">
            <div className="text-white font-bold text-sm">{character.name}</div>
            <div className="text-gray-400 text-xs">
              Lv.{character.level} • {character.class.charAt(0).toUpperCase() + character.class.slice(1)}
            </div>
          </div>
        </div>

        {/* GM Badge */}
        {isGM && gmRole && (
          <div className={`px-3 py-1 rounded border ${GM_ROLE_COLORS[gmRole] || 'text-gray-400 border-gray-500'} bg-black/30 text-xs font-bold`}>
            [{GM_ROLE_NAMES[gmRole] || gmRole}]
          </div>
        )}
      </div>

      {/* Right: Resources & Actions */}
      <div className="flex items-center gap-4">
        {/* Gold */}
        <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-yellow-600/30">
          <span className="text-yellow-500">💰</span>
          <span className="text-yellow-400 font-bold text-sm">{character.gold.toLocaleString()}</span>
        </div>

        {/* Premium Currency */}
        <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-purple-600/30">
          <span className="text-purple-400">💎</span>
          <span className="text-purple-400 font-bold text-sm">{character.premium_gems.toLocaleString()}</span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-600" />

        {/* Notifications */}
        <button
          onClick={onNotificationsClick}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/30 border border-gray-600 hover:border-yellow-500 hover:bg-yellow-500/10 transition-colors"
          title="Bildirimler"
        >
          <span className="text-lg">🔔</span>
        </button>

        {/* Settings */}
        <button
          onClick={onSettingsClick}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/30 border border-gray-600 hover:border-yellow-500 hover:bg-yellow-500/10 transition-colors"
          title="Ayarlar"
        >
          <span className="text-lg">⚙️</span>
        </button>
      </div>
    </header>
  );
}

import type { Character } from '../../types';

interface MiniMapProps {
  character: Character;
  serverName?: string;
  serverNumber?: number;
  onMapClick?: () => void;
  onFullMapClick?: () => void;
}

export default function MiniMap({
  character,
  serverName = 'Pantheon',
  serverNumber = 1,
  onMapClick,
  onFullMapClick,
}: MiniMapProps) {
  return (
    <div className="absolute top-2 right-2 z-30">
      {/* Main Container - Social Icons Left, Map Right */}
      <div className="flex items-start gap-2">
        {/* Social Links - Vertical Stack */}
        <div className="flex flex-col gap-2">
          <button className="w-8 h-8 bg-blue-600/80 rounded-full border-2 border-blue-400 flex items-center justify-center hover:scale-110 transition-transform">
            <span className="text-white text-xs font-bold">f</span>
          </button>
          <button className="w-8 h-8 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full border-2 border-yellow-400 flex items-center justify-center hover:scale-110 transition-transform">
            <span className="text-white text-xs">🎮</span>
          </button>
          <button className="w-8 h-8 bg-indigo-600/80 rounded-full border-2 border-indigo-400 flex items-center justify-center hover:scale-110 transition-transform">
            <span className="text-white text-xs">💬</span>
          </button>
        </div>

        {/* Mini Map Container */}
      <div className="bg-black/70 backdrop-blur-sm rounded-lg border border-yellow-600/50 overflow-hidden">
        {/* Server Info Header */}
        <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-b border-yellow-600/30">
          <span className="text-yellow-400 text-xs font-bold">Shard {serverNumber}</span>
          <span className="text-orange-300 text-xs font-bold">{serverName}</span>
        </div>

        {/* Map Display */}
        <div
          onClick={onMapClick}
          className="w-40 h-40 relative cursor-pointer group"
          style={{
            background: 'linear-gradient(135deg, #1a2a1a 0%, #0d1a0d 100%)',
          }}
        >
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,215,0,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,215,0,0.3) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          />

          {/* Map Terrain Placeholder */}
          <div className="absolute inset-2 rounded bg-gradient-to-br from-green-900/30 to-brown-900/30 border border-green-700/20" />

          {/* Player Position Marker */}
          <div
            className="absolute w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"
            style={{
              left: `${Math.min(90, Math.max(10, (character.position_x / 100) * 100))}%`,
              top: `${Math.min(90, Math.max(10, (character.position_y / 100) * 100))}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 10px rgba(0,255,0,0.5)',
            }}
          />

          {/* Some POI markers */}
          <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-500 rounded-full" title="NPC" />
          <div className="absolute top-8 right-6 w-2 h-2 bg-red-500 rounded-full" title="Enemy" />
          <div className="absolute bottom-6 left-8 w-2 h-2 bg-blue-500 rounded-full" title="Portal" />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">Click to expand</span>
          </div>
        </div>

        {/* Coordinates */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-black/50 border-t border-gray-700">
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-[10px]">📍</span>
            <span className="text-green-400 text-xs font-mono">
              {character.position_x}, {character.position_y}
            </span>
          </div>
          <button
            onClick={onFullMapClick}
            className="text-yellow-400 text-[10px] hover:text-yellow-300 transition-colors"
          >
            🗺️ Full Map
          </button>
        </div>

        {/* Map Name */}
        <div className="px-2 py-1 bg-gradient-to-r from-black/30 to-transparent border-t border-gray-700">
          <span className="text-gray-300 text-xs">
            {character.map_id || 'Starting Village'}
          </span>
        </div>

        {/* Online Players / Server Info */}
        <div className="flex items-center justify-between px-2 py-1 bg-black/30 border-t border-gray-700 text-[10px]">
          <span className="text-gray-500">RANK</span>
          <span className="text-yellow-400">s230-S230-Purgatory Shaman-HKT</span>
          <span className="text-gray-400">20:</span>
          <span className="text-white">15</span>
        </div>
      </div>
      </div>

      {/* Bonus Button */}
      <div className="flex justify-end mt-2">
        <button className="px-4 py-1.5 bg-gradient-to-b from-red-500 to-red-700 text-yellow-300 text-xs font-bold rounded border border-red-400 hover:from-red-400 hover:to-red-600 transition-colors animate-pulse">
          🎁 BONUS
        </button>
      </div>
    </div>
  );
}

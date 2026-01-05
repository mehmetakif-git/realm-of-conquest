import type { Character } from '../../types';
import { FantasyPanel } from '../ui';

interface RightPanelProps {
  character: Character;
  activeBuffs?: { id: string; name: string; icon: string; duration: number }[];
}

export default function RightPanel({
  character,
  activeBuffs = [],
}: RightPanelProps) {
  return (
    <aside className="w-[200px] h-full bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border-l-2 border-[#333355] flex flex-col overflow-hidden">
      {/* Mini Map Placeholder */}
      <div className="p-3 border-b border-[#333355]">
        <FantasyPanel
          title="Mini Harita"
          icon="🗺️"
          variant="dark"
          padding="none"
        >
          <div className="aspect-square bg-[#0a0a12] flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-1">🏰</div>
              <p className="text-[10px] text-gray-500">Yakinda</p>
            </div>
          </div>
          {/* Location Info */}
          <div className="px-2 py-1.5 bg-black/30 text-center">
            <p className="text-[10px] text-gray-400">
              Konum: ({character.position_x}, {character.position_y})
            </p>
            <p className="text-[10px] text-yellow-500 font-medium">
              {character.map_id || 'Baslangic Koyu'}
            </p>
          </div>
        </FantasyPanel>
      </div>

      {/* Active Buffs */}
      <div className="p-3">
        <FantasyPanel
          title="Buff / Debuff"
          icon="✨"
          variant="dark"
          padding="small"
        >
          {activeBuffs.length === 0 ? (
            <div className="flex items-center justify-center py-2">
              <span className="text-gray-500 text-xs">Aktif etki yok</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {activeBuffs.map((buff) => (
                <div
                  key={buff.id}
                  className="w-8 h-8 bg-black/30 rounded flex items-center justify-center border border-gray-700 hover:border-yellow-500 transition-colors cursor-pointer"
                  title={`${buff.name} (${buff.duration}s)`}
                >
                  <span className="text-lg">{buff.icon}</span>
                </div>
              ))}
            </div>
          )}
        </FantasyPanel>
      </div>

      {/* Player Info */}
      <div className="p-3 border-t border-[#333355]">
        <div className="bg-black/30 rounded-lg p-2 text-center">
          <p className="text-[10px] text-gray-500 mb-1">Server</p>
          <p className="text-xs text-yellow-400 font-bold">TR-1</p>
          <p className="text-[10px] text-green-400 mt-1">Online: 1,234</p>
        </div>
      </div>
    </aside>
  );
}

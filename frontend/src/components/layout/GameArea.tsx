import type { Character } from '../../types';
import { getClassColor } from '../../styles/theme';

interface GameAreaProps {
  character: Character;
  isLoading?: boolean;
}

export default function GameArea({ character, isLoading = false }: GameAreaProps) {
  const classColor = getClassColor(character.class);

  if (isLoading) {
    return (
      <main className="flex-1 bg-[#0a0a12] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-yellow-400 font-bold">Harita yukleniyor...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#0a0a12] relative overflow-hidden">
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

      {/* Content Area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Map Name */}
        <div className="absolute top-4 left-4 bg-black/60 px-4 py-2 rounded-lg border border-yellow-500/30">
          <p className="text-yellow-400 font-bold text-sm">
            📍 {character.map_id || 'Baslangic Koyu'}
          </p>
          <p className="text-gray-400 text-xs">
            Konum: ({character.position_x}, {character.position_y})
          </p>
        </div>

        {/* Character Placeholder */}
        <div className="relative">
          {/* Character Circle */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-lg animate-bounce"
            style={{
              background: `linear-gradient(135deg, ${classColor.primary} 0%, ${classColor.secondary} 100%)`,
              borderColor: classColor.primary,
              boxShadow: `0 0 30px ${classColor.primary}50`,
              animationDuration: '3s',
            }}
          >
            <span className="text-5xl">{classColor.icon}</span>
          </div>

          {/* Character Name */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 px-3 py-1 rounded-full border border-green-500">
            <span className="text-green-400 font-bold text-sm whitespace-nowrap">
              {character.name}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-20 text-center">
          <p className="text-gray-500 text-sm mb-2">Oyun alani yakinda aktif olacak</p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
            <span>⚔️ Savas icin alt bari kullan</span>
            <span>•</span>
            <span>🗺️ Harita icin tikla</span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-500/50 rounded-full animate-ping" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-blue-500/30 rounded-full animate-pulse" />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-purple-500/40 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-green-500/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-yellow-500/20" />
      <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-yellow-500/20" />
      <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-yellow-500/20" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-yellow-500/20" />
    </main>
  );
}

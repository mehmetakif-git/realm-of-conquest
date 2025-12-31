import type { Character } from '../../types';
import { getClassColor } from '../../styles/theme';
import { FlagStatus } from '../flag';

interface CharacterPanelProps {
  character: Character;
  battleRating?: number;
  onRechargeClick?: () => void;
  onTitleClick?: () => void;
  onFlagClick?: () => void;
}

export default function CharacterPanel({
  character,
  battleRating = 0,
  onRechargeClick,
  onTitleClick,
  onFlagClick,
}: CharacterPanelProps) {
  const classColor = getClassColor(character.class);

  // Calculate BR if not provided
  const calculatedBR = battleRating || (
    character.attack * 10 +
    character.defense * 8 +
    character.max_hp * 0.5 +
    character.max_mp * 0.3 +
    character.level * 100
  );

  return (
    <div className="absolute top-2 left-2 z-30">
      <div className="flex items-end gap-3">
        {/* Character Avatar - Large */}
        <div className="relative">
          {/* Level Badge - Top */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-700 text-white text-xs font-bold px-3 py-0.5 rounded-full border border-yellow-400 z-10 whitespace-nowrap">
            LV- {character.level}
          </div>

          {/* Avatar Frame */}
          <div
            className="w-20 h-20 rounded-xl border-3 flex items-center justify-center relative overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${classColor.primary}60 0%, ${classColor.secondary}90 100%)`,
              borderColor: classColor.primary,
              borderWidth: '3px',
              boxShadow: `0 0 20px ${classColor.primary}50, inset 0 0 20px rgba(0,0,0,0.5)`,
            }}
          >
            <span className="text-5xl drop-shadow-lg">{classColor.icon}</span>

            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-400" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-400" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-yellow-400" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-400" />
          </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-col">
          {/* Server + Name Row */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-400 text-xs">s1.</span>
            <span className="text-white font-bold text-sm">{character.name}</span>

            {/* Recharge Button */}
            <button
              onClick={onRechargeClick}
              className="ml-2 px-3 py-1 bg-gradient-to-b from-green-400 to-green-600 text-white text-[10px] font-bold rounded border border-green-300 hover:from-green-300 hover:to-green-500 transition-colors shadow-lg"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            >
              RECHARGE
            </button>
          </div>

          {/* BR Section - Large and Prominent */}
          <div className="flex items-center gap-2">
            <span
              className="text-orange-400 font-bold text-lg"
              style={{
                textShadow: '0 0 10px rgba(255,165,0,0.8)',
                fontFamily: 'Impact, sans-serif',
                letterSpacing: '2px'
              }}
            >
              BR
            </span>
            <span
              className="text-yellow-300 font-bold text-2xl"
              style={{
                textShadow: '0 0 15px rgba(255,215,0,0.8), 2px 2px 4px rgba(0,0,0,0.8)',
                fontFamily: 'Impact, sans-serif',
                letterSpacing: '1px'
              }}
            >
              {Math.floor(calculatedBR).toLocaleString()}
            </span>
          </div>

          {/* Buff Icons Row */}
          <div className="flex gap-1 mt-1">
            <div className="w-7 h-7 bg-gradient-to-b from-purple-500 to-purple-800 rounded border border-purple-400 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" title="Buff 1">
              <span className="text-xs">⚔️</span>
            </div>
            <div className="w-7 h-7 bg-gradient-to-b from-blue-500 to-blue-800 rounded border border-blue-400 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" title="Buff 2">
              <span className="text-xs">🛡️</span>
            </div>
            <div className="w-7 h-7 bg-gradient-to-b from-green-500 to-green-800 rounded border border-green-400 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" title="Buff 3">
              <span className="text-xs">✨</span>
            </div>
            <div className="w-7 h-7 bg-gradient-to-b from-red-500 to-red-800 rounded border border-red-400 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" title="Buff 4">
              <span className="text-xs">🔥</span>
            </div>
          </div>

          {/* Flag Status */}
          <div className="mt-2">
            <FlagStatus
              flag={character.flag_type || 'neutral'}
              infamy={character.infamy || 0}
              karma={character.karma || 0}
              onOpenSelector={onFlagClick || (() => {})}
            />
          </div>
        </div>

        {/* Title Button - Right Side */}
        <div className="flex flex-col items-center">
          <button
            onClick={onTitleClick}
            className="w-14 h-14 bg-gradient-to-b from-yellow-600 to-yellow-900 rounded-xl border-2 border-yellow-400 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer relative overflow-hidden"
            style={{ boxShadow: '0 0 15px rgba(255,215,0,0.4)' }}
          >
            {/* Exclamation badge */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
              <span className="text-white text-[10px] font-bold">!</span>
            </div>

            <span className="text-2xl">👑</span>
          </button>
          <span className="text-yellow-400 text-[10px] font-bold mt-1">TITLE</span>
        </div>
      </div>
    </div>
  );
}

import type { Character } from '../../types';

interface Skill {
  id: string;
  name: string;
  icon: string;
  cooldown?: number;
  maxCooldown?: number;
  isReady: boolean;
  hotkey?: string;
}

interface SkillBarProps {
  character: Character;
  skills?: Skill[];
  onSkillClick?: (skillId: string) => void;
}

export default function SkillBar({
  character,
  skills = [],
  onSkillClick,
}: SkillBarProps) {
  // Demo skills if none provided
  const demoSkills: Skill[] = skills.length > 0 ? skills : [
    { id: '1', name: 'Skill 1', icon: '🔴', isReady: true, hotkey: '1' },
    { id: '2', name: 'Skill 2', icon: '🟠', isReady: true, hotkey: '2' },
    { id: '3', name: 'Skill 3', icon: '🟡', isReady: false, cooldown: 3, maxCooldown: 10, hotkey: '3' },
    { id: '4', name: 'Skill 4', icon: '🟢', isReady: true, hotkey: '4' },
    { id: '5', name: 'Skill 5', icon: '🔵', isReady: true, hotkey: 'W' },
    { id: '6', name: 'Skill 6', icon: '🟣', isReady: true, hotkey: 'Space' },
    { id: '7', name: 'Auto', icon: '⚡', isReady: true, hotkey: 'R' },
  ];

  const hpPercent = (character.hp / character.max_hp) * 100;
  const mpPercent = (character.mp / character.max_mp) * 100;
  const expPercent = (character.experience / (character.level * 1000)) * 100;

  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30">
      {/* Main Skill Bar Container */}
      <div className="flex items-end gap-2">
        {/* HP Orb - Left Side */}
        <div className="relative w-16 h-16 flex-shrink-0">
          {/* Orb Background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-gray-600 overflow-hidden">
            {/* HP Fill */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-600 to-red-400 transition-all duration-300"
              style={{ height: `${hpPercent}%` }}
            />
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
          </div>
          {/* HP Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold drop-shadow-lg">
              {Math.floor(hpPercent)}%
            </span>
          </div>
        </div>

        {/* Skills Container */}
        <div className="flex flex-col items-center">
          {/* Skill Slots */}
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-gray-700">
            {demoSkills.map((skill) => (
              <div
                key={skill.id}
                onClick={() => skill.isReady && onSkillClick?.(skill.id)}
                className={`relative w-12 h-12 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all
                  ${skill.isReady
                    ? 'bg-gradient-to-b from-gray-700 to-gray-900 border-gray-500 hover:border-yellow-500 hover:scale-105'
                    : 'bg-gray-900 border-gray-700 opacity-60'
                  }
                `}
              >
                {/* Skill Icon */}
                <span className="text-2xl">{skill.icon}</span>

                {/* Cooldown Overlay */}
                {!skill.isReady && skill.cooldown !== undefined && (
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{skill.cooldown}s</span>
                  </div>
                )}

                {/* Hotkey */}
                {skill.hotkey && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black/80 px-1.5 py-0.5 rounded text-[9px] text-gray-300 font-bold border border-gray-600">
                    {skill.hotkey}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* EXP Bar - Below Skills */}
          <div className="w-full mt-1">
            <div className="h-2 bg-gray-900 rounded-full border border-gray-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
                style={{ width: `${expPercent}%` }}
              />
            </div>
            <div className="text-center mt-0.5">
              <span className="text-[9px] text-gray-400">{expPercent.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* MP Orb - Right Side */}
        <div className="relative w-16 h-16 flex-shrink-0">
          {/* Orb Background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-gray-600 overflow-hidden">
            {/* MP Fill */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-300"
              style={{ height: `${mpPercent}%` }}
            />
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
          </div>
          {/* MP Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold drop-shadow-lg">
              {Math.floor(mpPercent)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

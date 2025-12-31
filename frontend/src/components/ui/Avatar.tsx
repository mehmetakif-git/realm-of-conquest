import { getClassColor } from '../../styles/theme';

interface AvatarProps {
  characterClass: string;
  size?: 'small' | 'medium' | 'large';
  level?: number;
  showLevel?: boolean;
  isOnline?: boolean;
  className?: string;
}

const sizeStyles = {
  small: { container: 'w-10 h-10', icon: 'text-xl', level: 'text-[8px] w-4 h-4' },
  medium: { container: 'w-16 h-16', icon: 'text-3xl', level: 'text-[10px] w-5 h-5' },
  large: { container: 'w-20 h-20', icon: 'text-4xl', level: 'text-xs w-6 h-6' },
};

export default function Avatar({
  characterClass,
  size = 'medium',
  level,
  showLevel = true,
  isOnline = false,
  className = '',
}: AvatarProps) {
  const classColor = getClassColor(characterClass);
  const sizeStyle = sizeStyles[size];

  return (
    <div className={`relative ${className}`}>
      {/* Avatar Circle */}
      <div
        className={`
          ${sizeStyle.container}
          rounded-full
          flex items-center justify-center
          border-3 border-yellow-500/50
          shadow-[0_0_10px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(0,0,0,0.3)]
        `}
        style={{
          background: `linear-gradient(135deg, ${classColor.primary} 0%, ${classColor.secondary} 100%)`,
        }}
      >
        <span className={sizeStyle.icon}>{classColor.icon}</span>
      </div>

      {/* Level Badge */}
      {showLevel && level !== undefined && (
        <div
          className={`
            absolute -bottom-1 -right-1
            ${sizeStyle.level}
            bg-gradient-to-b from-yellow-500 to-orange-600
            border border-yellow-400
            rounded-full
            flex items-center justify-center
            font-bold text-black
            shadow-[0_0_5px_rgba(255,215,0,0.5)]
          `}
        >
          {level}
        </div>
      )}

      {/* Online Indicator */}
      {isOnline && (
        <div
          className={`
            absolute top-0 right-0
            w-3 h-3
            bg-green-500
            border-2 border-[#0f0f1a]
            rounded-full
            animate-pulse
          `}
        />
      )}
    </div>
  );
}

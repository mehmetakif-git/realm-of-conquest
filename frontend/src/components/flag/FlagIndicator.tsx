import type { FlagType } from '../../types/flag';

interface FlagIndicatorProps {
  flag: FlagType;
  size?: 'small' | 'medium' | 'large';
  showPulse?: boolean;
}

export default function FlagIndicator({ flag, size = 'medium', showPulse = true }: FlagIndicatorProps) {
  if (flag === 'neutral') return null;

  const sizes = {
    small: { width: 12, height: 16 },
    medium: { width: 18, height: 24 },
    large: { width: 24, height: 32 },
  };

  const s = sizes[size];
  const color = flag === 'red' ? '#ff4444' : '#4444ff';
  const glowColor = flag === 'red' ? 'rgba(255, 68, 68, 0.6)' : 'rgba(68, 68, 255, 0.6)';

  return (
    <div
      className="relative"
      style={{ width: s.width, height: s.height }}
    >
      {/* Flag pole */}
      <div
        className="absolute left-0 top-0 bg-gray-500"
        style={{ width: 2, height: s.height }}
      />

      {/* Flag */}
      <div
        className={showPulse ? 'animate-pulse' : ''}
        style={{
          position: 'absolute',
          left: 2,
          top: 0,
          width: s.width - 2,
          height: s.height * 0.6,
          background: color,
          clipPath: 'polygon(0 0, 100% 0, 80% 50%, 100% 100%, 0 100%)',
          boxShadow: `0 0 8px ${glowColor}`,
        }}
      />
    </div>
  );
}

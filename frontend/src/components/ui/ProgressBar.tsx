import { useMemo } from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  type: 'hp' | 'mp' | 'exp';
  showText?: boolean;
  showValues?: boolean;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  label?: string;
}

const typeStyles = {
  hp: {
    gradient: 'from-red-500 to-red-700',
    bg: 'bg-red-950',
    glow: 'shadow-[0_0_8px_rgba(231,76,60,0.4)]',
    lowGlow: 'shadow-[0_0_12px_rgba(231,76,60,0.8)] animate-pulse',
    textColor: 'text-red-400',
    icon: '❤️',
  },
  mp: {
    gradient: 'from-blue-500 to-blue-700',
    bg: 'bg-blue-950',
    glow: 'shadow-[0_0_8px_rgba(52,152,219,0.4)]',
    lowGlow: 'shadow-[0_0_12px_rgba(52,152,219,0.8)]',
    textColor: 'text-blue-400',
    icon: '💧',
  },
  exp: {
    gradient: 'from-green-500 to-green-700',
    bg: 'bg-green-950',
    glow: 'shadow-[0_0_8px_rgba(46,204,113,0.4)]',
    lowGlow: 'shadow-[0_0_8px_rgba(46,204,113,0.4)]',
    textColor: 'text-green-400',
    icon: '⭐',
  },
};

const sizeStyles = {
  small: { height: 'h-2', fontSize: 'text-[10px]', labelSize: 'text-xs' },
  medium: { height: 'h-3', fontSize: 'text-xs', labelSize: 'text-sm' },
  large: { height: 'h-4', fontSize: 'text-sm', labelSize: 'text-base' },
};

export default function ProgressBar({
  current,
  max,
  type,
  showText = true,
  showValues = true,
  size = 'medium',
  animated = true,
  label,
}: ProgressBarProps) {
  const percentage = useMemo(() => {
    if (max <= 0) return 0;
    return Math.max(0, Math.min(100, (current / max) * 100));
  }, [current, max]);

  const isLow = type === 'hp' && percentage < 30;
  const styles = typeStyles[type];
  const sizeStyle = sizeStyles[size];

  return (
    <div className="w-full">
      {/* Label and Values */}
      {(showText || showValues) && (
        <div className="flex justify-between items-center mb-1">
          {showText && (
            <span className={`${sizeStyle.labelSize} ${styles.textColor} font-medium flex items-center gap-1`}>
              {label || styles.icon}
            </span>
          )}
          {showValues && (
            <span className={`${sizeStyle.fontSize} text-gray-400`}>
              {current.toLocaleString()}/{max.toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* Bar Container */}
      <div
        className={`
          w-full ${sizeStyle.height} rounded-full overflow-hidden
          ${styles.bg} border border-gray-800
          ${isLow ? styles.lowGlow : styles.glow}
        `}
      >
        {/* Progress Fill */}
        <div
          className={`
            h-full rounded-full bg-gradient-to-r ${styles.gradient}
            ${animated ? 'transition-all duration-500 ease-out' : ''}
            ${isLow ? 'animate-pulse' : ''}
          `}
          style={{ width: `${percentage}%` }}
        >
          {/* Shine Effect */}
          <div className="h-full w-full bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>

      {/* Percentage Text (for exp bar) */}
      {type === 'exp' && showText && (
        <div className="text-center mt-0.5">
          <span className={`${sizeStyle.fontSize} text-gray-500`}>
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface FantasyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'gold' | 'red' | 'blue' | 'dark';
  size?: 'small' | 'medium' | 'large';
  icon?: ReactNode;
  fullWidth?: boolean;
  glowing?: boolean;
}

const variantStyles = {
  gold: {
    base: 'bg-gradient-to-b from-yellow-500 to-orange-500 text-black font-bold border-2 border-yellow-400',
    hover: 'hover:from-yellow-400 hover:to-orange-400 hover:shadow-[0_0_15px_rgba(255,215,0,0.5)]',
    active: 'active:from-yellow-600 active:to-orange-600',
  },
  red: {
    base: 'bg-gradient-to-b from-red-500 to-red-700 text-white font-bold border-2 border-red-400',
    hover: 'hover:from-red-400 hover:to-red-600 hover:shadow-[0_0_15px_rgba(231,76,60,0.5)]',
    active: 'active:from-red-600 active:to-red-800',
  },
  blue: {
    base: 'bg-gradient-to-b from-blue-500 to-blue-700 text-white font-bold border-2 border-blue-400',
    hover: 'hover:from-blue-400 hover:to-blue-600 hover:shadow-[0_0_15px_rgba(52,152,219,0.5)]',
    active: 'active:from-blue-600 active:to-blue-800',
  },
  dark: {
    base: 'bg-gradient-to-b from-gray-700 to-gray-900 text-white font-medium border-2 border-gray-600',
    hover: 'hover:from-gray-600 hover:to-gray-800 hover:border-gray-500',
    active: 'active:from-gray-800 active:to-gray-950',
  },
};

const sizeStyles = {
  small: 'px-3 py-1.5 text-xs rounded',
  medium: 'px-4 py-2 text-sm rounded-md',
  large: 'px-6 py-3 text-base rounded-lg',
};

export default function FantasyButton({
  children,
  variant = 'dark',
  size = 'medium',
  icon,
  fullWidth = false,
  glowing = false,
  disabled,
  className = '',
  ...props
}: FantasyButtonProps) {
  const styles = variantStyles[variant];

  return (
    <button
      disabled={disabled}
      className={`
        ${styles.base}
        ${!disabled && styles.hover}
        ${!disabled && styles.active}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${glowing ? 'animate-pulse shadow-[0_0_20px_rgba(255,215,0,0.6)]' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
        inline-flex items-center justify-center gap-2
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {children}
    </button>
  );
}

import { ReactNode } from 'react';

interface FantasyPanelProps {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
  variant?: 'default' | 'gold' | 'dark';
  padding?: 'none' | 'small' | 'medium' | 'large';
  className?: string;
  headerAction?: ReactNode;
}

const variantStyles = {
  default: {
    container: 'bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border-2 border-[#333355]',
    header: 'bg-[#252540] border-b border-[#333355]',
    headerText: 'text-white',
  },
  gold: {
    container: 'bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border-2 border-yellow-500/50 shadow-[0_0_15px_rgba(255,215,0,0.2)]',
    header: 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-b border-yellow-500/30',
    headerText: 'text-yellow-400',
  },
  dark: {
    container: 'bg-[#0a0a12] border border-[#222233]',
    header: 'bg-[#111122] border-b border-[#222233]',
    headerText: 'text-gray-400',
  },
};

const paddingStyles = {
  none: '',
  small: 'p-2',
  medium: 'p-3',
  large: 'p-4',
};

export default function FantasyPanel({
  children,
  title,
  icon,
  variant = 'default',
  padding = 'medium',
  className = '',
  headerAction,
}: FantasyPanelProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`rounded-lg overflow-hidden ${styles.container} ${className}`}>
      {/* Header */}
      {title && (
        <div className={`px-3 py-2 flex items-center justify-between ${styles.header}`}>
          <div className="flex items-center gap-2">
            {icon && <span className="text-lg">{icon}</span>}
            <h3 className={`font-bold text-sm ${styles.headerText}`}>{title}</h3>
          </div>
          {headerAction}
        </div>
      )}

      {/* Content */}
      <div className={paddingStyles[padding]}>
        {children}
      </div>
    </div>
  );
}

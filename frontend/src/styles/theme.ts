// Realm of Conquest - Fantasy MMORPG Theme

export const theme = {
  colors: {
    // Backgrounds
    bgPrimary: '#0f0f1a',
    bgSecondary: '#1a1a2e',
    bgPanel: 'rgba(26, 26, 46, 0.95)',
    bgHover: '#252540',
    bgDark: '#0a0a12',

    // Accents
    gold: '#ffd700',
    goldDark: '#cc9900',
    goldLight: '#ffe44d',
    orange: '#ff9500',
    orangeDark: '#cc7700',

    // HP/MP/EXP
    hpRed: '#e74c3c',
    hpRedDark: '#c0392b',
    hpRedLight: '#ff6b5b',
    mpBlue: '#3498db',
    mpBlueDark: '#2980b9',
    mpBlueLight: '#5dade2',
    expGreen: '#2ecc71',
    expGreenDark: '#27ae60',
    expGreenLight: '#58d68d',

    // Rarity colors
    common: '#9d9d9d',
    uncommon: '#1eff00',
    rare: '#0070ff',
    epic: '#a335ee',
    legendary: '#ff8000',
    mythic: '#e6cc80',

    // Text
    textPrimary: '#ffffff',
    textSecondary: '#b0b0b0',
    textMuted: '#666666',
    textGold: '#ffd700',

    // Border
    borderGold: '#ffd700',
    borderDark: '#333355',
    borderLight: '#444466',

    // Status
    success: '#2ecc71',
    warning: '#f39c12',
    error: '#e74c3c',
    info: '#3498db',
  },

  gradients: {
    goldButton: 'linear-gradient(180deg, #ffd700 0%, #ff9500 100%)',
    goldButtonHover: 'linear-gradient(180deg, #ffe44d 0%, #ffaa33 100%)',
    redButton: 'linear-gradient(180deg, #e74c3c 0%, #c0392b 100%)',
    redButtonHover: 'linear-gradient(180deg, #ff6b5b 0%, #e74c3c 100%)',
    blueButton: 'linear-gradient(180deg, #3498db 0%, #2980b9 100%)',
    blueButtonHover: 'linear-gradient(180deg, #5dade2 0%, #3498db 100%)',
    darkButton: 'linear-gradient(180deg, #2a2a4a 0%, #1a1a2e 100%)',
    darkButtonHover: 'linear-gradient(180deg, #3a3a5a 0%, #2a2a4a 100%)',
    darkPanel: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
    hpBar: 'linear-gradient(180deg, #e74c3c 0%, #c0392b 100%)',
    mpBar: 'linear-gradient(180deg, #3498db 0%, #2980b9 100%)',
    expBar: 'linear-gradient(180deg, #2ecc71 0%, #27ae60 100%)',
  },

  shadows: {
    gold: '0 0 10px rgba(255, 215, 0, 0.5)',
    goldStrong: '0 0 20px rgba(255, 215, 0, 0.7)',
    panel: '0 4px 20px rgba(0, 0, 0, 0.5)',
    button: '0 2px 10px rgba(0, 0, 0, 0.3)',
    buttonHover: '0 4px 15px rgba(0, 0, 0, 0.4)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
  },

  borders: {
    panel: '2px solid #333355',
    panelGold: '2px solid #ffd700',
    panelLight: '1px solid #444466',
    input: '1px solid #333355',
    inputFocus: '1px solid #ffd700',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  fontSize: {
    xs: '10px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  transitions: {
    fast: '0.15s ease',
    normal: '0.25s ease',
    slow: '0.4s ease',
  },

  zIndex: {
    base: 1,
    dropdown: 10,
    sticky: 20,
    modal: 50,
    tooltip: 100,
  },
} as const;

// Class-specific colors
export const classColors: Record<string, { primary: string; secondary: string; icon: string }> = {
  warrior: { primary: '#cc3333', secondary: '#ff6666', icon: '⚔️' },
  archer: { primary: '#33cc33', secondary: '#66ff66', icon: '🏹' },
  mage: { primary: '#3333cc', secondary: '#6666ff', icon: '🔮' },
  healer: { primary: '#cccc33', secondary: '#ffff66', icon: '✨' },
  ninja: { primary: '#9933cc', secondary: '#cc66ff', icon: '🗡️' },
};

// Helper function for class-based styling
export function getClassColor(characterClass: string): { primary: string; secondary: string; icon: string } {
  return classColors[characterClass] || { primary: '#666666', secondary: '#999999', icon: '👤' };
}

export type Theme = typeof theme;

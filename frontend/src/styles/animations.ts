// CSS Keyframe animations for Realm of Conquest

export const animations = {
  // Fade animations
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  fadeOut: `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `,

  // Slide animations
  slideInUp: `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  slideInDown: `
    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  slideInLeft: `
    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `,
  slideInRight: `
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `,

  // Scale animations
  scaleIn: `
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `,
  scaleOut: `
    @keyframes scaleOut {
      from {
        opacity: 1;
        transform: scale(1);
      }
      to {
        opacity: 0;
        transform: scale(0.9);
      }
    }
  `,

  // Glow animations
  glow: `
    @keyframes glow {
      0%, 100% {
        box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
      }
      50% {
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
      }
    }
  `,
  pulseGlow: `
    @keyframes pulseGlow {
      0%, 100% {
        box-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
        transform: scale(1);
      }
      50% {
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
        transform: scale(1.02);
      }
    }
  `,

  // HP bar low health animation
  lowHealth: `
    @keyframes lowHealth {
      0%, 100% {
        box-shadow: 0 0 5px rgba(231, 76, 60, 0.5);
      }
      50% {
        box-shadow: 0 0 15px rgba(231, 76, 60, 1);
      }
    }
  `,

  // Shake animation (for damage, errors, etc.)
  shake: `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
  `,

  // Bounce animation
  bounce: `
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }
  `,

  // Spin animation
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,

  // Float animation (idle characters, etc.)
  float: `
    @keyframes float {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-5px);
      }
    }
  `,

  // Progress bar fill animation
  fillProgress: `
    @keyframes fillProgress {
      from { width: 0%; }
      to { width: var(--progress-width); }
    }
  `,

  // Sparkle effect
  sparkle: `
    @keyframes sparkle {
      0%, 100% {
        opacity: 0;
        transform: scale(0);
      }
      50% {
        opacity: 1;
        transform: scale(1);
      }
    }
  `,
};

// Tailwind CSS custom animation classes to add to tailwind.config.js
export const tailwindAnimations = {
  animation: {
    'fade-in': 'fadeIn 0.2s ease-out',
    'fade-out': 'fadeOut 0.2s ease-out',
    'slide-in-up': 'slideInUp 0.3s ease-out',
    'slide-in-down': 'slideInDown 0.3s ease-out',
    'slide-in-left': 'slideInLeft 0.3s ease-out',
    'slide-in-right': 'slideInRight 0.3s ease-out',
    'scale-in': 'scaleIn 0.2s ease-out',
    'scale-out': 'scaleOut 0.2s ease-out',
    'glow': 'glow 2s ease-in-out infinite',
    'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
    'low-health': 'lowHealth 1s ease-in-out infinite',
    'shake': 'shake 0.5s ease-in-out',
    'float': 'float 3s ease-in-out infinite',
    'sparkle': 'sparkle 1.5s ease-in-out infinite',
  },
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    fadeOut: {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' },
    },
    slideInUp: {
      '0%': { opacity: '0', transform: 'translateY(20px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    slideInDown: {
      '0%': { opacity: '0', transform: 'translateY(-20px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    glow: {
      '0%, 100%': { boxShadow: '0 0 5px rgba(255, 215, 0, 0.5)' },
      '50%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)' },
    },
    pulseGlow: {
      '0%, 100%': { boxShadow: '0 0 5px rgba(255, 215, 0, 0.3)', transform: 'scale(1)' },
      '50%': { boxShadow: '0 0 15px rgba(255, 215, 0, 0.6)', transform: 'scale(1.02)' },
    },
    lowHealth: {
      '0%, 100%': { boxShadow: '0 0 5px rgba(231, 76, 60, 0.5)' },
      '50%': { boxShadow: '0 0 15px rgba(231, 76, 60, 1)' },
    },
    shake: {
      '0%, 100%': { transform: 'translateX(0)' },
      '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
      '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
    },
    float: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-5px)' },
    },
    sparkle: {
      '0%, 100%': { opacity: '0', transform: 'scale(0)' },
      '50%': { opacity: '1', transform: 'scale(1)' },
    },
  },
};

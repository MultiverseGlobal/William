// William Design System Tokens — Command Amber Theme

export const TOKENS = {
  colors: {
    background: '#0A0A0C', // void
    surface: '#131316',    // card/popup
    elevated: '#1B1B1F',
    border: '#26262B',
    textPrimary: '#F5F3EE', // warm, never pure white
    textMuted: '#9C9B97',
    textFaint: '#57565F',
    accent: '#C9974C',     // Command Amber
    accentGlow: 'rgba(201, 151, 76, 0.4)',
    accentGlowSoft: 'rgba(201, 151, 76, 0.15)',
  },
  fonts: {
    display: 'Fraunces',
    ui: 'System',
    data: 'IBMPlexMono',
  },
  animation: {
    easingExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
    entranceDuration: 500,
    microDuration: 150,
  },
} as const;

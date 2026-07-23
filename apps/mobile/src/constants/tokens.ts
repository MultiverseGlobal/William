// William Design System Tokens — Natural Light & Command Amber Themes

export const TOKENS = {
  colors: {
    // Natural Light Theme (Glebich Voice AI Design)
    background: '#F9FAFB',     // Soft crisp white mist
    surface: '#FFFFFF',        // Pure white card surfaces
    elevated: '#F3F4F6',       // Subtle grey container
    border: '#E5E7EB',         // Soft border stroke
    textPrimary: '#111827',    // High-contrast slate black
    textMuted: '#6B7280',      // Muted slate text
    textFaint: '#9CA3AF',      // Faint placeholder text
    accent: '#2563EB',         // Vibrant natural blue
    accentGlow: 'rgba(37, 99, 235, 0.25)',
    accentGlowSoft: 'rgba(37, 99, 235, 0.08)',
    waveDark: '#2C2D30',       // Dark liquid wave path
    waveMid: '#5C5E64',        // Mid liquid wave path
    waveLight: '#9CA0A8',      // Light liquid wave ribbon
    particle: 'rgba(50, 50, 60, 0.45)', // Floating particle dust
  },
  fonts: {
    display: 'System',
    ui: 'System',
    data: 'System',
  },
  animation: {
    easingExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
    entranceDuration: 500,
    microDuration: 150,
  },
} as const;


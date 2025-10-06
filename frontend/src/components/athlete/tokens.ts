export const athleteCardTokens = {
  colors: {
    primary: '#1B8FD2',
    primaryDark: '#051333',
    accent: '#F26622',
    surface: '#FFFFFF',
    surfaceMuted: '#F8FAFD',
    surfaceTint: '#E8F2FF',
    borderSoft: 'rgba(27, 143, 210, 0.12)',
    textPrimary: '#051333',
    textSecondary: '#405070',
    textMuted: '#6E7F9B',
    textInverted: '#FFFFFF',
    success: '#4BD37B',
    warning: '#F8D477',
  },
  radii: {
    card: '16px',
    capsule: '12px',
    button: '999px',
  },
  shadows: {
    card: '0 4px 12px rgba(0,0,0,0.05)',
    hover: '0 10px 24px rgba(5,19,51,0.18)',
  },
  typography: {
    title: '18px',
    body: '14px',
    caption: '12px',
  },
  icon: {
    size: 24,
    strokeWidth: 2,
  },
  gradients: {
    heroOverlay: 'linear-gradient(180deg, rgba(5,19,51,0.05) 0%, rgba(5,19,51,0.7) 100%)',
    energyHigh: 'linear-gradient(90deg, #4BD37B 0%, #1B8FD2 100%)',
    energyBase: 'linear-gradient(90deg, rgba(27,143,210,0.2) 0%, rgba(242,102,34,0.4) 100%)',
  },
} as const

export type AthleteCardTokens = typeof athleteCardTokens

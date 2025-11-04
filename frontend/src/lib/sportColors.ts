export type SupportedSport =
  | 'basketball'
  | 'badminton'
  | 'pickleball'
  | 'climbing'
  | 'running'
  | 'hiking'

type SportTheme = {
  id: SupportedSport | 'default'
  primary: string
  surface: string
  dark: string
  isDefault: boolean
}

const SPORT_THEMES: Record<SupportedSport, SportTheme> = {
  basketball: {
    id: 'basketball',
    primary: '#FF6B35',
    surface: '#FFE9DE',
    dark: '#9C3612',
    isDefault: false,
  },
  badminton: {
    id: 'badminton',
    primary: '#0066CC',
    surface: '#E0F1FF',
    dark: '#014A92',
    isDefault: false,
  },
  pickleball: {
    id: 'pickleball',
    primary: '#FFF000',
    surface: '#FFF9B0',
    dark: '#7A6D00',
    isDefault: false,
  },
  climbing: {
    id: 'climbing',
    primary: '#E74C3C',
    surface: '#FCE2DE',
    dark: '#971F14',
    isDefault: false,
  },
  running: {
    id: 'running',
    primary: '#00D084',
    surface: '#D6F9EC',
    dark: '#067A52',
    isDefault: false,
  },
  hiking: {
    id: 'hiking',
    primary: '#2D5016',
    surface: '#E3F2D9',
    dark: '#1C360E',
    isDefault: false,
  },
}

const DEFAULT_THEME: SportTheme = {
  id: 'default',
  primary: '#2563EB',
  surface: '#DBEAFE',
  dark: '#1D4ED8',
  isDefault: true,
}

export function getSportTheme(sport?: string | null): SportTheme {
  if (!sport) return DEFAULT_THEME
  const normalized = sport.toLowerCase() as SupportedSport
  return SPORT_THEMES[normalized] ?? DEFAULT_THEME
}

export function listSupportedSports(): SupportedSport[] {
  return Object.keys(SPORT_THEMES) as SupportedSport[]
}

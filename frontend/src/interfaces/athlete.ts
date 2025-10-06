export type AthleteVisibility = 'public' | 'smart' | 'private'

export interface AthleteStats {
  sessions: number
  streakWeeks?: number
  energy?: number
  badges?: number
}

export interface AthleteRelationship {
  sessionsTogether?: number
}

export interface ActivityCardProps {
  id: string
  title: string
  sport: string
  time: string
  partners?: string[]
  photoUrl?: string
  stats?: {
    highFives?: number
    comments?: number
  }
}

export interface AthleteCardProps {
  id: string
  name: string
  city?: string
  sport?: string
  primarySport?: string
  title?: string
  toneLines?: string[]
  visualTagline?: string
  avatarUrl: string
  coverUrl?: string
  backgroundUrl?: string
  stats: AthleteStats
  vibes?: string[]
  tags?: string[]
  bio?: string
  story?: string
  recentActivities?: ActivityCardProps[]
  visibility?: AthleteVisibility
  relationship?: AthleteRelationship
  statusLabel?: 'active' | 'rest' | 'new'
  activeNow?: boolean
  lastActiveLabel?: string
  highFiveCount?: number
}

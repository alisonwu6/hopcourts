export interface AthleteCardProps {
  id: string
  name: string
  sport: string
  city?: string
  vibes?: string[]
  avatarUrl: string
  backgroundUrl?: string
  activeNow?: boolean
  highFiveCount?: number
  lastActiveLabel?: string
}

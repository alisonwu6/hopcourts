export interface HostInfo {
  name: string
  avatarUrl: string
  tag: string
}

export type EventContentKey = 'basketball' | 'volleyball' | 'running'

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'

export interface EventCardProps {
  id: string
  contentKey: EventContentKey
  sport: 'basketball' | 'volleyball' | 'running'
  skillLevel?: SkillLevel
  joinedCount: number
  maxCount: number
  timeLeft: string
  host: HostInfo
  participants: string[]
}

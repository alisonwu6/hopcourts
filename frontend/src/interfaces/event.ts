export interface HostInfo {
  name: string
  avatarUrl: string
  tag: string
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'

export type SportKey = 'basketball' | 'volleyball' | 'running'

export interface EventCardProps {
  id: string
  contentKey: string
  sport: SportKey
  skillLevel?: SkillLevel
  joinedCount: number
  maxCount: number
  timeLeft: string
  host: HostInfo
  participants: string[]
}

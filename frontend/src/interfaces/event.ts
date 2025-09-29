export interface HostInfo {
  name: string
  avatarUrl: string
  tag: string
}

export interface EventCardProps {
  id: string
  title: string
  location: string
  time: string
  joinedCount: number
  maxCount: number
  timeLeft: string
  host: HostInfo
  tags: string[]
  participants: string[]
  sport?: string
  description?: string
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced'
}

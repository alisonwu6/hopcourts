export type SessionStatus = 'open' | 'closed' | 'cancelled'

export interface SessionMeta {
  tags: string[]
  description?: string
  notes?: string
  skillLevelLabel?: string
  heroImageUrl?: string
  distanceKm?: number
}

export interface Session {
  id: number
  title: string
  sport: string
  hostName: string
  startsAt: string
  endsAt: string
  maxPlayers: number
  playerCount: number
  venue: string
  tags: string[]
  status: SessionStatus
  details?: SessionMeta
}

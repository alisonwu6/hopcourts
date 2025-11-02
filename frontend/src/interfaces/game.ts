export type GameStatus = 'open' | 'closed' | 'cancelled'

export interface GameMeta {
  tags: string[]
  description?: string
  notes?: string
  skillLevelLabel?: string
  heroImageUrl?: string
  distanceKm?: number
}

export interface Game {
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
  status: GameStatus
  details?: GameMeta
}

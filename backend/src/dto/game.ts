export type SkillLevel = 'all' | 'beginner' | 'intermediate' | 'advanced'

export type PriceType = 'free' | 'pay_on_site' | 'fixed'

export type GameStatus = 'draft' | 'published' | 'cancelled' | 'completed'

export interface HostSummaryDTO {
  id: string
  displayName: string
  avatarUrl?: string | null
  tagline?: string | null
  rating?: number | null
  totalHostedSessions?: number | null
}

export interface AttendeeSummaryDTO {
  id: string
  displayName: string
  avatarUrl?: string | null
  isHost: boolean
}

export interface GameCardDTO {
  id: string
  title: string
  sport: string
  skillLevel: SkillLevel
  coverPhotoUrl?: string | null
  startDateTime: string
  endDateTime: string
  locationName: string
  area?: string | null
  city?: string | null
  countryCode?: string | null
  priceType: PriceType
  priceAmount?: number | null
  currency?: string | null
  capacity: number
  joinedCount: number
  waitlistCount: number
  host: HostSummaryDTO
  spotsRemaining: number
  isFull: boolean
  isFree: boolean
}

export interface GameDetailDTO {
  id: string
  title: string
  sport: string
  skillLevel: SkillLevel
  status: GameStatus
  coverPhotoUrl?: string | null
  host: HostSummaryDTO
  startDateTime: string
  endDateTime: string
  locationName: string
  addressLine?: string | null
  area?: string | null
  city?: string | null
  countryCode?: string | null
  latitude?: number | null
  longitude?: number | null
  priceType: PriceType
  priceAmount?: number | null
  currency?: string | null
  capacity: number
  joinedCount: number
  waitlistCount: number
  spotsRemaining: number
  isFull: boolean
  description: string
  notesForAttendees?: string | null
  attendees: AttendeeSummaryDTO[]
  isUserHost: boolean
  isUserJoined: boolean
  isUserWaitlisted: boolean
}

export interface SaveGamePayload {
  id?: string
  title: string
  sport: string
  skillLevel: SkillLevel
  startDateTime: string
  endDateTime: string
  locationName: string
  addressLine?: string | null
  area?: string | null
  city?: string | null
  countryCode?: string | null
  latitude?: number | null
  longitude?: number | null
  capacity: number
  priceType: PriceType
  priceAmount?: number | null
  currency?: string | null
  description: string
  notesForAttendees?: string | null
  coverPhotoUrl?: string | null
  status: GameStatus
}

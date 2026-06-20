// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

export interface User {
  id: string
  email: string
  password?: string
  name: string
  avatar?: string
  phone?: string
  bio?: string
  location: string
  sports: string[]
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  following: string[]
  followers: string[]
  managedVenues: string[]
  eventsAttended: number
  eventsHosted: number
  teammateCount: number
  gender?: 'male' | 'female' | null

  role?: string[]
  onboarding_completed_at?: Date | string | null
  is_anonymous?: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// VENUE
// ============================================================================

export interface Venue {
  id: string
  name: string
  type: 'gym' | 'outdoor' | 'studio' | 'private' | 'park' | 'court'
  description: string
  location: {
    lat: number
    lng: number
    address: string
    city: string
    state: string
    postalCode: string
  }
  amenities: string[]
  sports: string[]
  capacity: number
  images: {
    url: string
    alt: string
    order: number
  }[]
  phone?: string
  email?: string
  website?: string
  ownerId: string
  managerId?: string
  basePrice?: number
  currency: string
  priceModel: 'per_game' | 'per_hour' | 'per_month' | 'free'
  status: 'claimed' | 'unclaimed'
  logo_url?: string
  rating: number
  ratingCount: number
  eventsHosted: number
  operatingHours?: {
    monday: { open: string; close: string }
    tuesday: { open: string; close: string }
    wednesday: { open: string; close: string }
    thursday: { open: string; close: string }
    friday: { open: string; close: string }
    saturday: { open: string; close: string }
    sunday: { open: string; close: string }
  }
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  timestamp: Date
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

// ACTIVE: consumed by events.service.ts and useEventsStore filters.
export interface EventFilter {
  feedType?: 'upcoming' | 'interests' | 'relations'
  sport?: string
  sportKeys?: string[]
  skillLevel?: 'beginner' | 'intermediate' | 'advanced'
  minPrice?: number
  maxPrice?: number
  isFree?: boolean
  lat?: number
  lng?: number
  radiusKm?: number
  startDate?: Date
  endDate?: Date
  hostId?: string
  venueId?: string
  sortBy?: 'distance' | 'rating' | 'startTime' | 'price'
  page?: number
  pageSize?: number
}

export interface VenueFilter {
  sport?: string
  lat?: number
  lng?: number
  radiusKm?: number
  type?: string
  amenities?: string[]
  minRating?: number
  sortBy?: 'distance' | 'rating' | 'name'
  page?: number
  pageSize?: number
}

// ============================================================================
// PLAYER-FACING ENTITIES
// ============================================================================

type SkillLevelDTO = 'all' | 'any' | 'beginner' | 'intermediate' | 'advanced' | 'mixed'
type PriceTypeDTO = 'free' | 'pay_on_site' | 'fixed'
type EventStatusDTO = 'draft' | 'published' | 'cancelled' | 'completed'

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

export interface EventCardDTO {
  id: string
  title: string
  sport: string
  skillLevel: SkillLevelDTO
  coverPhotoUrl?: string | null
  startDateTime: string
  endDateTime: string
  locationName: string
  area?: string | null
  city?: string | null
  countryCode?: string | null
  priceType: PriceTypeDTO
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

export interface EventDetailDTO {
  id: string
  title: string
  sport: string
  skillLevel: SkillLevelDTO
  status: EventStatusDTO
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
  priceType: PriceTypeDTO
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

export interface SaveEventPayload {
  id?: string
  title: string
  sport: string
  skillLevel: SkillLevelDTO
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
  priceType: PriceTypeDTO
  priceAmount?: number | null
  currency?: string | null
  description: string
  notesForAttendees?: string | null
  coverPhotoUrl?: string | null
  status: EventStatusDTO
}

// ACTIVE: canonical UI event model used across the app.
export interface PlayerEvent {
  id: string
  venueId?: string
  courtName?: string
  title: string
  sport: string
  heroImageUrl?: string
  vibeIcon: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'mixed' | 'any'
  gender?: 'mixed' | 'female' | 'male'
  photos?: string[]
  startTime: Date | string
  endTime: Date | string
  location: {
    name: string
    address: string
    city: string
    lat?: number
    lng?: number
    status?: 'unclaimed' | 'claimed'
    logo_url?: string
  }
  host: {
    id: string
    name: string
    avatarUrl?: string
    rating?: number
    distanceKm?: number
    level?: string
    username?: string
    cityKey?: string
    cityName?: string
    countryKey?: string
  }
  highFives: number
  joined: boolean
  attendeeCount: number
  maxAttendees: number
  minPeople?: number
  difficulty: 1 | 2 | 3 | 4 | 5
  isFree: boolean
  priceTotal?: number
  pricePerPerson?: number
  priceMode?: 'total' | 'person'
  priceNote?: string | null
  priceRange?: string
  description?: string
  participants: Array<{
    id: string
    name: string
    avatarUrl?: string
    username?: string
    checkedInAt?: string | Date
    onTheWayAt?: string | Date
    isAnonymous?: boolean
  }>
  status?: 'draft' | 'published' | 'cancelled' | 'completed'
  completedDate?: Date
  visibility?: 'public' | 'private'
  updatedAt?: string | Date
  checkinOpenMinsBefore?: number
  checkinCloseMinsAfter?: number
  detail?: {
    description?: string
    lookingFor?: {
      skillLevel?: string
      vibe?: string
      notes?: string
    }
    rules?: {
      duration?: string
      courtType?: string
      equipment?: string
      rotation?: string
    }
    hideParticipants?: boolean
    heroImageUrl?: string
  }
  isOfficial?: boolean
  venueNameDisplay?: string
  venueLogoUrl?: string
}

export interface PlayerVenue {
  id: string
  name: string
  type: string
  sports: string[]
  location: {
    name: string
    address: string
    city: string
  }
  rating: number
  reviewCount: number
  memberCount: number
  eventsThisMonth: number
  amenities: string[]
}

export interface EventApi {
  id: string
  creator_id: string
  venue_id?: string | null
  title: string
  sport: string
  description?: string | null
  skill_level?: string | null
  location_name?: string | null
  location_address?: string | null
  area?: string | null
  city?: string | null
  country_code?: string | null
  latitude?: number | null
  longitude?: number | null
  start_time: string
  end_time: string
  max_players: number
  price_total?: number | null
  price_per_person?: number | null
  price_type?: string | null
  currency?: string | null
  status?: string | null
  cancel_reason?: string | null
  gender?: string | null
  photos?: string[] | null
  hero_image_url?: string | null
  host_name?: string | null
  host_avatar?: string | null
  venue_name?: string | null
  venue_address?: string | null
  venue_city?: string | null
  attendee_count?: number | null
  attendees?: Array<{
    player_id: string | number
    full_name?: string | null
    avatar_url?: string | null
    status?: string
  }>
}

// ============================================================================
// FORM TYPES
// ============================================================================

type RecurringPatternInput = {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  daysOfWeek?: number[]
  endDate?: Date
  maxOccurrences?: number
}

// ACTIVE: create-event flow + SaveEventPayload mapping rely on this shape.
export interface CreateEventInput {
  title: string
  description?: string
  sport: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'mixed' | 'any'
  startTime: Date
  duration: number
  maxAttendees: number
  minPeople?: number
  location: {
    name?: string | null
    address: string
    area?: string | null
    city?: string | null
    countryCode?: string | null
    lat?: number | null
    lng?: number | null
    instructions?: string
    source?: string
  }
  venueId?: string
  isFree: boolean
  priceTotal?: number
  pricePerPerson?: number
  priceMode?: 'total' | 'person'
  priceNote?: string
  notesForAttendees?: string
  coverPhotoUrl?: string | null
  isRecurring?: boolean
  recurringPattern?: RecurringPatternInput
  tags?: string[]
  difficulty?: 1 | 2 | 3 | 4 | 5
  gender?: 'mixed' | 'female' | 'male'
  photos?: string[]
}

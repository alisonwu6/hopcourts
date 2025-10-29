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
  hostProfile?: Host
  managedVenues: string[]
  sessionsAttended: number
  sessionsHosted: number
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// HOST & HOSTING
// ============================================================================

export interface Host {
  id: string
  userId: string
  name: string
  avatar?: string
  bio: string
  type: 'individual' | 'venue' | 'organization'
  verified: boolean
  verificationDate?: Date
  verificationReason?: string
  sessionsHosted: number
  rating: number
  ratingCount: number
  followerCount: number
  mostRecentRatings: number[]
  website?: string
  instagram?: string
  facebook?: string
  venueId?: string
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
  priceModel: 'per_session' | 'per_hour' | 'per_month' | 'free'
  isVerified: boolean
  verificationDate?: Date
  rating: number
  ratingCount: number
  sessionsHosted: number
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
// SESSION / EVENT
// ============================================================================

export interface Session {
  id: string
  title: string
  description: string
  sport: string
  difficulty: 1 | 2 | 3 | 4 | 5
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'mixed'
  hostId: string
  hostName: string
  hostAvatar?: string
  hostRating: number
  venueId?: string
  location: {
    lat: number
    lng: number
    address: string
    instructions?: string
  }
  startTime: Date
  endTime: Date
  duration: number
  isRecurring: boolean
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
    daysOfWeek?: number[]
    endDate?: Date
    maxOccurrences?: number
  }
  maxAttendees: number
  minAttendees?: number
  requiresApproval: boolean
  attendees: string[]
  attendeeCount: number
  waitlist?: string[]
  tags: string[]
  language?: string
  isFree: boolean
  pricePerPerson?: number
  currency?: string
  squadId?: string
  isSquadOnly?: boolean
  energy?: number
  joinedLastWeek?: number
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  cancelReason?: string
  likedBy: string[]
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

// ============================================================================
// SQUAD / GROUP
// ============================================================================

export interface Squad {
  id: string
  name: string
  description: string
  avatar?: string
  sport: string
  alternativeSports?: string[]
  location: string
  primaryVenueId?: string
  members: SquadMember[]
  memberCount: number
  visibility: 'public' | 'private' | 'invite-only'
  allowVisitors: boolean
  totalSessions: number
  energy: number
  rating: number
  tags: string[]
  vibe?: string
  sessions: string[]
  createdAt: Date
  updatedAt: Date
}

export interface SquadMember {
  userId: string
  name: string
  avatar?: string
  role: 'admin' | 'moderator' | 'member'
  status: 'active' | 'inactive' | 'left'
  joinedAt: Date
  sessionsAttended?: number
  lastAttendedAt?: Date
}

// ============================================================================
// CHAT & MESSAGING
// ============================================================================

export interface Chat {
  id: string
  type: 'direct_message' | 'squad_chat' | 'session_chat' | 'venue_chat'
  participantIds: string[]
  participantCount: number
  messages: Message[]
  messageCount: number
  title?: string
  avatar?: string
  lastMessageAt: Date
  lastMessageContent?: string
  unreadCounts: Record<string, number>
  linkedSessionId?: string
  linkedSquadId?: string
  linkedVenueId?: string
  createdAt: Date
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  type: 'text' | 'image' | 'location' | 'file'
  media?: {
    url: string
    type: 'image' | 'video' | 'file'
    size?: number
  }
  reactions?: Record<string, string[]>
  status: 'sent' | 'delivered' | 'read'
  readBy?: Record<string, Date>
  createdAt: Date
  editedAt?: Date
}

// ============================================================================
// REVIEWS & RATINGS
// ============================================================================

export interface Review {
  id: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  type: 'host' | 'venue' | 'session'
  hostId?: string
  venueId?: string
  sessionId?: string
  rating: 1 | 2 | 3 | 4 | 5
  comment: string
  aspects?: Record<string, number | undefined>
  response?: {
    text: string
    respondedAt: Date
  }
  helpfulCount: number
  createdAt: Date
  updatedAt?: Date
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export interface Notification {
  id: string
  userId: string
  type:
    | 'session_created'
    | 'session_reminder'
    | 'session_cancelled'
    | 'attendee_joined'
    | 'attendee_cancelled'
    | 'message_received'
    | 'host_message'
    | 'rating_received'
    | 'squad_invited'
    | 'venue_update'
    | 'friend_action'
  title: string
  message: string
  icon?: string
  targetId?: string
  targetType?: string
  isRead: boolean
  readAt?: Date
  createdAt: Date
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

export interface SessionFilter {
  sport?: string
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

export interface HostFilter {
  sport?: string
  minRating?: number
  verified?: boolean
  sortBy?: 'followers' | 'rating' | 'sessionsHosted'
  page?: number
  pageSize?: number
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CreateSessionInput {
  title: string
  description?: string
  sport: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'mixed'
  startTime: Date
  duration: number
  maxAttendees: number
  location: {
    lat: number
    lng: number
    address: string
    instructions?: string
  }
  venueId?: string
  isFree: boolean
  pricePerPerson?: number
  isRecurring?: boolean
  recurringPattern?: Session['recurringPattern']
  tags?: string[]
  difficulty?: 1 | 2 | 3 | 4 | 5
}

export interface UpdateHostProfileInput {
  name: string
  bio: string
  avatar?: string
  website?: string
  instagram?: string
  facebook?: string
}

export interface CreateVenueInput {
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
  phone?: string
  email?: string
  website?: string
  basePrice?: number
  priceModel: 'per_session' | 'per_hour' | 'per_month' | 'free'
  images?: string[]
}

import { ApiResponse, CreateVenueInput, PaginatedResponse, Venue, VenueFilter } from '@/types'

const mockVenues: Venue[] = [
  {
    id: 'venue-basketball-1',
    name: 'South Bank Hoops Centre',
    type: 'court',
    description: 'Riverside courts with nightly pickup games and coaching clinics.',
    location: {
      lat: -27.474,
      lng: 153.0235,
      address: '45 Grey St',
      city: 'Brisbane',
      state: 'QLD',
      postalCode: '4101',
    },
    amenities: ['scoreboard', 'change rooms', 'equipment hire', 'juice bar'],
    sports: ['Basketball'],
    capacity: 60,
    images: [],
    phone: '+61-7-3000-1100',
    email: 'hello@southbankhoops.com',
    website: 'southbankhoops.com',
    ownerId: 'user-venue-1',
    managerId: undefined,
    basePrice: 12,
    currency: 'AUD',
    priceModel: 'per_hour',
    isVerified: true,
    verificationDate: new Date(),
    rating: 4.8,
    ratingCount: 58,
    gamesHosted: 215,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'venue-badminton-1',
    name: 'Yeronga Badminton Hub',
    type: 'indoor',
    description: 'Eight indoor courts with LED lighting and weekly socials.',
    location: {
      lat: -27.5178,
      lng: 153.0205,
      address: '120 School Rd',
      city: 'Yeronga',
      state: 'QLD',
      postalCode: '4104',
    },
    amenities: ['stringing service', 'pro shop', 'cafe', 'parking'],
    sports: ['Badminton'],
    capacity: 48,
    images: [],
    phone: '+61-7-3200-8899',
    email: 'play@yerongabadminton.com',
    website: 'yerongabadminton.com',
    ownerId: 'user-venue-2',
    managerId: undefined,
    basePrice: 10,
    currency: 'AUD',
    priceModel: 'per_hour',
    isVerified: false,
    verificationDate: undefined,
    rating: 4.6,
    ratingCount: 33,
    gamesHosted: 142,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'venue-pickleball-1',
    name: 'Riverwalk Pickleball Courts',
    type: 'court',
    description: 'Purpose-built pickleball complex with ladder leagues.',
    location: {
      lat: -27.4679,
      lng: 153.0456,
      address: '82 Griffith St',
      city: 'New Farm',
      state: 'QLD',
      postalCode: '4005',
    },
    amenities: ['paddle rentals', 'shade seating', 'water station', 'coaching'],
    sports: ['Pickleball'],
    capacity: 40,
    images: [],
    phone: '+61-7-3230-2210',
    email: 'team@riverwalkpickleball.com',
    website: 'riverwalkpickleball.com',
    ownerId: 'user-venue-3',
    managerId: undefined,
    basePrice: 14,
    currency: 'AUD',
    priceModel: 'per_hour',
    isVerified: true,
    verificationDate: new Date(),
    rating: 4.7,
    ratingCount: 27,
    gamesHosted: 158,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'venue-climbing-1',
    name: 'Kangaroo Point Climbing',
    type: 'outdoor',
    description: 'Iconic outdoor cliff climbs with guided sessions all week.',
    location: {
      lat: -27.4713,
      lng: 153.0341,
      address: 'River Terrace',
      city: 'Brisbane',
      state: 'QLD',
      postalCode: '4169',
    },
    amenities: ['belay certification', 'gear rental', 'guided climbs', 'cafe'],
    sports: ['Climbing'],
    capacity: 30,
    images: [],
    phone: '+61-7-4100-7788',
    email: 'info@kpclimbing.com',
    website: 'kpclimbing.com',
    ownerId: 'user-venue-4',
    managerId: undefined,
    basePrice: 25,
    currency: 'AUD',
    priceModel: 'per_game',
    isVerified: true,
    verificationDate: new Date(),
    rating: 4.9,
    ratingCount: 45,
    gamesHosted: 196,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'venue-running-1',
    name: 'South Bank Running Hub',
    type: 'outdoor',
    description: 'Waterfront meetup point with lockers, showers, and pacers.',
    location: {
      lat: -27.4817,
      lng: 153.023,
      address: 'Stanley St Plaza',
      city: 'South Brisbane',
      state: 'QLD',
      postalCode: '4101',
    },
    amenities: ['secure lockers', 'showers', 'pace groups', 'refill station'],
    sports: ['Running'],
    capacity: 80,
    images: [],
    phone: '+61-7-3550-4420',
    email: 'crew@sbrunninghub.com',
    website: 'sbrunninghub.com',
    ownerId: 'user-venue-5',
    managerId: undefined,
    basePrice: 0,
    currency: 'AUD',
    priceModel: 'free',
    isVerified: true,
    verificationDate: new Date(),
    rating: 4.6,
    ratingCount: 39,
    gamesHosted: 284,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'venue-hiking-1',
    name: 'Mount Coot-tha Trail Base',
    type: 'outdoor',
    description: 'Trailhead facilities with guides, maps, and sunrise meetups.',
    location: {
      lat: -27.4839,
      lng: 152.9649,
      address: 'JC Slaughter Falls',
      city: 'Toowong',
      state: 'QLD',
      postalCode: '4066',
    },
    amenities: ['trail maps', 'guided walks', 'parking', 'coffee cart'],
    sports: ['Hiking'],
    capacity: 45,
    images: [],
    phone: '+61-7-3900-1150',
    email: 'explore@cootthabase.com',
    website: 'cootthabase.com',
    ownerId: 'user-venue-6',
    managerId: undefined,
    basePrice: 5,
    currency: 'AUD',
    priceModel: 'per_game',
    isVerified: false,
    verificationDate: undefined,
    rating: 4.8,
    ratingCount: 41,
    gamesHosted: 122,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const simulateDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const venuesService = {
  async getVenues(filters?: VenueFilter): Promise<ApiResponse<PaginatedResponse<Venue>>> {
    await simulateDelay(500)

    let results = [...mockVenues]

    if (filters?.sport) {
      results = results.filter((venue) => venue.sports.includes(filters.sport!))
    }
    if (filters?.type) {
      results = results.filter((venue) => venue.type === filters.type)
    }
    if (filters?.minRating) {
      results = results.filter((venue) => venue.rating >= filters.minRating!)
    }

    const page = filters?.page ?? 1
    const pageSize = filters?.pageSize ?? 10
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      success: true,
      data: {
        data: results.slice(start, end),
        total: results.length,
        page,
        pageSize,
        hasMore: end < results.length,
      },
      timestamp: new Date(),
    }
  },

  async getVenueById(id: string): Promise<ApiResponse<Venue>> {
    await simulateDelay(300)

    const venue = mockVenues.find((item) => item.id === id)
    if (!venue) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Venue not found',
        },
        timestamp: new Date(),
      }
    }

    return {
      success: true,
      data: venue,
      timestamp: new Date(),
    }
  },

  async createVenue(input: CreateVenueInput, ownerId: string): Promise<ApiResponse<Venue>> {
    await simulateDelay(1000)

    const newVenue: Venue = {
      id: `venue-${Math.random().toString(36).slice(2)}`,
      ...input,
      ownerId,
      managerId: undefined,
      images: [],
      isVerified: false,
      rating: 0,
      ratingCount: 0,
      gamesHosted: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockVenues.push(newVenue)

    return {
      success: true,
      data: newVenue,
      timestamp: new Date(),
    }
  },
}

import { ApiResponse, CreateVenueInput, PaginatedResponse, Venue, VenueFilter } from '@/types'

const mockVenues: Venue[] = [
  {
    id: 'venue-1',
    name: 'Kangaroo Point Climbing',
    type: 'gym',
    description: 'Premier indoor climbing gym with rope and bouldering walls',
    location: {
      lat: -27.4705,
      lng: 151.8391,
      address: '123 Kangaroo Point Drive',
      city: 'Brisbane',
      state: 'QLD',
      postalCode: '4169',
    },
    amenities: ['rope climbing', 'bouldering', 'equipment rental', 'cafe', 'parking'],
    sports: ['Climbing', 'Bouldering'],
    capacity: 50,
    images: [],
    phone: '+61-7-1234-5678',
    email: 'info@kangaroclimbing.com',
    website: 'kangaroclimbing.com',
    ownerId: 'user-venue-1',
    managerId: undefined,
    basePrice: 15,
    currency: 'AUD',
    priceModel: 'per_game',
    isVerified: true,
    verificationDate: new Date(),
    rating: 4.7,
    ratingCount: 42,
    gamesHosted: 156,
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

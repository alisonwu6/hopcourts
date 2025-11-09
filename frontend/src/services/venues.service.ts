import { apiRequest } from './apiClient'
import { ApiResponse, PaginatedResponse, PlayerVenue, VenueFilter } from '@/types'

const adaptVenue = (venue: any): PlayerVenue => ({
  id: String(venue.id),
  name: venue.name,
  type: venue.type ?? 'court',
  sports: venue.sports ?? [],
  location: {
    name: venue.name,
    address: venue.address ?? '',
    city: venue.city ?? '',
  },
  rating: venue.rating ?? 4.6,
  reviewCount: venue.ratingCount ?? 0,
  memberCount: venue.capacity ?? 0,
  gamesThisMonth: venue.gamesHosted ?? 0,
  amenities: venue.amenities ?? [],
})

const wrapSuccess = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date(),
})

export const venuesService = {
  async getVenues(_filters?: VenueFilter): Promise<ApiResponse<PaginatedResponse<PlayerVenue>>> {
    const response = await apiRequest<{ data: any[] }>('GET', '/venues', { auth: false })
    const venues = response.data.map(adaptVenue)
    return wrapSuccess({
      data: venues,
      total: venues.length,
      page: 1,
      pageSize: venues.length,
      hasMore: false,
    })
  },

  async getVenueById(id: string): Promise<ApiResponse<PlayerVenue>> {
    const venue = await apiRequest<any>('GET', `/venues/${id}`, { auth: false })
    return wrapSuccess(adaptVenue(venue))
  },
}

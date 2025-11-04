import { ApiResponse, Host, HostFilter, PaginatedResponse, UpdateHostProfileInput } from '@/types'

const mockHosts: Host[] = [
  {
    id: 'host-1',
    userId: 'user-1',
    name: 'Blue Carter',
    bio: 'Community point guard organising friendly basketball runs.',
    type: 'individual',
    verified: true,
    gamesHosted: 64,
    rating: 4.9,
    ratingCount: 112,
    followerCount: 420,
    sports: ['Basketball', 'Pickleball'],
    mostRecentRatings: [5, 5, 5, 4, 5, 5, 5, 5, 4, 5],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'host-2',
    userId: 'user-2',
    name: 'Zoe Patel',
    bio: 'Leading relaxed riverfront runs and weekend hikes for newcomers.',
    type: 'individual',
    verified: false,
    gamesHosted: 41,
    rating: 4.7,
    ratingCount: 58,
    followerCount: 235,
    sports: ['Running', 'Hiking'],
    mostRecentRatings: [4, 5, 5, 4, 5, 5, 5, 4, 5, 4],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'host-3',
    userId: 'user-3',
    name: 'Mika Chen',
    bio: 'Belay certified coach guiding climbers from first tie-in to lead routes.',
    type: 'individual',
    verified: true,
    gamesHosted: 88,
    rating: 4.9,
    ratingCount: 96,
    followerCount: 318,
    sports: ['Climbing'],
    mostRecentRatings: [5, 5, 5, 5, 4, 5, 5, 5, 5, 5],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'host-4',
    userId: 'user-4',
    name: 'Ivy Tran',
    bio: 'Serving upbeat badminton doubles and skills nights around Brisbane.',
    type: 'individual',
    verified: false,
    gamesHosted: 37,
    rating: 4.6,
    ratingCount: 44,
    followerCount: 190,
    sports: ['Badminton'],
    mostRecentRatings: [4, 5, 4, 5, 4, 5, 5, 4, 5, 4],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'host-5',
    userId: 'user-5',
    name: 'Jo Rivera',
    bio: 'Pickleball league organiser focused on fun ladders and fair play.',
    type: 'organization',
    verified: true,
    gamesHosted: 52,
    rating: 4.8,
    ratingCount: 61,
    followerCount: 275,
    sports: ['Pickleball', 'Basketball'],
    mostRecentRatings: [5, 5, 5, 4, 5, 5, 5, 5, 5, 5],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'host-6',
    userId: 'user-6',
    name: 'Noah Green',
    bio: 'Trail leader planning sunrise hikes and weekend adventure treks.',
    type: 'individual',
    verified: false,
    gamesHosted: 33,
    rating: 4.8,
    ratingCount: 47,
    followerCount: 210,
    sports: ['Hiking'],
    mostRecentRatings: [5, 5, 5, 4, 5, 5, 4, 5, 5, 5],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const simulateDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const hostsService = {
  async getHostById(id: string): Promise<ApiResponse<Host>> {
    await simulateDelay(300)

    const host = mockHosts.find((item) => item.id === id)
    if (!host) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Host not found',
        },
        timestamp: new Date(),
      }
    }

    return {
      success: true,
      data: host,
      timestamp: new Date(),
    }
  },

  async getHosts(filters?: HostFilter): Promise<ApiResponse<PaginatedResponse<Host>>> {
    await simulateDelay(500)

    let results = [...mockHosts]

    if (filters?.minRating) {
      results = results.filter((host) => host.rating >= filters.minRating!)
    }
    if (filters?.verified !== undefined) {
      results = results.filter((host) => host.verified === filters.verified)
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

  async updateHostProfile(hostId: string, input: UpdateHostProfileInput): Promise<ApiResponse<Host>> {
    await simulateDelay(500)

    const host = mockHosts.find((item) => item.id === hostId)
    if (!host) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Host not found',
        },
        timestamp: new Date(),
      }
    }

    Object.assign(host, input, { updatedAt: new Date() })

    return {
      success: true,
      data: host,
      timestamp: new Date(),
    }
  },

  async createHostProfile(userId: string, name: string, type: Host['type']): Promise<ApiResponse<Host>> {
    await simulateDelay(500)

    const newHost: Host = {
      id: `host-${Math.random().toString(36).slice(2)}`,
      userId,
      name,
      bio: '',
      type,
      verified: false,
      gamesHosted: 0,
      rating: 0,
      ratingCount: 0,
      followerCount: 0,
      mostRecentRatings: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockHosts.push(newHost)

    return {
      success: true,
      data: newHost,
      timestamp: new Date(),
    }
  },
}

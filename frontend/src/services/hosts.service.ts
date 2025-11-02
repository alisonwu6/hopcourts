import { ApiResponse, Host, HostFilter, PaginatedResponse, UpdateHostProfileInput } from '@/types'

const mockHosts: Host[] = [
  {
    id: 'host-1',
    userId: 'user-1',
    name: 'Tom Chen',
    bio: 'Love running and connecting people through sports',
    type: 'individual',
    verified: false,
    gamesHosted: 52,
    rating: 4.8,
    ratingCount: 48,
    followerCount: 127,
    mostRecentRatings: [5, 5, 4, 5, 5, 4, 5, 4, 5, 5],
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

import { ApiResponse, User } from '@/types'

const simulateDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    await simulateDelay(1000)

    if (!email || !password) {
      return {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email and password required',
        },
        timestamp: new Date(),
      }
    }

    const mockUser: User = {
      id: 'user-1',
      email,
      name: 'Test User',
      location: 'Brisbane',
      sports: ['Running'],
      skillLevel: 'intermediate',
      following: [],
      followers: [],
      managedVenues: [],
      sessionsAttended: 0,
      sessionsHosted: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return {
      success: true,
      data: {
        user: mockUser,
        token: `mock-jwt-token-${Date.now()}`,
      },
      timestamp: new Date(),
    }
  },

  async signup(name: string, email: string, password: string, sports: string[]): Promise<ApiResponse<{ user: User; token: string }>> {
    await simulateDelay(1000)

    if (!name || !email || !password) {
      return {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Name, email, and password required',
        },
        timestamp: new Date(),
      }
    }

    const mockUser: User = {
      id: `user-${Math.random().toString(36).slice(2)}`,
      email,
      name,
      location: 'Brisbane',
      sports,
      skillLevel: 'beginner',
      following: [],
      followers: [],
      managedVenues: [],
      sessionsAttended: 0,
      sessionsHosted: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return {
      success: true,
      data: {
        user: mockUser,
        token: `mock-jwt-token-${Date.now()}`,
      },
      timestamp: new Date(),
    }
  },

  async logout(): Promise<ApiResponse<null>> {
    await simulateDelay(500)
    return {
      success: true,
      data: null,
      timestamp: new Date(),
    }
  },

  async getCurrentUser(token: string): Promise<ApiResponse<User>> {
    await simulateDelay(300)

    if (!token) {
      return {
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'No token provided',
        },
        timestamp: new Date(),
      }
    }

    const mockUser: User = {
      id: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
      location: 'Brisbane',
      sports: ['Running'],
      skillLevel: 'intermediate',
      following: [],
      followers: [],
      managedVenues: [],
      sessionsAttended: 0,
      sessionsHosted: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return {
      success: true,
      data: mockUser,
      timestamp: new Date(),
    }
  },
}

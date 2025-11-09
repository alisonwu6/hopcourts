import { apiRequest } from './apiClient'
import { AUTH_TOKEN_STORAGE_KEY } from '@/constants/storage'
import { User } from '@/types'
import { OnboardingStatus } from '@/store/onboardingStore'

interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
  name: string
  role?: 'player' | 'venue_manager'
}

export interface SignInResponse {
  token: string
  user: User
  onboardingStatus: OnboardingStatus
}

type RawUser = Record<string, any>

const adaptUser = (payload: RawUser): User => ({
  id: String(payload.id),
  email: payload.email,
  name: payload.full_name ?? payload.name ?? '',
  avatar: payload.avatar_url ?? undefined,
  phone: payload.phone ?? undefined,
  bio: payload.bio ?? '',
  location: payload.city ?? '',
  sports: (payload.sports ?? []).map((sport: any) => sport.sport || sport),
  skillLevel: 'beginner',
  following: [],
  followers: [],
  hostProfile: undefined,
  managedVenues: [],
  gamesAttended: payload.gamesAttended ?? 0,
  gamesHosted: payload.gamesHosted ?? 0,
  createdAt: payload.created_at ? new Date(payload.created_at) : new Date(),
  updatedAt: payload.updated_at ? new Date(payload.updated_at) : new Date(),
})

const adaptSignInResponse = (data: any): SignInResponse => ({
  token: data.token,
  user: adaptUser(data.user),
  onboardingStatus: data.onboardingStatus,
})

export const authService = {
  async login(email: string, password: string): Promise<SignInResponse> {
    const response = await apiRequest<any>('POST', '/auth/login', {
      auth: false,
      body: { email, password },
    })
    return adaptSignInResponse(response)
  },

  async register(data: RegisterRequest): Promise<SignInResponse> {
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match')
    }
    const response = await apiRequest<any>('POST', '/auth/signup', {
      auth: false,
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role ?? 'player',
      },
    })
    return adaptSignInResponse(response)
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('POST', '/auth/logout', {})
    } catch {
      // ignore network failures on logout
    }
  },

  async checkUsername(username: string): Promise<{ available: boolean }> {
    const response = await apiRequest<{ available: boolean }>(
      'GET',
      '/users/check/username',
      {
        auth: false,
        params: { value: username },
      }
    )
    return response
  },

  async getOnboardingStatus(): Promise<OnboardingStatus> {
    return apiRequest<OnboardingStatus>('GET', '/onboarding/player/progress', {})
  },

  async isOnboardingComplete(): Promise<boolean> {
    const status = await this.getOnboardingStatus()
    return status.isComplete
  },

  async completeOnboarding(payload: {
    fullName?: string
    city?: string
    gender?: string
    username?: string
    sports?: Array<{ sport: string; skillLevel: string; playingStyle?: string }>
    areas?: Array<{ areaName: string; postalCode?: string }>
    motivation?: string
  }): Promise<SignInResponse> {
    await apiRequest('POST', '/onboarding/player/complete', {
      body: {
        fullName: payload.fullName,
        city: payload.city,
        gender: payload.gender,
        username: payload.username,
        sports: payload.sports?.map((sport) => ({
          sport: sport.sport,
          skill_level: sport.skillLevel,
          playing_style: sport.playingStyle,
        })),
        areas: payload.areas?.map((area) => ({
          area_name: area.areaName,
          postal_code: area.postalCode,
        })),
        motivation: payload.motivation,
      },
    })
    const onboardingStatus = await this.getOnboardingStatus()
    const profile = await apiRequest<any>('GET', '/users/me', {})
    const currentToken =
      typeof window !== 'undefined'
        ? window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ?? ''
        : ''
    return {
      token: currentToken,
      user: adaptUser(profile),
      onboardingStatus,
    }
  },
}

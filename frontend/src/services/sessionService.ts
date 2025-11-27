import { apiRequest } from './apiClient'
import { AUTH_TOKEN_STORAGE_KEY } from '@/constants/storage'
import { User } from '@/types'
import { OnboardingStatus } from '@/store/onboardingStore'

export interface SessionContext {
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
  eventsAttended: payload.eventsAttended ?? payload.gamesAttended ?? 0,
  eventsHosted: payload.eventsHosted ?? payload.gamesHosted ?? 0,
  createdAt: payload.created_at ? new Date(payload.created_at) : new Date(),
  updatedAt: payload.updated_at ? new Date(payload.updated_at) : new Date(),
})

async function fetchAuthenticatedContext(token: string) {
  const [profile, onboardingStatus] = await Promise.all([
    apiRequest<any>('GET', '/users/me', {
      authTokenOverride: token,
    }),
    apiRequest<OnboardingStatus>('GET', '/onboarding/player/progress', {
      authTokenOverride: token,
    }),
  ])

  return {
    user: adaptUser(profile),
    onboardingStatus,
  }
}

export const sessionService = {
  async bootstrap(token: string): Promise<SessionContext> {
    const context = await fetchAuthenticatedContext(token)
    return {
      token,
      ...context,
    }
  },

  async logoutBackend(): Promise<void> {
    try {
      await apiRequest('POST', '/auth/logout', {})
    } catch {
      // ignore network failures on logout
    }
  },

  async checkUsername(username: string): Promise<{ available: boolean }> {
    return apiRequest<{ available: boolean }>('GET', '/users/check/username', {
      auth: false,
      params: { value: username },
    })
  },

  async getOnboardingStatus(): Promise<OnboardingStatus> {
    return apiRequest<OnboardingStatus>('GET', '/onboarding/player/progress', {})
  },

  async completeOnboarding(payload: {
    fullName?: string
    city?: string
    gender?: string
    username?: string
    sports?: Array<{ sport: string; skillLevel: string; playingStyle?: string }>
    areas?: Array<{ areaName: string; postalCode?: string }>
    motivation?: string
  }): Promise<SessionContext> {
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
        ? window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ??
          window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ??
          ''
        : ''
    return {
      token: currentToken,
      user: adaptUser(profile),
      onboardingStatus,
    }
  },
}

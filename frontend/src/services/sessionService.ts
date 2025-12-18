import { AUTH_TOKEN_STORAGE_KEY } from '@/constants/storage'
import type { User } from '@/types'
import type { OnboardingStatus } from '@/store/onboardingStore'
import { supabase } from '@/lib/supabase'

export interface SessionContext {
  token: string
  user: User
  onboardingStatus: OnboardingStatus
}

type SupabaseUser = {
  id?: string
  email?: string
  created_at?: string
  user_metadata?: Record<string, any>
}

const STATUS_STORAGE_KEY = 'sportsmatch_onboarding_status_v1'

const DEFAULT_STATUS: OnboardingStatus = {
  hasRole: false,
  hasBasicInfo: false,
  hasUsername: false,
  hasSports: false,
  hasSkillLevels: false,
  hasPlayingStyle: false,
  hasPlayFrequency: false,
  hasAvatar: false,
  hasMotivation: false,
  hasVenueDetails: false,
  hasVenueSports: false,
  hasVenueCourts: false,
  hasVenuePhoto: false,
  hasVenueVerification: false,
  isComplete: false,
  signUpSource: 'unknown',
}

const readStoredStatus = (): OnboardingStatus => {
  if (typeof window === 'undefined') return DEFAULT_STATUS
  const raw = window.localStorage.getItem(STATUS_STORAGE_KEY)
  if (!raw) return DEFAULT_STATUS
  try {
    return { ...DEFAULT_STATUS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_STATUS
  }
}

const persistStatus = (status: OnboardingStatus) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(status))
}

const buildUser = (payload: SupabaseUser | null): User => {
  const now = new Date()
  const metadata = payload?.user_metadata ?? {}
  return {
    id: String(payload?.id ?? ''),
    email: payload?.email ?? '',
    name: metadata.full_name ?? metadata.name ?? '',
    avatar: metadata.avatar_url ?? metadata.picture ?? undefined,
    phone: metadata.phone ?? undefined,
    bio: metadata.bio ?? '',
    location: metadata.city ?? '',
    sports: [],
    skillLevel: 'beginner',
    following: [],
    followers: [],
    managedVenues: [],
    eventsAttended: 0,
    eventsHosted: 0,
    createdAt: payload?.created_at ? new Date(payload.created_at) : now,
    updatedAt: now,
  }
}

const fetchSupabaseUser = async (token: string) => {
  if (!supabase || !token) return null
  const { data, error } = await supabase.auth.getUser(token)
  if (error) return null
  return data.user as SupabaseUser
}

export const sessionService = {
  async bootstrap(token: string): Promise<SessionContext> {
    const supabaseUser = await fetchSupabaseUser(token)
    const onboardingStatus = readStoredStatus()
    return {
      token,
      user: buildUser(supabaseUser),
      onboardingStatus,
    }
  },

  async logoutBackend(): Promise<void> {
    return
  },

  async checkUsername(): Promise<{ available: boolean }> {
    return { available: true }
  },

  async getOnboardingStatus(): Promise<OnboardingStatus> {
    return readStoredStatus()
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
    const currentToken =
      typeof window !== 'undefined'
        ? window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ??
          window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ??
          ''
        : ''

    const nextStatus: OnboardingStatus = {
      ...readStoredStatus(),
      hasBasicInfo: Boolean(payload.fullName || payload.city),
      hasUsername: Boolean(payload.username),
      hasSports: Boolean(payload.sports?.length),
      hasMotivation: Boolean(payload.motivation),
      isComplete: true,
    }
    persistStatus(nextStatus)

    const supabaseUser = await fetchSupabaseUser(currentToken)
    return {
      token: currentToken,
      user: buildUser(supabaseUser),
      onboardingStatus: nextStatus,
    }
  },
}

import { AUTH_TOKEN_STORAGE_KEY } from '@/constants/storage'
import type { User } from '@/types'
import { supabase } from '@/lib/supabase'

export interface SessionContext {
  token: string
  user: User
}

type SupabaseUser = {
  id?: string
  email?: string
  created_at?: string
  user_metadata?: Record<string, any>
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
    teammateCount: 0,
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

import { http } from '@/api/http'
import type { ApiResponse } from '@/api/types'

// ... existing imports

export const sessionService = {
  async bootstrap(token: string): Promise<SessionContext> {
    try {
      // 1. Fetch user profile from backend to check profile completion status
      // We explicitly pass the token since it might not be in storage yet
      const response = await http<ApiResponse<any>>('GET', '/me/profile', {
        headers: { Authorization: `Bearer ${token}` },
        tokenOverride: token,
      })

      const backendUser = response.data.user
      const userSports = response.data.sports || []

      // 2. Map backend response to Frontend User type
      const user: User = {
        id: backendUser.id,
        email: backendUser.email,
        name: backendUser.display_name || 'New User',
        avatar: backendUser.avatar_url,
        bio: backendUser.bio,
        location: backendUser.city_key || '',
        sports: userSports.map((s: any) => s.sport_key),
        skillLevel: 'beginner',
        following: [],
        followers: [],
        managedVenues: [],
        eventsAttended: backendUser.joined_count || 0,
        eventsHosted: backendUser.hosted_count || 0,
        teammateCount: backendUser.teammate_count || 0,
        gender: backendUser.gender,
        onboarding_completed_at: backendUser.onboarding_completed_at || null,
        createdAt: new Date(backendUser.created_at),
        updatedAt: new Date(backendUser.updated_at),
      }

      return {
        token,
        user,
      }
    } catch (error) {
      console.error('Bootstrap failed, falling back to basic auth:', error)
      const supabaseUser = await fetchSupabaseUser(token)
      if (!supabaseUser) throw new Error('Authentication failed')

      return {
        token,
        user: buildUser(supabaseUser),
      }
    }
  },

  async logoutBackend(): Promise<void> {
    return
  },

  async checkUsername(): Promise<{ available: boolean }> {
    return { available: true }
  },
}

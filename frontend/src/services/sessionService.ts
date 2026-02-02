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
    return {
      token,
      user: buildUser(supabaseUser),
    }
  },

  async logoutBackend(): Promise<void> {
    return
  },

  async checkUsername(): Promise<{ available: boolean }> {
    return { available: true }
  },
}

import { create } from 'zustand'
import { User } from '@/types'
import {
  signInWithEmail,
  signUpWithEmail,
  signOut as supabaseSignOut,
} from '@/services/authService'
import { sessionService } from '@/services/sessionService'

import { AUTH_TOKEN_STORAGE_KEY } from '@/constants/storage'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  token: string | null
  profileCache: any | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  signup: (name: string, email: string, password: string, remember?: boolean) => Promise<void>
  logout: () => Promise<void>
  hydrate: (silent?: boolean) => Promise<void>
  setAuthData: (
    user: User | null,
    token: string | null,
    options?: { remember?: boolean }
  ) => void
  setProfileCache: (profile: any | null) => void
  clearError: () => void
}

const persistToken = (token: string | null, remember = true) => {
  if (typeof window === 'undefined') return
  if (token) {
    const target = remember ? window.localStorage : window.sessionStorage
    const other = remember ? window.sessionStorage : window.localStorage
    target.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    other.removeItem(AUTH_TOKEN_STORAGE_KEY)
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    window.sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  }
}

const persistUserId = (userId: string | null, remember = true) => {
  if (typeof window === 'undefined') return
  const key = 'x-user-id'
  if (userId) {
    const target = remember ? window.localStorage : window.sessionStorage
    const other = remember ? window.sessionStorage : window.localStorage
    target.setItem(key, userId)
    other.removeItem(key)
  } else {
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  profileCache: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string, remember = true) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await signInWithEmail(email, password)
      if (error || !data?.session?.access_token) {
        throw new Error(error?.message ?? 'Unable to sign in with Supabase')
      }
      const response = await sessionService.bootstrap(data.session.access_token)
      const { token, user } = response
      persistToken(token, remember)
      persistUserId(user.id, remember)
      set({
        user,
        token,
        profileCache: null,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error?.message ?? 'Login failed',
        isLoading: false,
        user: null,
        token: null,
        profileCache: null,
        isAuthenticated: false,
      })
      persistToken(null)
      persistUserId(null)
    }
  },

  signup: async (name: string, email: string, password: string, remember = true) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await signUpWithEmail(email, password)
      if (error) {
        throw new Error(error.message)
      }
      if (!data.session?.access_token) {
        throw new Error('Signup successful. Please verify your email before logging in.')
      }
      const response = await sessionService.bootstrap(data.session.access_token)
      persistToken(response.token, remember)
      persistUserId(response.user.id, remember)
      set({
        user: response.user,
        token: response.token,
        profileCache: null,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error?.message ?? 'Signup failed',
        isLoading: false,
      })
      persistToken(null)
      persistUserId(null)
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await supabaseSignOut()
      await sessionService.logoutBackend()
    } catch (error: any) {
      set({ error: error?.message ?? 'Logout failed' })
    } finally {
      persistToken(null)
      persistUserId(null)
      set({
        user: null,
        token: null,
        profileCache: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  hydrate: async (silent = false) => {
    if (!silent) set({ isLoading: true, error: null })
    try {
      if (!supabase) throw new Error('Supabase 未設定')
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      const accessToken = data.session?.access_token
      if (!accessToken) {
        persistToken(null)
        persistUserId(null)
        set({
          user: null,
          token: null,
          profileCache: null,
          isAuthenticated: false,
          isLoading: false,
        })
        return
      }
      const context = await sessionService.bootstrap(accessToken)
      persistToken(context.token, true)
      persistUserId(context.user.id, true)
      set({
        user: context.user,
        token: context.token,
        profileCache: null,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (err: any) {
      set({
        error: err?.message ?? '無法載入登入狀態',
        isLoading: false,
        user: null,
        token: null,
        isAuthenticated: false,
      })
      persistToken(null)
      persistUserId(null)
    }
  },

  setAuthData: (user, token, options) => {
    persistToken(token, options?.remember ?? true)
    persistUserId(user?.id ?? null, options?.remember ?? true)
    set({
      user,
      token,
      profileCache: null,
      isAuthenticated: Boolean(user && token),
    })
  },

  setProfileCache: (profile) => set({ profileCache: profile }),
  clearError: () => set({ error: null }),
}))

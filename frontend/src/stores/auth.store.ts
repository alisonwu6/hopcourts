import { create } from 'zustand'
import { User } from '@/types'
import { signInWithEmail, signUpWithEmail, signOut as supabaseSignOut } from '@/services/authService'
import { sessionService } from '@/services/sessionService'
import { useSavedEventsStore } from './savedEvents.store'
import { useProfileStore } from './profile.store'

const hydrateBookmarks = () => void useSavedEventsStore.getState().fetchBookmarks()

let hydrateInflight: Promise<void> | null = null

import { AUTH_TOKEN_STORAGE_KEY } from '@/constants/storage'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isLoggingOut: boolean
  error: string | null
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  signup: (name: string, email: string, password: string, remember?: boolean) => Promise<void>
  logout: () => Promise<void>
  clearAuthState: () => void
  hydrate: (silent?: boolean) => Promise<void>
  setAuthData: (user: User | null, token: string | null, options?: { remember?: boolean }) => void
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
  isAuthenticated: false,
  isLoading: true,
  isLoggingOut: false,
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
      set({ user, token, isAuthenticated: true, isLoading: false })
      hydrateBookmarks()
      if (response.rawProfile) useProfileStore.getState().seedFromBootstrap(response.rawProfile)
    } catch (error: any) {
      set({
        error: error?.message ?? 'Login failed',
        isLoading: false,
        user: null,
        token: null,
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
      set({ user: response.user, token: response.token, isAuthenticated: true, isLoading: false })
      hydrateBookmarks()
      if (response.rawProfile) useProfileStore.getState().seedFromBootstrap(response.rawProfile)
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
    const current = useAuthStore.getState()
    if (current.isLoggingOut) return

    set({ isLoading: true, isLoggingOut: true })
    const hadSession = Boolean(current.user || current.token || current.isAuthenticated)

    if (!hadSession) {
      persistToken(null)
      persistUserId(null)
      useSavedEventsStore.getState().clearSavedEvents()
      useProfileStore.getState().clear()
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, isLoggingOut: false })
      return
    }

    try {
      await supabaseSignOut()
      await sessionService.logoutBackend()
    } catch (error: any) {
      set({ error: error?.message ?? 'Logout failed' })
    } finally {
      persistToken(null)
      persistUserId(null)
      useSavedEventsStore.getState().clearSavedEvents()
      useProfileStore.getState().clear()
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, isLoggingOut: false })
    }
  },

  clearAuthState: () => {
    persistToken(null)
    persistUserId(null)
    useProfileStore.getState().clear()
    set({ user: null, token: null, isAuthenticated: false, isLoading: false, isLoggingOut: false })
  },

  hydrate: (silent = false) => {
    if (!hydrateInflight) {
      hydrateInflight = (async () => {
        const hasToken =
          typeof window !== 'undefined' &&
          (window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY))

        if (!hasToken) {
          set({ isLoading: false, isAuthenticated: false, user: null, token: null })
          return
        }

        if (!silent) set({ isLoading: true, error: null })
        try {
          if (!supabase) throw new Error('Supabase 未設定')
          const { data, error } = await supabase.auth.getSession()
          if (error) throw error
          const accessToken = data.session?.access_token
          if (!accessToken) {
            persistToken(null)
            persistUserId(null)
            set({ user: null, token: null, isAuthenticated: false, isLoading: false })
            return
          }
          const context = await sessionService.bootstrap(accessToken)
          persistToken(context.token, true)
          persistUserId(context.user.id, true)
          const isAnonymous = !!data.session?.user?.is_anonymous
          set({
            user: { ...context.user, is_anonymous: isAnonymous },
            token: context.token,
            isAuthenticated: true,
            isLoading: false,
          })
          hydrateBookmarks()
          if (context.rawProfile) useProfileStore.getState().seedFromBootstrap(context.rawProfile)
        } catch (err: any) {
          set({
            error: err?.message ?? 'Unable to load login status',
            isLoading: false,
            user: null,
            token: null,
            isAuthenticated: false,
          })
          persistToken(null)
          persistUserId(null)
        }
      })().finally(() => {
        hydrateInflight = null
      })
    }
    return hydrateInflight
  },

  setAuthData: (user, token, options) => {
    persistToken(token, options?.remember ?? true)
    persistUserId(user?.id ?? null, options?.remember ?? true)
    set({ user, token, isAuthenticated: Boolean(user && token) })
  },

  clearError: () => set({ error: null }),
}))

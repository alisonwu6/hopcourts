import { create } from 'zustand'
import { User } from '@/types'
import { signInWithEmail, signUpWithEmail, signOut as supabaseSignOut } from '@/services/auth'
import { sessionService } from '@/services/sessionService'
import {
  OnboardingStatus,
  useOnboardingStore,
} from './onboardingStore'

import { AUTH_TOKEN_STORAGE_KEY } from '@/constants/storage'

interface AuthState {
  user: User | null
  token: string | null
  onboardingStatus: OnboardingStatus | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  signup: (name: string, email: string, password: string, remember?: boolean) => Promise<void>
  logout: () => Promise<void>
  setAuthData: (
    user: User | null,
    token: string | null,
    status?: OnboardingStatus | null,
    options?: { remember?: boolean }
  ) => void
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

const handleOnboardingInitialization = (status: OnboardingStatus, user: User | null) => {
  const onboarding = useOnboardingStore.getState()
  const inferredRole =
    user && (user.managedVenues?.length ?? 0) > 0 ? 'venue_manager' : user
      ? 'player'
      : null
  onboarding.initializeOnboarding(status, {
    fullName: user?.name ?? '',
    role: inferredRole,
    username: (user as any)?.username ?? '',
    avatarPreview: (user as any)?.avatar ?? undefined,
  })
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  onboardingStatus: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string, remember = true) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await signInWithEmail(email, password)
      if (error || !data?.session?.access_token) {
        throw new Error(error?.message ?? 'Unable to sign in with Supabase')
      }
      const response = await sessionService.bootstrap(data.session.access_token)
      const { token, user, onboardingStatus } = response
      persistToken(token, remember)
      handleOnboardingInitialization(onboardingStatus, user)
      set({
        user,
        token,
        onboardingStatus,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error?.message ?? 'Login failed',
        isLoading: false,
        user: null,
        token: null,
        onboardingStatus: null,
        isAuthenticated: false,
      })
      persistToken(null)
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
      handleOnboardingInitialization(response.onboardingStatus, response.user)
      set({
        user: response.user,
        token: response.token,
        onboardingStatus: response.onboardingStatus,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error?.message ?? 'Signup failed',
        isLoading: false,
      })
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
      useOnboardingStore.getState().reset()
      set({
        user: null,
        token: null,
        onboardingStatus: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  setAuthData: (user, token, status, options) => {
    persistToken(token, options?.remember ?? true)
    if (status) {
      handleOnboardingInitialization(status, user)
    }
    set({
      user,
      token,
      onboardingStatus: status ?? null,
      isAuthenticated: Boolean(user && token),
    })
  },

  clearError: () => set({ error: null }),
}))

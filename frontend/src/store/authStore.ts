import { create } from 'zustand'
import { User } from '@/types'
import { authService } from '@/services/authService'
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
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setAuthData: (user: User | null, token: string | null, status?: OnboardingStatus | null) => void
  clearError: () => void
}

const persistToken = (token: string | null) => {
  if (typeof window === 'undefined') return
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
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

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.login(email, password)
      const { token, user, onboardingStatus } = response
      persistToken(token)
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

  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.register({
        email,
        password,
        confirmPassword: password,
        name,
      })
      const { token, user, onboardingStatus } = response
      persistToken(token)
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
        error: error?.message ?? 'Signup failed',
        isLoading: false,
      })
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await authService.logout()
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

  setAuthData: (user, token, status) => {
    persistToken(token)
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

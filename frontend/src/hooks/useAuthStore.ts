import { create } from 'zustand'
import { User } from '@/types'
import { authService } from '@/services'
import { useOnboardingStore } from './useOnboardingStore'

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, sports: string[]) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  clearError: () => void
}

const TOKEN_KEY = 'auth_token'

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.login(email, password)
      if (response.success && response.data) {
        set({
          user: response.data.user,
          token: response.data.token,
          isLoading: false,
        })
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(TOKEN_KEY, response.data.token)
        }
        const onboardingState = useOnboardingStore.getState()
        const inferredRole =
          (response.data.user.sessionsHosted ?? 0) > 0 ? 'host' : onboardingState.role
        onboardingState.completeOnboarding({
          role: inferredRole,
          preferredSports: response.data.user.sports ?? [],
        })
      } else {
        set({
          error: response.error?.message ?? 'Login failed',
          isLoading: false,
        })
      }
    } catch {
      set({
        error: 'An error occurred',
        isLoading: false,
      })
    }
  },

  signup: async (name: string, email: string, password: string, sports: string[]) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.signup(name, email, password, sports)
      if (response.success && response.data) {
        set({
          user: response.data.user,
          token: response.data.token,
          isLoading: false,
        })
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(TOKEN_KEY, response.data.token)
        }
        const onboardingState = useOnboardingStore.getState()
        onboardingState.setPreferredSports(response.data.user.sports ?? sports)
      } else {
        set({
          error: response.error?.message ?? 'Signup failed',
          isLoading: false,
        })
      }
    } catch {
      set({
        error: 'An error occurred',
        isLoading: false,
      })
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await authService.logout()
      set({ user: null, token: null, isLoading: false })
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(TOKEN_KEY)
      }
      useOnboardingStore.getState().reset()
    } catch {
      set({ isLoading: false, error: 'Logout failed' })
    }
  },

  setUser: (user: User | null) => set({ user }),

  clearError: () => set({ error: null }),
}))

import { create } from 'zustand'
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'

export type OnboardingRole = 'player' | 'host'

interface OnboardingPreferences {
  role: OnboardingRole
  preferredSports: string[]
  hasCompletedOnboarding: boolean
}

interface OnboardingState extends OnboardingPreferences {
  setRole: (role: OnboardingRole) => void
  toggleSport: (sport: string) => void
  setPreferredSports: (sports: string[]) => void
  completeOnboarding: (preferences?: Partial<Omit<OnboardingPreferences, 'hasCompletedOnboarding'>>) => void
  reset: () => void
}

const DEFAULT_ROLE: OnboardingRole = 'player'

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

const storage =
  typeof window !== 'undefined'
    ? createJSONStorage(() => window.localStorage)
    : noopStorage

export const useOnboardingStore = create(
  persist<OnboardingState>(
    (set) => ({
      role: DEFAULT_ROLE,
      preferredSports: [],
      hasCompletedOnboarding: false,
      setRole: (role) => set({ role }),
      toggleSport: (sport) =>
        set((state) => {
          const exists = state.preferredSports.includes(sport)
          const preferredSports = exists
            ? state.preferredSports.filter((item) => item !== sport)
            : [...state.preferredSports, sport]
          return { preferredSports }
        }),
      setPreferredSports: (sports) => set({ preferredSports: Array.from(new Set(sports)) }),
      completeOnboarding: (preferences) =>
        set((state) => ({
          role: preferences?.role ?? state.role,
          preferredSports: preferences?.preferredSports ?? state.preferredSports,
          hasCompletedOnboarding: true,
        })),
      reset: () => set({ role: DEFAULT_ROLE, preferredSports: [], hasCompletedOnboarding: false }),
    }),
    {
      name: 'sportsmatch:onboarding',
      storage,
      partialize: (state) => ({
        role: state.role,
        preferredSports: state.preferredSports,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
)

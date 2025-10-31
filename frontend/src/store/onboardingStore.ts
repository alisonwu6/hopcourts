import { create } from 'zustand'

export type OnboardingRole = 'player' | 'host'

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'

export interface OnboardingStatus {
  hasRole: boolean
  hasBasicInfo: boolean
  hasUsername: boolean
  hasSports: boolean
  hasSkillLevels: boolean
  hasAvatar: boolean
  isComplete: boolean
  signUpSource: 'email_password' | 'google' | 'apple' | 'unknown'
  oauthData?: {
    email: string
    name?: string
    picture?: string
  }
}

export interface OnboardingData {
  role: OnboardingRole | null
  fullName: string
  age: number | null
  location: string
  username: string
  usernameChecked: boolean
  usernameAvailable: boolean
  sports: string[]
  skillLevels: Record<string, SkillLevel>
  avatar: File | null
  avatarPreview: string | null
  motivations: string[]
  startedAt: number
  completedSteps: number[]
}

interface OnboardingState {
  data: OnboardingData
  status: OnboardingStatus | null
  currentStep: number
  requiredSteps: number[]
  isLoading: boolean
  error: string | null
  initializeOnboarding: (status: OnboardingStatus, existingData?: Partial<OnboardingData>) => void
  setStatus: (status: OnboardingStatus) => void
  getNextStep: () => number | null
  markStepCompleted: (step: number) => void
  setRole: (role: OnboardingRole) => void
  setBasicInfo: (fullName: string, age: number, location: string) => void
  setUsername: (username: string, available: boolean) => void
  addSport: (sport: string) => void
  removeSport: (sport: string) => void
  setSkillLevel: (sport: string, level: SkillLevel) => void
  setAvatar: (file: File | null, preview: string | null) => void
  setMotivations: (motivations: string[]) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const INITIAL_DATA: OnboardingData = {
  role: null,
  fullName: '',
  age: null,
  location: '',
  username: '',
  usernameChecked: false,
  usernameAvailable: false,
  sports: [],
  skillLevels: {},
  avatar: null,
  avatarPreview: null,
  motivations: [],
  startedAt: Date.now(),
  completedSteps: [],
}

const INITIAL_STATUS: OnboardingStatus = {
  hasRole: false,
  hasBasicInfo: false,
  hasUsername: false,
  hasSports: false,
  hasSkillLevels: false,
  hasAvatar: false,
  isComplete: false,
  signUpSource: 'unknown',
}

const ROLE_STEP = 1
const BASIC_INFO_STEP = 2
const USERNAME_STEP = 3
const SPORTS_STEP = 4
const SKILL_LEVEL_STEP = 5
const AVATAR_STEP = 6

const determineRequiredSteps = (status: OnboardingStatus, role: OnboardingRole | null) => {
  const required: number[] = []
  if (!status.hasRole) required.push(ROLE_STEP)
  if (!status.hasBasicInfo) required.push(BASIC_INFO_STEP)
  if (!status.hasUsername) required.push(USERNAME_STEP)

  const shouldIncludePlayerSteps = role === 'player' || (!role && !status.hasSports)

  if (shouldIncludePlayerSteps && !status.hasSports) required.push(SPORTS_STEP)
  if (shouldIncludePlayerSteps && !status.hasSkillLevels) required.push(SKILL_LEVEL_STEP)

  if (!required.includes(AVATAR_STEP)) {
    required.push(AVATAR_STEP)
  }

  return required
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  data: INITIAL_DATA,
  status: null,
  currentStep: ROLE_STEP,
  requiredSteps: [],
  isLoading: false,
  error: null,

  initializeOnboarding: (status, existingData) => {
    const baseStatus = { ...INITIAL_STATUS, ...status }
    let prefilledData: OnboardingData = {
      ...INITIAL_DATA,
      ...existingData,
    }

    if (status.oauthData?.name && !prefilledData.fullName) {
      prefilledData = { ...prefilledData, fullName: status.oauthData.name }
    }
    if (status.oauthData?.picture && !prefilledData.avatarPreview) {
      prefilledData = { ...prefilledData, avatarPreview: status.oauthData.picture }
    }

    const role = prefilledData.role
    const requiredSteps = determineRequiredSteps(baseStatus, role)

    set({
      status: baseStatus,
      data: prefilledData,
      requiredSteps,
      currentStep: requiredSteps[0] ?? ROLE_STEP,
      isLoading: false,
      error: null,
    })
  },

  setStatus: (status) => {
    set({ status })
  },

  getNextStep: () => {
    const { requiredSteps, currentStep } = get()
    const currentIndex = requiredSteps.indexOf(currentStep)
    if (currentIndex === -1) return requiredSteps[0] ?? null
    return requiredSteps[currentIndex + 1] ?? null
  },

  markStepCompleted: (step) => {
    set((state) => ({
      data: {
        ...state.data,
        completedSteps: Array.from(new Set([...state.data.completedSteps, step])),
      },
    }))
  },

  setRole: (role) => {
    set((state) => {
      const updatedStatus = state.status ? { ...state.status, hasRole: true } : null
      const requiredSteps = determineRequiredSteps(
        updatedStatus ?? INITIAL_STATUS,
        role
      )
      return {
        data: { ...state.data, role },
        status: updatedStatus,
        requiredSteps,
        currentStep: requiredSteps.includes(state.currentStep) ? state.currentStep : requiredSteps[0] ?? ROLE_STEP,
      }
    })
    get().markStepCompleted(ROLE_STEP)
  },

  setBasicInfo: (fullName, age, location) => {
    set((state) => {
      const updatedStatus = state.status ? { ...state.status, hasBasicInfo: true } : null
      return {
        data: { ...state.data, fullName, age, location },
        status: updatedStatus,
      }
    })
    get().markStepCompleted(BASIC_INFO_STEP)
  },

  setUsername: (username, available) => {
    set((state) => {
      const updatedStatus = state.status ? { ...state.status, hasUsername: available && username.length > 0 } : null
      return {
        data: {
          ...state.data,
          username,
          usernameAvailable: available,
          usernameChecked: true,
        },
        status: updatedStatus,
      }
    })
    if (available) {
      get().markStepCompleted(USERNAME_STEP)
    }
  },

  addSport: (sport) => {
    set((state) => {
      if (state.data.sports.includes(sport)) return state
      const sports = [...state.data.sports, sport]
      const updatedStatus = state.status ? { ...state.status, hasSports: sports.length > 0 } : null
      return {
        data: { ...state.data, sports },
        status: updatedStatus,
      }
    })
    get().markStepCompleted(SPORTS_STEP)
  },

  removeSport: (sport) => {
    set((state) => {
      const sports = state.data.sports.filter((item) => item !== sport)
      const skillLevels = { ...state.data.skillLevels }
      delete skillLevels[sport]
      const updatedStatus = state.status ? { ...state.status, hasSports: sports.length > 0 } : null
      return {
        data: { ...state.data, sports, skillLevels },
        status: updatedStatus,
      }
    })
  },

  setSkillLevel: (sport, level) => {
    set((state) => {
      const skillLevels = { ...state.data.skillLevels, [sport]: level }
      const hasAllLevels =
        state.data.sports.length > 0 &&
        state.data.sports.every((item) => skillLevels[item])
      const updatedStatus = state.status
        ? { ...state.status, hasSkillLevels: hasAllLevels }
        : null
      return {
        data: { ...state.data, skillLevels },
        status: updatedStatus,
      }
    })
    get().markStepCompleted(SKILL_LEVEL_STEP)
  },

  setAvatar: (file, preview) => {
    set((state) => {
      const updatedStatus = state.status ? { ...state.status, hasAvatar: Boolean(file || preview) } : null
      return {
        data: { ...state.data, avatar: file, avatarPreview: preview },
        status: updatedStatus,
      }
    })
    get().markStepCompleted(AVATAR_STEP)
  },

  setMotivations: (motivations) => {
    set((state) => ({
      data: { ...state.data, motivations },
    }))
  },

  nextStep: () => {
    const nextStep = get().getNextStep()
    if (nextStep) {
      set({ currentStep: nextStep })
    }
  },

  prevStep: () => {
    const { requiredSteps, currentStep } = get()
    const currentIndex = requiredSteps.indexOf(currentStep)
    if (currentIndex > 0) {
      set({ currentStep: requiredSteps[currentIndex - 1] })
    }
  },

  reset: () =>
    set({
      data: { ...INITIAL_DATA, startedAt: Date.now() },
      status: null,
      requiredSteps: [],
      currentStep: ROLE_STEP,
      isLoading: false,
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))

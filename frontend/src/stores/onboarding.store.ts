import { create } from 'zustand'

export type OnboardingRole = 'player' | 'venue_manager'

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'
export type PlayingStyle = 'social' | 'competitive' | 'learning' | 'mixed'
export type PlayFrequency = 'new' | 'casual' | 'regular' | 'frequent'

type NullableNumber = number | null

export interface OnboardingStatus {
  hasRole: boolean
  hasBasicInfo: boolean
  hasUsername: boolean
  hasSports: boolean
  hasSkillLevels: boolean
  hasPlayingStyle: boolean
  hasPlayFrequency: boolean
  hasAvatar: boolean
  hasMotivation: boolean
  hasVenueDetails: boolean
  hasVenueSports: boolean
  hasVenueCourts: boolean
  hasVenuePhoto: boolean
  hasVenueVerification: boolean
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
  city: string
  postalCode: string
  postalArea: string
  gender: string
  username: string
  usernameChecked: boolean
  usernameAvailable: boolean
  sports: string[]
  skillLevels: Record<string, SkillLevel>
  playingStyle: PlayingStyle | null
  playFrequency: PlayFrequency | null
  avatar: File | null
  avatarPreview: string | null
  motivations: string[]
  athleteMotivation: string
  venueName: string
  venueAddress: string
  venuePhone: string
  venueEmail: string
  venueDescription: string
  venueSports: string[]
  totalCourts: NullableNumber
  courtNames: string[]
  venuePhoto: File | null
  venuePhotoPreview: string | null
  venueConsent: boolean
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
  setBasicInfo: (payload: {
    fullName: string
    city: string
    postalCode: string
    postalArea: string
    gender: string
  }) => void
  setUsername: (username: string, available: boolean) => void
  addSport: (sport: string) => void
  removeSport: (sport: string) => void
  setSkillLevel: (sport: string, level: SkillLevel) => void
  setPlayingStyle: (style: PlayingStyle) => void
  setPlayFrequency: (value: PlayFrequency) => void
  setAvatar: (file: File | null, preview: string | null) => void
  setMotivations: (motivations: string[]) => void
  setAthleteMotivation: (motivation: string) => void
  setVenueDetails: (payload: {
    venueName: string
    venueAddress: string
    venuePhone: string
    venueEmail: string
    venueDescription: string
  }) => void
  setVenueSports: (sports: string[]) => void
  setVenueCourts: (payload: { totalCourts: number; courtNames: string[] }) => void
  setVenuePhoto: (file: File | null, preview: string | null) => void
  setVenueConsent: (consent: boolean) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const INITIAL_DATA: OnboardingData = {
  role: null,
  fullName: '',
  city: '台北',
  postalCode: '',
  postalArea: '',
  gender: 'prefer_not_to_say',
  username: '',
  usernameChecked: false,
  usernameAvailable: false,
  sports: [],
  skillLevels: {},
  playingStyle: null,
  playFrequency: null,
  avatar: null,
  avatarPreview: null,
  motivations: [],
  athleteMotivation: '',
  venueName: '',
  venueAddress: '',
  venuePhone: '',
  venueEmail: '',
  venueDescription: '',
  venueSports: [],
  totalCourts: null,
  courtNames: [],
  venuePhoto: null,
  venuePhotoPreview: null,
  venueConsent: false,
  startedAt: Date.now(),
  completedSteps: [],
}

const INITIAL_STATUS: OnboardingStatus = {
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

const ROLE_STEP = 1
const PLAYER_INTRO_STEP = 2
const PLAYER_USERNAME_STEP = 3
const PLAYER_SPORTS_STEP = 4
const PLAYER_SKILL_STEP = 5
const PLAYER_STYLE_STEP = 6
const PLAYER_FREQUENCY_STEP = 8
const PLAYER_AVATAR_STEP = 9
const PLAYER_MOTIVATION_STEP = 10

const VENUE_DETAILS_STEP = 20
const VENUE_SPORTS_STEP = 21
const VENUE_COURTS_STEP = 22
const VENUE_PHOTO_STEP = 23
const VENUE_VERIFY_STEP = 24

const PLAYER_FLOW_STEPS = [
  ROLE_STEP,
  PLAYER_INTRO_STEP,
  PLAYER_USERNAME_STEP,
  PLAYER_SPORTS_STEP,
  PLAYER_SKILL_STEP,
  PLAYER_STYLE_STEP,
  PLAYER_FREQUENCY_STEP,
  PLAYER_AVATAR_STEP,
  PLAYER_MOTIVATION_STEP,
]

const VENUE_FLOW_STEPS = [
  ROLE_STEP,
  VENUE_DETAILS_STEP,
  VENUE_SPORTS_STEP,
  VENUE_COURTS_STEP,
  VENUE_PHOTO_STEP,
  VENUE_VERIFY_STEP,
]

const determineRequiredSteps = (role: OnboardingRole | null) => {
  if (role === 'player') return PLAYER_FLOW_STEPS
  if (role === 'venue_manager') return VENUE_FLOW_STEPS
  return [ROLE_STEP]
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  data: INITIAL_DATA,
  status: null,
  currentStep: ROLE_STEP,
  requiredSteps: [ROLE_STEP],
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

    const requiredSteps = determineRequiredSteps(prefilledData.role)

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
      const requiredSteps = determineRequiredSteps(role)
      return {
        data: { ...state.data, role },
        status: updatedStatus,
        requiredSteps,
        currentStep: requiredSteps.includes(state.currentStep)
          ? state.currentStep
          : (requiredSteps[0] ?? ROLE_STEP),
      }
    })
    get().markStepCompleted(ROLE_STEP)
  },

  setBasicInfo: ({ fullName, city, postalCode, postalArea, gender }) => {
    set((state) => {
      const updatedStatus = state.status ? { ...state.status, hasBasicInfo: true } : null
      return {
        data: { ...state.data, fullName, city, postalCode, postalArea, gender },
        status: updatedStatus,
      }
    })
    get().markStepCompleted(PLAYER_INTRO_STEP)
  },

  setUsername: (username, available) => {
    set((state) => {
      const updatedStatus = state.status
        ? { ...state.status, hasUsername: available && username.length > 0 }
        : null
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
      get().markStepCompleted(PLAYER_USERNAME_STEP)
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
    get().markStepCompleted(PLAYER_SPORTS_STEP)
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
        state.data.sports.length > 0 && state.data.sports.every((item) => skillLevels[item])
      const updatedStatus = state.status ? { ...state.status, hasSkillLevels: hasAllLevels } : null
      return {
        data: { ...state.data, skillLevels },
        status: updatedStatus,
      }
    })
    get().markStepCompleted(PLAYER_SKILL_STEP)
  },

  setPlayingStyle: (style) => {
    set((state) => {
      const updatedStatus = state.status ? { ...state.status, hasPlayingStyle: true } : null
      return {
        data: { ...state.data, playingStyle: style },
        status: updatedStatus,
      }
    })
    get().markStepCompleted(PLAYER_STYLE_STEP)
  },

  setPlayFrequency: (value) => {
    set((state) => {
      const updatedStatus = state.status
        ? { ...state.status, hasPlayFrequency: Boolean(value) }
        : null
      return {
        data: { ...state.data, playFrequency: value },
        status: updatedStatus,
      }
    })
    get().markStepCompleted(PLAYER_FREQUENCY_STEP)
  },

  setAvatar: (file, preview) => {
    set((state) => {
      const updatedStatus = state.status
        ? { ...state.status, hasAvatar: Boolean(file || preview) }
        : null
      return {
        data: { ...state.data, avatar: file, avatarPreview: preview },
        status: updatedStatus,
      }
    })
    if (file || preview) {
      get().markStepCompleted(PLAYER_AVATAR_STEP)
    }
  },

  setMotivations: (motivations) => {
    set((state) => ({
      data: { ...state.data, motivations },
    }))
  },

  setAthleteMotivation: (motivation) => {
    set((state) => {
      const updatedStatus = state.status
        ? { ...state.status, hasMotivation: motivation.trim().length > 0 }
        : null
      return {
        data: { ...state.data, athleteMotivation: motivation },
        status: updatedStatus,
      }
    })
    get().markStepCompleted(PLAYER_MOTIVATION_STEP)
  },

  setVenueDetails: ({ venueName, venueAddress, venuePhone, venueEmail, venueDescription }) => {
    set((state) => {
      const updatedStatus = state.status ? { ...state.status, hasVenueDetails: true } : null
      return {
        data: {
          ...state.data,
          venueName,
          venueAddress,
          venuePhone,
          venueEmail,
          venueDescription,
        },
        status: updatedStatus,
      }
    })
    get().markStepCompleted(VENUE_DETAILS_STEP)
  },

  setVenueSports: (sports) => {
    set((state) => {
      const updatedStatus = state.status
        ? { ...state.status, hasVenueSports: sports.length > 0 }
        : null
      return {
        data: { ...state.data, venueSports: sports },
        status: updatedStatus,
      }
    })
    if (sports.length > 0) {
      get().markStepCompleted(VENUE_SPORTS_STEP)
    }
  },

  setVenueCourts: ({ totalCourts, courtNames }) => {
    set((state) => {
      const updatedStatus = state.status
        ? { ...state.status, hasVenueCourts: totalCourts > 0 }
        : null
      return {
        data: { ...state.data, totalCourts, courtNames },
        status: updatedStatus,
      }
    })
    if (totalCourts > 0) {
      get().markStepCompleted(VENUE_COURTS_STEP)
    }
  },

  setVenuePhoto: (file, preview) => {
    set((state) => {
      const updatedStatus = state.status
        ? { ...state.status, hasVenuePhoto: Boolean(file || preview) }
        : null
      return {
        data: { ...state.data, venuePhoto: file, venuePhotoPreview: preview },
        status: updatedStatus,
      }
    })
    if (file || preview) {
      get().markStepCompleted(VENUE_PHOTO_STEP)
    }
  },

  setVenueConsent: (consent) => {
    set((state) => {
      const updatedStatus = state.status ? { ...state.status, hasVenueVerification: consent } : null
      return {
        data: { ...state.data, venueConsent: consent },
        status: updatedStatus,
      }
    })
    if (consent) {
      get().markStepCompleted(VENUE_VERIFY_STEP)
    }
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
      requiredSteps: [ROLE_STEP],
      currentStep: ROLE_STEP,
      isLoading: false,
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))

export {
  ROLE_STEP,
  PLAYER_INTRO_STEP,
  PLAYER_USERNAME_STEP,
  PLAYER_SPORTS_STEP,
  PLAYER_SKILL_STEP,
  PLAYER_STYLE_STEP,
  PLAYER_FREQUENCY_STEP,
  PLAYER_AVATAR_STEP,
  PLAYER_MOTIVATION_STEP,
  VENUE_DETAILS_STEP,
  VENUE_SPORTS_STEP,
  VENUE_COURTS_STEP,
  VENUE_PHOTO_STEP,
  VENUE_VERIFY_STEP,
}

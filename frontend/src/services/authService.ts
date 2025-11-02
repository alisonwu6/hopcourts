import { User } from '@/types'
import { OnboardingStatus } from '@/store/onboardingStore'

interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
  name: string
}

interface SignInResponse {
  token: string
  user: User
  onboardingStatus: OnboardingStatus
}

type OAuthProvider = 'google' | 'apple'

let storedUser: User | null = null
let storedStatus: OnboardingStatus = {
  hasRole: false,
  hasBasicInfo: false,
  hasUsername: false,
  hasSports: false,
  hasSkillLevels: false,
  hasAvatar: false,
  isComplete: false,
  signUpSource: 'unknown',
}

const buildUser = (overrides?: Partial<User>): User => ({
  id: overrides?.id ?? `user-${Math.random().toString(36).slice(2)}`,
  email: overrides?.email ?? 'user@example.com',
  name: overrides?.name ?? 'New Athlete',
  avatar: overrides?.avatar,
  phone: overrides?.phone,
  bio: overrides?.bio,
  location: overrides?.location ?? 'Brisbane',
  sports: overrides?.sports ?? [],
  skillLevel: overrides?.skillLevel ?? 'beginner',
  following: overrides?.following ?? [],
  followers: overrides?.followers ?? [],
  hostProfile: overrides?.hostProfile,
  managedVenues: overrides?.managedVenues ?? [],
  gamesAttended: overrides?.gamesAttended ?? 0,
  gamesHosted: overrides?.gamesHosted ?? 0,
  createdAt: overrides?.createdAt ?? new Date(),
  updatedAt: overrides?.updatedAt ?? new Date(),
})

const buildToken = () => `mock-token-${Date.now()}`

const withSimulatedDelay = async <T>(result: () => T, delay = 400): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(result()), delay)
  })

const createSignInResponse = (userOverrides?: Partial<User>, statusOverrides?: Partial<OnboardingStatus>): SignInResponse => {
  storedUser = buildUser(userOverrides)
  storedStatus = {
    ...storedStatus,
    ...statusOverrides,
  }
  return {
    token: buildToken(),
    user: storedUser,
    onboardingStatus: storedStatus,
  }
}

export const authService = {
  async login(email: string, password: string): Promise<SignInResponse> {
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    return withSimulatedDelay(() =>
      createSignInResponse(
        {
          email,
          name: storedUser?.name ?? 'Returning Athlete',
          avatar: storedUser?.avatar,
          sports: storedUser?.sports ?? [],
          gamesHosted: storedUser?.gamesHosted ?? 0,
        },
        {
          signUpSource: 'email_password',
        }
      )
    )
  },

  async register(data: RegisterRequest): Promise<SignInResponse> {
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match')
    }

    if (data.password.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }

    return withSimulatedDelay(() =>
      createSignInResponse(
        {
          email: data.email,
          name: data.name || 'New Athlete',
          avatar: undefined,
        },
        {
          hasRole: false,
          hasBasicInfo: false,
          hasUsername: false,
          hasSports: false,
          hasSkillLevels: false,
          hasAvatar: false,
          isComplete: false,
          signUpSource: 'email_password',
        }
      )
    )
  },

  async checkUsername(username: string): Promise<{ available: boolean }> {
    return withSimulatedDelay(() => ({
      available: username.toLowerCase() !== 'taken',
    }), 250)
  },

  async getOnboardingStatus(): Promise<OnboardingStatus> {
    return withSimulatedDelay(() => storedStatus, 200)
  },

  async isOnboardingComplete(): Promise<boolean> {
    try {
      const status = await this.getOnboardingStatus()
      return status.isComplete
    } catch {
      return false
    }
  },

  async completeOnboarding(onboardingData: Partial<OnboardingStatus>): Promise<SignInResponse> {
    storedStatus = {
      ...storedStatus,
      hasRole: onboardingData.hasRole ?? true,
      hasBasicInfo: onboardingData.hasBasicInfo ?? true,
      hasUsername: onboardingData.hasUsername ?? true,
      hasSports: onboardingData.hasSports ?? storedStatus.hasSports,
      hasSkillLevels: onboardingData.hasSkillLevels ?? storedStatus.hasSkillLevels,
      hasAvatar: onboardingData.hasAvatar ?? storedStatus.hasAvatar,
      isComplete: true,
    }
    if (storedUser) {
      storedUser = {
        ...storedUser,
        updatedAt: new Date(),
      }
    }
    return withSimulatedDelay(() =>
      ({
        token: buildToken(),
        user: storedUser ?? buildUser(),
        onboardingStatus: storedStatus,
      }),
      300
    )
  },

  async signInWithGoogle(): Promise<SignInResponse> {
    return withSimulatedDelay(() =>
      createSignInResponse(
        {
          name: 'Google Athlete',
          email: 'google.user@example.com',
          avatar: 'https://avatars.dicebear.com/api/initials/GA.svg',
        },
        {
          hasBasicInfo: true,
          hasAvatar: true,
          signUpSource: 'google',
        }
      )
    )
  },

  async signInWithApple(): Promise<SignInResponse> {
    return withSimulatedDelay(() =>
      createSignInResponse(
        {
          name: 'Apple Athlete',
          email: 'apple.user@example.com',
          avatar: undefined,
        },
        {
          hasBasicInfo: true,
          signUpSource: 'apple',
        }
      )
    )
  },

  async logout(): Promise<void> {
    await withSimulatedDelay(() => {
      storedUser = null
      storedStatus = {
        hasRole: false,
        hasBasicInfo: false,
        hasUsername: false,
        hasSports: false,
        hasSkillLevels: false,
        hasAvatar: false,
        isComplete: false,
        signUpSource: 'unknown',
      }
    }, 200)
  },
}

import { api } from '@/api/client'
import type { ApiResponse, SessionMeta } from '@/api/types'

export const onboardingService = {
  async getProfile() {
    return api.me.profile.get()
  },

  async saveProfile(body: any) {
    return api.me.profile.update(body)
  },

  async getPreferences() {
    return api.me.preferences.get()
  },

  async savePreferences(body: any) {
    return api.me.preferences.update(body)
  },

  async getOnboardingStatus() {
    return api.me.onboarding() as Promise<ApiResponse<{ is_complete: boolean; missing_fields: string[] }>>
  },
}

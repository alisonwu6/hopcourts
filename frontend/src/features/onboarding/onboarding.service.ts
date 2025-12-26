import { api } from '@/api/client'

export const onboardingService = {
  async getProfile() {
    return api.me.profile.get()
  },
}

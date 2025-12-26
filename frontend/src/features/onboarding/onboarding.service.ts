import { apiRequest } from '@/api/http'
import type { ApiResponse } from '@/api/types'

export const onboardingService = {
  // TODO: wire to real endpoints (/me/profile, /me/preferences, /me/onboarding)
  async getProfile() {
    return apiRequest<ApiResponse<any>>('GET', '/v1/me/profile', { auth: true })
  },
}

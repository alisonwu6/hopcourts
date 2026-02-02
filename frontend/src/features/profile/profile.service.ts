import { api } from '@/api/client'
import type { ApiResponse } from '@/api/types'

export const profileService = {
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

  async getStats() {
    return api.me.stats()
  },
}

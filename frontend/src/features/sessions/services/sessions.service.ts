import { api } from '@/api/client'

export const sessionsService = {
  async list(params: Record<string, any> = {}) {
    return api.sessions.list(params)
  },
}

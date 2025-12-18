import { apiRequest } from '@/services/apiClient'
import type { Sport } from '@/types/sport'

type SportsResponse = {
  ok: boolean
  data: {
    items: Sport[]
  }
}

export const sportsService = {
  async list(lang: 'zh' | 'en' = 'zh') {
    const response = await apiRequest<SportsResponse>('GET', '/v1/sports', {
      auth: false,
      params: { lang },
    })
    if (!response.ok) {
      throw new Error('Failed to load sports')
    }
    return response.data.items
  },
}

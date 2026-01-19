import { api } from '@/api/client'
import type { Sport } from '@/types/sport'

type SportsResponse = {
  ok: boolean
  data: {
    items: Sport[]
  }
}

export const sportsService = {
  async list(lang: 'zh' | 'en' = 'zh') {
    const response = await api.sports.list(lang)
    if (!response.ok) throw new Error('Failed to load sports')
    return response.data.items
  },
}

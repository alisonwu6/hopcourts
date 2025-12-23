import { apiRequest } from '@/services/apiClient'
import type { Country, City, Vibe, AgeRange } from '@/types/dictionary'

type ListResponse<T> = {
  ok: boolean
  data: { items: T[] }
}

export const dictionaryService = {
  async listCountries(lang: 'zh' | 'en' = 'zh') {
    const res = await apiRequest<ListResponse<Country>>('GET', '/v1/countries', {
      auth: false,
      params: { lang },
    })
    if (!res.ok) throw new Error('Failed to load countries')
    return res.data.items
  },
  async listCities(country?: string, lang: 'zh' | 'en' = 'zh') {
    const res = await apiRequest<ListResponse<City>>('GET', '/v1/cities', {
      auth: false,
      params: { country, lang },
    })
    if (!res.ok) throw new Error('Failed to load cities')
    return res.data.items
  },
  async listVibes(lang: 'zh' | 'en' = 'zh') {
    const res = await apiRequest<ListResponse<Vibe>>('GET', '/v1/vibes', {
      auth: false,
      params: { lang },
    })
    if (!res.ok) throw new Error('Failed to load vibes')
    return res.data.items
  },
  async listAgeRanges(lang: 'zh' | 'en' = 'zh') {
    const res = await apiRequest<ListResponse<AgeRange>>('GET', '/v1/age-ranges', {
      auth: false,
      params: { lang },
    })
    if (!res.ok) throw new Error('Failed to load age ranges')
    return res.data.items
  },
}

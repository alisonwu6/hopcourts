import { api } from '@/api/client'
import type { Country, City, Vibe, AgeRange, Sport } from '@/types/dictionary'

export const dictionaryService = {
  async meta() {
    const res = await api.dictionaries.meta()
    if (!res.ok) throw new Error('Failed to load dictionary meta')
    // backend may return { data: {...} } or directly {...}
    return (res.data as any)?.data ?? res.data
  },
  async listCountries(lang: 'zh' | 'en' = 'zh') {
    const res = await api.dictionaries.countries(lang)
    if (!res.ok) throw new Error('Failed to load countries')
    return res.data.items as Country[]
  },
  async listCities(country?: string, lang: 'zh' | 'en' = 'zh') {
    const res = await api.dictionaries.cities(country, lang)
    if (!res.ok) throw new Error('Failed to load cities')
    return res.data.items as City[]
  },
  async listVibes(lang: 'zh' | 'en' = 'zh') {
    const res = await api.dictionaries.vibes(lang)
    if (!res.ok) throw new Error('Failed to load vibes')
    return res.data.items as Vibe[]
  },
  async listSports(lang: 'zh' | 'en' = 'zh') {
    const res = await api.dictionaries.sports(lang)
    if (!res.ok) throw new Error('Failed to load sports')
    return res.data.items as Sport[]
  },
  async listAgeRanges(lang: 'zh' | 'en' = 'zh') {
    const res = await api.dictionaries.ageRanges(lang)
    if (!res.ok) throw new Error('Failed to load age ranges')
    return res.data.items as AgeRange[]
  },
}

import { api } from '@/api/client'
import type { Country, City, VibeItem, AgeRange, Sport } from '@/types/dictionary'

let metaPromise: Promise<any> | null = null

export const dictionaryService = {
  async meta() {
    if (metaPromise) return metaPromise

    metaPromise = api.dictionaries.meta().then((res) => {
      if (!res.ok) {
        throw new Error('Failed to load dictionary meta')
      }
      // backend may return { data: {...} } or directly {...}
      return (res.data as any)?.data ?? res.data
    })

    // Allow concurrent calls to share the promise, then clear it
    metaPromise.finally(() => {
      setTimeout(() => {
        metaPromise = null
      }, 2000)
    })

    return metaPromise
  },
  async listCountries(lang: 'zh' | 'en' = 'en') {
    const res = await api.dictionaries.countries(lang)
    if (!res.ok) throw new Error('Failed to load countries')
    return res.data.items as Country[]
  },
  async listCities(country?: string, lang: 'zh' | 'en' = 'en') {
    const res = await api.dictionaries.cities(country, lang)
    if (!res.ok) throw new Error('Failed to load cities')
    return res.data.items as City[]
  },
  async listVibes(lang: 'zh' | 'en' = 'en') {
    const res = await api.dictionaries.vibes(lang)
    if (!res.ok) throw new Error('Failed to load vibes')
    return res.data.items as VibeItem[]
  },
  async listSports(lang: 'zh' | 'en' = 'en') {
    const res = await api.dictionaries.sports(lang)
    if (!res.ok) throw new Error('Failed to load sports')
    return res.data.items as Sport[]
  },
  async listAgeRanges(lang: 'zh' | 'en' = 'en') {
    const res = await api.dictionaries.ageRanges(lang)
    if (!res.ok) throw new Error('Failed to load age ranges')
    return res.data.items as AgeRange[]
  },
}

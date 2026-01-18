import { useEffect, useState } from 'react'
import { dictionaryService } from './dict.service'
import type { Country, City, Vibe, AgeRange } from '@/types/dictionary'

type Status<T> = {
  items: T[]
  isLoading: boolean
  error: Error | null
}

const STORAGE_PREFIX = 'sm.dict'
const VERSION_KEY = `${STORAGE_PREFIX}.meta`

type DictType = 'sports' | 'vibes' | 'countries' | 'age_ranges' | 'cities'

type DictionaryMeta = Partial<Record<DictType, { version: string }>>

const getCache = <T,>(type: DictType, lang: string) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}.${type}.${lang}`)
    if (!raw) return null
    return JSON.parse(raw) as T[]
  } catch {
    return null
  }
}

const setCache = <T,>(type: DictType, lang: string, items: T[]) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}.${type}.${lang}`, JSON.stringify(items))
  } catch {
    // ignore
  }
}

const getVersionCache = () => {
  try {
    const raw = localStorage.getItem(VERSION_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as DictionaryMeta
  } catch {
    return {}
  }
}

const setVersionCache = (meta: DictionaryMeta) => {
  try {
    localStorage.setItem(VERSION_KEY, JSON.stringify(meta))
  } catch {
    // ignore
  }
}

const useDictionary = <T,>(
  type: DictType,
  lang: 'zh' | 'en',
  loader: () => Promise<T[]>,
  deps: any[] = []
): Status<T> => {
  const [items, setItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let active = true
    const cachedItems = getCache<T>(type, lang)
    if (cachedItems && cachedItems.length) {
      setItems(cachedItems)
      setIsLoading(false)
    }

    const bootstrap = async () => {
      const versionMap = getVersionCache()
      // 如果已有快取且有版本資訊，直接返回，不打 API
      if (cachedItems && cachedItems.length && versionMap[type]?.version) {
        return
      }

      try {
        const meta = await dictionaryService.meta()
        const remoteVersion = meta?.[type]?.version
        const localVersion = versionMap[type]?.version

        const shouldRefresh = !remoteVersion || remoteVersion !== localVersion || !cachedItems
        if (shouldRefresh) {
          const data = await loader()
          if (!active) return
          setItems(data)
          setCache(type, lang, data)
          setVersionCache({ ...versionMap, [type]: { version: remoteVersion || Date.now().toString() } })
        }
      } catch (err: any) {
        // API 失敗：如果有舊快取就沿用，否則標記錯誤
        if (!cachedItems) {
          if (active) setError(err instanceof Error ? err : new Error('Failed to load dictionary'))
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    bootstrap()

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { items, isLoading, error }
}

export function useCountries(lang: 'zh' | 'en' = 'zh') {
  return useDictionary<Country>('countries', lang, () => dictionaryService.listCountries(lang), [lang])
}

export function useCities(country?: string, lang: 'zh' | 'en' = 'zh') {
  return useDictionary<City>(
    'cities',
    lang,
    () => dictionaryService.listCities(country, lang),
    [country, lang]
  )
}

export function useVibes(lang: 'zh' | 'en' = 'zh') {
  return useDictionary<Vibe>('vibes', lang, () => dictionaryService.listVibes(lang), [lang])
}

export function useAgeRanges(lang: 'zh' | 'en' = 'zh') {
  return useDictionary<AgeRange>('age_ranges', lang, () => dictionaryService.listAgeRanges(lang), [lang])
}

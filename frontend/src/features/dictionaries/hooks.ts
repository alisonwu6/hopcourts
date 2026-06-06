import { useEffect, useMemo, useState } from 'react'
import { dictionaryService } from './dict.service'
import type { Country, City, VibeItem, AgeRange, Sport } from '@/types/dictionary'

type Status<T> = {
  items: T[]
  isLoading: boolean
  error: Error | null
}

const STORAGE_PREFIX = 'sm.dict'
const VERSION_KEY = `${STORAGE_PREFIX}.meta`

type DictType = 'sports' | 'vibes' | 'countries' | 'age_ranges' | 'cities'

type DictionaryMeta = Partial<Record<DictType, { version: string }>>

const getCache = <T>(type: DictType, lang: string) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}.${type}.${lang}`)
    if (!raw) return null
    return JSON.parse(raw) as T[]
  } catch {
    return null
  }
}

const setCache = <T>(type: DictType, lang: string, items: T[]) => {
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
    const current = getVersionCache()
    localStorage.setItem(VERSION_KEY, JSON.stringify({ ...current, ...meta }))
  } catch {
    // ignore
  }
}

const useDictionary = <T>(
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

      try {
        const meta = await dictionaryService.meta()
        if (meta) {
          setVersionCache(meta as DictionaryMeta)
        }
        const remoteVersion = meta?.[type]?.version
        const localVersion = versionMap[type]?.version

        const shouldRefresh = !remoteVersion || remoteVersion !== localVersion || !cachedItems
        if (shouldRefresh) {
          const data = await loader()
          if (!active) return
          setItems(data)
          setCache(type, lang, data)
          setVersionCache({
            [type]: { version: remoteVersion || Date.now().toString() },
          })
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

export function useCountries(lang: 'zh' | 'en' = 'en') {
  return useDictionary<Country>('countries', lang, () => dictionaryService.listCountries(lang), [lang])
}

export function useCities(country?: string, lang: 'zh' | 'en' = 'en') {
  return useDictionary<City>('cities', lang, () => dictionaryService.listCities(country, lang), [country, lang])
}

export function useVibes(lang: 'zh' | 'en' = 'en') {
  return useDictionary<VibeItem>('vibes', lang, () => dictionaryService.listVibes(lang), [lang])
}

export function useVibeUtils(lang: 'zh' | 'en' = 'en') {
  const { items: vibesCatalog, isLoading, error } = useVibes(lang)

  const vibeKeyToUnion = useMemo(() => {
    const map = new Map<string, string>()
    vibesCatalog.forEach((v) => {
      const union = v.key.charAt(0).toUpperCase() + v.key.slice(1).toLowerCase()
      map.set(v.key, union)
      map.set(v.key.toLowerCase(), union)
    })
    return (key: string): string | null => {
      if (!key) return null
      return map.get(key) ?? map.get(key.toLowerCase()) ?? (key.charAt(0).toUpperCase() + key.slice(1).toLowerCase())
    }
  }, [vibesCatalog])

  const labelForVibe = useMemo(() => {
    const map = new Map<string, string>()
    vibesCatalog.forEach((v) => {
      map.set(v.key, v.label)
      map.set(v.key.toLowerCase(), v.label)
    })
    return (key: string) => map.get(key) ?? map.get(key?.toLowerCase?.() ?? '') ?? key
  }, [vibesCatalog])

  const vibeUnionToKey = useMemo(() => {
    const map = new Map<string, string>()
    vibesCatalog.forEach((v) => {
      const union = v.key.charAt(0).toUpperCase() + v.key.slice(1).toLowerCase()
      map.set(union, v.key)
      map.set(union.toLowerCase(), v.key)
    })
    return (union: string) => map.get(union) ?? map.get(union?.toLowerCase?.() ?? '') ?? ''
  }, [vibesCatalog])

  return { vibesCatalog, vibeKeyToUnion, labelForVibe, vibeUnionToKey, isLoading, error }
}

export function useAgeRanges(lang: 'zh' | 'en' = 'en') {
  return useDictionary<AgeRange>('age_ranges', lang, () => dictionaryService.listAgeRanges(lang), [lang])
}

export function useSports(lang: 'zh' | 'en' = 'en') {
  return useDictionary<Sport>('sports', lang, () => dictionaryService.listSports(lang), [lang])
}

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
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

let metaInflight: Promise<DictionaryMeta> | null = null

const fetchMeta = (): Promise<DictionaryMeta> => {
  if (!metaInflight) {
    metaInflight = dictionaryService.meta().finally(() => {
      metaInflight = null
    })
  }
  return metaInflight
}

const dataInflight: Record<string, Promise<any>> = {}

const fetchData = <T>(key: string, loader: () => Promise<T[]>): Promise<T[]> => {
  if (!dataInflight[key]) {
    dataInflight[key] = loader().finally(() => {
      delete dataInflight[key]
    })
  }
  return dataInflight[key] as Promise<T[]>
}

const useDictionary = <T>(
  type: DictType,
  lang: 'zh' | 'en',
  loader: () => Promise<T[]>,
): Status<T> => {
  const query = useQuery({
    queryKey: ['dict', type, lang] as const,
    queryFn: async () => {
      const cachedItems = getCache<T>(type, lang)
      const versionMap = getVersionCache()
      const meta = await fetchMeta()
      const remoteVersion = meta?.[type]?.version
      const localVersion = versionMap[type]?.version
      const shouldRefresh = !remoteVersion || remoteVersion !== localVersion || !cachedItems
      if (!shouldRefresh && cachedItems?.length) return cachedItems
      const data = await fetchData(`${type}.${lang}`, loader)
      setCache(type, lang, data)
      setVersionCache({ [type]: { version: remoteVersion || Date.now().toString() } })
      return data
    },
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const cached = getCache<T>(type, lang)
      return cached?.length ? cached : undefined
    },
  })

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
  }
}

export function useCountries(lang: 'zh' | 'en' = 'en') {
  return useDictionary<Country>('countries', lang, () => dictionaryService.listCountries(lang))
}

export function useCities(country?: string, lang: 'zh' | 'en' = 'en') {
  return useDictionary<City>('cities', lang, () => dictionaryService.listCities(country, lang))
}

export function useVibes(lang: 'zh' | 'en' = 'en') {
  return useDictionary<VibeItem>('vibes', lang, () => dictionaryService.listVibes(lang))
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
      return map.get(key) ?? map.get(key.toLowerCase()) ?? key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
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
  return useDictionary<AgeRange>('age_ranges', lang, () => dictionaryService.listAgeRanges(lang))
}

export function useSports(lang: 'zh' | 'en' = 'en') {
  return useDictionary<Sport>('sports', lang, () => dictionaryService.listSports(lang))
}

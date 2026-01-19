import { useEffect, useRef, useState } from 'react'
import type { Sport } from '@/types/sport'
import { sportsService } from '../services/sportsService'
import { dictionaryService } from '@/features/dictionaries/dict.service'

const inFlightByLang: Record<string, Promise<Sport[]> | null> = {}

export function useSports(lang: 'zh' | 'en' = 'zh') {
  const [sports, setSports] = useState<Sport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const lastLoadedLang = useRef<string | null>(null)

  const STORAGE_PREFIX = 'sm.dict'
  const VERSION_KEY = `${STORAGE_PREFIX}.meta`

  const cacheKey = `${STORAGE_PREFIX}.sports.${lang}`

  const getCache = () => {
    try {
      const raw = localStorage.getItem(cacheKey)
      if (!raw) return null
      return JSON.parse(raw) as Sport[]
    } catch {
      return null
    }
  }

  const setCache = (items: Sport[]) => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(items))
    } catch {
      // ignore
    }
  }

  const getVersionCache = () => {
    try {
      const raw = localStorage.getItem(VERSION_KEY)
      if (!raw) return {}
      return JSON.parse(raw) as Record<string, { version: string }>
    } catch {
      return {}
    }
  }

  const setVersionCache = (meta: Record<string, { version: string }>) => {
    try {
      localStorage.setItem(VERSION_KEY, JSON.stringify(meta))
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    // Avoid duplicate fetches in React StrictMode; still allow re-run when lang changes.
    if (lastLoadedLang.current === lang) return
    lastLoadedLang.current = lang

    let isMounted = true
    const cached = getCache()
    if (cached && cached.length) {
      setSports(cached)
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }
    setError(null)

    const load = async () => {
      try {
        const meta = await dictionaryService.meta()
        const remoteVersion = meta?.sports?.version
        const versionMap = getVersionCache()
        const localVersion = versionMap.sports?.version
        const shouldRefresh = !remoteVersion || remoteVersion !== localVersion || !cached

        if (shouldRefresh) {
          if (!inFlightByLang[lang]) {
            inFlightByLang[lang] = sportsService.list(lang).finally(() => {
              inFlightByLang[lang] = null
            })
          }
          const items = await inFlightByLang[lang]!
          if (!isMounted) return
          setSports(items)
          setCache(items)
          setVersionCache({
            ...versionMap,
            sports: { version: remoteVersion || Date.now().toString() },
          })
        }
      } catch (err: any) {
        if (!cached) {
          if (isMounted) setError(err instanceof Error ? err : new Error('Failed to load sports'))
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [lang])

  return { sports, isLoading, error }
}

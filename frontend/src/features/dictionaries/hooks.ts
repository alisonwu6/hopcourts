import { useEffect, useState } from 'react'
import { dictionaryService } from './dict.service'
import type { Country, City, Vibe, AgeRange } from '@/types/dictionary'

type Status<T> = {
  items: T[]
  isLoading: boolean
  error: Error | null
}

const useLoad = <T,>(loader: () => Promise<T[]>, deps: any[] = []): Status<T> => {
  const [items, setItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)
    loader()
      .then((data) => {
        if (!active) return
        setItems(data)
      })
      .catch((err) => {
        if (!active) return
        setError(err)
      })
      .finally(() => {
        if (!active) return
        setIsLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { items, isLoading, error }
}

export function useCountries(lang: 'zh' | 'en' = 'zh') {
  return useLoad<Country>(() => dictionaryService.listCountries(lang), [lang])
}

export function useCities(country?: string, lang: 'zh' | 'en' = 'zh') {
  return useLoad<City>(() => dictionaryService.listCities(country, lang), [country, lang])
}

export function useVibes(lang: 'zh' | 'en' = 'zh') {
  return useLoad<Vibe>(() => dictionaryService.listVibes(lang), [lang])
}

export function useAgeRanges(lang: 'zh' | 'en' = 'zh') {
  return useLoad<AgeRange>(() => dictionaryService.listAgeRanges(lang), [lang])
}

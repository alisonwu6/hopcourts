import { useEffect, useState } from 'react'
import type { Sport } from '@/types/sport'
import { sportsService } from '../services/sportsService'

export function useSports(lang: 'zh' | 'en' = 'zh') {
  const [sports, setSports] = useState<Sport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError(null)

    sportsService
      .list(lang)
      .then((items) => {
        if (!isMounted) return
        setSports(items)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err)
      })
      .finally(() => {
        if (!isMounted) return
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [lang])

  return { sports, isLoading, error }
}

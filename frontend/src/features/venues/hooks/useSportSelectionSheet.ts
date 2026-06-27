import { useEffect, useMemo, useState } from 'react'
import type { Sport } from '@/types/dictionary'

export const SPORT_CATEGORY_LABELS: Record<string, string> = {
  ball_sports: 'Ball Sports',
  racket_sports: 'Racket Sports',
  outdoor: 'Outdoor',
  fitness_wellness: 'Fitness & Wellness',
  extreme: 'Extreme',
}

const SPORT_CATEGORY_ORDER = ['ball_sports', 'racket_sports', 'outdoor', 'fitness_wellness', 'extreme']

export type SportSelectionOption = Pick<Sport, 'key' | 'label' | 'icon' | 'category'>

export function useSportSelectionSheet({
  open,
  sports,
  selectedKeys,
}: {
  open: boolean
  sports: SportSelectionOption[]
  selectedKeys: string[]
}) {
  const [pendingKeys, setPendingKeys] = useState<string[]>(selectedKeys)

  useEffect(() => {
    if (open) {
      setPendingKeys(selectedKeys)
    }
  }, [open, selectedKeys])

  const options = useMemo(() => sports.filter((sport) => sport.key && sport.label), [sports])

  const groupedSports = useMemo(() => {
    return options.reduce<Record<string, SportSelectionOption[]>>((acc, sport) => {
      const category = sport.category || 'other'
      acc[category] = [...(acc[category] || []), sport]
      return acc
    }, {})
  }, [options])

  const categories = useMemo(() => {
    const known = SPORT_CATEGORY_ORDER.filter((category) => groupedSports[category]?.length)
    const rest = Object.keys(groupedSports).filter((category) => !SPORT_CATEGORY_ORDER.includes(category))
    return [...known, ...rest]
  }, [groupedSports])

  const toggleSport = (key: string) => {
    setPendingKeys((prev) => {
      if (prev.includes(key)) return prev.filter((item) => item !== key)
      return [...prev, key]
    })
  }

  const clearPending = () => setPendingKeys([])

  return {
    categories,
    groupedSports,
    pendingKeys,
    toggleSport,
    clearPending,
  }
}

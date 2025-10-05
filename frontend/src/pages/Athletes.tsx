import { useEffect, useMemo, useState } from 'react'
import { SearchBar } from '@/components/athlete/SearchBar'
import { FilterChips } from '@/components/athlete/FilterChips'
import { AthleteGrid } from '@/components/athlete/AthleteGrid'
import { CreateCardButton } from '@/components/athlete/CreateCardButton'
import { mockAthletes } from '@/data/mock/athletes'
import type { AthleteCardProps } from '@/interfaces/athlete'
import { useCopy } from '@/i18n/LanguageProvider'
import { BottomNavBar } from '@/components/navigation/BottomNavBar'
import Header from '@/components/navigation/Header'

const fallbackFilters = [
  'All',
  'Running',
  'Boxing',
  'Climbing',
  'Basketball',
  'Yoga',
  'Social',
  'Focused',
  'Chill',
]

export default function Athletes() {
  const copy = useCopy()
  const filters = useMemo(() => copy.home.explore.filters ?? fallbackFilters, [copy.home.explore.filters])
  const [selectedFilter, setSelectedFilter] = useState<string>(filters[0] ?? 'All')

  useEffect(() => {
    if (!filters.includes(selectedFilter)) {
      setSelectedFilter(filters[0] ?? 'All')
    }
  }, [filters, selectedFilter])

  const filteredAthletes: AthleteCardProps[] = useMemo(() => {
    if (selectedFilter === 'All') return mockAthletes

    const lowered = selectedFilter.toLowerCase()
    return mockAthletes.filter((athlete) => {
      const sportMatch = athlete.sport.toLowerCase() === lowered
      const vibeMatch = (athlete.vibes ?? []).some((vibe) => vibe.toLowerCase().includes(lowered))
      return sportMatch || vibeMatch
    })
  }, [selectedFilter])

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 text-[#051333]">
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <Header sticky={false} showBorder={false} />
        <section className="border-t border-[#E6E6E6]">
          <FilterChips
            filters={filters}
            selected={selectedFilter}
            onSelect={setSelectedFilter}
          />
          <SearchBar
            placeholder={copy.home.explore.searchPlaceholder}
            className="pb-4"
          />
        </section>
      </div>

      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <AthleteGrid athletes={filteredAthletes} />
      </main>

      <CreateCardButton />
      <BottomNavBar />
    </div>
  )
}

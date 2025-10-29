import { useMemo, useState } from 'react'
import { FilterChips } from '@/components/athlete/FilterChips'
import { AthleteGrid } from '@/components/athlete/AthleteGrid'
import { CreateCardButton } from '@/components/athlete/CreateCardButton'
import { mockAthletes } from '@/data/mock/athletes'
import type { AthleteCardProps } from '@/interfaces/athlete'
import { SearchField } from '@/components/search/SearchField'

export default function Athletes() {
  const [selectedFilter, setSelectedFilter] = useState<string>('All')

  const filteredAthletes: AthleteCardProps[] = useMemo(() => {
    if (selectedFilter === 'All') return mockAthletes

    const lowered = selectedFilter.toLowerCase()
    return mockAthletes.filter((athlete) => {
      const sportMatch = (athlete.primarySport ?? '').toLowerCase() === lowered
      const tagMatch = (athlete.tags ?? []).some((tag) => tag.toLowerCase().includes(lowered))
      return sportMatch || tagMatch
    })
  }, [selectedFilter])

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 text-[#051333]">
      <div className="sticky top-[56px] z-40 bg-white/95 backdrop-blur shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <section className="border-t border-[#E6E6E6]">
          <div className="mx-auto w-full max-w-4xl">
            <FilterChips
              filters={['All', 'Running', 'Basketball', 'Bouldering', 'Climbing', 'Hiking', 'Yoga', 'Surfing']}
              selected={selectedFilter}
              onSelect={setSelectedFilter}
            />
            <SearchField placeholder="Search by sport, host, or venue" />
          </div>
        </section>
      </div>

      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <AthleteGrid athletes={filteredAthletes} />
      </main>

      <CreateCardButton />
    </div>
  )
}

import { useMemo, useState } from 'react'
import { FilterChips } from '@/components/athlete/FilterChips'
import { AthleteGrid } from '@/components/athlete/AthleteGrid'
import { SearchField } from '@/components/search/SearchField'
import { mockAthletes } from '@/data/mock/athletes'
import type { AthleteCardProps } from '@/interfaces/athlete'

const FILTERS = ['All', 'Running', 'Basketball', 'Bouldering', 'Climbing', 'Hiking', 'Yoga', 'Surfing']

function matchesQuery(athlete: AthleteCardProps, query: string) {
  if (!query) return true
  const normalised = query.toLowerCase().trim()

  const haystacks = [
    athlete.name,
    athlete.primarySport,
    athlete.sport,
    athlete.city,
    athlete.bio,
    ...(athlete.tags ?? []),
    ...(athlete.vibes ?? []),
  ]

  return haystacks.some((value) => value?.toLowerCase().includes(normalised))
}

export function PlayersPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>('All')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const filteredAthletes = useMemo(() => {
    const baseList = selectedFilter === 'All'
      ? mockAthletes
      : mockAthletes.filter((athlete) => {
          const sport = athlete.primarySport ?? athlete.sport ?? ''
          const tags = athlete.tags ?? []
          const vibes = athlete.vibes ?? []
          const loweredFilter = selectedFilter.toLowerCase()
          return (
            sport.toLowerCase() === loweredFilter
            || tags.some((tag) => tag.toLowerCase() === loweredFilter)
            || vibes.some((vibe) => vibe.toLowerCase() === loweredFilter)
          )
        })

    if (!searchTerm.trim()) return baseList
    return baseList.filter((athlete) => matchesQuery(athlete, searchTerm))
  }, [searchTerm, selectedFilter])

  return (
    <div className="min-h-screen bg-player-50 pb-24 text-player-900">
      <div className="sticky top-[56px] z-40 bg-player-50/95 backdrop-blur shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <section className="border-t border-player-200">
          <div className="mx-auto w-full max-w-4xl">
            <FilterChips filters={FILTERS} selected={selectedFilter} onSelect={setSelectedFilter} storyLine="player" />
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by player, sport, or vibe"
              storyLine="player"
            />
          </div>
        </section>
      </div>

      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-4">
          <h1 className="text-lg font-bold text-player-900">Players</h1>
          <p className="text-sm text-player-900/70">Find crew members who match your pace and vibe.</p>
        </div>

        {filteredAthletes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-player-200 bg-white p-10 text-center text-sm text-gray-600">
            No players match right now. Try another sport or adjust your search.
          </div>
        ) : (
          <AthleteGrid athletes={filteredAthletes} />
        )}
      </main>
    </div>
  )
}

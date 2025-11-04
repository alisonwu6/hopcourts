import { useMemo, useState } from 'react'
import { FilterChips } from '@/components/athlete/FilterChips'
import { SearchField } from '@/components/search/SearchField'
import { MateCard } from '@/components/mates/MateCard'
import { CONNECTED_MATES, Mate, NEARBY_MATES, RECOMMENDED_MATES } from '@/data/mates'

const sports = ['All', 'Basketball', 'Badminton', 'Pickleball', 'Climbing', 'Running', 'Hiking']

export function MatesPage() {
  const [selectedSport, setSelectedSport] = useState('All')
  const [query, setQuery] = useState('')

  const sections = useMemo(() => {
    const filters = buildFilter(selectedSport, query)

    return [
      {
        id: 'recommended',
        title: 'Recommended for you',
        description: 'AI suggestions based on your sports, schedule, and play style.',
        mates: filters(RECOMMENDED_MATES),
      },
      {
        id: 'nearby',
        title: 'Players nearby',
        description: 'Within 5km. Great for spontaneous play and walk-ins.',
        mates: filters(NEARBY_MATES),
      },
      {
        id: 'connections',
        title: 'Your connections',
        description: 'People you already follow or play with often.',
        mates: filters(CONNECTED_MATES),
      },
    ]
  }, [selectedSport, query])

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      <div className="sticky top-[80px] z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto w-full max-w-4xl px-4 py-4">
          <h1 className="text-lg font-bold text-blue-900">Mates</h1>
          <p className="text-sm text-slate-600">
            Discover players to connect with, follow, and invite to your next game.
          </p>
        </div>
        <FilterChips
          filters={sports}
          selected={selectedSport}
          onSelect={setSelectedSport}
          className="border-t border-slate-100 bg-white px-4"
        />
        <SearchField
          placeholder="Search mates by name, sport, or venue"
          value={query}
          onChange={setQuery}
          className="px-4 pb-4"
        />
      </div>

      <main className="mx-auto mt-6 w-full max-w-4xl space-y-8 px-4 pb-28">
        {sections.map((section) => (
          <section key={section.id} className="space-y-4">
            <header className="space-y-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {section.title}
              </h2>
              <p className="text-sm text-slate-600">{section.description}</p>
            </header>

            {section.mates.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-center text-sm text-slate-500">
                {emptyStateCopy(section.id)}
              </div>
            ) : (
              <div className="space-y-4">
                {section.mates.map((mate) => (
                  <MateCard
                    key={mate.id}
                    mate={mate}
                    onFollow={(id) => console.info('follow', id)}
                    onInvite={(id) => console.info('invite', id)}
                    onMessage={(id) => console.info('message', id)}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </main>
    </div>
  )
}

function buildFilter(selectedSport: string, query: string) {
  const normalizedSport = selectedSport.toLowerCase()
  const normalizedQuery = query.trim().toLowerCase()

  return (mates: Mate[]) =>
    mates.filter((mate) => {
      const sportMatches =
        normalizedSport === 'all' || mate.sports.some((sport) => sport.toLowerCase() === normalizedSport)

      if (!sportMatches) return false

      if (!normalizedQuery) return true

      return [
        mate.name,
        mate.tagline,
        ...(mate.sports ?? []),
        ...(mate.favouriteVenues ?? []),
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    })
}

function emptyStateCopy(sectionId: string) {
  switch (sectionId) {
    case 'recommended':
      return "No recommendations match your filters yet. Update your sports to see more players."
    case 'nearby':
      return 'No nearby mates match this sport right now. Try another sport or widen your filters.'
    case 'connections':
      return 'You have no mates in this filter. Follow players to build your network.'
    default:
      return 'No mates found.'
  }
}

import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import SessionCard, { ExploreSession } from '@/components/explore/SessionCard'
import { trackEvent } from '@/lib/analytics'
import { SearchField } from '@/components/search/SearchField'

const sampleSessions: ExploreSession[] = [
  {
    id: 101,
    title: 'Sunrise Climbing Meetup',
    sport: 'Climbing',
    hostName: 'Tere Wu',
    startsAt: '2025-09-12T06:00:00Z',
    endsAt: '2025-09-12T08:00:00Z',
    maxPlayers: 12,
    playerCount: 5,
    heroImage: '/placeholders/climb.jpg',
    distanceKm: 2.1,
    hostAvatar: '/avatars/a1.jpg',
    startLabel: 'Sat · 6:00 AM',
    venue: 'Kangaroo Point Cliffs',
    tags: ['outdoor', 'ropes'],
    status: 'open',
    details: {
      tags: ['outdoor', 'sunrise'],
      skillLevelLabel: 'All levels',
      description: 'Casual sunrise climbs with safety recap.',
    },
  },
  {
    id: 102,
    title: 'South Bank Sunset Run',
    sport: 'Running',
    hostName: 'Jamie Lee',
    startsAt: '2025-09-13T17:00:00Z',
    endsAt: '2025-09-13T18:30:00Z',
    maxPlayers: 20,
    playerCount: 11,
    heroImage: '/placeholders/run.jpg',
    distanceKm: 1.4,
    hostAvatar: '/avatars/b3.jpg',
    startLabel: 'Sun · 5:00 PM',
    venue: 'South Bank River Loop',
    tags: ['tempo'],
    status: 'open',
    details: {
      tags: ['tempo'],
      skillLevelLabel: 'Intermediate',
      description: 'Two pace groups with cool-down hangs.',
    },
  },
  {
    id: 103,
    title: 'Indoor Yoga Flow',
    sport: 'Yoga',
    hostName: 'Mika Chen',
    startsAt: '2025-09-15T19:00:00Z',
    endsAt: '2025-09-15T20:00:00Z',
    maxPlayers: 15,
    playerCount: 9,
    heroImage: '/placeholders/yoga.jpg',
    distanceKm: 3.8,
    hostAvatar: '/avatars/d1.jpg',
    startLabel: 'Tue · 7:00 PM',
    venue: 'West End Studio',
    tags: ['indoor'],
    status: 'open',
    details: {
      tags: ['flow'],
      skillLevelLabel: 'Beginner friendly',
      description: 'Slow flow with focus on recovery and breath.',
    },
  },
]

export default function Home() {
  const [selectedFilter, setSelectedFilter] = useState('All')

  const filteredSessions = useMemo(() => {
    return sampleSessions.filter((session) => {
      if (selectedFilter === 'All') return true
      return session.sport.toLowerCase() === selectedFilter.toLowerCase()
    })
  }, [selectedFilter])

  const handleFilterClick = (filter: string) => {
    setSelectedFilter(filter)
    trackEvent('FilterSelect', { sport_type: filter })
  }

  const handleCreateIntent = () => {
    trackEvent('CreateIntent')
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 text-[#2B2B2B]">
      <div className="sticky top-[56px] z-40 bg-white/95 backdrop-blur shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="border-t border-[#E6E6E6]">
          <div className="mx-auto w-full max-w-4xl">
            <div className="overflow-x-auto scrollbar-hidden">
              <div className="flex min-w-max items-center gap-2 px-4 py-3 sm:px-6">
                {['All', 'Running', 'Basketball', 'Bouldering', 'Climbing', 'Hiking', 'Yoga', 'Surfing'].map((filter) => {
                  const isActive = filter === selectedFilter
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => handleFilterClick(filter)}
                      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                        isActive ? 'bg-[#1B8FD2] text-white shadow-sm' : 'bg-white text-[#6E6E6E] hover:text-[#1B8FD2]'
                      }`}
                    >
                      {filter}
                    </button>
                  )
                })}
              </div>
            </div>
            <SearchField placeholder="Search by sport, host, or venue" />
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-5">
          {filteredSessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E6E6E6] bg-white p-10 text-center text-sm text-[#6E6E6E]">
              No sessions match right now. Try another sport or widen your search.
            </div>
          ) : (
            filteredSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </div>
      </main>

      <button
        type="button"
        onClick={handleCreateIntent}
        className="fixed bottom-20 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B8FD2] text-white shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition hover:bg-[#1679b3]"
        aria-label="Create a session"
      >
        <Plus className="h-6 w-6" />
      </button>

    </div>
  )
}

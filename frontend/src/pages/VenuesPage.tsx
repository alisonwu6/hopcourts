import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VenueRow } from '@/components/player/VenueRow'
import { FilterChips } from '@/components/athlete/FilterChips'
import { useVenuesStore } from '@/hooks'

const sports = ['All', 'Basketball', 'Badminton', 'Pickleball', 'Climbing', 'Running', 'Hiking']

export function VenuesPage() {
  const navigate = useNavigate()
  const [selectedSport, setSelectedSport] = useState('All')
  const venues = useVenuesStore((state) => state.venues)
  const fetchVenues = useVenuesStore((state) => state.fetchVenues)
  const isLoading = useVenuesStore((state) => state.isLoading)
  const error = useVenuesStore((state) => state.error)

  useEffect(() => {
    void fetchVenues()
  }, [fetchVenues])

  const filteredVenues = useMemo(() => {
    if (selectedSport === 'All') return venues
    const lowered = selectedSport.toLowerCase()
    return venues.filter((venue) =>
      venue.sports.some((sport) => sport.toLowerCase() === lowered)
    )
  }, [venues, selectedSport])

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      <div
        className="fixed left-0 right-0 z-40 border-b border-slate-200 bg-white shadow-sm"
        style={{ top: '80px' }}
      >
        <div className="mx-auto w-full max-w-4xl px-4">
          <FilterChips
            filters={sports}
            selected={selectedSport}
            onSelect={setSelectedSport}
          />
        </div>
      </div>

      <div className="mx-auto mt-[3rem] w-full max-w-4xl px-4 py-6">
        {/* <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-blue-700">Near you</h3> */}

        {error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="py-10 text-center text-slate-500">Loading venues…</div>
        ) : (
          <div className="space-y-3">
            {filteredVenues.map((venue) => (
              <VenueRow
                key={venue.id}
                venue={venue}
                onClick={() => navigate(`/venue/${venue.id}`)}
              />
            ))}
          </div>
        )}

        {filteredVenues.length > 10 && (
          <button
            type="button"
            className="mt-6 w-full py-2 text-sm font-semibold text-blue-600 hover:underline"
          >
            View all {filteredVenues.length} venues
          </button>
        )}
      </div>
    </div>
  )
}

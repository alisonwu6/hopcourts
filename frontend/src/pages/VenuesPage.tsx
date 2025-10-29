import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, VenueCard } from '@/components'
import { useVenuesStore } from '@/hooks'

export function VenuesPage() {
  const navigate = useNavigate()
  const { venues, isLoading, fetchVenues } = useVenuesStore()

  useEffect(() => {
    fetchVenues()
  }, [fetchVenues])

  return (
    <div className="pb-24 pt-20">
      <div className="flex items-center justify-between px-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Venues</h1>
          <p className="text-sm text-slate-500">Discover spaces hosting your next session.</p>
        </div>
        <Button variant="secondary" className="rounded-full text-sm" onClick={() => navigate('/create-venue')}>
          + Add
        </Button>
      </div>

      <div className="px-4 py-6">
        {isLoading ? (
          <div className="py-10 text-center text-slate-500">Loading venues…</div>
        ) : venues.length === 0 ? (
          <div className="py-10 text-center text-slate-500">No venues found</div>
        ) : (
          venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} onViewDetails={() => navigate(`/venue/${venue.id}`)} />
          ))
        )}
      </div>
    </div>
  )
}

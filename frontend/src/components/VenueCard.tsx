import { Venue } from '@/types'
import { Button } from './Button'

type VenueCardProps = {
  venue: Venue
  onViewDetails?: (venueId: string) => void
}

export function VenueCard({ venue, onViewDetails }: VenueCardProps) {
  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow">
      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-5xl text-white">
        🏢
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{venue.name}</h3>
            <p className="text-sm text-slate-600 capitalize">{venue.type}</p>
          </div>
          {venue.isVerified && <span className="text-xl text-blue-500">✓</span>}
        </div>

        <p className="text-sm text-slate-700">{venue.description}</p>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded bg-blue-50 p-2">
            <p className="font-semibold text-blue-700">{venue.rating.toFixed(1)}</p>
            <p className="text-xs text-slate-600">rating</p>
          </div>
          <div className="rounded bg-blue-50 p-2">
            <p className="font-semibold text-blue-700">{venue.gamesHosted}</p>
            <p className="text-xs text-slate-600">games hosted</p>
          </div>
          <div className="rounded bg-blue-50 p-2">
            <p className="font-semibold text-blue-700">
              {venue.basePrice ? `$${venue.basePrice}` : 'Free'}
            </p>
            <p className="text-xs text-slate-600">price</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {venue.amenities.slice(0, 3).map((amenity) => (
              <span key={amenity} className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {onViewDetails && (
          <Button className="w-full text-sm" onClick={() => onViewDetails(venue.id)}>
            View Details
          </Button>
        )}
      </div>
    </div>
  )
}

import type { PlayerVenue } from '@/types'
import { Building2, MapPin, Star } from 'lucide-react'

interface VenueRowProps {
  venue: PlayerVenue
  onClick: () => void
}

export function VenueRow({ venue, onClick }: VenueRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <LogoPlaceholder />
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold text-slate-900">{venue.name}</h4>
          <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide">
            {venue.sports.map((sport) => (
              <span
                key={sport}
                className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700"
              >
                {sport}
              </span>
            ))}
          </div>
          <p className="mt-1 flex items-center gap-2 text-xs text-gray-600">
            <MapPin className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            <span>{venue.location.address}</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <Star className="h-3.5 w-3.5 text-amber-400" fill="#FACC15" stroke="none" aria-hidden="true" />
              {venue.rating}
            </span>
            <span>{venue.memberCount} members</span>
            <span>{venue.gamesThisMonth} games this month</span>
          </div>
        </div>
      </div>
    </button>
  )
}

function LogoPlaceholder() {
  return (
    <span
      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-blue-50"
    >
      <Building2 className="h-5 w-5 text-slate-500" strokeWidth={2} aria-hidden="true" />
    </span>
  )
}

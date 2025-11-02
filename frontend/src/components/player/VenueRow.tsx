import type { PlayerVenue } from '@/data/playerMocks'

const venueIcons: Record<string, string> = {
  climbing: '🧗',
  running: '🏃',
  tennis: '🎾',
  basketball: '🏀',
}

function resolveVenueIcon(type: string) {
  return venueIcons[type.toLowerCase()] ?? '🏟️'
}

interface VenueRowProps {
  venue: PlayerVenue
  onClick: () => void
}

export function VenueRow({ venue, onClick }: VenueRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xl text-white">
          {resolveVenueIcon(venue.type)}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold text-slate-900">{venue.name}</h4>
          <p className="mt-1 text-xs text-gray-600">🧗 {venue.sport}</p>
          <p className="mt-1 text-xs text-gray-600">📍 {venue.location.address}</p>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-600">
            <span>{venue.rating}⭐</span>
            <span>{venue.memberCount} members</span>
            <span>{venue.gamesThisMonth} games this month</span>
          </div>
        </div>
      </div>
    </button>
  )
}

import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { InfoRow } from '@/components/player/InfoRow'
import { GameRow } from '@/components/player/GameRow'
import { PLAYER_MOCK_GAMES, PLAYER_MOCK_VENUES } from '@/data/playerMocks'

const venueIcons: Record<string, string> = {
  climbing: '🧗',
  running: '🏃',
  tennis: '🎾',
  basketball: '🏀',
}

function resolveVenueIcon(type: string) {
  return venueIcons[type.toLowerCase()] ?? '🏟️'
}

export function VenueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const venue = useMemo(() => PLAYER_MOCK_VENUES.find((item) => item.id === id), [id])

  const gamesAtVenue = useMemo(
    () =>
      PLAYER_MOCK_GAMES.filter(
        (game) => venue && game.location.name.toLowerCase() === venue.location.name.toLowerCase()
      ),
    [venue]
  )

  if (!venue) {
    return (
      <div className="px-4 pt-24 text-sm text-blue-700">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 text-blue-600">
          ← Back
        </button>
        Venue not found.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      <div className="sticky top-0 z-10 border-b border-blue-200 bg-blue-50">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-xl text-blue-600 hover:text-blue-700"
            >
              ←
            </button>
            <h1 className="text-lg font-bold text-blue-900">Venue</h1>
          </div>
          <button type="button" className="text-xl text-gray-600 hover:text-gray-900">
            ⋯
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-blue-600">
        <div className="mx-auto flex h-32 w-full max-w-4xl items-center justify-center text-6xl text-white">
          {resolveVenueIcon(venue.type)}
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 py-4">
        <h2 className="text-2xl font-bold text-blue-900">{venue.name}</h2>
        <p className="text-sm text-slate-600 capitalize">{venue.type}</p>

        <div className="mt-4 space-y-3">
          <InfoRow
            icon="📍"
            label="Address"
            value={venue.location.address}
            subValue={venue.location.city}
            storyLine="venue"
          />
          <InfoRow
            icon="⭐"
            label="Rating"
            value={`${venue.rating} (${venue.reviewCount} reviews)`}
            storyLine="venue"
          />
          <InfoRow icon="👥" label="Members" value={`${venue.memberCount} members`} storyLine="venue" />
          <InfoRow
            icon="🕐"
            label="Hours"
            value="Mon-Fri: 6AM - 10PM"
            subValue="Sat-Sun: 9AM - 8PM"
            storyLine="venue"
          />
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Amenities</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {venue.amenities.map((amenity) => (
              <p key={amenity} className="text-sm text-slate-700">
                ✓ {amenity}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-blue-700">
            Games here
          </h3>
          <div className="space-y-3">
            {gamesAtVenue.map((game) => (
              <GameRow
                key={game.id}
                title={game.title}
                sport={game.sport}
                startTime={game.startTime}
                attendeeCount={game.attendeeCount}
                locationName={game.location.name}
                hostName={game.hostName}
                onClick={() => navigate(`/game/${game.id}`)}
                storyLine="venue"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

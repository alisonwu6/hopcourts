import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GameRow } from '@/components/player/GameRow'
import clsx from 'clsx'
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  MapPin,
  MapPinned,
  Star,
  UsersRound,
} from 'lucide-react'
import { useVenuesStore } from '@/hooks'
import { useGamesStore } from '@/hooks'

export function VenueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isSaved, setIsSaved] = useState(false)
  const venue = useVenuesStore((state) => state.selectedVenue)
  const isLoading = useVenuesStore((state) => state.isLoading)
  const venueError = useVenuesStore((state) => state.error)
  const fetchVenueById = useVenuesStore((state) => state.fetchVenueById)
  const fetchGames = useGamesStore((state) => state.fetchGames)
  const games = useGamesStore((state) => state.games)

  useEffect(() => {
    if (id) {
      void fetchVenueById(id)
      void fetchGames()
    }
  }, [id, fetchVenueById, fetchGames])

  const gamesAtVenue = useMemo(() => {
    if (!venue) return []
    return games.filter(
      (game) =>
        game.location?.name &&
        game.location.name.toLowerCase() === venue.location.name.toLowerCase()
    )
  }, [games, venue])

  if (!venue) {
    return (
      <div className="px-4 pt-24 text-sm text-slate-600">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 text-slate-500">
          ← Back
        </button>
        {isLoading ? 'Loading venue…' : venueError ?? 'Venue not found.'}
      </div>
    )
  }

  const chips = venue.sports.length ? venue.sports : ['General']
  const [activeTab, setActiveTab] = useState<'about' | 'games'>('about')

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      <div className="sticky top-[80px] z-40 bg-white/95 backdrop-blur shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="border-t border-[#E6E6E6]">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
            <div className="flex h-[52px] min-w-max items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-sm font-semibold text-slate-500 transition hover:text-slate-700"
              >
                ← Back
              </button>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSaved((prev) => !prev)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 text-blue-600 transition hover:border-blue-300 hover:bg-blue-50"
                  aria-pressed={isSaved}
                  aria-label={isSaved ? 'Saved' : 'Save venue'}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill={isSaved ? 'currentColor' : 'none'}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.78-3.4 6.86-8.55 11.53L12 21.35Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 pb-24">
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_24px_60px_rgba(15,41,77,0.12)]">
          <div
            className="h-40 w-full bg-cover bg-center"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80)',
            }}
            aria-hidden="true"
          />

          <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <LogoBadge />
                <div className="space-y-1">
                  <h1 className="text-2xl font-semibold text-slate-900">{venue.name}</h1>
                  <p className="text-sm text-slate-600 capitalize">{venue.type}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                    <span>{venue.location.city}</span>
                  </div>
                </div>
              </div>
            </header>

            <div className="mt-4 flex gap-3 border-b border-slate-200 text-sm font-semibold text-slate-500">
              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className={clsx(
                  'relative px-3 py-2 transition',
                  activeTab === 'about'
                    ? 'text-slate-900 after:absolute after:inset-x-0 after:-bottom-[1px] after:h-0.5 after:rounded-full after:bg-blue-500'
                    : 'hover:text-slate-700'
                )}
              >
                About
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('games')}
                className={clsx(
                  'relative px-3 py-2 transition',
                  activeTab === 'games'
                    ? 'text-slate-900 after:absolute after:inset-x-0 after:-bottom-[1px] after:h-0.5 after:rounded-full after:bg-blue-500'
                    : 'hover:text-slate-700'
                )}
              >
                Games
              </button>
            </div>
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-8">
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide">
              {chips.map((sport) => (
                <span
                  key={sport}
                  className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700"
                >
                  {sport}
                </span>
              ))}
            </div>

            {activeTab === 'about' ? (
              <AboutSection venue={venue} />
            ) : (
              <GamesSection games={gamesAtVenue} navigate={navigate} />
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

function LogoBadge() {
  return (
    <span
      className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 bg-blue-50"
    >
      <Building2 className="h-5 w-5 text-slate-500" strokeWidth={2} aria-hidden="true" />
    </span>
  )
}

function InfoTile({
  icon: Icon,
  label,
  value,
  subValue,
}: {
  icon: typeof MapPin
  label: string
  value: string
  subValue?: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center text-slate-500">
        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value}</p>
        {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
      </div>
    </div>
  )
}

function AboutSection({ venue }: { venue: PlayerVenue }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
        <InfoTile
          icon={MapPin}
          label="Address"
          value={venue.location.address}
          subValue={venue.location.city}
        />
        <InfoTile
          icon={Star}
          label="Rating"
          value={`${venue.rating}`}
          subValue={`${venue.reviewCount} reviews`}
        />
        <InfoTile
          icon={UsersRound}
          label="Members"
          value={`${venue.memberCount}`}
          subValue="active players"
        />
        <InfoTile
          icon={Clock3}
          label="Hours"
          value="Mon-Fri: 6AM – 10PM"
          subValue="Sat-Sun: 9AM – 8PM"
        />
      </div>

      <section className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Amenities</h2>
        <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          {venue.amenities.map((amenity) => (
            <div key={amenity} className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" strokeWidth={2} aria-hidden="true" />
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function GamesSection({
  games,
  navigate,
}: {
  games: PlayerGame[]
  navigate: ReturnType<typeof useNavigate>
}) {
  if (!games.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500">
        No upcoming games at this venue yet. Check back soon!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {games.map((game) => (
        <GameRow
          key={game.id}
          title={game.title}
          sport={game.sport}
          startTime={game.startTime}
          attendeeCount={game.attendeeCount}
          locationName={game.location.name}
          hostName={game.host.name}
          onClick={() => navigate(`/game/${game.id}`)}
          storyLine="venue"
        />
      ))}
    </div>
  )
}

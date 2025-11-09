import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components'
import type { PlayerGame } from '@/types'
import clsx from 'clsx'
import {
  BarChart3,
  Calendar,
  CircleDollarSign,
  Clock8,
  MapPin,
  MapPinPlusInside,
  TicketCheck,
  UserRoundPlus,
} from 'lucide-react'
import { getSportTheme } from '@/lib/sportColors'
import { useGamesStore } from '@/hooks'
import { useAuthStore } from '@/store/authStore'

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isSaved, setIsSaved] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const selectedGame = useGamesStore((state) => state.selectedGame)
  const fetchGameById = useGamesStore((state) => state.fetchGameById)
  const joinGame = useGamesStore((state) => state.joinGame)
  const leaveGame = useGamesStore((state) => state.leaveGame)
  const gamesLoading = useGamesStore((state) => state.isLoading)
  const { user } = useAuthStore()

  useEffect(() => {
    if (id) {
      void fetchGameById(id)
    }
  }, [id, fetchGameById])

  const game = selectedGame

  if (!game) {
    return (
      <div className="px-4 pt-24 text-sm text-slate-600">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 text-slate-700">
          ← Back
        </button>
        {gamesLoading ? 'Loading game…' : 'Game not found.'}
      </div>
    )
  }

  const handleJoinToggle = async () => {
    if (!game) return
    setActionLoading(true)
    try {
      if (game.joined) {
        await leaveGame(game.id)
      } else {
        await joinGame(game.id)
      }
    } finally {
      setActionLoading(false)
    }
  }

  const theme = getSportTheme(game.sport)
  const sportLabel = formatSportName(game.sport)
  const skillLabel = friendlySkill(game.skillLevel)
  const locationCity = game.location?.city
  const locationLabel = game.location?.address ?? game.location?.name ?? 'Venue to be confirmed'
  const dateLabel = formatFullDate(game.startTime)
  const timeRangeLabel = formatTimeRange(game.startTime, game.endTime)
  const priceLabel = game.priceRange ?? (game.isFree ? 'Free to join' : 'Paid event')
  const hostRating = typeof game.host.rating === 'number' ? game.host.rating.toFixed(1) : '4.8'
  const hostedCount = game.attendeeCount

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
                  className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-blue-200 text-blue-600 transition hover:border-blue-300 hover:bg-blue-50"
                  aria-pressed={isSaved}
                  aria-label={isSaved ? 'Saved' : 'Save for later'}
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
                <button
                  type="button"
                  onClick={handleJoinToggle}
                  disabled={actionLoading}
                  className={clsx(
                    'inline-flex items-center gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    game.joined ? 'bg-player-600 text-white border-player-600' : ''
                  )}
                  style={
                    game.joined
                      ? undefined
                      : {
                          borderColor: theme.primary,
                          color: theme.primary,
                        }
                  }
                >
                  <span className="inline-flex  items-center justify-center rounded-full bg-white/90">
                    <TicketCheck
                      className="h-4 w-4"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </span>
                  {game.joined ? 'Joined' : "I'm in"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 pb-32">
        <section className="relative overflow-hidden rounded-[30px] border border-slate-100 bg-white shadow-[0_24px_60px_rgba(15,41,77,0.12)]">
          <div
            className="absolute left-6 top-6 hidden h-12 w-12 items-center justify-center rounded-2xl sm:flex"
            style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
          >
            <MapPinPlusInside
              className="h-5 w-5"
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            <header className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <AvatarCircle
                  name={game.host.name}
                  src={game.host.avatarUrl}
                />
                <div className="space-y-1 leading-tight">
                  <p className="text-base font-semibold text-slate-900">
                    {game.host.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {hostRating}★ · {hostedCount} joined
                  </p>
                  {locationCity && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin
                        className="h-4 w-4"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      <span>{locationCity}</span>
                    </div>
                  )}
                </div>
              </div>

              <span
                className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                style={{ backgroundColor: theme.surface, color: theme.dark }}
              >
                {sportLabel}
              </span>
            </header>

            <div className="flex items-center justify-between gap-3">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
                style={{ backgroundColor: theme.surface, color: theme.dark }}
              >
                {skillLabel}
              </span>
            </div>

            <div className="space-y-5">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-slate-900">
                  {game.title}
                </h1>
                {game.detail?.description ?? game.description ? (
                  <p className="text-sm text-slate-600">
                    {game.detail?.description ?? game.description}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
                <InfoTile
                  icon={MapPinPlusInside}
                  label="Address"
                  value={locationLabel}
                />
                <InfoTile
                  icon={Calendar}
                  label="Date"
                  value={dateLabel}
                />
                <InfoTile
                  icon={Clock8}
                  label="Time"
                  value={timeRangeLabel}
                />
                <InfoTile
                  icon={CircleDollarSign}
                  label="Price"
                  value={priceLabel}
                />
                <InfoTile
                  icon={UserRoundPlus}
                  label="Joined"
                  value={`${game.attendeeCount}/${game.maxAttendees}`}
                />
                <InfoTile
                  icon={BarChart3}
                  label="Skill level"
                  value={skillLabel}
                />
              </div>

              {!game.detail?.hideParticipants &&
                game.participants.length > 0 && (
                  <ParticipantsList participants={game.participants} />
                )}
            </div>
          </div>
        </section>

        <GameDetailsSections game={game} />
      </main>
    </div>
  )
}

function AvatarCircle({ name, src }: { name: string; src?: string }) {
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-lg font-semibold text-slate-700"
      style={
        src
          ? {
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {!src && name.charAt(0).toUpperCase()}
    </div>
  )
}

function IconBadge({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center text-slate-500">
      <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
    </span>
  )
}

function InfoTile({ icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <IconBadge icon={icon} />
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  )
}

function ParticipantsList({
  participants,
}: {
  participants: PlayerGame['participants']
}) {
  const preview = participants.slice(0, 12)
  return (
    <section className="space-y-3 rounded-3xl border border-slate-100 bg-white/80 px-4 py-4 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Who's joining ({participants.length})
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {preview.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
          >
            <div
              className={clsx(
                'flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700'
              )}
              style={
                participant.avatarUrl
                  ? {
                      backgroundImage: `url(${participant.avatarUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : undefined
              }
            >
              {!participant.avatarUrl && participant.name.charAt(0).toUpperCase()}
            </div>
            <span>{participant.name}</span>
          </div>
        ))}
      </div>
      {participants.length > preview.length && (
        <p className="text-xs text-slate-500">+{participants.length - preview.length} more</p>
      )}
    </section>
  )
}

function GameDetailsSections({ game }: { game: PlayerGame }) {
  const detail = game.detail ?? {}
  const sections: Array<{ icon: string; title: string; lines: string[] }> = []

  if (detail.description ?? game.description) {
    sections.push({
      icon: '📝',
      title: 'About this game',
      lines: [detail.description ?? game.description ?? 'Host has not shared details yet.'],
    })
  }

  if (detail.lookingFor) {
    const { skillLevel, vibe, notes } = detail.lookingFor
    const lines: string[] = []
    if (skillLevel) lines.push(`Skill level: ${skillLevel}`)
    if (vibe) lines.push(`Team vibe: ${vibe}`)
    if (notes) lines.push(`Special notes: ${notes}`)
    if (lines.length) {
      sections.push({
        icon: '🎯',
        title: "What the host is looking for",
        lines,
      })
    }
  }

  if (detail.rules) {
    const { duration, courtType, equipment, rotation } = detail.rules
    const lines: string[] = []
    if (duration) lines.push(`Duration: ${duration}`)
    if (courtType) lines.push(`Court: ${courtType}`)
    if (equipment) lines.push(`Equipment: ${equipment}`)
    if (rotation) lines.push(`Rotation: ${rotation}`)
    if (lines.length) {
      sections.push({
        icon: '⚙️',
        title: 'Game rules',
        lines,
      })
    }
  }

  if (!sections.length) {
    return null
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <section
          key={section.title}
          className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {section.icon} {section.title}
          </h2>
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
            {section.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function formatSportName(value: string) {
  if (!value) return 'Sport'
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

function friendlySkill(level: PlayerGame['skillLevel']) {
  switch (level) {
    case 'beginner':
      return 'Beginner friendly'
    case 'intermediate':
      return 'Intermediate pace'
    case 'advanced':
      return 'Advanced crew'
    case 'mixed':
    default:
      return 'All levels welcome'
  }
}

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value)
}

function formatFullDate(value: Date | string) {
  const date = toDate(value)
  const weekday = date.toLocaleDateString(undefined, { weekday: 'short' })
  const day = date.toLocaleDateString(undefined, { day: '2-digit' })
  const month = date.toLocaleDateString(undefined, { month: '2-digit' })
  const year = date.toLocaleDateString(undefined, { year: 'numeric' })
  return `${weekday}, ${day}/${month}/${year}`
}

function formatTimeRange(start: Date | string, end: Date | string) {
  const startDate = toDate(start)
  const endDate = toDate(end)
  const startLabel = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const endLabel = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `${startLabel}-${endLabel}`
}

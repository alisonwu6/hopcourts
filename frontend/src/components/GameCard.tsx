import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'
import { Calendar, CircleDollarSign, Clock8, MapPin, MapPinned, MapPinPlusInside, UserRoundPlus } from 'lucide-react'
import { PlayerGame } from '@/types'
import { getSportTheme } from '@/lib/sportColors'

type GameCardProps = {
  game: PlayerGame
  onViewDetails?: (gameId: string) => void
}

export function GameCard({
  game,
  onViewDetails,
}: GameCardProps) {
  const theme = getSportTheme(game.sport)
  const sportLabel = formatSportName(game.sport)
  const skillLabel = friendlySkill(game.skillLevel)
  const locationCity = game.location?.city
  const locationLabel = game.location?.address ?? game.location?.name ?? 'Venue to be confirmed'
  const dateLabel = formatFullDate(game.startTime)
  const timeRangeLabel = formatTimeRange(game.startTime, game.endTime)
  const priceLabel = game.priceRange ?? (game.isFree ? 'Free to join' : 'Paid event')

  const attendeeCount = game.attendeeCount
  const participantPreview = game.participants.slice(0, 4)
  const remaining = Math.max(attendeeCount - participantPreview.length, 0)

  return (
    <article className="relative mb-6 overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_20px_45px_rgba(15,41,77,0.08)] transition-shadow hover:shadow-[0_24px_60px_rgba(15,41,77,0.12)]">
      <div
        className="absolute left-6 top-6 hidden h-12 w-12 items-center justify-center rounded-2xl sm:flex"
        style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
      >
        <MapPinPlusInside className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
      </div>

      <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-7">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AvatarCircle name={game.host.name} src={game.host.avatarUrl} />
            <div className="space-y-1 leading-tight">
              <p className="text-base font-semibold text-slate-900">{game.host.name}</p>
              {locationCity && (
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  <span>{locationCity}</span>
                </div>
              )}
            </div>
          </div>

          <span
            className="rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
            style={{ backgroundColor: theme.surface, color: theme.dark }}
          >
            {sportLabel}
          </span>
        </header>

        <div className="flex items-center justify-between gap-3">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide"
            style={{ backgroundColor: theme.surface, color: theme.dark }}
          >
            {skillLabel}
          </span>
          <button
            type="button"
            onClick={() => onViewDetails?.(game.id)}
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-700"
          >
            View details →
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-slate-900">{game.title}</h3>
          </div>

          <div className="space-y-1.5 text-sm text-slate-600">
            <InfoRow icon={MapPinned} label={locationLabel} />
            <InfoRow icon={Calendar} label={dateLabel} />
            <InfoRow icon={Clock8} label={timeRangeLabel} />
            <InfoRow icon={CircleDollarSign} label={priceLabel} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <IconBadge icon={UserRoundPlus} />
            <div className="flex -space-x-2">
              {participantPreview.map((participant) => (
                <AvatarCircle
                  key={participant.id}
                  name={participant.name}
                  src={participant.avatarUrl}
                  size="sm"
                  ring
                />
              ))}
            </div>
            <span className="text-sm text-slate-600">
              {summaryText(attendeeCount, game.maxAttendees, remaining)}
            </span>
          </div>
        </div>

      </div>
    </article>
  )
}

function AvatarCircle({
  name,
  src,
  size = 'md',
  ring,
}: {
  name: string
  src?: string
  size?: 'sm' | 'md'
  ring?: boolean
}) {
  const dimension = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700',
        dimension,
        ring && 'border-2 border-white shadow ring-1 ring-slate-200'
      )}
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

function InfoRow({ icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <IconBadge icon={icon} />
      <span>{label}</span>
    </div>
  )
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
  return `${startLabel} - ${endLabel}`
}

function summaryText(attending: number, max: number, remaining: number) {
  const base = `${attending}/${max} joined`
  if (remaining <= 0) return base
  return `${base} · +${remaining} more`
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

function formatSportName(value: string) {
  if (!value) return 'Sport'
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

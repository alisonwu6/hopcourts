import type { KeyboardEvent } from 'react'
import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'
import { Calendar, CircleDollarSign, Earth, MapPin, MapPinPlusInside, UserRoundPlus } from 'lucide-react'
import { PlayerEvent } from '@/types'

const ACCENT = {
  primary: '#2563EB',
  surface: '#DBEAFE',
  dark: '#1D4ED8',
  gradient: 'linear-gradient(135deg, #DBEAFE, #2563EB)',
}

type EventCardProps = {
  event: PlayerEvent
  onViewDetails?: (eventId: string) => void
}

export function EventCard({
  event,
  onViewDetails,
}: EventCardProps) {
  const sportLabel = formatSportName(event.sport)
  const skillLabel = friendlySkill(event.skillLevel)
  const locationCity = event.location?.city
  const locationLabel = event.location?.address ?? event.location?.name ?? '地點待確認'
  const scheduleLabel = formatSchedule(event.startTime, event.endTime)
  const priceLabel = event.priceRange ?? (event.isFree ? '免費參加' : '付費活動')
  const cityLabel = locationCity ?? '城市待確認'

  const attendeeCount = event.attendeeCount
  const participantPreview = event.participants.slice(0, 4)
  const remaining = Math.max(attendeeCount - participantPreview.length, 0)
  const isClickable = Boolean(onViewDetails)
  const heroImage =
    (event as PlayerEvent & { heroImageUrl?: string }).heroImageUrl ?? event.detail?.heroImageUrl
  const heroStyle = heroImage
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(2,6,23,0.15), rgba(2,6,23,0.55)), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundImage: ACCENT.gradient,
      }

  const handleCardClick = () => onViewDetails?.(event.id)
  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onViewDetails?.(event.id)
    }
  }

  const interactionHandlers = isClickable
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick: handleCardClick,
        onKeyDown: handleCardKeyDown,
        'aria-label': `查看 ${event.title} 詳細資訊`,
      }
    : {}

  return (
    <article
      {...interactionHandlers}
      className={clsx(
        'relative mb-6 overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_20px_45px_rgba(15,41,77,0.08)] transition-all hover:shadow-[0_24px_60px_rgba(15,41,77,0.12)]',
        isClickable &&
          'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-player-500'
      )}
    >
      <div
        className="absolute left-6 top-6 hidden h-12 w-12 items-center justify-center rounded-2xl bg-player-600 text-white sm:flex"
      >
        <MapPinPlusInside
          className="h-5 w-5"
          strokeWidth={2}
          aria-hidden="true"
        />
      </div>

      <div className="space-y-2 px-3 py-3 sm:px-8 sm:py-7">
        <header className="flex flex-wrap items-start justify-between">
          <div className="flex items-start gap-3">
            <AvatarCircle
              name={event.host.name}
              src={event.host.avatarUrl}
            />
            <div>
              <p className="text-base font-semibold text-slate-900">
                {event.host.name}
              </p>
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Earth
                  className="h-4 w-4"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span>{cityLabel}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="overflow-hidden rounded-2xl">
          <div
            className="relative h-48 w-full rounded-2xl"
            style={heroStyle}
          >
            {!heroImage && (
              <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
                {event.vibeIcon}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600">
            {skillLabel}
          </span>
          <span
            className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700"
          >
            {sportLabel}
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-semibold leading-snug text-slate-900">
            {event.title}
          </h3>

          <div className="flex flex-col text-sm text-slate-600">
            <InfoRow
              icon={Calendar}
              label={scheduleLabel}
            />
            <InfoRow
              icon={MapPin}
              label={locationLabel}
            />
            <div className="flex flex-wrap items-center">
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
                {summaryText(attendeeCount, event.maxAttendees, remaining)}
              </span>
            </div>
            <InfoRow
              icon={CircleDollarSign}
              label={priceLabel}
            />
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
    <div className="flex items-center">
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

function formatSchedule(start: Date | string, end: Date | string) {
  const startDate = toDate(start)
  const dateLabel = startDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  return `${dateLabel} ${formatTimeRange(start, end)}`
}

function summaryText(attending: number, max: number, remaining: number) {
  const base = `${attending}/${max} 已報名`
  if (remaining <= 0) return base
  return `${base} · 還有${remaining}位`
}

function friendlySkill(level: PlayerEvent['skillLevel']) {
  switch (level) {
    case 'beginner':
      return '新手友善'
    case 'intermediate':
      return '中階步調'
    case 'advanced':
      return '進階高手'
    case 'mixed':
    default:
      return '不限程度'
  }
}

function formatSportName(value: string) {
  if (!value) return '運動'
  return value
}

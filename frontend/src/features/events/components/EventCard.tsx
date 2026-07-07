import type { KeyboardEvent } from 'react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, CircleDollarSign, ShieldCheck } from 'lucide-react'
import { PlayerEvent } from '@/types'
import { BookmarkButton } from './BookmarkButton'
import { EVENT_SPORT_CLASS, GENDER_CLASS, getSkillClass } from '@/constants/sportTokens'
import { getFlagEmoji } from '@/utils/flags'

type EventCardViewAs = 'host' | 'joined' | 'browse'

type EventCardProps = {
  event: PlayerEvent
  onViewDetails?: (eventId: string) => void
  className?: string
  sportLabel?: string
  cityLabel?: string
  disableVenueHostNavigation?: boolean
  showBookmark?: boolean
  viewAs?: EventCardViewAs
}

export function EventCard({
  event,
  onViewDetails,
  className,
  sportLabel: sportLabelProp,
  cityLabel: cityLabelProp,
  disableVenueHostNavigation = false,
  showBookmark = false,
  viewAs = 'browse',
}: EventCardProps) {
  const navigate = useNavigate()

  const isVenueHost = Boolean(event.isOfficial && event.venueId)
  const venueName = event.venueNameDisplay
  const venueLogo = event.venueLogoUrl

  const canNavigateToVenue = isVenueHost && Boolean(event.venueId) && !disableVenueHostNavigation

  const displayHost = {
    name: isVenueHost && venueName ? venueName : event.host.name,
    avatarUrl: isVenueHost ? venueLogo : event.host.avatarUrl,
    isOfficial: isVenueHost,
  }

  const sportLabel = sportLabelProp || event.sport

  const skillLabel = friendlySkill(event.skillLevel)
  const locationCity = event.location?.city
  const locationLine1 =
    event.location.name && event.location.name !== event.location.address
      ? event.location.name
      : event.location.name || event.location.address || 'Location TBD'
  const locationLine2 =
    event.location.name && event.location.address && event.location.name !== event.location.address
      ? event.location.address
      : ''
  const scheduleLabel = formatSchedule(event.startTime, event.endTime)
  const cityLabel = cityLabelProp || locationCity || 'City TBD'

  const attendeeCount = event.attendeeCount
  const remaining = Math.max(event.maxAttendees - attendeeCount, 0)
  const minPeople = Math.max(1, event.minPeople ?? 1)
  const isClickable = Boolean(onViewDetails)

  const handleCardClick = () => onViewDetails?.(event.id)
  const handleCardKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onViewDetails?.(event.id)
    }
  }

  const priceDisplay = event.isFree
    ? 'Free'
    : event.priceMode === 'person'
      ? `${event.priceRange || `$${Number(event.pricePerPerson).toFixed(2)}`} / player`
      : event.priceTotal
        ? (() => {
            const perFull = (event.priceTotal / event.maxAttendees).toFixed(2)
            const perHigh = (event.priceTotal / minPeople).toFixed(2)
            return perHigh !== perFull ? `Est. $${perFull} – $${perHigh} / player` : `Est. $${perFull} / player`
          })()
        : 'Paid event'

  const isFull = remaining === 0 && event.maxAttendees > 0 && event.status !== 'cancelled'

  const interactionHandlers = isClickable
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick: handleCardClick,
        onKeyDown: handleCardKeyDown,
        'aria-label': `View details for ${event.title}`,
      }
    : {}

  return (
    <article
      {...interactionHandlers}
      className={clsx(
        'relative overflow-hidden rounded-[10px] border border-slate-100 bg-white shadow-[0_15px_45px_rgba(15,41,77,0.07)]',
        isClickable && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-player-500',
        className ?? 'mb-5'
      )}
    >
      {showBookmark && (
        <div className="absolute right-0 top-[2px] z-10">
          <BookmarkButton
            eventId={event.id}
            className="px-2 pb-2 pt-0 text-blue-600"
          />
        </div>
      )}

      {/* 1. Host Header at top */}
      <header className="flex items-stretch justify-between border-b border-slate-50 px-5 py-3.5">
        <div
          className={clsx('flex items-center gap-2.5', canNavigateToVenue && 'cursor-pointer')}
          onClick={(e) => {
            if (canNavigateToVenue && event.venueId) {
              e.stopPropagation()
              navigate(`/venues/${event.venueId}`)
            }
          }}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && canNavigateToVenue && event.venueId) {
              e.preventDefault()
              e.stopPropagation()
              navigate(`/venues/${event.venueId}`)
            }
          }}
          role={canNavigateToVenue ? 'button' : undefined}
          tabIndex={canNavigateToVenue ? 0 : undefined}
          aria-label={canNavigateToVenue ? `View venue ${displayHost.name}` : undefined}
        >
          <AvatarCircle
            name={displayHost.name}
            src={displayHost.avatarUrl}
            size="sm"
          />
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
              {displayHost.name}
              {/* {displayHost.isOfficial && (
                <ShieldCheck className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
              )} */}
              {event.host.countryKey && <span className="text-xs">{getFlagEmoji(event.host.countryKey)}</span>}
            </p>
            <div className="mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-slate-400" />
              <p className="text-[12px] leading-none text-slate-500">{cityLabel}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end justify-end gap-1">
          <StatusBadge
            status={event.status}
            startTime={event.startTime}
            endTime={event.endTime}
          />
          {isVenueHost && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-700">
              <ShieldCheck
                size={10}
                className="text-emerald-600"
              />
              OFFICIAL
            </span>
          )}
        </div>
      </header>

      {/* 2. Info Content */}
      <div className="px-5 pb-4 pt-3.5">
        {/* Tags */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${EVENT_SPORT_CLASS}`}>
            {sportLabel}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${getSkillClass(event.skillLevel)}`}>
            {skillLabel}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${GENDER_CLASS}`}>
            {event.gender === 'female' ? 'Women' : event.gender === 'male' ? 'Men' : event.gender === 'lgbtq' ? 'LGBT+' : 'All genders'}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-3 text-[15px] font-bold leading-snug tracking-tight text-slate-900">{event.title}</h3>

        {/* Info rows — compact */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Calendar
              className="h-3.5 w-3.5 shrink-0 text-slate-400"
              strokeWidth={2}
            />
            <span className="text-[12px] text-slate-600">{scheduleLabel}</span>
          </div>

          <div className="flex items-start gap-2">
            <MapPin
              className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400"
              strokeWidth={2}
            />
            <div className="min-w-0 text-[12px] leading-snug text-slate-600">
              <p className="break-words">{locationLine1}</p>
              {locationLine2 ? <p className="break-words">{locationLine2}</p> : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CircleDollarSign
              className="h-3.5 w-3.5 shrink-0 text-slate-400"
              strokeWidth={2}
            />
            <span className="text-[12px] text-slate-600">{priceDisplay}</span>
          </div>
        </div>
      </div>

      {/* 4. Footer — join progress */}
      <div className="border-t border-slate-100 px-5 py-3">
        <p className="mb-1.5 text-[11px] text-slate-400">
          {attendeeCount} joined · {remaining > 0 ? `${remaining} spots left` : 'All spots filled'}
          {minPeople > 1 && <span className="text-slate-300"> · </span>}
          {minPeople > 1 && <span>Min. {minPeople} players</span>}
        </p>
        <div className="flex items-center gap-2">
          <div
            className="relative h-1.5 w-4/5 overflow-hidden rounded-full"
            style={{ background: 'linear-gradient(to right, #bbf7d0, #16a34a 55%, #ef4444)' }}
          >
            {/* gray cover slides from right, revealing gradient as attendees join */}
            <div
              className="absolute right-0 h-full bg-slate-200 transition-all duration-500"
              style={{
                width: `${Math.max(0, 100 - (event.maxAttendees > 0 ? (attendeeCount / event.maxAttendees) * 100 : 0))}%`,
              }}
            />
            {/* min threshold notch */}
            {minPeople > 1 && event.maxAttendees > 0 && (
              <div
                className="absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white/70"
                style={{ left: `${Math.min(99, (minPeople / event.maxAttendees) * 100)}%` }}
              />
            )}
          </div>
          {isFull && (
            <span className="shrink-0 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-red-500">
              Full
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

function StatusBadge({
  status,
  startTime,
  endTime,
}: {
  status?: PlayerEvent['status']
  startTime: Date | string
  endTime: Date | string
}) {
  const now = new Date()
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : new Date(startTime)
  const isPast = now > end
  const isInProgress = now >= start && now <= end
  let label: string
  let className: string

  if (status === 'cancelled') {
    label = 'Cancelled'
    className = 'border-red-200 bg-red-50 text-red-600'
  } else if (status === 'completed') {
    label = 'Completed'
    className = 'border-slate-200 bg-slate-200 text-slate-500'
  } else if (status === 'draft') {
    label = 'Draft'
    className = 'border-slate-100 bg-white text-slate-500'
  } else if (isPast) {
    label = 'Past'
    className = 'border-slate-200 bg-slate-100 text-slate-500'
  } else if (isInProgress) {
    label = 'In Progress'
    className = 'border-green-200 bg-green-50 text-green-600'
  } else if (status === 'published') {
    label = 'Open'
    className = 'border-sky-200 bg-sky-50 text-sky-600'
  } else {
    return null
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${className}`}
    >
      {label}
    </span>
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
  const dimension = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10'
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
  return (
    <div
      className={clsx(
        'flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full',
        dimension,
        src ? 'bg-slate-100' : 'bg-blue-100',
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
      {!src && <span className="text-[11px] font-bold text-blue-700">{initials || '?'}</span>}
    </div>
  )
}

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value)
}

function formatSchedule(start: Date | string, end: Date | string) {
  const startDate = toDate(start)
  const endDate = toDate(end)
  const dateStr = startDate.toLocaleDateString('en-AU', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const upcase = (t: string) => t.replace(/\s(am|pm)$/i, (m) => m.toUpperCase())
  const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true }
  const startTime = upcase(startDate.toLocaleTimeString('en-AU', opts))
  const endTime = upcase(endDate.toLocaleTimeString('en-AU', opts))

  return `${dateStr} · ${startTime} – ${endTime}`
}

function friendlySkill(level: PlayerEvent['skillLevel']) {
  switch (level) {
    case 'beginner':
      return 'Beginner'
    case 'intermediate':
      return 'Intermediate'
    case 'advanced':
      return 'Advanced'
    case 'mixed':
    default:
      return 'All levels'
  }
}

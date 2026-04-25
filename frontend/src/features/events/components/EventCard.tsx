import type { KeyboardEvent } from 'react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Calendar,
  MapPin,
  PersonStanding,
  CircleDollarSign,
  ChartColumnIncreasing,
  ShieldCheck,
} from 'lucide-react'
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
  className?: string
  sportLabel?: string
  cityLabel?: string
  disableVenueHostNavigation?: boolean
}

function getFlagEmoji(countryCode: string) {
  if (!countryCode || countryCode.length !== 2) return ''
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
}

export function EventCard({
  event,
  onViewDetails,
  className,
  sportLabel: sportLabelProp,
  cityLabel: cityLabelProp,
  disableVenueHostNavigation = false,
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
  const priceLabel = event.priceRange ?? (event.isFree ? 'Free' : 'Paid event')
  const cityLabel = cityLabelProp || event.host.cityName || locationCity || 'City TBD'

  const attendeeCount = event.attendeeCount
  const remaining = Math.max(event.maxAttendees - attendeeCount, 0)
  const minPeople = Math.max(1, event.minPeople ?? 1)
  const isClickable = Boolean(onViewDetails)
  const heroImage =
    (event as PlayerEvent & { heroImageUrl?: string }).heroImageUrl ?? event.detail?.heroImageUrl
  const heroStyle = heroImage
    ? {
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundImage: ACCENT.gradient,
      }

  const handleCardClick = () => onViewDetails?.(event.id)
  const handleCardKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onViewDetails?.(event.id)
    }
  }

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
        'relative overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_15px_45px_rgba(15,41,77,0.07)] transition-all active:scale-[0.98]',
        isClickable &&
          'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-player-500',
        className ?? 'mb-5'
      )}
    >
      {/* 1. Host Header at top */}
      <header className="flex items-center justify-between border-b border-slate-50 px-5 py-3.5">
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
          <AvatarCircle name={displayHost.name} src={displayHost.avatarUrl} size="sm" />
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
              {displayHost.name}
              {/* {displayHost.isOfficial && (
                <BadgeCheck className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
              )} */}
              {event.host.countryKey && !displayHost.isOfficial && (
                <span className="text-xs">{getFlagEmoji(event.host.countryKey)}</span>
              )}
            </p>
            <div className="mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-slate-400" />
              <p className="text-[12px] leading-none text-slate-500">{cityLabel}</p>
            </div>
          </div>
        </div>

        {isVenueHost && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-700">
            <ShieldCheck size={10} className="text-emerald-600" />
            OFFICIAL
          </span>
        )}

      </header>

      {/* 2. Full-width Hero Image */}
      {false && (
        <div className="relative h-56 w-full" style={heroStyle}>
          {!heroImage && (
            <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-40">
              {sportLabel}
            </div>
          )}
        </div>
      )}

      {/* 3. Info Content */}
      <div className="space-y-3.5 px-5 py-4">
        <div className="flex flex-col gap-2.5">
          {/* Tags above Title */}
          <div className="flex items-center gap-2">
            {/* Sport Tag */}
            <div className="flex items-center gap-1.5 rounded-full border border-slate-100 bg-white px-3 py-1 text-[11px] font-medium text-slate-800">
              {sportLabel}
            </div>
            {/* Skill Tag */}
            <div className="flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-800">
              {skillLabel}
            </div>
            {/* Gender Tag (Added) */}
            <div className="flex items-center gap-1.5 rounded-full border border-pink-100 bg-pink-50/50 px-3 py-1 text-[11px] font-medium text-pink-800">
              {event.gender === 'female' ? 'Women' : event.gender === 'male' ? 'Men' : 'Mixed'}
            </div>
          </div>

          <h3 className="text-[13px] font-bold leading-tight tracking-tight text-slate-900">
            {event.title}
          </h3>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-5 w-5 items-center justify-center text-blue-600">
              <Calendar className="h-4.5 w-4.5" strokeWidth={2.5} />
            </div>
            <span className="text-[11px]">{scheduleLabel}</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-5 w-5 items-center justify-center text-blue-600">
              <MapPin className="h-4.5 w-4.5" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 text-[11px] leading-snug">
              <p className="break-words">{locationLine1}</p>
              {locationLine2 ? <p className="break-words">{locationLine2}</p> : null}
            </div>
          </div>

          {/* Attendance Area */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 items-center justify-center text-blue-600">
              <PersonStanding className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px]">
                {attendeeCount} Joined · {remaining} Spots Left
                <br />
                Starts with {minPeople} players
              </span>
              <div className="flex -space-x-1.5">
                {event.participants.slice(0, 3).map((p, i) => (
                  <div
                    key={i}
                    className="h-5 w-5 overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-sm"
                  >
                    <img
                      src={
                        p.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${p.name}&background=random`
                      }
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Price Area - Now aligned with other icons */}
          <div className="flex items-center gap-3">
            <div className="flex h-5 w-5 items-center justify-center text-blue-600">
              <CircleDollarSign className="w-4.5 h-4.5" strokeWidth={2.5} />
            </div>
            <div className="text-[11px]">
              <span className="text-slate-900">
                {event.isFree
                  ? 'Free'
                  : `${event.priceRange || `$${event.pricePerPerson}`} /person`}
              </span>
            </div>
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
        'flex items-center justify-center rounded-full bg-slate-200 text-slate-700',
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

function InfoRow({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-blue-600">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="text-sm text-slate-600">{label}</div>
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
  const startLabel = startDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
  const endLabel = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `${startLabel} - ${endLabel}`
}

function formatSchedule(start: Date | string, end: Date | string) {
  const startDate = toDate(start)
  const endDate = toDate(end)
  const dateStr = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const startWithSuffix = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  const endWithSuffix = endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const startSuffix = startWithSuffix.match(/\s(AM|PM)$/)?.[1] ?? ''
  const endSuffix = endWithSuffix.match(/\s(AM|PM)$/)?.[1] ?? ''
  const startCore = startWithSuffix.replace(/\s(AM|PM)$/, '')
  const endCore = endWithSuffix.replace(/\s(AM|PM)$/, '')

  const timeStr =
    startSuffix && startSuffix === endSuffix
      ? `${startCore}–${endCore} ${endSuffix}`
      : `${startWithSuffix}–${endWithSuffix}`

  return `${dateStr} · ${timeStr}`
}

function summaryText(attending: number, max: number, remaining: number) {
  const base = `${attending}/${max} registered`
  return `${base} · ${remaining} left`
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

function formatSportName(value: string) {
  if (!value) return 'Sport'
  return value
}

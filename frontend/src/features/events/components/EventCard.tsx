import type { KeyboardEvent } from 'react'
import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'
import { Calendar, MapPin, MapPinPlusInside, PersonStanding } from 'lucide-react'
import { PlayerEvent } from '@/types'
import { useSports } from '@/features/dictionaries/hooks'

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

function getFlagEmoji(countryCode: string) {
  if (!countryCode || countryCode.length !== 2) return ''
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
}

export function EventCard({ event, onViewDetails }: EventCardProps) {
  const { items: sports } = useSports('zh')
  const sportLabel =
    sports.find((s) => s.key.toUpperCase() === event.sport.toUpperCase())?.label || event.sport
  const skillLabel = friendlySkill(event.skillLevel)
  const locationCity = event.location?.city
  const locationLabel =
    event.location.name && event.location.name !== event.location.address
      ? `${event.location.name} (${event.location.address})`
      : event.location.name || event.location.address || '地點待確認'
  const scheduleLabel = formatSchedule(event.startTime, event.endTime)
  const priceLabel = event.priceRange ?? (event.isFree ? '免費參加' : '付費活動')
  const cityLabel = event.host.cityName || locationCity || '城市待確認'

  const attendeeCount = event.attendeeCount
  const participantPreview = event.participants.slice(0, 4)
  const remaining = Math.max(event.maxAttendees - attendeeCount, 0)
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
        'aria-label': `查看 ${event.title} 詳細資訊`,
      }
    : {}

  return (
    <article
      {...interactionHandlers}
      className={clsx(
        'relative mb-3 overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_20px_45px_rgba(15,41,77,0.08)] transition-all', 
        isClickable &&
          'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-player-500'
      )}
    >
      
      <div className="space-y-2 px-3 py-3 sm:px-8 sm:py-7">
        <header className="flex flex-wrap items-start justify-between">
          <div className="flex items-start gap-3">
            <AvatarCircle name={event.host.name} src={event.host.avatarUrl} />
            <div>
              <p className="text-base font-semibold text-slate-900">
                {event.host.name} {event.host.countryKey && getFlagEmoji(event.host.countryKey)}
              </p>
              <div className="flex items-center gap-1 text-[12px] font-medium text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} aria-hidden="true" />
                <span>{cityLabel}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="overflow-hidden rounded-2xl">
          <div className="relative h-48 w-full rounded-2xl" style={heroStyle}>
            {!heroImage && (
              <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
                {event.vibeIcon}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600">
            {sportLabel}
          </span>
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700">
            {skillLabel}
          </span>
          <span className="inline-flex items-center rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-semibold tracking-wide text-pink-700">
            {event.gender === 'female_only'
              ? '女性專屬'
              : event.gender === 'male_only'
                ? '男性專屬'
                : '性別混合'}
          </span>
          {event.visibility !== 'public' && (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600">
              私人場次
            </span>
          )}
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600">
            {event.isFree ? '免費參加' : event.priceRange || '收費活動'}
          </span>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-bold leading-snug text-slate-900">{event.title}</h3>

          <div className="space-y-3">
            <InfoRow icon={Calendar} label={scheduleLabel} />
            <InfoRow icon={MapPin} label={locationLabel} />

            <div className="flex items-center gap-3">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center text-blue-600">
                <PersonStanding className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                  {attendeeCount}/{event.maxAttendees} 人
                </span>
                <span className="text-xs font-medium text-slate-500">剩餘名額 {remaining} 人</span>
                <div className="ml-1 flex -space-x-2">
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
              </div>
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

function InfoRow({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-blue-600">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="text-sm font-medium text-slate-600">{label}</div>
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
  const dateStr = startDate.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const startTimeStr = startDate.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const endTimeStr = endDate.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return `${dateStr} ${startTimeStr}-${endTimeStr}`
}

function summaryText(attending: number, max: number, remaining: number) {
  const base = `${attending}/${max} 已報名`
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

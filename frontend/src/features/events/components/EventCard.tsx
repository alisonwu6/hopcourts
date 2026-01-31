import type { KeyboardEvent } from 'react'
import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'
import { Calendar, MapPin, MapPinPlusInside, PersonStanding, BadgeCheck, CircleDollarSign, ChartColumnIncreasing } from 'lucide-react'
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
  
  // Official Event Logic
  const raw = event as any
  const isOfficial = raw.isOfficial || raw.is_official
  const venueName = raw.venueNameDisplay || raw.venue_name_display
  const venueLogo = raw.venueLogoUrl || raw.venue_logo_url
  
  const displayHost = {
    name: isOfficial && venueName ? venueName : event.host.name,
    avatarUrl: isOfficial && venueLogo ? venueLogo : event.host.avatarUrl,
    isOfficial: Boolean(isOfficial)
  }

  const sportItem = sports.find((s) => s.key.toUpperCase() === event.sport.toUpperCase())
  const sportLabel = sportItem?.label || event.sport
  const sportIcon = sportItem?.icon

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
        'relative mb-5 overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_15px_45px_rgba(15,41,77,0.07)] transition-all active:scale-[0.98]',
        isClickable &&
          'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-player-500'
      )}
    >
      {/* 1. Host Header at top (IG style) */}
      <header className="px-5 py-3.5 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-2.5">
          <AvatarCircle name={displayHost.name} src={displayHost.avatarUrl} size="sm" />
          <div>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              {displayHost.name}
              {displayHost.isOfficial ? (
                <BadgeCheck className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
              ) : (
                event.host.countryKey && <span className="text-xs">{getFlagEmoji(event.host.countryKey)}</span>
              )}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <p className="text-[11px] font-medium text-slate-500 leading-none">
                {cityLabel}
              </p>
            </div>
          </div>
        </div>
        
        {event.visibility !== 'public' && (
          <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Private</span>
        )}
      </header>

      {/* 2. Full-width Hero Image */}
      <div className="relative h-56 w-full" style={heroStyle}>
        {!heroImage && (
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
            {event.vibeIcon}
          </div>
        )}
      </div>

      {/* 3. Info Content */}
      <div className="px-5 py-4 space-y-3.5">
        <div className="flex flex-col gap-2.5">
          {/* Tags above Title */}
          <div className="flex items-center gap-2">
            {/* Sport Tag */}
            <div className="flex items-center gap-1.5 rounded-full bg-white border border-slate-100 px-3 py-1 text-[11px] font-bold text-slate-800 shadow-[0_2px_10px_rgba(15,41,77,0.04)]">
              <span>{sportIcon}</span>
              {sportLabel}
            </div>
            {/* Skill Tag */}
            <div className="flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
              <ChartColumnIncreasing className="w-3 h-3 text-indigo-500" strokeWidth={3} />
              {skillLabel}
            </div>
            {/* Gender Tag (Added) */}
            <div className="flex items-center gap-1.5 rounded-full bg-pink-50/50 border border-pink-100 px-3 py-1 text-[11px] font-bold text-pink-700">
              <span>
                {event.gender === 'female_only' ? '👩' : event.gender === 'male_only' ? '👨' : '👫'}
              </span>
              {event.gender === 'female_only' ? '女性專屬' : event.gender === 'male_only' ? '男性專屬' : '性別混合'}
            </div>
          </div>

          <h3 className="text-xl font-extrabold leading-tight text-slate-900 tracking-tight">
            {event.title}
          </h3>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-3">
             <div className="flex h-5 w-5 items-center justify-center text-indigo-500">
               <Calendar className="h-4.5 w-4.5" strokeWidth={2.5} />
             </div>
             <span className="text-sm font-semibold text-slate-600">{scheduleLabel}</span>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex h-5 w-5 items-center justify-center text-indigo-500">
               <MapPin className="h-4.5 w-4.5" strokeWidth={2.5} />
             </div>
             <span className="text-sm font-semibold text-slate-600 line-clamp-1">{locationLabel}</span>
          </div>

          {/* Attendance Area */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 items-center justify-center text-indigo-500">
              <PersonStanding className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {attendeeCount}/{event.maxAttendees} 人已預約
              </span>
              <div className="flex -space-x-1.5">
                 {event.participants.slice(0, 3).map((p, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white overflow-hidden shadow-sm bg-slate-100">
                      <img 
                        src={p.avatarUrl || `https://ui-avatars.com/api/?name=${p.name}&background=random`} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Price Area - Now aligned with other icons */}
          <div className="flex items-center gap-3">
            <div className="flex h-5 w-5 items-center justify-center text-indigo-500">
              <CircleDollarSign className="w-4.5 h-4.5" strokeWidth={2.5} />
            </div>
            <div className="text-sm font-bold">
               <span className={clsx(event.isFree ? "text-green-600" : "text-slate-900")}>
                 {event.isFree ? '免費體驗' : `${event.priceRange || `$${event.price}`} /人`}
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

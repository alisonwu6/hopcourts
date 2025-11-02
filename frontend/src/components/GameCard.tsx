import { ReactNode, useMemo, useState } from 'react'
import { PlayerGame } from '@/data/playerMocks'
import clsx from 'clsx'

type GameCardProps = {
  game: PlayerGame
  onJoin?: (gameId: string) => Promise<void> | void
  onLeave?: (gameId: string) => Promise<void> | void
  onHighFive?: (gameId: string) => Promise<void> | void
  onViewDetails?: (gameId: string) => void
  requireAuth?: () => void
  isAuthenticated?: boolean
}

export function GameCard({
  game,
  onJoin,
  onLeave,
  onHighFive,
  onViewDetails,
  requireAuth,
  isAuthenticated = true,
}: GameCardProps) {
  const [isJoined, setIsJoined] = useState(Boolean(game.joined))
  const [hasHighFived, setHasHighFived] = useState(false)
  const [highFiveCount, setHighFiveCount] = useState(game.highFives)
  const [attendeeCount, setAttendeeCount] = useState(game.attendeeCount)
  const [participantList, setParticipantList] = useState(game.participants)
  const CURRENT_USER_ID = 'current-user'

  const startTime = useMemo(
    () => (game.startTime instanceof Date ? game.startTime : new Date(game.startTime)),
    [game.startTime]
  )

  const timeLabel = useMemo(
    () =>
      `${startTime.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })} · ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    [startTime]
  )

  const sportTone = sportChipTone(game.sport)

  const participantPreview = participantList.slice(0, 4)
  const remaining = Math.max(attendeeCount - participantPreview.length, 0)

  const handleAuthRequired = () => {
    if (!isAuthenticated) {
      requireAuth?.()
      return true
    }
    return false
  }

  const handleJoin = async () => {
    if (handleAuthRequired()) return
    if (isJoined) {
      setIsJoined(false)
      setAttendeeCount((count) => Math.max(count - 1, 0))
      setParticipantList((list) => list.filter((participant) => participant.id !== CURRENT_USER_ID))
      onLeave?.(game.id)
      return
    }
    setIsJoined(true)
    setAttendeeCount((count) => Math.min(count + 1, game.maxAttendees))
    setParticipantList((list) => {
      if (list.some((participant) => participant.id === CURRENT_USER_ID)) {
        return list
      }
      return [
        { id: CURRENT_USER_ID, name: 'You', avatarUrl: undefined },
        ...list,
      ]
    })
    onJoin?.(game.id)
  }

  const handleHighFive = async () => {
    if (handleAuthRequired()) return
    if (hasHighFived) {
      setHasHighFived(false)
      setHighFiveCount((count) => Math.max(count - 1, 0))
      return
    }
    setHasHighFived(true)
    setHighFiveCount((count) => count + 1)
    onHighFive?.(game.id)
  }

  return (
    <div className="flex flex-col mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(16,54,89,0.07)] transition-shadow hover:shadow-[0_16px_48px_rgba(16,54,89,0.12)]">
      {/* Host strip */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <AvatarCircle name={game.host.name} src={game.host.avatarUrl} />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900">{game.host.name}</p>
            <p className="text-xs text-slate-500">
              {formatDistance(game.host.distanceKm)} · {formatHostLevel(game.host.level)}
            </p>
          </div>
        </div>
        <div
          className={clsx(
            'rounded-full px-3 py-1 text-xs font-semibold capitalize',
            sportTone.badge
          )}
        >
          {game.sport}
        </div>
      </div>

      {/* Vibe visual */}
      <div className="flex items-center justify-between gap-4 px-5 pt-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span className={clsx('rounded-full px-2 py-1 text-[10px] font-semibold', sportTone.label)}>
            {friendlySkill(game.skillLevel)}
          </span>
          {/* <span className="text-slate-400">Energy {game.difficulty}/5</span> */}
        </div>
        <button
          type="button"
          onClick={() => onViewDetails?.(game.id)}
          className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
        >
          View details →
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-4 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{game.sport}</p>
            <h3 className="text-lg font-semibold text-slate-900">{game.title}</h3>
            <p className="text-sm font-semibold text-slate-700">{formatFullDate(game.startTime)} · {formatTimeRange(game.startTime, game.endTime)}</p>
          </div>
        </div>

        {/* <div className="flex flex-wrap gap-2 text-sm text-slate-600">
          <InfoPill icon="📍">{game.location.name}</InfoPill>
          <InfoPill icon="🕒">{formatTimeRange(game.startTime, game.endTime)} · {formatDuration(game.startTime, game.endTime)}</InfoPill>
          {game.priceRange && <InfoPill icon="💸">{game.priceRange}</InfoPill>}
        </div> */}

        <div className="flex items-center gap-3">
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
          <div className="text-sm text-slate-600">
            {summaryText(attendeeCount, game.maxAttendees, remaining)}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {/* <CircleIconButton
            label={hasHighFived ? 'Cheered!' : 'Cheer'}
            count={highFiveCount}
            pressed={hasHighFived}
            onToggle={handleHighFive}
            icon={<HandSvg filled={hasHighFived} />}
            inactiveClassName="border-slate-200 text-slate-600 hover:border-amber-200 hover:text-amber-600"
            activeClassName="border-amber-200 bg-amber-50 text-amber-600"
          /> */}
          <CircleIconButton
            label={isJoined ? "You're in" : "I'm in"}
            pressed={isJoined}
            onToggle={handleJoin}
            icon={<JoinSvg filled={isJoined} />}
            showCount={false}
            inactiveClassName="border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35]/10"
            activeClassName="border-[#FF6B35] bg-[#FF6B35] text-white"
          />
        </div>

        {/* {isJoined && (
          <p className="text-right text-xs font-semibold text-slate-500">
            {game.host.name.split(' ')[0]} will see you’re joining 👋
          </p>
        )} */}
      </div>
    </div>
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

function InfoPill({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
      <span className="text-sm">{icon}</span>
      {children}
    </span>
  )
}

function formatDistance(distanceKm?: number) {
  if (distanceKm === undefined) return 'Local host'
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m away`
  return `${distanceKm.toFixed(1)} km away`
}

function formatHostLevel(level?: string) {
  if (!level) return 'Welcoming host'
  return level
}

function formatDuration(start: Date | string, end: Date | string) {
  const startDate = toDate(start)
  const endDate = toDate(end)
  const diff = Math.max(endDate.getTime() - startDate.getTime(), 0)
  const minutes = Math.round(diff / 60000)
  return `${minutes} mins`
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

function sportChipTone(sport: string) {
  const normalized = sport.toLowerCase()
  switch (normalized) {
    case 'running':
      return { badge: 'bg-blue-100 text-blue-700', label: 'bg-blue-100 text-blue-700' }
    case 'basketball':
      return { badge: 'bg-orange-100 text-orange-600', label: 'bg-orange-100 text-orange-600' }
    case 'climbing':
      return { badge: 'bg-emerald-100 text-emerald-600', label: 'bg-emerald-100 text-emerald-600' }
    default:
      return { badge: 'bg-slate-100 text-slate-600', label: 'bg-slate-100 text-slate-600' }
  }
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

function CircleIconButton({
  label,
  count,
  pressed,
  icon,
  onToggle,
  inactiveClassName,
  activeClassName,
  showCount = true,
}: {
  label: string
  count?: number
  pressed: boolean
  icon: ReactNode
  onToggle: () => void
  inactiveClassName?: string
  activeClassName?: string
  showCount?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        'inline-flex h-10 min-w-[120px] items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition',
        pressed ? activeClassName : inactiveClassName
      )}
      aria-pressed={pressed}
    >
      <span
        className={clsx(
          'flex h-7 w-7 items-center justify-center rounded-full border border-transparent shadow-sm transition',
          pressed ? 'bg-transparent' : 'bg-white'
        )}
      >
        {icon}
      </span>
      {label}
      {showCount && typeof count === 'number' && (
        <span className="text-xs font-medium text-slate-400">{count}</span>
      )}
    </button>
  )
}

function HandSvg({ filled }: { filled: boolean }) {
  const stroke = filled ? '#FFB200' : 'currentColor'
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      {filled ? (
        <>
          <path d="M10.5 12.2 14.2 18c1.3 1.9 3.9 2.4 5.8 1.1 1.9-1.3 2.4-3.9 1.1-5.8l-3.7-5.8a1 1 0 0 0-1.7.2c-.3.6-.1 1.3.2 1.8l2.3 3.5c.4.6.2 1.5-.4 1.9-.6.4-1.4.2-1.8-.4l-2.3-3.6M4.8 11.3 9 18.4c.7 1.2 2.3 1.5 3.5.8 1.2-.7 1.5-2.3.8-3.5L9.9 11m-3.8.3L4.3 9.1a1.6 1.6 0 0 1 .6-2.2c.7-.4 1.5-.2 2 .4l1.5 2.3" fill={stroke} opacity={0.18} />
          <path d="M10.5 12.2 14.2 18c1.3 1.9 3.9 2.4 5.8 1.1 1.9-1.3 2.4-3.9 1.1-5.8l-3.7-5.8a1 1 0 0 0-1.7.2c-.3.6-.1 1.3.2 1.8l2.3 3.5c.4.6.2 1.5-.4 1.9-.6.4-1.4.2-1.8-.4l-2.3-3.6" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.8 11.3 9 18.4c.7 1.2 2.3 1.5 3.5.8 1.2-.7 1.5-2.3.8-3.5L9.9 11" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          <path d="m4.2 9.6 1.5 2.3" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
          <path d="M12.4 3.2 12 2" stroke={stroke} strokeWidth={1.2} strokeLinecap="round" />
          <path d="m10 3.8-.8-.8" stroke={stroke} strokeWidth={1.2} strokeLinecap="round" />
          <path d="m14.5 3.8.8-.8" stroke={stroke} strokeWidth={1.2} strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M8 12V6a1 1 0 0 1 2 0v6" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
          <path d="M12 12V3.5a1 1 0 0 1 2 0V12" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
          <path d="M16 12V6.5a1 1 0 0 1 2 0V14" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
          <path d="M6 14V8.5a1 1 0 0 1 2 0V14" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
          <path d="M6 14c0 4 2 7 6 7s6-3 6-7" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}



function JoinSvg({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 8 6-3-6-3v10" />
      <path d="m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12" />
      <path d="m6.49 12.85 11.02 6.3" />
      <path d="M17.51 12.85 6.5 19.15" />
    </svg>
  )
}

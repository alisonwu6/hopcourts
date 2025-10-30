import { Session } from '@/types'
import { Button } from './Button'

type SessionCardProps = {
  session: Session
  onJoin?: (sessionId: string) => void
  onViewDetails?: (sessionId: string) => void
}

export function SessionCard({ session, onJoin, onViewDetails }: SessionCardProps) {
  const startTime = session.startTime instanceof Date ? session.startTime : new Date(session.startTime)
  const distance = '2.1 km'
  const sportIcon = resolveSportIcon(session.sport)
  const hostRatingLabel =
    typeof session.hostRating === 'number' ? session.hostRating.toFixed(1) : '4.8'
  const priceLabel = session.price ?? session.pricePerPerson

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            {session.hostName?.[0] ?? 'H'}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{session.hostName}</p>
            <p className="text-xs text-slate-500">{distance} away</p>
          </div>
        </div>
        <div className="text-right text-xs font-semibold text-blue-600">
          {hostRatingLabel}★
        </div>
      </div>

      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-4xl text-white">
        {sportIcon}
      </div>

      <div className="space-y-4 p-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{session.title}</h3>
          <p className="text-sm text-slate-600">{session.sport}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>📅</span>
          <span>
            {startTime.toLocaleDateString()} ·{' '}
            {startTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>📍</span>
          <span>{session.location.address}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="font-semibold text-slate-900">{session.attendeeCount} joined</div>
          {typeof session.energy === 'number' && <div className="text-amber-500">⚡ {session.energy}% energy</div>}
        </div>

        {!session.isFree && typeof priceLabel === 'number' && (
          <div className="rounded bg-blue-50 p-2 text-sm">
            <p className="font-semibold text-blue-600">
              ${priceLabel}
              {session.currency ? ` ${session.currency}` : ''}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {onJoin && (
            <Button className="flex-1 text-sm" onClick={() => onJoin(session.id)}>
              Join
            </Button>
          )}
          {onViewDetails && (
            <Button
              variant="secondary"
              className="flex-1 text-sm"
              onClick={() => onViewDetails(session.id)}
            >
              Details
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function resolveSportIcon(sport: string) {
  const map: Record<string, string> = {
    running: '🏃',
    basketball: '🏀',
    climbing: '🧗',
    tennis: '🎾',
    hiking: '🥾',
  }
  return map[sport.toLowerCase()] ?? '🏅'
}

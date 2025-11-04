import clsx from 'clsx'
import { MessageCircle, PlusCircle, UserPlus } from 'lucide-react'
import { Mate } from '@/data/mates'
import { getSportTheme } from '@/lib/sportColors'

type MateCardProps = {
  mate: Mate
  onFollow?: (mateId: string) => void
  onInvite?: (mateId: string) => void
  onMessage?: (mateId: string) => void
}

const CONNECTION_LABEL: Record<Mate['connectionStatus'], { label: string; tone: string }> = {
  none: { label: 'Not connected', tone: 'text-slate-500 bg-slate-100' },
  following: { label: 'Following', tone: 'text-blue-600 bg-blue-50' },
  mutual: { label: 'Connected', tone: 'text-emerald-600 bg-emerald-50' },
}

const ACTIVITY_TONE: Record<Mate['activityStatus'], { dot: string; label: string }> = {
  playing_now: { dot: 'bg-emerald-500', label: 'Playing now' },
  recently_active: { dot: 'bg-amber-400', label: 'Active recently' },
  offline: { dot: 'bg-slate-300', label: 'Offline' },
}

export function MateCard({ mate, onFollow, onInvite, onMessage }: MateCardProps) {
  const theme = getSportTheme(mate.primarySport)
  const connectionTone = CONNECTION_LABEL[mate.connectionStatus]
  const activityTone = ACTIVITY_TONE[mate.activityStatus]

  const canMessage = mate.connectionStatus === 'mutual'
  const followLabel =
    mate.connectionStatus === 'none'
      ? 'Follow'
      : mate.connectionStatus === 'following'
        ? 'Following'
        : 'Connected'

  const followButtonStyle =
    mate.connectionStatus === 'none'
      ? {
          borderColor: theme.primary,
          color: theme.primary,
        }
      : {
          backgroundColor: theme.primary,
          borderColor: theme.primary,
          color: '#0B1A2A',
        }

  return (
    <article className="rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:shadow-lg">
      <div className="space-y-4 p-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <Avatar name={mate.name} avatarUrl={mate.avatarUrl} activityTone={activityTone.dot} />
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-base font-semibold text-slate-900">{mate.name}</h3>
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    connectionTone.tone
                  )}
                >
                  {connectionTone.label}
                </span>
              </div>
              <p className="text-xs text-slate-500">{mate.tagline}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span
                  className={clsx('flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]')}
                  style={{ backgroundColor: theme.surface, color: theme.dark }}
                >
                  {mate.skillLevel === 'beginner'
                    ? 'Beginner'
                    : mate.skillLevel === 'intermediate'
                      ? 'Intermediate'
                      : 'Advanced'}
                </span>
                <span className="flex items-center gap-1">
                  <span className={clsx('inline-flex h-2 w-2 rounded-full', activityTone.dot)} />
                  {activityTone.label}
                </span>
                {mate.distanceKm !== undefined && (
                  <span>{formatDistance(mate.distanceKm)}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide">
          {mate.sports.map((sport) => {
            const tone = getSportTheme(sport)
            return (
              <span
                key={sport}
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: tone.surface, color: tone.dark }}
              >
                {sport}
              </span>
            )
          })}
        </div>

        <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
          {mate.rating && (
            <StatTile label="Rating" value={mate.rating.toFixed(1)} subValue="player reviews" />
          )}
          {mate.gamesPlayed && (
            <StatTile label="Games" value={String(mate.gamesPlayed)} subValue="played" />
          )}
          {mate.mutualConnections !== undefined && (
            <StatTile
              label="Connections"
              value={`${mate.mutualConnections}`}
              subValue="mutual"
            />
          )}
        </div>

        {mate.availability?.length ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-xs text-slate-600">
            <p className="font-semibold uppercase tracking-wide text-slate-500">Play schedule</p>
            <p className="mt-2">{mate.availability.join(' · ')}</p>
          </div>
        ) : null}

        {mate.upcomingSession && (
          <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Upcoming session
            </p>
            <p className="mt-1 font-medium text-slate-900">{mate.upcomingSession.title}</p>
            <p className="text-xs text-slate-500">{mate.upcomingSession.time}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={clsx(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:flex-none sm:px-6'
            )}
            style={followButtonStyle}
            onClick={() => onFollow?.(mate.id)}
          >
            <UserPlus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            {followLabel}
          </button>
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:flex-none sm:px-6"
            onClick={() => onInvite?.(mate.id)}
          >
            <PlusCircle className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Invite
          </button>
          <button
            type="button"
            className={clsx(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:flex-none sm:px-6',
              canMessage
                ? 'border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600'
                : 'cursor-not-allowed border-slate-100 text-slate-300'
            )}
            onClick={() => canMessage && onMessage?.(mate.id)}
            disabled={!canMessage}
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Message
          </button>
        </div>
      </div>
    </article>
  )
}

function Avatar({
  name,
  avatarUrl,
  activityTone,
}: {
  name: string
  avatarUrl?: string
  activityTone: string
}) {
  return (
    <span className="relative inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-semibold text-blue-700">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
      <span
        className={clsx(
          'absolute bottom-0 right-0 h-3 w-3 rounded-full border border-white',
          activityTone
        )}
        aria-hidden="true"
      />
    </span>
  )
}

function StatTile({ label, value, subValue }: { label: string; value: string; subValue?: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
      {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
    </div>
  )
}

function formatDistance(km: number) {
  if (km < 1) return 'Nearby'
  if (km < 5) return `${km.toFixed(1)} km away`
  return `${Math.round(km)} km away`
}

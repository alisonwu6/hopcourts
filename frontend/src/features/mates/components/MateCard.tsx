import clsx from 'clsx'
import { MapPin, Smile } from 'lucide-react'
import { vibeTokens, type Vibe } from '@/constants/vibeTokens'
import { getFlagEmoji } from '@/utils/flags'

const withAlpha = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export type MateCardProps = {
  name: string
  username?: string
  vibe: Vibe | null
  vibeKey?: string | null
  vibeLabel?: string
  sports: string[]
  trying: string[]
  location: string
  cityKey?: string
  countryKey?: string | null
  blurb: string
  avatar: string
  accentClassName?: string
  gender?: string | null
  ageRangeKey?: string | null
  friendCount?: number
  joinedCount?: number
  hostedCount?: number
  onHostedClick?: () => void
  onJoinedClick?: () => void
  onTeammatesClick?: () => void
  placeholderMode?: boolean
}

export function MateCard({
  name,
  vibe,
  vibeLabel,
  sports,
  trying,
  location,
  countryKey,
  blurb,
  avatar,
  accentClassName,
  gender,
  ageRangeKey,
  friendCount = 0,
  joinedCount = 0,
  hostedCount = 0,
  onHostedClick,
  onJoinedClick,
  onTeammatesClick,
  placeholderMode = false,
}: MateCardProps) {
  const dash = (
    <span className="text-muted">—</span>
  )
  const renderStat = (n: number) =>
    placeholderMode && n === 0 ? dash : <span className="text-slate-900">{n}</span>
  const vibeColors = (vibe ? vibeTokens[vibe] : undefined) ?? {
    bg: 'linear-gradient(135deg, #EEF2F6 0%, #E2E8F0 100%)',
    text: '#1E293B',
    ring: '#CBD5E1',
    card: 'linear-gradient(145deg, rgba(226,232,240,0.18) 0%, rgba(226,232,240,0.08) 100%)',
  }

  return (
    <article
      className={clsx(
        'flex w-full min-w-[calc(100vw-4.25rem)] max-w-[520px] snap-start flex-col gap-3 rounded-[24px] bg-slate-200 px-4 py-4 transition sm:min-w-[420px]',
        accentClassName
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
          {avatar ? (
            <img
              src={avatar}
              alt={`${name} avatar`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <Smile className="text-muted h-12 w-12" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {/* Header: Name/Loc + Vibe */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {name && <span className="text-base font-bold text-slate-900">{name}</span>}
                {!!countryKey && (
                  <span
                    className="text-base leading-none"
                    aria-label={`Country flag ${countryKey}`}
                  >
                    {getFlagEmoji(countryKey)}
                  </span>
                )}
              </div>
              {location ? (
                <div className="flex items-center gap-1 text-[12px] font-medium text-slate-600">
                  <MapPin
                    className="h-3.5 w-3.5 text-slate-400"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span className="truncate">{location}</span>
                </div>
              ) : placeholderMode ? (
                <div className="text-muted flex items-center gap-1 text-[12px] font-medium">
                  <MapPin
                    className="text-muted h-3.5 w-3.5"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span>—</span>
                </div>
              ) : null}
            </div>

            {vibe ? (
              <span
                className="inline-flex flex-shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: vibeColors.bg,
                  color: vibeColors.text,
                }}
              >
                {vibeLabel ?? vibe}
              </span>
            ) : placeholderMode ? (
              <span
                className="bg-muted/70 inline-flex h-[26px] w-16 flex-shrink-0 rounded-full"
                aria-hidden="true"
              />
            ) : null}
          </div>

          <div className="flex w-full divide-x divide-slate-300/50 border-y border-slate-300/50 py-2">
            <button
              type="button"
              className={clsx(
                'flex-1 pr-2 text-left transition-opacity',
                onHostedClick ? 'cursor-pointer hover:opacity-70' : 'cursor-default'
              )}
              onClick={onHostedClick}
            >
              <div className="flex items-baseline gap-1 text-xl font-bold leading-none">{renderStat(hostedCount)}</div>
              <span className="mt-0.5 block whitespace-nowrap text-[10px] font-medium text-slate-500">Hosted</span>
            </button>

            <button
              type="button"
              className={clsx(
                'flex-1 pl-4 text-left transition-opacity',
                onJoinedClick ? 'cursor-pointer hover:opacity-70' : 'cursor-default'
              )}
              onClick={onJoinedClick}
            >
              <div className="flex items-baseline gap-1 text-xl font-bold leading-none">{renderStat(joinedCount)}</div>
              <span className="mt-0.5 block whitespace-nowrap text-[10px] font-medium text-slate-500">Joined</span>
            </button>

            <div
              className={clsx(
                'flex-1 pl-4 transition-opacity',
                onTeammatesClick ? 'cursor-pointer hover:opacity-70' : ''
              )}
              onClick={onTeammatesClick}
            >
              <div className="flex items-baseline gap-1 text-xl font-bold leading-none">{renderStat(friendCount)}</div>
              <span className="mt-0.5 block whitespace-nowrap text-[10px] font-medium text-slate-500">Mates</span>
            </div>
          </div>
        </div>
      </div>

      <div className="-mt-2 flex flex-col gap-2 text-[12px] font-medium text-slate-700">
        <div>
          <span className="uppercase tracking-wide text-slate-500">Favourites:</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {sports.length > 0 ? (
              sports.map((sport) => (
                <span
                  key={sport}
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: withAlpha(vibeColors.ring, 0.7),
                    color: vibeColors.text,
                  }}
                >
                  {sport}
                </span>
              ))
            ) : (
              <>
                <div
                  className="bg-muted/70 h-[22px] w-16 rounded-full"
                  aria-hidden="true"
                />
                <div
                  className="bg-muted/70 h-[22px] w-16 rounded-full"
                  aria-hidden="true"
                />
                <div
                  className="bg-muted/70 h-[22px] w-16 rounded-full"
                  aria-hidden="true"
                />
              </>
            )}
          </div>
        </div>
        <div>
          <span className="uppercase tracking-wide text-slate-500">Want to try:</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {trying.length > 0 ? (
              trying.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: withAlpha(vibeColors.ring, 0.7),
                    color: vibeColors.text,
                  }}
                >
                  {item}
                </span>
              ))
            ) : (
              <>
                <div
                  className="bg-muted/70 h-[22px] w-16 rounded-full"
                  aria-hidden="true"
                />
                <div
                  className="bg-muted/70 h-[22px] w-16 rounded-full"
                  aria-hidden="true"
                />
              </>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 pt-1 text-[12px] text-slate-600">
          <span
            className="flex w-[3px] shrink-0 self-stretch rounded"
            style={{ background: vibeColors.ring }}
            aria-hidden="true"
          />
          {blurb?.trim() ? (
            <span className="whitespace-pre-wrap">{blurb}</span>
          ) : placeholderMode ? (
            <span className="text-muted not-italic">
              Hop in? Activate your profile to kick-start your journey.
            </span>
          ) : (
            <span className="text-muted not-italic">No bio yet... Too busy on the court!</span>
          )}
        </div>
      </div>
    </article>
  )
}

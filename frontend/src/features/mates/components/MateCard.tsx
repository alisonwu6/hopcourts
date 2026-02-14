import clsx from 'clsx'
import { MapPin, Smile } from 'lucide-react'
import { vibeTokens, vibeList, type Vibe } from '@/constants/vibeTokens'

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
  blurb: string
  avatar: string
  accentClassName?: string
  gender?: string | null
  ageRangeKey?: string | null
  friendCount?: number
  joinedCount?: number
  hostedCount?: number
  onTeammatesClick?: () => void
}

export function MateCard({
  name,
  vibe,
  sports,
  trying,
  location,
  blurb,
  avatar,
  accentClassName,
  gender,
  ageRangeKey,
  friendCount = 0,
  joinedCount = 0,
  hostedCount = 0,
  onTeammatesClick,
}: MateCardProps) {
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
        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full bg-white">
          {avatar ? (
            <img
              src={avatar}
              alt={`${name} avatar`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <Smile className="h-12 w-12 text-slate-300" />
          )}
        </div>
        
        <div className="flex flex-1 flex-col gap-2">
          {/* Header: Name/Loc + Vibe */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {name && <span className="text-base font-bold text-slate-900">{name}</span>}
              </div>
              {location && (
                <div className="flex items-center gap-1 text-[12px] font-medium text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} aria-hidden="true" />
                  <span className="truncate">{location}</span>
                </div>
              )}
            </div>

            {vibe && (
              <span
                className="inline-flex flex-shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: vibeColors.bg,
                  color: vibeColors.text,
                }}
              >
                {vibeList.find((item) => item.id === vibe)?.title ?? vibe}
              </span>
            )}
          </div>

          {/* Stats Bar */}
          {/* Stats Bar */}
          <div className="flex w-full divide-x divide-slate-300/50 border-y border-slate-300/50 py-2">
            <div className="flex-1 pr-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold leading-none text-slate-900">{hostedCount}</span>
                <span className="text-[10px] font-medium text-slate-600">場</span>
              </div>
              <span className="mt-0.5 block text-[10px] font-medium text-slate-500 whitespace-nowrap">主辦活動</span>
            </div>

            <div className="flex-1 pl-4">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold leading-none text-slate-900">{joinedCount}</span>
                <span className="text-[10px] font-medium text-slate-600">場</span>
              </div>
              <span className="mt-0.5 block text-[10px] font-medium text-slate-500 whitespace-nowrap">參與活動</span>
            </div>

            <div 
              className={clsx(
                "flex-1 pl-4 transition-opacity",
                onTeammatesClick ? "cursor-pointer hover:opacity-70" : ""
              )}
              onClick={onTeammatesClick}
            >
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold leading-none text-slate-900">{friendCount}</span>
                <span className="text-[10px] font-medium text-slate-600">位</span>
              </div>
              <span className="mt-0.5 block text-[10px] font-medium text-slate-500 whitespace-nowrap">一起動過的人</span>
            </div>
          </div>
        </div>
      </div>

      <div className="-mt-2 flex flex-col gap-2 text-[12px] font-medium text-slate-700">
        <div>
          <span className="uppercase tracking-wide text-slate-500">我的最愛：</span>
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
                <div className="h-[22px] w-16 animate-pulse rounded-full bg-slate-100/50" />
                <div className="h-[22px] w-20 animate-pulse rounded-full bg-slate-100/50" />
                <div className="h-[22px] w-14 animate-pulse rounded-full bg-slate-100/50" />
              </>
            )}
          </div>
        </div>
        <div>
          <span className="uppercase tracking-wide text-slate-500">想嘗試：</span>
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
                <div className="h-[22px] w-16 animate-pulse rounded-full bg-slate-100/50" />
                <div className="h-[22px] w-14 animate-pulse rounded-full bg-slate-100/50" />
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
          ) : (
            <span className="not-italic text-slate-400">等待夥伴更新自我介紹...</span>
          )}
        </div>
      </div>
    </article>
  )
}

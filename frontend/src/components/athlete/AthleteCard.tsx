import { memo } from 'react'
import { HandMetal } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { AthleteCardProps } from '@/interfaces/athlete'
import fallbackHero from '@/assets/placeholders/session-fallback.svg'
import fallbackAvatar from '@/assets/placeholders/avatar-fallback.svg'

const gradientOverlay = 'linear-gradient(180deg, rgba(5,19,51,0.05) 0%, rgba(5,19,51,0.65) 100%)'

function formatStatus(athlete: AthleteCardProps) {
  if (athlete.activeNow) {
    return `🟢 Active now${athlete.city ? ` in ${athlete.city}` : ''}`
  }
  if (athlete.lastActiveLabel) {
    return athlete.lastActiveLabel
  }
  return 'Last active · recently'
}

export const AthleteCard = memo(({ athlete }: { athlete: AthleteCardProps }) => {
  const status = formatStatus(athlete)

  return (
    <article className="overflow-hidden rounded-2xl border border-[#E6E6E6] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={athlete.backgroundUrl ?? fallbackHero}
          onError={(event) => {
            const target = event.currentTarget
            if (target.src !== fallbackHero) {
              target.src = fallbackHero
            }
          }}
          alt={`${athlete.name} background`}
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: gradientOverlay }}
        />
        <div className="absolute left-4 top-4 flex items-center gap-3">
          <Avatar className="h-11 w-11 border-2 border-white/80 shadow">
            <AvatarImage
              src={athlete.avatarUrl || fallbackAvatar}
              alt={athlete.name}
              onError={(event) => {
                const target = event.currentTarget
                if (target.src !== fallbackAvatar) {
                  target.src = fallbackAvatar
                }
              }}
            />
            <AvatarFallback>{athlete.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5 text-white drop-shadow-sm">
            <div className="text-base font-semibold leading-tight">{athlete.name}</div>
            <div className="text-sm text-white/80">{athlete.sport}</div>
          </div>
        </div>
        <button
          type="button"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#1B8FD2] shadow-sm transition hover:bg-white"
          onClick={() => console.log('high-five', athlete.id)}
          aria-label="High five"
        >
          <HandMetal className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3 px-4 py-4">
        <div className="text-sm font-medium text-[#051333]">{athlete.city ?? 'Location TBD'}</div>
        {athlete.vibes && athlete.vibes.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {athlete.vibes.map((vibe) => (
              <span
                key={`${athlete.id}-${vibe}`}
                className="rounded-full bg-[#E8F2FF] px-3 py-1 text-[#1B8FD2]"
              >
                {vibe}
              </span>
            ))}
          </div>
        )}
        <div className="text-xs font-medium text-[#1B8FD2]">{status}</div>
        {typeof athlete.highFiveCount === 'number' && (
          <div className="text-xs text-[#6E6E6E]">High-fives received · {athlete.highFiveCount}</div>
        )}
      </div>
    </article>
  )
})

AthleteCard.displayName = 'AthleteCard'

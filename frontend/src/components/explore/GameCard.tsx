import { useEffect, useRef } from 'react'
import type { MouseEvent, SyntheticEvent } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Save, Navigation } from 'lucide-react'
import type { Game } from '@/interfaces/game'
import { trackEvent } from '@/lib/analytics'
import fallbackHero from '@/assets/placeholders/game-fallback.svg'
import fallbackAvatar from '@/assets/placeholders/avatar-fallback.svg'

export type ExploreGame = Game & {
  heroImage?: string
  distanceKm?: number
  hostAvatar?: string
  startLabel: string
}

type Props = {
  game: ExploreGame
}

export default function GameCard({ game }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = cardRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackEvent('GameView', { game_id: game.id, interaction: 'impression' })
            obs.disconnect()
          }
        })
      },
      { threshold: 0.4 }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [game.id])

  const handleJoin = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    trackEvent('JoinClick', { game_id: game.id })
  }

  const handleMap = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    trackEvent('MapClick', { game_id: game.id })
  }

  const handleSave = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    trackEvent('SaveClick', { game_id: game.id })
  }

  const handleCardClick = () => {
    trackEvent('GameView', { game_id: game.id, interaction: 'click' })
  }

  const hostInitial = game.hostName.charAt(0).toUpperCase()
  const heroImageSrc = game.heroImage?.trim() ? game.heroImage : fallbackHero
  const distanceLabel =
    typeof game.distanceKm === 'number' && Number.isFinite(game.distanceKm)
      ? `${game.distanceKm.toFixed(1)} km away`
      : 'Starts soon'

  const onHeroError = (event: SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget
    if (target.src !== fallbackHero) {
      target.src = fallbackHero
    }
  }

  return (
    <Card
      ref={cardRef}
      className="overflow-hidden rounded-2xl border border-[#E6E6E6] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
    >
      <Link
        to={`/games/${game.id}`}
        onClick={handleCardClick}
        className="block"
      >
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: '4 / 5' }}
        >
          <img
            src={heroImageSrc}
            alt={`${game.title} hero image`}
            loading="lazy"
            onError={onHeroError}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

          <div className="absolute left-4 top-4 flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-white/80 shadow-sm">
              <AvatarImage
                src={game.hostAvatar ?? fallbackAvatar}
                alt={game.hostName}
                onError={(event) => {
                  const target = event.currentTarget
                  if (target.src !== fallbackAvatar) {
                    target.src = fallbackAvatar
                  }
                }}
              />
              <AvatarFallback>{hostInitial}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-white drop-shadow">
              {game.hostName}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm transition hover:bg-white"
            aria-label="Save game"
          >
            <Save className="h-5 w-5" />
          </button>

          <div className="absolute inset-x-4 bottom-4 space-y-1 text-white drop-shadow">
            <div className="text-lg font-semibold leading-tight">{game.title}</div>
            <div className="text-sm text-white/85">
              {game.startLabel} · {game.venue}
            </div>
            <div className="text-xs text-white/70">{distanceLabel}</div>
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-3 border-t border-[#E6E6E6] bg-white px-4 py-3">
        <Button
          onClick={handleJoin}
          className="flex-1 bg-[#1B8FD2] text-white shadow-sm transition hover:bg-[#0f7ab7]"
        >
          Join game
        </Button>
        <Button
          onClick={handleMap}
          variant="outline"
          className="border-[#E6E6E6] text-slate-600 hover:border-[#1B8FD2] hover:text-[#1B8FD2]"
        >
          <Navigation className="mr-2 h-4 w-4" /> Map
        </Button>
      </div>
    </Card>
  )
}

import { Link } from 'react-router-dom'
import logoUrl from '@/assets/main-logo.png'
import { Button } from '@/components'

export function Splash() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-player-50 via-white to-player-200">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,199,44,0.25),_transparent_55%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center px-6 py-12 text-center">
        <main className="flex w-full flex-1 flex-col items-center justify-center gap-10">
          <div className="flex flex-col items-center gap-6">
            <img
              className="h-48 w-auto drop-shadow-lg sm:h-60"
              src={logoUrl}
              alt="SportsMatch"
            />
            <div className="space-y-4">
              {/* <h1 className="text-2xl font-semibold leading-tight text-player-900 sm:text-5xl">
                Pick-up sports that <br /> match your vibe.
              </h1> */}
              <h1 className="text-xl font-semibold leading-tight text-player-900 sm:text-5xl">
                Discover local games and build your crew in Brisbane.
              </h1>
              <ul className="mt-6">
                <li>Meet new mates.</li>
                <li>Play your favourite sports.</li>
                <li>Feel part of something real.</li>
              </ul>
            </div>
          </div>

          <div className="flex w-full max-w-sm flex-col gap-3">
            <Button
              asChild
              storyLine="player"
              className="w-full"
            >
              <Link to="/home" className="flex w-full items-center justify-center">
                Explore SportsMatch
              </Link>
            </Button>
            <Button
              asChild
              storyLine="player"
              variant="secondary"
              className="w-full"
            >
              <Link to="/login" className="flex w-full items-center justify-center">
                Join SportsMatch
              </Link>
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}

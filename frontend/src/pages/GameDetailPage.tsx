import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components'
import { PLAYER_MOCK_GAMES } from '@/data/playerMocks'

const sportIcons: Record<string, string> = {
  running: '🏃',
  basketball: '🏀',
  climbing: '🧗',
  tennis: '🎾',
  hiking: '🥾',
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
})
const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' })

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isSaved, setIsSaved] = useState(false)

  const game = useMemo(() => PLAYER_MOCK_GAMES.find((item) => item.id === id), [id])

  if (!game) {
    return (
      <div className="px-4 pt-24 text-sm text-slate-600">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 text-slate-700">
          ← Back
        </button>
        Game not found.
      </div>
    )
  }

  const start = game.startTime instanceof Date ? game.startTime : new Date(game.startTime)
  const end = game.endTime instanceof Date ? game.endTime : new Date(game.endTime)
  const icon = sportIcons[game.sport.toLowerCase()] ?? '🏅'
  const hostRating =
    typeof game.host.rating === 'number' ? game.host.rating.toFixed(1) : '4.8'
  const hostedCount = game.attendeeCount

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      <div className="sticky top-[80px] z-40 bg-white/95 backdrop-blur shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="border-t border-[#E6E6E6]">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
            <div className="flex h-[52px] min-w-max items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                ← Back
              </button>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSaved((prev) => !prev)}
                  className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-blue-200 text-blue-600 transition hover:border-blue-300 hover:bg-blue-50"
                  aria-pressed={isSaved}
                  aria-label={isSaved ? 'Saved' : 'Save for later'}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill={isSaved ? 'currentColor' : 'none'}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.78-3.4 6.86-8.55 11.53L12 21.35Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <Button className="flex-shrink-0 !h-9 !px-5 !py-2 text-sm font-semibold leading-none">
                  Join
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6">
        <section className="overflow-hidden rounded-lg bg-white shadow">
          <div className="flex items-center justify-between border-b border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg text-white">
                {game.host.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{game.host.name}</p>
                <p className="text-xs text-slate-500">
                  {hostRating}★ · {hostedCount} joined
                </p>
              </div>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
              {game.sport}
            </span>
          </div>

          <div className="flex h-32 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-4xl text-white">
            {icon}
          </div>

          <div className="space-y-3 p-4">
            <h1 className="text-lg font-bold text-slate-900">{game.title}</h1>
            <DetailRow
              icon="📅"
              label="When"
              value={`${dateFormatter.format(start)} · ${timeFormatter.format(start)} – ${timeFormatter.format(end)}`}
            />
            <DetailRow icon="📍" label="Where" value={game.location.address} />
            <DetailRow
              icon="👥"
              label="Players"
              value={`${game.attendeeCount}/${game.maxAttendees} joined`}
            />
            <DetailRow icon="🎯" label="Difficulty" value={`Level ${game.difficulty}`} />
            <DetailRow
              icon="💰"
              label="Price"
              value={
                game.isFree
                  ? 'Free'
                  : game.price ?? game.pricePerPerson
                  ? `$${game.price ?? game.pricePerPerson}${
                      game.currency ? ` ${game.currency}` : ''
                    }`
                  : 'Check with host'
              }
            />
          </div>
        </section>

        {game.description && (
          <section className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-sm font-semibold text-slate-900">About this game</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{game.description}</p>
          </section>
        )}
      </main>

    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md bg-slate-50 p-3 text-sm">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-sm text-slate-700">{value}</p>
      </div>
    </div>
  )
}

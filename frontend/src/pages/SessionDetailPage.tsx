import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components'
import { PLAYER_MOCK_SESSIONS } from '@/data/playerMocks'

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

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const session = useMemo(() => PLAYER_MOCK_SESSIONS.find((item) => item.id === id), [id])

  if (!session) {
    return (
      <div className="px-4 pt-24 text-sm text-slate-600">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 text-slate-700">
          ← Back
        </button>
        Game not found.
      </div>
    )
  }

  const start = session.startTime instanceof Date ? session.startTime : new Date(session.startTime)
  const end = session.endTime instanceof Date ? session.endTime : new Date(session.endTime)
  const icon = sportIcons[session.sport.toLowerCase()] ?? '🏅'
  const hostRating =
    typeof session.hostRating === 'number' ? session.hostRating.toFixed(1) : '4.8'
  const hostedCount =
    typeof session.hostSessionsCount === 'number' ? session.hostSessionsCount : '—'

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      <div className="px-4 pt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          ← Back
        </button>
      </div>

      <main className="space-y-4 px-4 py-6">
        <section className="overflow-hidden rounded-lg bg-white shadow">
          <div className="flex items-center justify-between border-b border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg text-white">
                {session.hostName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{session.hostName}</p>
                <p className="text-xs text-slate-500">
                  {hostRating}★ · {hostedCount} hosted
                </p>
              </div>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
              {session.sport}
            </span>
          </div>

          <div className="flex h-32 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-4xl text-white">
            {icon}
          </div>

          <div className="space-y-3 p-4">
            <h1 className="text-lg font-bold text-slate-900">{session.title}</h1>
            <DetailRow
              icon="📅"
              label="When"
              value={`${dateFormatter.format(start)} · ${timeFormatter.format(start)} – ${timeFormatter.format(end)}`}
            />
            <DetailRow icon="📍" label="Where" value={session.location.address} />
            <DetailRow
              icon="👥"
              label="Players"
              value={`${session.attendeeCount}/${session.maxAttendees} joined`}
            />
            <DetailRow icon="🎯" label="Difficulty" value={`Level ${session.difficulty}`} />
            <DetailRow
              icon="💰"
              label="Price"
              value={
                session.isFree
                  ? 'Free'
                  : session.price ?? session.pricePerPerson
                  ? `$${session.price ?? session.pricePerPerson}${
                      session.currency ? ` ${session.currency}` : ''
                    }`
                  : 'Check with host'
              }
            />
          </div>
        </section>

        {session.description && (
          <section className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-sm font-semibold text-slate-900">About this game</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{session.description}</p>
          </section>
        )}
      </main>

      <div className="fixed bottom-24 left-0 right-0 border-t border-slate-200 bg-white px-4 py-4">
        <Button className="w-full">
          Join
        </Button>
        <Button variant="secondary" className="mt-3 w-full text-sm">
          ♡ Save for later
        </Button>
      </div>
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

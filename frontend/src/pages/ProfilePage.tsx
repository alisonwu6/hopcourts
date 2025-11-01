import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/hooks'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  if (!user) {
    return (
      <div className="px-4 pt-24 text-slate-600">
        <h1 className="text-xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-4 text-sm">Please log in to view your profile.</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Sign in
        </button>
      </div>
    )
  }

  const sessionsAttended = user.sessionsAttended ?? 0
  const isNewUser = sessionsAttended <= 1
  const sportLine =
    user.sports && user.sports.length > 0
      ? user.sports.join(' · ')
      : 'Ready to explore new sports'

  const displayStats = {
    totalSessions: Math.max(1, sessionsAttended),
    streakDays: Math.max(1, sessionsAttended > 0 ? 1 : 0),
    energyLevel: 85,
    badges: Math.max(1, sessionsAttended > 0 ? 1 : 0),
    rank: sessionsAttended > 1 ? 320 : 9999,
    points: sessionsAttended > 0 ? 5 : 0,
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <section className="bg-gradient-to-br from-blue-600 to-blue-500">
        <div className="mx-auto flex w-full max-w-4xl items-start gap-4 px-4 py-6 text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl font-bold backdrop-blur">
            {user.avatar ?? user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-blue-100">📍 {user.location}</p>
            {!isNewUser && (
              <p className="text-sm text-blue-100">
                Sessions attended · {sessionsAttended}
              </p>
            )}
          </div>
        </div>
        {isNewUser && (
          <div className="mx-auto mt-4 w-full max-w-4xl px-4">
            <div className="rounded-xl bg-white/10 p-3 text-sm text-white backdrop-blur">
              <p className="font-medium text-white">🎯 Goals locked in</p>
              <p className="text-blue-100">{sportLine}</p>
            </div>
          </div>
        )}
      </section>

      {isNewUser ? (
        <section className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6">
          <div className="rounded-2xl border-2 border-blue-300 bg-gradient-to-br from-blue-100 to-blue-50 p-5">
            <div className="flex gap-3">
              <span className="text-3xl">🎬</span>
              <div>
                <p className="font-semibold text-slate-900">Great start!</p>
                <p className="mt-1 text-sm text-slate-700">
                  You&apos;ve joined your first session. This is just the
                  beginning of an amazing fitness journey.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Session"
              value={displayStats.totalSessions.toString()}
              accent="text-blue-600"
            />
            <StatCard
              label="Streak"
              value={`${displayStats.streakDays} 🔥`}
              accent="text-amber-600"
            />
            <EnergyCard energy={displayStats.energyLevel} />
            <StatCard
              label="Badges"
              value={displayStats.badges.toString()}
              accent="text-yellow-600"
            />
          </div>

          <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-100 to-amber-50 p-5">
            <div className="flex gap-3">
              <span className="text-4xl">👣</span>
              <div>
                <p className="font-semibold text-slate-900">First Step Badge</p>
                <p className="text-xs text-slate-600">
                  Join your first session
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-700">
              You did it! You&apos;ve taken your first step into the SportsMatch
              community.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              🎯 Your next milestones
            </h3>
            <Milestone
              step="2"
              title="Join one more session"
              description='Unlock the "Week Warrior" badge 🏆'
            />
            <Milestone
              step="7"
              title="Keep a 7-day streak"
              description='Unlock "Consistency King" 🔥'
            />
            <Milestone
              step="4"
              title="Complete 4 sessions this month"
              description="Hit your monthly goal 🎯"
            />
          </div>

          <button
            type="button"
            onClick={() => navigate('/home')}
            className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
          >
            🏃 Join another session
          </button>
        </section>
      ) : (
        <section className="mx-auto w-full max-w-4xl px-4 py-6">
          <div className="rounded-2xl bg-white p-6 text-center text-slate-500 shadow-sm">
            Regular profile view coming soon…
          </div>
        </section>
      )}

      <div className="mx-auto w-full max-w-4xl space-y-2 border-t border-player-200 px-4 pt-6">
        <ActionButton icon="📆" label="My sessions" onClick={() => navigate('/my-sessions')} />
        <ActionButton icon="📊" label="Detailed stats" />
        <ActionButton icon="❤️" label="Saved sessions" />
        <ActionButton icon="⭐" label="My reviews" />
        <ActionButton icon="👥" label="Following" />
        <ActionButton
          icon="⚙️"
          label="Settings"
          onClick={() => navigate('/settings')}
        />
        <ActionButton
          icon="🚪"
          label="Logout"
          onClick={async () => {
            await logout()
            navigate('/login', { replace: true })
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 pb-8">
        <button
          type="button"
          onClick={async () => {
            await logout()
            navigate('/login', { replace: true })
          }}
          className="w-full rounded-lg py-3 text-sm font-semibold text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent: string
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  )
}

function EnergyCard({ energy }: { energy: number }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Energy
      </p>
      <p className="mt-2 text-3xl font-bold text-blue-600">{energy}%</p>
      <div className="mt-3 h-2 rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-amber-400"
          style={{ width: `${Math.min(100, Math.max(0, energy))}%` }}
        />
      </div>
    </div>
  )
}

function Milestone({
  step,
  title,
  description,
}: {
  step: string
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
        {step}
      </div>
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-600">{description}</p>
      </div>
    </div>
  )
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg bg-gray-100 px-4 py-3 text-left transition hover:bg-gray-200"
    >
      <span className="text-xl">{icon}</span>
      <span className="font-semibold text-gray-900">{label}</span>
      <span className="ml-auto text-gray-400">→</span>
    </button>
  )
}

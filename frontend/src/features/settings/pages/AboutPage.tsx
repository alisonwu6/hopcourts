import { CalendarCheck, IdCard, Sparkles, UsersRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

export function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[100dvh] bg-white text-slate-900">
      <ActionToolbar
        onBack={() => navigate('/settings')}
        showShare={false}
        showFavorite={false}
        contentClassName="max-w-5xl px-4"
        showBack
        title={<span className="text-lg font-semibold text-slate-900">About Us</span>}
        rightContent={
          <span
            className="h-10 w-10"
            aria-hidden="true"
          />
        }
        borderBottom
      />

      <main className="pb-16">
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white">
          <div className="pointer-events-none absolute -right-24 top-10 h-48 w-48 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-4 w-4" />
              Real-World Sports Platform
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Your city.
              <br />
              Your home game.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              Finding people to play with shouldn’t be hard.
              <br />
              <br />
              HopCourts makes it simple. Browse events near you, join a game, or start your own. No group chats, no
              back-and-forth. Just show up and play.
              <br />
              <br />
              Right here in your city.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
                <IdCard className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">Your Sports Pass</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Show off what you love to play and what you're keen to try next. This is your digital ticket to get
                  spotted and connect with the local community.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
                <UsersRound className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">My Sports Circle</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Build your network naturally. Every time you share a court or join the same event, players are added
                  to your Sports Circle. No awkward friend requests needed.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
                <CalendarCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">Hop-In & Play</h3>
                <p className="mt-2 text-sm text-slate-600">
                  See active events near you right now. Jump into an open slot or host your own session in seconds.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 text-center">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Ready to find your next game?</h2>
          <p className="mt-2 text-base text-slate-500">Join the HopCourts community.</p>
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="mt-6 inline-flex items-center rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            Explore events
          </button>
        </section>
      </main>
    </div>
  )
}

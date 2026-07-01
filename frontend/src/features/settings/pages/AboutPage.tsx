import { CalendarCheck, IdCard, UsersRound } from 'lucide-react'
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
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Find your game.
              <br />
              No group chats required.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              New to a city or just can't find people who are into the same sports. We sort it.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
                <IdCard className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">Your Profile</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Set what you play and what you want to pick up. The right games find you.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
                <UsersRound className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">My Mates Circle</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Everyone you play with is automatically saved. No swapping socials. Just play again when you’re ready.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
                <CalendarCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">Hop-In & Play</h3>
                <p className="mt-2 text-sm text-slate-600">Open the app. Find a game. Show up.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 text-center">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Ready to find your next game?</h2>
          <p className="mt-2 text-base text-slate-500">Games are happening near you right now.</p>
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

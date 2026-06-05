import { CalendarCheck, IdCard, Sparkles, UsersRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

export function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <ActionToolbar
        onBack={() => navigate(-1)}
        showShare={false}
        showFavorite={false}
        contentClassName="max-w-5xl px-4"
        showBack
        title={<span className="text-lg font-semibold text-slate-900">About Us</span>}
        rightContent={<span className="h-10 w-10" aria-hidden="true" />}
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
              HopCourts connects people through real-world sports.
              <br />
              <br />
              The best part of sport isn’t just the workout — it’s the moments shared with people
              who love the game.
              <br />
              <br />
              Right here in your city.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
                <IdCard className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">Your Sports Card</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Build your profile and track your sports journey.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
                <UsersRound className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">Players</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Meet players who share your interests and energy.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
                <CalendarCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">Find Games Easily</h3>
                <p className="mt-2 text-sm text-slate-600">Start or join sessions near you.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '@/assets/main-logo.png'
import { Rocket, ArrowRight, MessageSquareOff, Clock, Coins, Users } from 'lucide-react'
import { LoginPromptSheet } from '@/components'
import { useAuthStore } from '@/hooks'
import { PushNotificationBanner } from '@/components/PushNotificationBanner'

export function HomePage() {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const { isAuthenticated } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
  }))
  const navigate = useNavigate()

  const handleIdentityClick = () => {
    setShowLoginPrompt(true)
  }

  return (
    <div className="relative min-h-[100dvh] bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="pointer-events-none absolute inset-x-0 top-0" />
      <div className="relative mx-auto flex w-full flex-col px-4">
        <div className="mb-4 flex w-full justify-center">
          <img
            src={logo}
            alt="HopCourts"
            className="h-33 w-auto"
          />
        </div>

        <PushNotificationBanner />
        <main className="flex flex-col">
          {/* Badge & Headlines */}
          <header className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Rocket className="h-3.5 w-3.5" />
              <span>Zero Scheduling. Just Action.</span>
            </div>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900">
              No Team?
              <br />
              No Worries.
              <br />
              Hop In.
            </h1>
            <h2 className="text-base text-slate-600">
              Open courts. Real players.
              <br />
              No planning needed.
            </h2>
          </header>

          <section className="mt-6 flex justify-center gap-3">
            <button
              className="bg-ocean flex w-36 items-center justify-center rounded-full px-6 py-4 text-base font-bold text-white"
              type="button"
              onClick={() => navigate('/events')}
            >
              Discover
            </button>
            {!isAuthenticated && (
              <button
                className="bg-hop flex w-36 items-center justify-center rounded-full px-6 py-4 text-base font-bold text-white shadow-xl shadow-emerald-200/50"
                type="button"
                onClick={handleIdentityClick}
              >
                Hop in
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            )}
          </section>

          {/* Why HopCourts */}
          <section className="mt-10 w-full">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Why HopCourts</p>
            <div className="space-y-3">
              <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <MessageSquareOff className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Ditch the chat chaos</p>
                  <p className="mt-0.5 text-sm text-slate-500">Skip the 47-message threads. Just turn up and play.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Play when you want</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    No rigid leagues. Just open courts and games ready right now near you.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Split the bill, play premium</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Share court bookings and split training fees with mates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Instant mate connection</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Played once? You're automatically linked under My Mates for the next game.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Manifesto */}
          <section className="bg-courts mt-8 rounded-2xl px-3 py-4 text-center">
            <blockquote className="text-md font-semibold italic leading-relaxed text-white">
              Sport is the oldest social network.
              <br />
              We just built the app for it.
            </blockquote>
            <p className="mt-3 text-xs font-semibold text-white">HopCourts Team</p>
          </section>

          <div className="mt-20 flex flex-col items-center text-[9px]">
            <p className="text-slate-400">
              HopCourts v{__APP_VERSION__}
              {import.meta.env.MODE !== 'production' && <span className="ml-1 opacity-75">({import.meta.env.MODE})</span>}
            </p>
            <p className="text-slate-300">Built for real-world connections</p>
          </div>
        </main>
      </div>

      <LoginPromptSheet
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  )
}

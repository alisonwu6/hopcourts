import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '@/assets/main-logo.png'
import { Sparkles, ArrowRight, SquareX } from 'lucide-react'
import { LoginPromptSheet } from '@/components'
import { useAuthStore } from '@/hooks'

export function HomePage() {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const { isAuthenticated } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
  }))
  const navigate = useNavigate()

  const handleIdentityClick = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }
    navigate('/profile')
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white pb-24">
      <div className="pointer-events-none absolute inset-x-0 top-0" />
      <div className="relative mx-auto flex w-full flex-col px-4">
        <div className="flex w-full justify-center">
          <img src={logo} alt="HopCourts" className="h-50 w-auto" />
        </div>

        <main className="flex flex-col">
          {/* Badge & Headlines */}
          <header className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Zero Scheduling. Just Vitality.</span>
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
            <p className="mt-2 text-base font-bold text-emerald-600">
              The all-in-one instant matchmaker <br/> for your physical life.
            </p>
          </header>

          {/* Call to Action */}
          {!isAuthenticated && (
            <section className="mt-6 flex justify-center">
              <button
                className="flex items-center justify-center rounded-full bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-emerald-200/50"
                type="button"
                onClick={handleIdentityClick}
              >
                Hop in
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </section>
          )}

          {/* Why HopCourts */}
          <section className="mt-10 w-full">
            <p className="mb-6 text-center text-[12px] font-bold uppercase tracking-widest text-slate-400">
              Here! In HopCourts
            </p>
            <div className="flex justify-center">
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  <SquareX className="h-5 w-5 shrink-0" />
                  <p className="text-base font-semibold text-slate-700">
                    No more scattered group chats.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <SquareX className="h-5 w-5 shrink-0" />
                  <p className="text-base font-semibold text-slate-700">
                    No need to commit to rigid leagues.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Manifesto */}
          <section className="mt-16 border-t border-slate-100 pb-4 pt-12 text-center">
            <blockquote className="text-lg font-semibold italic leading-relaxed text-slate-700">
              "Sport is the oldest social network.
              <br />
              We just forgot to build the app for it."
            </blockquote>
            <p className="mt-4 text-xs font-semibold text-slate-400">— HopCourts</p>
          </section>
        </main>
      </div>

      <LoginPromptSheet open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </div>
  )
}

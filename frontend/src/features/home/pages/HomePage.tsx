import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '@/assets/main-logo.png'
import { MapPin, Sparkles, ArrowRight, Clock, Users } from 'lucide-react'
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
          <img src={logo} alt="SportsMatch" className="h-45 w-auto" />
        </div>

        <main className="flex flex-col">
          {/* Badge & Headlines */}
          <header className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-World First Application</span>
            </div>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900">
              No team?
              <br />
              No worries!
              <br />
              Just play.
            </h1>
            <h2 className="text-base text-slate-600">
              A social network that helps
              <br />
              you find sports mates — wherever you go.
            </h2>
          </header>

          {/* Call to Action */}
          {!isAuthenticated && (
            <section className="mt-10 flex justify-center">
              <button
                className="flex items-center justify-center rounded-full bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-emerald-200/50"
                type="button"
                onClick={handleIdentityClick}
              >
                Join SportsMatch
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </section>
          )}
        </main>
      </div>

      <LoginPromptSheet open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </div>
  )
}

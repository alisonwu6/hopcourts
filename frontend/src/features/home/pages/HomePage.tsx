import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '@/assets/sportsmatch.png'
import { MapPin, Sparkles, ArrowRight, Clock, Users } from 'lucide-react'
import { LoginPromptSheet } from '@/components'
import { useAuthStore } from '@/hooks'

export function HomePage() {
  const city = '大台北'

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
      <div className="relative mx-auto flex w-full flex-col px-4 pt-4">
        {/* Top Navigation / City Selector */}
        <div className="mb-2 flex w-full justify-center pt-2">
          <img src={logo} alt="SportsMatch" className="h-20 w-auto" />
        </div>
        {/* <nav className="-mb-2 flex w-full" aria-label="City Selector">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-full border border-[var(--color-border)] bg-white px-5 py-3 text-left shadow-md shadow-blue-100/40"
          >
            <MapPin
              className="h-5 w-5 text-[var(--color-primary)]"
              strokeWidth={2.2}
              aria-hidden="true"
            />
            <div className="flex flex-1 flex-col">
              <span className="text-lg font-bold text-slate-900">{city}</span>
              <span className="text-xs font-medium text-slate-500">目前所在城市</span>
            </div>
          </button>
        </nav> */}
        

        <main className="flex flex-col gap-8">
          {/* Badge & Headlines */}
          <header className="mt-6 flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-World First Application</span>
            </div>

            <div className="space-y-5">
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                找到你運動的樣子
              </h1>
              <h2 className="text-base text-slate-600">
                在 <span className="font-bold italic text-slate-800">SportsMatch</span>，
                找到志趣相投的運動夥伴，
                <br />
                讓運動成為最爽快的日常。
              </h2>
            </div>

          </header>

          {/* Feature Grid */}
          <section aria-label="App Features" className="px-4">
            <ul className="mx-auto grid w-full grid-cols-3 gap-3">
              {/* Time */}
              <li className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm">
                  <Clock className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">隨時開約</h3>
                  <p className="mt-1 text-xs leading-tight text-slate-600 sm:text-sm">
                    配合你的
                    <br />
                    生活步調
                  </p>
                </div>
              </li>

              {/* Location */}
              <li className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm">
                  <MapPin className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">探索城市</h3>
                  <p className="mt-1 text-xs leading-tight text-slate-600 sm:text-sm">
                    挖掘身邊
                    <br />
                    運動熱點
                  </p>
                </div>
              </li>

              {/* People */}
              <li className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600 shadow-sm">
                  <Users className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">契合夥伴</h3>
                  <p className="mt-1 text-xs leading-tight text-slate-600 sm:text-sm">
                    實力相當
                    <br />
                    更有挑戰
                  </p>
                </div>
              </li>
            </ul>
          </section>

          {/* Call to Action */}
          {!isAuthenticated && (
            <section className="mt-6 flex justify-center">
              <button
                className="flex w-full items-center justify-center rounded-full bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-emerald-200/50"
                type="button"
                onClick={handleIdentityClick}
              >
                加入 SportsMatch
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </section>
          )}
        </main>
      </div>

      <LoginPromptSheet
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  )
}

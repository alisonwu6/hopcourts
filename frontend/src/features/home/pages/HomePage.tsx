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
          <img src={logo} alt="SportsMatch" className="h-55 w-auto" />
        </div>      

        <main className="flex flex-col gap-4">
          {/* Badge & Headlines */}
          <header className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-World First Application</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                當揪團運動成為日常
              </h1>
              <h2 className="text-base text-slate-600">
                即時探索城市
                <br />
                時間 × 各種運動 × 夥伴
              </h2>
            </div>

          </header>

          {/* Feature Grid */}
          <section aria-label="App Features" className="px-4">
            <div className="mx-auto grid w-full grid-cols-3 gap-4">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center gap-3">
                <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm">
                  <Clock className="h-10 w-10" strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">隨時開約</h3>
                  <p className="text-sm font-medium leading-relaxed text-slate-500">
                    配合你的
                    <br />
                    生活步調
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center gap-3">
                <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] border border-blue-200 bg-blue-50 text-blue-600 shadow-sm">
                  <MapPin className="h-10 w-10" strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">探索城市</h3>
                  <p className="text-sm font-medium leading-relaxed text-slate-500">
                    挖掘身邊
                    <br />
                    運動熱點
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center gap-3">
                <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] border border-amber-200 bg-amber-50 text-amber-600 shadow-sm">
                  <Users className="h-10 w-10" strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">契合夥伴</h3>
                  <p className="text-sm font-medium leading-relaxed text-slate-500">
                    志趣相同
                    <br />
                    更有樂趣
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          {!isAuthenticated && (
            <section className="mt-4 flex justify-center">
              <button
                className="flex items-center justify-center rounded-full bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-emerald-200/50"
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

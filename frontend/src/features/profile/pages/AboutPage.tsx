import {
  Activity,
  ArrowRight,
  CalendarCheck,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  UsersRound,
  MessageCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { useAuthStore } from '@/hooks'

export function AboutPage() {
  const navigate = useNavigate()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const handleIdentityClick = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }
    navigate('/onboarding')
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <ActionToolbar
        onBack={() => navigate(-1)}
        showShare={false}
        showFavorite={false}
        contentClassName="max-w-5xl px-4"
        showBack
        title={
          <span className="text-lg font-semibold text-slate-900">關於 SportsMatch</span>
        }
        rightContent={<span className="h-10 w-10" aria-hidden="true" />}
        borderBottom
      />

      <main className="pb-16">
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white">
          <div className="pointer-events-none absolute -right-24 top-10 h-48 w-48 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 bottom-10 h-56 w-56 rounded-full bg-sky-200/50 blur-3xl" />
          <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-4 w-4" />
              Real-World First Application
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
              你的運動，由你定義。
              <br />
              你的世界，等你探索。
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              我們是運動生活社群，讓每一次行動都能找到最可靠的連結。一起找到步調相近的人，
              把運動變成日常裡最爽快的約定。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                type="button"
                onClick={handleIdentityClick}
              >
                加入 SportsMatch
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
                <UsersRound className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">靈魂匹配</h3>
                <p className="mt-2 text-sm text-slate-600">
                  根據你的運動心態和節奏，找到與你同頻的夥伴。
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
                <CalendarCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">可靠夥伴</h3>
                <p className="mt-2 text-sm text-slate-600">
                  社群信用系統幫你篩選準時、投入的運動夥伴。
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">
                  隱私最高標準
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  個人資料與行程都有加密防護，讓你安心享受運動。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-emerald-50/60 py-14">
          <div className="mx-auto w-full max-w-5xl px-4">
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
              不是報名一場運動，
              <br />
              是建立你在城市裡的運動身份。
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              在 SportsMatch，你不是匿名參加者，而是一個有節奏、有偏好、有故事的運動者。
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                <Activity className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">
                  你的運動狀態
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  不是程度高低，而是你的步調、心情與生活節奏。輕鬆 / 穩定 / 成長 / 探索。
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                <SlidersHorizontal className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">
                  你的運動偏好
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  我的最愛、想嘗試的項目、偏好的時間與頻率，讓對的人更容易找到你。
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                <MessageCircle className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">
                  你的運動故事
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  一句話就好，這會成為你運動卡片上最真實、也最吸引人的部分。
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-start gap-2">
              <button
                className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-400 hover:to-teal-400"
                type="button"
                onClick={handleIdentityClick}
              >
                建立我的運動身份
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <span className="text-xs text-slate-500">
                約 2 分鐘完成，之後都可以調整
              </span>
            </div>
          </div>
        </section>
      </main>

      <LoginPromptSheet
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onSignup={() => navigate('/signup')}
      />
    </div>
  )
}

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
        title={<span className="text-lg font-semibold text-slate-900">關於我們</span>}
        rightContent={<span className="h-10 w-10" aria-hidden="true" />}
        borderBottom
      />

      <main className="pb-16">
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white">
          <div className="pointer-events-none absolute -right-24 top-10 h-48 w-48 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-4 w-4" />
              Real World First Application
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
              你的城市，
              <br />
              就是你的主場。
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              SportsMatch
              是一個專注於真實世界連結的運動社群服務。我們相信，運動最好的部分不只是流汗，
              更是與志趣相投的夥伴，一起在城市裡創造爽快的時刻。
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
                <IdCard className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">我的運動卡</h3>
                <p className="mt-2 text-sm text-slate-600">建立運動身份，累積自我運動旅程。</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
                <UsersRound className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">運動夥伴</h3>
                <p className="mt-2 text-sm text-slate-600">找到運動興趣與程度契合的運動夥伴。</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
                <CalendarCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">輕鬆成局</h3>
                <p className="mt-2 text-sm text-slate-600">
                  輕鬆開團與參加流程。設定時間、地點、程度。
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

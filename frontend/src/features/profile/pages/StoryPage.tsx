import { useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

export function StoryPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white pb-[120px] text-slate-900">
      <ActionToolbar
        onBack={() => navigate(-1)}
        showShare={false}
        showFavorite={false}
        title={<span className="text-lg font-semibold text-slate-900">創立故事</span>}
        contentClassName="max-w-3xl px-4"
        showBack
        borderBottom
      />
      <main className="pb-16">
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white">
          <div className="pointer-events-none absolute -right-24 top-10 h-48 w-48 rounded-full bg-emerald-200/50 blur-3xl" />

          <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10">
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              從「找不到咖」開始
              <br />
              到可以隨時揪團的城市運動
            </h1>

            <div className="mt-8 space-y-4 text-base sm:text-lg">
              <div className="pt-2 text-slate-700">
                <p>嗨！ 我們是 SportsMatch，一個讓你輕鬆揪團運動的平台。</p>
              </div>
              <div className="pt-2 text-slate-600">
                <p>
                  在繁忙的都市生活中，要找到時間、地點以及程度相近的運動夥伴並不容易。
                  我們希望能透過科技的力量，讓每一個人都能輕鬆找到屬於自己的運動圈，
                  能一直找到一起前行的夥伴與對手，不再讓找不到人成為運動的阻礙。
                </p>
              </div>
              <div className="pt-2 text-slate-600">
                <p>
                  我們相信，運動不僅僅是鍛鍊身體，更是連結人與人之間最純粹的方式。
                  每一次的擊掌、每一次的互動，都在建立真實的連結與自我的成就感。
                </p>
              </div>
              <div className="pt-2 text-slate-600">
                <p>期待每一個人的加入與回饋，我們對 SportsMatch 還有更多想像，也會一直變得更好。</p>
              </div>
            </div>
            <p className="mt-8 text-right text-sm font-bold text-slate-500">SportsMatch Team 💛</p>
          </div>
        </section>
      </main>
    </div>
  )
}

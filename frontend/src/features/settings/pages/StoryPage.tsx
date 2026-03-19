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
        title={<span className="text-lg font-semibold text-slate-900">Our Story</span>}
        contentClassName="max-w-3xl px-4"
        showBack
        borderBottom
      />
      <main className="pb-16">
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white">
          <div className="pointer-events-none absolute -right-24 top-10 h-48 w-48 rounded-full bg-emerald-200/50 blur-3xl" />

          <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10">
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              It started with
              <br />
              "can't find people to play with."
            </h1>

            <div className="mt-8 space-y-4 text-base sm:text-lg">
              <div className="pt-2 text-slate-700">
                <p>Hi, we're SportsMatch, a platform that makes it easy to organize sports sessions.</p>
              </div>
              <div className="pt-2 text-slate-600">
                <p>
                  In busy city life, it's hard to find people with matching time, location, and skill
                  level. We built SportsMatch to remove that friction and help everyone find their
                  own sports circle.
                </p>
              </div>
              <div className="pt-2 text-slate-600">
                <p>
                  We believe sports are not only about fitness, but also one of the purest ways to
                  build real human connection. Every high-five and every interaction creates momentum
                  and confidence.
                </p>
              </div>
              <div className="pt-2 text-slate-600">
                <p>Thanks for being part of this journey. We're continuing to improve SportsMatch with your feedback.</p>
              </div>
            </div>
            <p className="mt-8 text-right text-sm font-bold text-slate-500">SportsMatch Team 💛</p>
          </div>
        </section>
      </main>
    </div>
  )
}

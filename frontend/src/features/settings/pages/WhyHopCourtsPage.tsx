import { Rocket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

export function WhyHopCourtsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[100dvh] bg-white pb-[120px] text-slate-900">
      <ActionToolbar
        onBack={() => navigate('/settings')}
        showShare={false}
        showFavorite={false}
        title={<span className="text-lg font-semibold text-slate-900">Why HopCourts </span>}
        contentClassName="max-w-3xl px-4"
        showBack
        borderBottom
      />

      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <header className="border-b border-slate-200 pb-5">
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Why HopCourts</h1>
          </header>

          <div className="mt-6 space-y-6 text-base leading-8 text-slate-700">
            <p>In most cities today, there is a strange mismatch.</p>
            <p>
              We do not lack people who want to play; we lack the coordination to bring them together. Every day,
              underutilized sports venues sit empty, while fragmented human hours are wasted in isolation. When the two
              cannot align precisely, a potentially great game simply never happens.
            </p>
            <p>We built HopCourts because we want to bring back a simpler time.</p>
            <p>
              When we were growing up, connecting through sports was effortless. You didn&apos;t need to pay for
              exclusive clubs. You didn&apos;t need to manage the logistical nightmare of chaotic group chats. You just
              grabbed a ball, walked down to the local court, and the game would find you.
            </p>
            <p>
              Modern technology promised to connect us, but when it comes to real life, it has only introduced friction.
              The transaction cost of just going out to play has become too high. A spontaneous act has become a
              coordination headache.
            </p>
            <p>But sports should be instinctual. A ball and a court should be enough.</p>
            <p>
              We believe that shared physical exertion is the oldest, purest trust network we have. On the court, our
              backgrounds are flattened. Our social titles don&apos;t matter. For those two hours, we share the exact
              same physical space, communicating through a silent, universal language.
            </p>
            <p className="text-lg font-semibold text-slate-900">Anyone can be an athlete.</p>
            <p>This is the unwavering conviction behind HopCourts.</p>
            <p>
              We are using code to eliminate the cost of human coordination, not to trap you in another digital
              community, but to get you back into the physical world. We want you to be able to open the app, see an
              open slot, and just hop in. By doing so, we maximize court utilization for venues while allowing
              like-minded people to connect seamlessly.
            </p>
            <p>
              Perhaps it will yield a compounding network of lifelong mates, or perhaps it is just an efficient, deeply
              satisfying allocation of your afternoon. Either outcome is a win for us.
            </p>
            <p>
              Our ultimate goal is to bring absolute liquidity to human intent and physical spaces. No matter what city
              you travel to, you should always be able to easily find your place on the court, just the way it used to
              be.
            </p>
          </div>

          <footer className="mt-3 pt-6">
            <p className="text-sm font-semibold text-slate-900">HopCourts Team</p>
          </footer>
        </article>
      </main>
    </div>
  )
}

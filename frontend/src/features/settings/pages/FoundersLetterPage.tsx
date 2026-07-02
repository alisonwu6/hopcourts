import { useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

export function FoundersLetterPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[100dvh] pb-[120px]">
      <ActionToolbar
        onBack={() => navigate(-1)}
        showShare={false}
        showFavorite={false}
        title={<span className="text-lg font-semibold text-slate-900">A Letter from the Founder</span>}
        showBack
        borderBottom
      />

      {/* Dark section — feeling + current reality */}
      <div className="bg-courts px-5 pb-12 pt-6">
        <h1 className="text-4xl font-black leading-tight tracking-tight text-white">
          Hey, I'm the founder of <span className="text-hop">Hop</span>
          <span className="text-ocean">Courts</span>.
        </h1>

        <div className="mt-8 space-y-5 text-base leading-8 text-white/70">
          <p>
            You know that feeling when a game is just flowing — the court, the rhythm, the people around you all in
            sync. I've been chasing that feeling since I was a kid.
          </p>

          <p>
            Sport was never about winning for me. It was about those moments when nothing else mattered, when I could
            reset and feel like myself again. Show up to a court in a new city, and somehow you belong. It's where I
            always found my true strength — that pure, instinctual flow where social titles disappear, and shared sweat
            creates an instant bond.
          </p>

          <p>
            But the older I got, the harder it became to hold onto that. Everyone got busier. Life got in the way. And
            every time I moved somewhere new, I'd have to start from scratch — no courts, no contacts, no way in. The
            spontaneity I loved most slowly got replaced by logistics.
          </p>

          <blockquote className="border-hop border-l-4 pl-4">
            <p className="text-base font-bold leading-snug text-white">The joy was still there. It just got buried.</p>
          </blockquote>
        </div>
      </div>

      {/* Light section — vision */}
      <main className="bg-stone-50 px-5 py-8">
        <div className="space-y-5 text-base leading-8 text-slate-700">
          <p className="text-ocean font-extrabold">That's why I built HopCourts.</p>

          <p>
            Not just for me — for anyone who's moved to a new city and felt that gap. For anyone who wants to try a
            different sport but doesn't know where to start. For anyone who just wants to show up and play, without the
            admin headache.
          </p>

          <p>That's the world I'm building. One where the court is always just one hop away.</p>

          <blockquote className="border-hop border-l-4 pl-4">
            <p className="text-hop text-base font-bold leading-snug">
              A ball and a court should be enough. <br /> The rest is on HopCourts.
            </p>
          </blockquote>
        </div>

        {/* Sign-off */}
        <div className="mt-10 border-t border-slate-200 pt-8">
          <p className="text-slate-700">See you on the court,</p>
          <p className="text-lg font-bold text-slate-900">
            <span className="text-hop">Hop</span>
            <span className="text-ocean">Courts</span>
            <span> Founder</span>
          </p>
        </div>
      </main>
    </div>
  )
}

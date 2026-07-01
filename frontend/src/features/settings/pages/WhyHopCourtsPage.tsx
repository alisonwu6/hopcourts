import { useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  )
}

export function WhyHopCourtsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[100dvh] bg-white pb-[120px]">
      <ActionToolbar
        onBack={() => navigate(-1)}
        showShare={false}
        showFavorite={false}
        title={<span className="text-lg font-semibold text-slate-900">Why HopCourts</span>}
        showBack
        borderBottom
      />

      {/* Dark hero */}
      <div className="bg-slate-900">
        <div className="mx-auto max-w-2xl px-5 pb-10 pt-6">
          <p className="text-courts-400 mb-3 text-xs font-bold uppercase tracking-widest">Our Story</p>
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white">
            Sport should be <span className="text-courts-400">instinctual.</span>
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-400">
            A ball and a court should be enough. We&apos;re building the missing piece.
          </p>
        </div>
      </div>

      {/* Content sections */}
      <main className="mx-auto max-w-2xl space-y-0 divide-y divide-slate-100 bg-white px-5 shadow-sm">
        {/* How it used to be */}
        <section className="space-y-4 py-7">
          <SectionLabel label="How it used to be" />
          <div className="space-y-4 text-base leading-8 text-slate-700">
            <p>Sport doesn&apos;t ask much of you. A ball. A court. Someone to play with. That&apos;s it.</p>
            <p>
              When we were growing up, connecting through sports was effortless. You grabbed a ball, walked down to the
              local court, and the game found you. No apps. No back-and-forth. Just sport.
            </p>
          </div>
        </section>

        {/* What it became */}
        <section className="space-y-4 py-7">
          <SectionLabel label="What it became" />
          <div className="space-y-4 text-base leading-8 text-slate-700">
            <p>
              You move cities and the game you had just disappears. The Facebook groups are dead. The WhatsApp threads
              go quiet. You end up posting on Threads asking if anyone runs pickup on weekends.
            </p>
            <p>
              And when something does come together, someone always bails. The people who show up are either way too
              intense or barely trying.
            </p>
            <p>Finding the right people, at the right level, at the right time. It&apos;s harder than it should be.</p>
          </div>
        </section>

        {/* What we're building */}
        <section className="space-y-4 py-7">
          <SectionLabel label="What we're building" />
          <div className="space-y-4 text-base leading-8 text-slate-700">
            <p>
              HopCourts takes the coordination problem away. Open the app, find a game near you, hop in. No group chats.
              No back-and-forth. No starting over every time you move.
            </p>
            <p>
              Hosting is just as easy. Set a time, set a sport, and let people come to you. No chasing confirmations, no
              managing a group chat.
            </p>
            <p>
              And when the game is over, the people you played with are already saved. No awkward moment of asking for
              numbers. If you both want to play again, HopCourts makes it easy to find each other next time.
            </p>
          </div>
        </section>

        {/* Anyone can be an athlete */}
        <section className="space-y-4 py-7">
          <SectionLabel label="Anyone can be an athlete" />
          <div className="space-y-4 text-base leading-8 text-slate-700">
            <p>
              Sport isn&apos;t just for the serious or the skilled. Whether you&apos;re picking up a ball for the first
              time, getting back into it after years away, or somewhere in between, there&apos;s a game for you.
            </p>
            <p>
              Everyone starts somewhere. HopCourts helps you find people at your level, so you can show up comfortably,
              play with people who get it, and grow from there.
            </p>
            <p>
              Sport should feel like sport again. Easy to find, easy to join, and worth showing up for. That&apos;s what
              HopCourts is built on.
            </p>
          </div>
        </section>
        <div className="py-6">
          <p className="text-sm font-semibold text-slate-900">HopCourts Team</p>
        </div>
      </main>
    </div>
  )
}

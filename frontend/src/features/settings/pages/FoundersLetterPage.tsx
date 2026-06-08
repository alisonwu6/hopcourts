import { useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

export function FoundersLetterPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white pb-[120px] text-slate-900">
      <ActionToolbar
        onBack={() => navigate('/settings')}
        showShare={false}
        showFavorite={false}
        title={<span className="text-lg font-semibold text-slate-900">Why HopCourts Exists</span>}
        contentClassName="max-w-3xl px-4"
        showBack
        borderBottom
      />

      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <header className="border-b border-slate-200 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              A Letter from the Founder
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Why HopCourts Exists</h1>
          </header>

          <div className="mt-6 space-y-6 text-base leading-8 text-slate-700">
            <p>In many cities, wanting to exercise isn&apos;t the hard part.</p>
            <p>Finding people to play with is.</p>
            <p>You might have the time. You might have the court. But somehow the game never happens.</p>
            <p>We wait in group chats. We try new communities. Sometimes we just give up and go home.</p>
            <p>Something that should feel natural starts to feel complicated.</p>
            <p>But sport was never meant to be complicated.</p>
            <p>
              In many places around the world, all it takes is someone bringing a ball to a court. And slowly, people
              gather.
            </p>
            <p>Strangers start playing together. Different backgrounds meet through the same language — movement.</p>
            <p>For a moment, it feels like a small Olympic village inside a city.</p>
            <p>
              Everyone arrives with their own rhythm. Some want to compete. Some want to move. Some just want to feel
              alive again.
            </p>
            <p>But they all share the same truth.</p>
            <p className="text-lg font-semibold text-slate-900">Anyone can be an athlete.</p>
            <p>HopCourts started from this belief.</p>
            <p>The idea is simple.</p>
            <p>
              Wherever you are, in whatever city you happen to be in, you should be able to open your phone and find
              people ready to move — whatever sport you love.
            </p>
            <p>No complicated coordination. No endless searching.</p>
            <p>Just a game waiting to happen.</p>
            <p>Maybe it becomes a regular crew. Maybe it becomes a friendship.</p>
            <p>Or maybe it&apos;s just a great game at the end of the day.</p>
            <p>
              But if one day people can travel to any city and still easily find their place to play, then the world
              might become a little healthier, and a little more connected.
            </p>
            <p>That&apos;s why HopCourts exists.</p>
          </div>

          <footer className="mt-8 border-t border-slate-200 pt-6">
            <p className="font-semibold text-slate-800">— Alison Wu</p>
            <p className="text-sm font-semibold text-slate-900">Founder, HopCourts</p>
          </footer>
        </article>
      </main>
    </div>
  )
}

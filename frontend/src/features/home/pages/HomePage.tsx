import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '@/assets/main-logo.png'
import {
  Megaphone,
  ArrowRight,
  MessageSquareOff,
  Clock,
  Coins,
  Users,
  MoveUpRight,
  ChevronDown,
  MessageCircle,
  Bug,
  Lightbulb,
  ChevronRight,
} from 'lucide-react'
import { LoginPromptSheet } from '@/components'
import { useAuthStore } from '@/hooks'
import { PushNotificationBanner } from '@/components/PushNotificationBanner'

const homeFaqCategories = [
  {
    category: 'About HopCourts',
    items: [
      {
        q: 'What is HopCourts trying to do?',
        a: "We're building for anyone who wants to play sport but can't find the right people or the right moment. Group chats are messy. Planning takes too long. HopCourts removes the friction so a good game doesn't need all that.",
      },
    ],
  },
  {
    category: 'Playing',
    items: [
      {
        q: 'How do I join a game?',
        a: 'Browse games near you on the events page. When you find one that fits, tap Hop In. No back-and-forth, no group chats. Just show up and play.',
      },
      {
        q: 'How do I host a game?',
        a: 'Tap + from the home screen. Fill in the sport, time, location, and number of spots. Hit publish and others can find and join you. You sort the court, we make it easy for people to show up.',
      },
    ],
  },
  {
    category: 'Features',
    items: [
      {
        q: 'How does HopCourts know I actually showed up?',
        a: "You check in when you're within 100m of the venue. It records that you were there and connects you with the people you played with. We think showing up is the best thing you can do for your game and your mates.",
      },
    ],
  },
  {
    category: 'App & Notifications',
    items: [
      {
        q: 'Can I use HopCourts like a mobile app?',
        a: "Yes. HopCourts is a web app that can be installed on your phone's home screen so it feels and behaves like a native app — no app store needed.\n\niPhone (Safari): tap the Share button at the bottom of the screen, then tap Add to Home Screen. Tap Add to confirm. Open HopCourts from your home screen and it will run full-screen without the browser bar.\n\nAndroid (Chrome): tap the three-dot menu in the top-right corner, then tap Add to Home Screen or Install App. Tap Install to confirm.\n\nOnce installed, you get full-screen mode, faster loading, and push notifications.",
      },
      {
        q: 'How do I turn on notifications?',
        a: "On Android: tap Allow when the prompt appears.\n\nOn iPhone: add HopCourts to your Home Screen first (see 'Can I use HopCourts like a mobile app?' above), then open it from there and tap Allow when prompted.\n\nTo turn off: go to phone Settings, find Notifications, look for HopCourts, and switch it off.",
      },
    ],
  },
]

export function HomePage() {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const { isAuthenticated } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
  }))
  const navigate = useNavigate()

  const handleIdentityClick = () => {
    setShowLoginPrompt(true)
  }

  return (
    <div className="relative min-h-[100dvh] bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="pointer-events-none absolute inset-x-0 top-0" />
      <div className="relative mx-auto flex w-full flex-col px-4">
        <div className="mb-4 flex w-full justify-center">
          <img
            src={logo}
            alt="HopCourts"
            className="h-33 w-auto"
          />
        </div>

        <PushNotificationBanner />
        <main className="flex flex-col">
          {/* Badge & Headlines */}
          <header className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Megaphone size={15} />
              <span>We handle the friction, you just hop in.</span>
            </div>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900">
              No Team?
              <br />
              No Worries.
              <br />
              Hop In.
            </h1>
            <h2 className="text-base text-slate-600">
              Host a game or hop in.
              <br />
              Either way, it's easy.
            </h2>
          </header>

          <section className="mt-6 flex justify-center gap-3">
            <button
              className="bg-ocean flex w-36 cursor-pointer items-center justify-center rounded-full px-6 py-4 text-base font-bold text-white"
              type="button"
              onClick={() => navigate('/events')}
            >
              Discover
            </button>
            {!isAuthenticated && (
              <button
                className="bg-hop flex w-36 cursor-pointer items-center justify-center rounded-full px-6 py-4 text-base font-bold text-white shadow-xl shadow-emerald-200/50"
                type="button"
                onClick={handleIdentityClick}
              >
                Hop in
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            )}
          </section>

          {/* Why HopCourts */}
          <section className="mt-10 w-full">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-2xl font-extrabold leading-tight text-slate-900">Why HopCourts</h2>
              <button
                type="button"
                onClick={() => navigate('/why-hopcourts')}
                className="text-courts-500 flex items-center gap-1 text-[12px] text-sm font-extrabold underline"
              >
                Read more
                <MoveUpRight
                  size={12}
                  strokeWidth={3}
                  className="text-courts-500"
                />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <MessageSquareOff className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Ditch the chat chaos</p>
                  <p className="mt-0.5 text-sm text-slate-500">Skip the 47-message threads. Just turn up and play.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Play when you want</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    No rigid leagues. Just open courts and games ready right now near you.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Split the bill, play premium</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Share court bookings and split training fees with mates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Instant mate connection</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Played once? You're automatically linked under My Mates for the next game.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Manifesto */}
          <section className="bg-courts mt-4 rounded-2xl px-3 py-4 text-center">
            <blockquote className="text-md font-semibold italic leading-relaxed text-white">
              "Sport is the oldest social network.
              <br />
              We just built the app for it."
            </blockquote>
            <p className="mt-3 text-xs font-semibold text-white">HopCourts Team</p>
          </section>

          {/* Common Questions */}
          <section className="mt-10 w-full">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-2xl font-extrabold leading-tight text-slate-900">FAQ</h2>
              <button
                type="button"
                onClick={() => navigate('/faq')}
                className="text-courts-500 flex items-center gap-1 text-[12px] text-sm font-extrabold underline"
              >
                See all{' '}
                <MoveUpRight
                  size={12}
                  strokeWidth={3}
                />
              </button>
            </div>
            <div className="space-y-6">
              {homeFaqCategories.map((cat, ci) => (
                <div key={ci}>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-slate-400">{cat.category}</p>
                  <div className="space-y-3">
                    {cat.items.map((item, ii) => {
                      const key = `${ci}-${ii}`
                      return (
                        <div
                          key={ii}
                          className="rounded-2xl bg-white shadow-sm"
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFaq(openFaq === key ? null : key)}
                            className="flex w-full items-center justify-between p-5 text-left"
                          >
                            <span className="pr-4 text-base font-semibold text-slate-900">{item.q}</span>
                            <ChevronDown
                              className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${openFaq === key ? 'rotate-180' : ''}`}
                            />
                          </button>
                          {openFaq === key && (
                            <p className="whitespace-pre-line px-5 pb-5 text-sm leading-relaxed text-slate-500">
                              {item.a}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* We're Listening */}
          <section className="mt-10 w-full">
            <h2 className="mb-4 text-2xl font-extrabold text-slate-900">{"We're listening"}</h2>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="mb-4 text-sm leading-relaxed text-slate-400">
                HopCourts is built with the community. Your feedback shapes every update.
              </p>
              <div className="space-y-3">
                {[
                  {
                    icon: <MessageCircle className="h-5 w-5" />,
                    bg: 'bg-blue-100 text-blue-600',
                    label: 'Share feedback',
                    sub: "Tell us what's working or not",
                    type: 'other',
                  },
                  {
                    icon: <Bug className="h-5 w-5" />,
                    bg: 'bg-orange-100 text-orange-500',
                    label: 'Report a bug',
                    sub: 'Something not working right?',
                    type: 'issue',
                  },
                  {
                    icon: <Lightbulb className="h-5 w-5" />,
                    bg: 'bg-purple-100 text-purple-600',
                    label: 'Request a feature',
                    sub: "Got an idea? We'd love to hear it",
                    type: 'feature',
                  },
                ].map(({ icon, bg, label, sub, type }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => navigate(`/settings/contact?type=${type}`)}
                    className="flex w-full items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-left"
                  >
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${bg}`}>
                      {icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{label}</p>
                      <p className="text-xs text-slate-400">{sub}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="mb-20" />
        </main>
      </div>

      <LoginPromptSheet
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />

      <div className="fixed bottom-20 left-0 right-0 z-[-10] flex flex-col items-center text-[9px]">
        <p className="text-slate-400">
          HopCourts v{__APP_VERSION__}
          {import.meta.env.MODE !== 'production' && <span className="ml-1 opacity-75">({import.meta.env.MODE})</span>}
        </p>
        <p className="text-slate-300">Built for real-world connections</p>
      </div>
    </div>
  )
}

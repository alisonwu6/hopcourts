import { useState, useMemo } from 'react'
import { ChevronDown, Info, Dribbble, Sparkles, Smartphone, Search, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

type FaqItem = { q: string; a: string }
type FaqCategory = {
  category: string
  Icon: React.ElementType
  iconColor: string
  labelColor: string
  items: FaqItem[]
}

const faqCategories: FaqCategory[] = [
  {
    category: 'About HopCourts',
    Icon: Info,
    iconColor: 'text-blue-500',
    labelColor: 'text-blue-600',
    items: [
      {
        q: 'What is HopCourts trying to do?',
        a: "We're building for anyone who wants to play sport but can't find the right people or the right moment. Group chats are messy. Planning takes too long. HopCourts removes the friction so a good game doesn't need all that.",
      },
      {
        q: 'Is HopCourts free to use?',
        a: "Yes, for now. We see the problem: too much friction between wanting to play and actually playing. Removing that barrier is the whole point. Charging for it right now would work against what we're trying to do.",
      },
    ],
  },
  {
    category: 'Playing',
    Icon: Dribbble,
    iconColor: 'text-emerald-600',
    labelColor: 'text-emerald-700',
    items: [
      {
        q: 'How do I join a game?',
        a: 'Browse games near you on the events page. When you find one that fits, tap Hop In. No back-and-forth, no group chats. Just show up and play.',
      },
      {
        q: 'How do I host a game?',
        a: "Tap + from the home screen. Fill in the sport, time, location, and number of spots. Hit publish and others can find and join you. You sort the court, we make it easy for people to show up.",
      },
      {
        q: 'How can I cancel a game?',
        a: "If you're the host, open the game and tap Edit. If anyone has already joined, tap Cancel and everyone who joined will be notified. If you've joined someone else's game and need to pull out, open the game and tap Leave.",
      },
      {
        q: 'Do I need to book a court in advance?',
        a: "Depends on your role. If you're joining, no booking needed. Just hop in and show up. If you're hosting, yes. You sort out the court and others can find and join you.",
      },
    ],
  },
  {
    category: 'Features',
    Icon: Sparkles,
    iconColor: 'text-amber-500',
    labelColor: 'text-amber-600',
    items: [
      {
        q: 'How does HopCourts know I actually showed up?',
        a: "You check in when you're within 100m of the venue. It records that you were there and connects you with the people you played with. We think showing up is the best thing you can do for your game and your mates.",
      },
      {
        q: 'How does Mates work?',
        a: "Every game you play is logged. The mates you checked in with and played alongside show up here automatically. No more losing touch after a good game.",
      },
    ],
  },
  {
    category: 'App & Notifications',
    Icon: Smartphone,
    iconColor: 'text-indigo-500',
    labelColor: 'text-indigo-600',
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

export function FaqPage() {
  const navigate = useNavigate()
  const [openIndex, setOpenIndex] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return faqCategories
    return faqCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.items.length > 0)
  }, [query])

  return (
    <div className="min-h-[100dvh] bg-white text-slate-900">
      <ActionToolbar
        onBack={() => navigate(-1)}
        showShare={false}
        showFavorite={false}
        contentClassName="max-w-3xl px-4"
        showBack
        title={<span className="text-lg font-semibold text-slate-900">FAQ</span>}
        rightContent={<span className="h-10 w-10" aria-hidden="true" />}
        borderBottom
      />

      {/* Hero */}
      <div className="relative overflow-hidden bg-[#1a3b14]">
        {/* Pickleball court — lower right */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 390 170"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g opacity="0.22" stroke="white" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <g transform="translate(200, 75) rotate(6, 65, 32) scale(1.35)">
              <rect x="0" y="0" width="130" height="65" strokeWidth="1.5" />
              {/* Net */}
              <line x1="65" y1="0" x2="65" y2="65" strokeWidth="1.2" />
              {/* Non-volley zone (kitchen) lines */}
              <line x1="44.3" y1="0" x2="44.3" y2="65" strokeWidth="1.2" />
              <line x1="85.7" y1="0" x2="85.7" y2="65" strokeWidth="1.2" />
              {/* Service court centre lines */}
              <line x1="0" y1="32.5" x2="44.3" y2="32.5" strokeWidth="1.2" />
              <line x1="85.7" y1="32.5" x2="130" y2="32.5" strokeWidth="1.2" />
            </g>
          </g>

          {/* Pickleball paddle and ball */}
          <g opacity="0.28" stroke="white" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <g transform="translate(338, 35) rotate(18)">
              <path
                d="M0,-20 C-11,-20 -17,-12 -17,0 C-17,12 -10,20 0,20 C10,20 17,12 17,0 C17,-12 11,-20 0,-20 Z"
                strokeWidth="1.5"
              />
              <path d="M-4,19 L-3,38 Q0,42 3,38 L4,19" strokeWidth="1.5" />
              <line x1="-3" y1="34" x2="3" y2="34" strokeWidth="1" />
            </g>
            <g transform="translate(291, 37)">
              <circle cx="0" cy="0" r="12" strokeWidth="1.5" fill="white" />
              <g fill="#1a3b14" stroke="none">
                <ellipse cx="0" cy="0" rx="2.1" ry="2.4" />
                <ellipse cx="-7" cy="-6" rx="1.4" ry="2" transform="rotate(35 -7 -6)" />
                <ellipse cx="0" cy="-8" rx="1.8" ry="1.4" />
                <ellipse cx="7" cy="-5" rx="1.4" ry="2" transform="rotate(-35 7 -5)" />
                <ellipse cx="-8" cy="1" rx="1.4" ry="1.9" transform="rotate(-12 -8 1)" />
                <ellipse cx="8" cy="2" rx="1.4" ry="1.9" transform="rotate(18 8 2)" />
                <ellipse cx="-5" cy="7" rx="1.9" ry="1.3" transform="rotate(25 -5 7)" />
                <ellipse cx="4" cy="7" rx="1.9" ry="1.3" transform="rotate(-25 4 7)" />
                <ellipse cx="-10" cy="-2.5" rx="0.8" ry="1.5" transform="rotate(18 -10 -2.5)" />
                <ellipse cx="10" cy="-1.5" rx="0.8" ry="1.5" transform="rotate(-18 10 -1.5)" />
              </g>
            </g>
          </g>
        </svg>

        <div className="relative mx-auto max-w-3xl px-5 pb-10 pt-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-lime-400">Help Centre</p>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-white">
            Frequently
            <br />
            asked questions
          </h1>
          <p className="mt-3 text-base text-white/60">Everything you need to know about HopCourts.</p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-3xl px-4 py-5 pb-16">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search questions..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpenIndex(null)
            }}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">No results for &quot;{query}&quot;</p>
        )}

        <div className="space-y-6">
          {filtered.map((cat, ci) => (
            <div key={ci}>
              {/* Category label */}
              <div className="mb-2 flex items-center gap-2 px-1">
                <cat.Icon className={clsx('h-4 w-4 flex-shrink-0', cat.iconColor)} />
                <span className={clsx('text-xs font-bold uppercase tracking-widest', cat.labelColor)}>
                  {cat.category}
                </span>
              </div>

              {/* Accordion card */}
              <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
                {cat.items.map((item, ii) => {
                  const key = `${ci}-${ii}`
                  const isOpen = openIndex === key
                  return (
                    <div key={ii}>
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : key)}
                        className="flex w-full items-center justify-between px-4 py-4 text-left"
                      >
                        <span className="pr-4 text-base font-medium text-slate-900">{item.q}</span>
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                          <ChevronDown
                            className={clsx(
                              'h-4 w-4 text-slate-500 transition-transform duration-200',
                              isOpen && 'rotate-180'
                            )}
                          />
                        </span>
                      </button>
                      {isOpen && (
                        <p className="whitespace-pre-line px-4 pb-5 text-sm leading-relaxed text-slate-500">
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

        {/* Contact support card */}
        {!query && (
        <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
            <p className="text-base font-bold text-slate-900">Still have a question?</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Can&apos;t find what you&apos;re looking for? Send us a message and we&apos;ll get back to you.
            </p>
            <button
              type="button"
              onClick={() => navigate('/settings/contact')}
              className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50 active:bg-slate-100"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <MessageCircle className="h-4 w-4" />
                Contact support
              </span>
              <span className="text-slate-400">→</span>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { Search, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { FaqAccordion } from '@/components/ui/FaqAccordion'
import { faqCategories } from '@/data/faqData'

export function FaqPage() {
  const navigate = useNavigate()
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
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 390 170"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g opacity="0.22" stroke="white" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <g transform="translate(200, 75) rotate(6, 65, 32) scale(1.35)">
              <rect x="0" y="0" width="130" height="65" strokeWidth="1.5" />
              <line x1="65" y1="0" x2="65" y2="65" strokeWidth="1.2" />
              <line x1="44.3" y1="0" x2="44.3" y2="65" strokeWidth="1.2" />
              <line x1="85.7" y1="0" x2="85.7" y2="65" strokeWidth="1.2" />
              <line x1="0" y1="32.5" x2="44.3" y2="32.5" strokeWidth="1.2" />
              <line x1="85.7" y1="32.5" x2="130" y2="32.5" strokeWidth="1.2" />
            </g>
          </g>

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
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">No results for &quot;{query}&quot;</p>
        )}

        {/* key={query} remounts FaqAccordion on each search, resetting open state */}
        <FaqAccordion key={query} categories={filtered} />

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

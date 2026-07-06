import { useState, useMemo, useRef, useEffect } from 'react'
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
  MessageCircle,
  Bug,
  Sparkles,
  ChevronRight,
  Feather,
  BookUser,
  Sprout,
} from 'lucide-react'
import { LoginPromptSheet } from '@/components'
import { useAuthStore } from '@/hooks'
import { PushNotificationBanner } from '@/components/PushNotificationBanner'
import { FaqAccordion } from '@/components/ui/FaqAccordion'
import { faqCategories } from '@/data/faqData'

export function HomePage() {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const { isAuthenticated } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
  }))
  const navigate = useNavigate()

  const homeFaqCategories = useMemo(
    () =>
      faqCategories
        .map((cat) => ({ ...cat, items: cat.items.filter((item) => item.showOnHome) }))
        .filter((cat) => cat.items.length > 0),
    []
  )

  const feedbackRef = useRef<HTMLElement>(null)

  useEffect(() => {
    return () => {
      // Cancel any in-progress smooth scroll on unmount to prevent BottomNav
      // from misrendering on iOS Safari during page transitions
      window.scrollTo({ top: window.scrollY, behavior: 'instant' as ScrollBehavior })
    }
  }, [])

  const handleIdentityClick = () => {
    setShowLoginPrompt(true)
  }

  const scrollToFeedback = () => {
    feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="relative min-h-[100dvh] bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="pointer-events-none absolute inset-x-0 top-0" />
      <div className="relative mx-auto flex w-full flex-col px-4">
        <div className="mb-4 flex w-full flex-col items-center">
          <img
            src={logo}
            alt="HopCourts"
            className="h-33 w-auto mb-2"
          />
          <button
            type="button"
            onClick={scrollToFeedback}
            className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-500 underline"
          >
            Beta
          </button>
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
                  <p className="mt-0.5 text-sm text-slate-500">
                    Stop copying and pasting endless attendance lists. Just set your game rules and move on.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Share once, zero chasing</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Drop your game link into any group chat. Mates secure their slots instantly without 47 follow-up
                    messages.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Split the costs, play more</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Hosting together means splitting the court fees. Gather your mates, share the costs, and play more
                    without breaking the bank.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Your next mates</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Played once? Check in to automatically save today's players for your next game.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Manifesto */}
          <section className="bg-courts -mx-4 mt-6 px-6 py-8">
            <blockquote className="text-[20px] font-extrabold italic leading-snug tracking-tight text-white">
              "A ball and a court should be enough. We're building the missing piece."
            </blockquote>
            <p className="mt-4 text-sm font-semibold text-white/80">— HopCourts Team</p>
          </section>

          {/* Common Questions */}
          <section className="-mx-4 bg-white px-4 py-8">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-2xl font-extrabold leading-tight text-slate-900">FAQ</h2>
              <button
                type="button"
                onClick={() => navigate('/faq')}
                className="text-courts-500 flex items-center gap-1 text-[12px] text-sm font-extrabold underline"
              >
                Read more
                <MoveUpRight
                  size={12}
                  strokeWidth={3}
                />
              </button>
            </div>
            <FaqAccordion categories={homeFaqCategories} />
          </section>

          {/* A Letter from the Founder & Community Guidelines */}
          <section className="bg-courts -mx-4 px-6 py-6">
            <h2 className="mb-4 text-2xl font-extrabold leading-tight text-white">Our Story &amp; Community</h2>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Sprout className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">About Us</p>
                  <p className="mt-0.5 text-xs text-slate-400">Who we are and why we built this.</p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-300" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/founders-letter')}
                className="flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm"
              >
                <div className="bg-ocean-100 text-ocean-600 flex h-10 w-10 items-center justify-center rounded-xl">
                  <Feather className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">A Letter from the Founder</p>
                  <p className="mt-0.5 text-xs text-slate-400">Why I built HopCourts</p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-300" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/guidelines')}
                className="flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm"
              >
                <div className="bg-courts-100 text-courts-600 flex h-10 w-10 items-center justify-center rounded-xl">
                  <BookUser className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Community Guidelines</p>
                  <p className="mt-0.5 text-xs text-slate-400">Play fair. Show respect. Have fun.</p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-300" />
              </button>
            </div>
          </section>

          {/* We're Listening */}
          <section
            ref={feedbackRef}
            className="my-8 w-full"
          >
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
                    bg: 'bg-green-100 text-green-500',
                    label: 'Report an issue',
                    sub: 'Something not working right?',
                    type: 'issue',
                  },
                  {
                    icon: <Sparkles className="h-5 w-5" />,
                    bg: 'bg-yellow-100 text-yellow-600',
                    label: 'Request a feature',
                    sub: "Got an idea? We'd love to hear it",
                    type: 'feature',
                  },
                ].map(({ icon, bg, label, sub, type }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => navigate(`/contact?type=${type}`)}
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

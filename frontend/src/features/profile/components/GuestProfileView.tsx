import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  PlusSquare,
  Bell,
  Bookmark,
  Rocket,
  Flag,
  Users,
  Smartphone,
  Lock,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import { useAuthStore } from '@/hooks'
import { HeroCard } from '@/features/profile/components/HeroCard'
import { ProfileEventsPanel } from '@/features/profile/components/ProfileEventsPanel'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'
import type { MateCardProps } from '@/features/mates/components/MateCard'
import logo from '@/assets/main-logo.png'

const CTA_DISMISSED_KEY = 'hopcourts.guest_cta_dismissed'

export function GuestProfileView() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [ctaDismissed, setCtaDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem(CTA_DISMISSED_KEY) === '1'
    } catch {
      return false
    }
  })
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const handleUpgrade = () => {
    setShowLoginPrompt(true)
  }

  const handleDismissCta = () => {
    setCtaDismissed(true)
    try {
      localStorage.setItem(CTA_DISMISSED_KEY, '1')
    } catch {}
  }

  const userName = (user as any)?.name
  const guestName = userName ? `${userName} (Guest)` : 'Guest'

  const guestProfile: MateCardProps = {
    name: guestName,
    username: '',
    vibe: null,
    vibeKey: null,
    vibeLabel: '',
    sports: [],
    trying: [],
    location: '',
    countryKey: '',
    blurb: '',
    avatar: '',
    gender: null,
    ageRangeKey: null,
    friendCount: 0,
    joinedCount: 0,
    hostedCount: 0,
  }

  return (
    <div className="min-h-[100dvh] overflow-y-auto pb-[120px]">
      <div className="mx-auto w-full max-w-4xl">
        <div className="relative flex items-center justify-between bg-white px-4 py-4">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Add game"
              onClick={handleUpgrade}
              className="text-muted inline-flex h-10 w-10 items-center justify-center rounded-xl"
            >
              <PlusSquare className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label="Saved events"
              onClick={handleUpgrade}
              className="text-muted inline-flex h-10 w-10 items-center justify-center rounded-xl"
            >
              <Bookmark className="h-6 w-6" />
            </button>
          </div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 w-[60%] -translate-x-1/2 -translate-y-1/2 px-2 text-center">
            <div className="flex w-full justify-center pb-3">
              <img
                src={logo}
                alt="HopCourts"
                className="h-14 w-auto"
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleUpgrade}
              aria-label="Notifications"
              className="text-muted inline-flex h-10 w-10 items-center justify-center rounded-full"
            >
              <Bell className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={handleUpgrade}
              aria-label="Menu"
              className="text-muted inline-flex h-10 w-10 items-center justify-center rounded-full bg-white"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        <HeroCard
          profile={guestProfile}
          showShare={false}
          placeholderMode
        />

        {!ctaDismissed && (
          <div className="bg-courts relative mx-3 mt-4 mb-0 rounded-3xl p-6 text-white">
            <button
              type="button"
              onClick={handleDismissCta}
              className="absolute right-4 top-4 text-xs font-medium underline text-emerald-100/70 transition hover:text-emerald-100"
            >
              Maybe later
            </button>
            <div className="flex items-end">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700/40">
                <Rocket className="h-5 w-5 text-emerald-300" />
              </div>
              <h2 className="mb-1 ml-2 mt-4 text-lg font-bold leading-tight">Lock in your spot, every time</h2>
            </div>

            <p className="mt-2 text-sm text-emerald-100/80">
              Right now, your account only lives on this device. Sign up to sync your progress anywhere.
            </p>

            <ul className="mt-5 space-y-2 text-sm">
              <CtaBullet
                icon={<Flag className="h-4 w-4" />}
                title="Host your own games"
                description="Pick a court, set the time, invite mates."
              />
              <CtaBullet
                icon={<Users className="h-4 w-4" />}
                title="Stay connected"
                description="Keep track of the people you’ve played with."
              />
              <CtaBullet
                icon={<Smartphone className="h-4 w-4" />}
                title="Switch devices"
                description="Access your account on your phone, tablet, or anywhere."
              />
            </ul>

            <section className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={handleUpgrade}
                className="bg-hop flex w-36 items-center justify-center rounded-full px-6 py-4 text-base font-bold text-white"
              >
                Hop in
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </section>
          </div>
        )}

        <div className="mt-4 px-3">
          <div className="mt-3 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xl font-semibold text-slate-700">Recent Activity</h3>
            </div>
            <ProfileEventsPanel
              mode="joined"
              showTimeTabs={false}
              viewMode="list"
              onExplore={() => navigate('/events')}
            />
          </div>
        </div>
      </div>

      <LoginPromptSheet
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  )
}

function CtaBullet({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-emerald-700/40 text-emerald-200">
        {icon}
      </div>
      <div className="text-sm leading-relaxed">
        <div className="font-semibold">{title}</div>
        <div className="text-emerald-100/80"> {description}</div>
      </div>
    </li>
  )
}

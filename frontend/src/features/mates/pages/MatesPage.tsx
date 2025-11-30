import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { MapPin, Sparkles } from 'lucide-react'
import { IntroSheet } from '@/components/IntroSheet'
import { BottomSheet } from '@/components/BottomSheet'
import GoogleLoginButton from '@/components/button/GoogleLoginButton'
import AppleLoginButton from '@/components/button/AppleLoginButton'
import { useAuthStore } from '@/hooks'
import { signInWithApple, signInWithGoogle } from '@/services/authService'
import { MateCard, type MateCardProps } from '../components/MateCard'

const mates: MateCardProps[] = [
  {
    name: 'Jamie Thompson',
    flag: '🇦🇺',
    vibe: 'Social',
    sports: ['Basketball', 'Touch footy', 'Running'],
    trying: ['Pickleball', 'Bouldering'],
    location: 'Brisbane',
    blurb: 'Here for good banter, easy pace, and a crew to play with after work.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-amber-50 via-white to-white',
  },
  {
    name: 'Maia Rangi',
    flag: '🇳🇿',
    vibe: 'Chill',
    sports: ['Basketball', 'Rugby touch', 'Hiking'],
    trying: ['Indoor climbing', 'Social running'],
    location: 'Brisbane',
    blurb: 'I’m happiest when it’s friendly, outdoors, and with easygoing people.',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-sky-50 via-white to-white',
  },
  {
    name: 'Oliver Shaw',
    flag: '🇬🇧',
    vibe: 'Social',
    sports: ['Cricket nets', '5k runs', 'Gym'],
    trying: ['Tennis', 'Pilates'],
    location: 'Brisbane',
    blurb: 'A good chat and a steady run are all I need to feel settled.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-slate-100 via-white to-white',
  },
  {
    name: 'Riya Nair',
    flag: '🇮🇳',
    vibe: 'Competitive',
    sports: ['Badminton', 'Cricket', '5k runs'],
    trying: ['Ultimate frisbee', 'Strength training'],
    location: 'Brisbane',
    blurb: 'I love tight rallies, tough games, and meeting anyone who hustles hard.',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-rose-50 via-white to-white',
  },
  {
    name: 'Chen Li',
    flag: '🇨🇳',
    vibe: 'Chill',
    sports: ['Badminton', 'Table tennis', 'Yoga'],
    trying: ['Bouldering', 'Light running'],
    location: 'Brisbane',
    blurb: 'I like calm sessions that leave me feeling balanced and clear.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-lime-50 via-white to-white',
  },
  {
    name: 'Jana Cruz',
    flag: '🇵🇭',
    vibe: 'Social',
    sports: ['Volleyball', 'Badminton', 'Dance fitness'],
    trying: ['Pickleball', 'Gym'],
    location: 'Brisbane',
    blurb: 'I show up for the laughs, the energy, and the people.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-orange-50 via-white to-white',
  },
  {
    name: 'Thabo Mbeki',
    flag: '🇿🇦',
    vibe: 'Competitive',
    sports: ['Rugby touch', 'Cricket', 'Trail running'],
    trying: ['Cross-training', 'Indoor climbing'],
    location: 'Brisbane',
    blurb: 'Give me a fast game, good intensity, and players who push me.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-emerald-50 via-white to-white',
  },
  {
    name: 'Linh Do',
    flag: '🇻🇳',
    vibe: 'Chill',
    sports: ['Badminton', 'Walking', 'Yoga'],
    trying: ['Light running', 'Pilates'],
    location: 'Brisbane',
    blurb: 'I enjoy slow, steady sessions that help me unwind.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-purple-50 via-white to-white',
  },
  {
    name: 'Emily Chen',
    flag: '🇹🇼',
    vibe: 'Social',
    sports: ['Basketball', 'Gym', 'Hiking'],
    trying: ['Pickleball', 'Bouldering'],
    location: 'Brisbane',
    blurb: 'Just looking for people who move at a similar pace.',
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-cyan-50 via-white to-white',
  },
  {
    name: 'Adrian Law',
    flag: '🇭🇰',
    vibe: 'Social',
    sports: ['Running', 'Hiking', 'Badminton'],
    trying: ['Pickleball', 'Gym'],
    location: 'Brisbane',
    blurb: 'I like active days with good views, good sweat, and good company.',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-blue-50 via-white to-white',
  },
  {
    name: 'Minseo Park',
    flag: '🇰🇷',
    vibe: 'Flow',
    sports: ['Pilates', 'Gym', 'Badminton'],
    trying: ['Yoga', 'Social running'],
    location: 'Brisbane',
    blurb: 'I love moving in ways that feel light, focused, and steady.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-indigo-50 via-white to-white',
  },
  {
    name: 'Arjun KC',
    flag: '🇳🇵',
    vibe: 'Competitive',
    sports: ['Cricket', 'Running', 'Hiking'],
    trying: ['Gym', 'Badminton'],
    location: 'Brisbane',
    blurb: 'I’m driven by effort — I like teammates who don’t quit early.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-amber-100 via-white to-white',
  },
]

export function MatesPage() {
  const city = 'Brisbane'
  const [showIntroSheet, setShowIntroSheet] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const seen = window.localStorage.getItem('sportsmatch_mates_intro_v1') === 'dismissed'
    if (!seen) setShowIntroSheet(true)
  }, [])

  const loginGoogle = async () => {
    const { data, error } = await signInWithGoogle()
    if (error) {
      alert(error.message)
      return
    }
    if (data?.url) window.location.href = data.url
  }

  const loginApple = async () => {
    const { data, error } = await signInWithApple()
    if (error) {
      alert(error.message)
      return
    }
    if (data?.url) window.location.href = data.url
  }

  const handleCloseIntro = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('sportsmatch_mates_intro_v1', 'dismissed')
    }
    setShowIntroSheet(false)
  }

  const scrollToIndex = (idx: number) => {
    const container = listRef.current
    if (!container) return
    const children = Array.from(container.children) as HTMLElement[]
    if (!children[idx]) return
    container.scrollTo({ left: children[idx].offsetLeft, behavior: 'smooth' })
    setActiveIndex(idx)
  }

  const handleDraftClick = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }
    // TODO: route to mate card creation when ready
  }

  useEffect(() => {
    const container = listRef.current
    if (!container) return
    const handleScroll = () => {
      const children = Array.from(container.children) as HTMLElement[]
      if (!children.length) return
      const nearest = children.reduce(
        (best, child, idx) => {
          const distance = Math.abs(child.offsetLeft - container.scrollLeft)
          return distance < best.distance ? { index: idx, distance } : best
        },
        { index: 0, distance: Number.POSITIVE_INFINITY }
      )
      setActiveIndex(nearest.index)
    }
    handleScroll()
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const container = listRef.current
    if (!container) return
    const children = Array.from(container.children) as HTMLElement[]
    if (!children.length) return
    const timeout = window.setTimeout(() => {
      if (activeIndex >= mates.length - 1) return
      const next = activeIndex + 1
      container.scrollTo({ left: children[next].offsetLeft, behavior: 'smooth' })
    }, 3000)
    return () => window.clearTimeout(timeout)
  }, [activeIndex])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 via-white to-white pb-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-100/40 via-white to-transparent" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pt-6">
        <div className="flex justify-center">
          <button
            type="button"
            className="flex w-full max-w-2xl items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-md shadow-blue-100/40 transition hover:shadow-lg"
          >
            <MapPin className="h-5 w-5 text-blue-500" strokeWidth={2.2} aria-hidden="true" />
            <div className="flex flex-1 items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-base font-semibold text-slate-900">{city}</span>
                <span className="text-xs font-medium text-slate-500">Starting market</span>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                Coming soon
              </div>
            </div>
          </button>
        </div>

        <header className="flex flex-col gap-1.5 text-center">
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-slate-900">
            Find Your Sport Identity
          </h1>
          <p className="text-sm text-slate-600">
            Everyone starts somewhere. Explore the vibes and meet the people moving near you.
          </p>
        </header>

        <section className="pb-4">
          <div
            ref={listRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory [-ms-overflow-style:'none'] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {mates.map((mate) => (
              <MateCard key={mate.name} {...mate} />
            ))}
          </div>
          <div className="mt-3 flex justify-center gap-2">
            {mates.map((mate, idx) => (
              <button
                key={mate.name}
                type="button"
                onClick={() => scrollToIndex(idx)}
                className={clsx(
                  'h-2 w-2 rounded-full transition',
                  activeIndex === idx ? 'bg-blue-600' : 'bg-slate-300'
                )}
                aria-label={`Go to card ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-100 bg-white/80 p-6 text-center shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-900">Start your own identity</h2>
          <p className="text-sm text-slate-600">
            Share your vibe, list your go-to sports, and find people who match your pace.
          </p>
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            onClick={handleDraftClick}
          >
            Draft your mate card
          </button>
        </section>
      </div>

      <IntroSheet
        open={showIntroSheet}
        onClose={handleCloseIntro}
        description={
          'SportsMatch helps you find people who play like you — not just events.'
        }
        dismissLabel={null}
      />

      <BottomSheet
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        showHandle={false}
        sheetClassName="rounded-t-[44px] border border-white/50 bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
        contentClassName="px-6 pb-8 pt-10 text-center text-slate-900"
        maxWidthClassName="max-w-xl"
      >
        <div className="relative space-y-4">
          <button
            type="button"
            onClick={() => setShowLoginPrompt(false)}
            className="absolute right-0 top-0 -mr-1 -mt-6 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:text-slate-700"
            aria-label="Close"
          >
            ×
          </button>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Save your sport identity</h2>
            <p className="text-sm text-slate-600">
              We&apos;ll help you discover your vibe and find your crew — all in one place.
            </p>
          </div>

          <div className="space-y-3">
            <AppleLoginButton loginApple={loginApple} />
            <GoogleLoginButton loginGoogle={loginGoogle} />
            <button
              type="button"
              className="w-full text-sm font-semibold text-blue-600 underline-offset-4 hover:underline"
              onClick={() => {
                setShowLoginPrompt(false)
                window.location.href = '/login?email=alison.wu23@gmail.com'
              }}
            >
              Use email instead
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}

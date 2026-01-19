import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { MapPin } from 'lucide-react'
import { IntroSheet } from '@/components/IntroSheet'
import { BottomSheet } from '@/components/BottomSheet'
import GoogleLoginButton from '@/components/button/GoogleLoginButton'
import AppleLoginButton from '@/components/button/AppleLoginButton'
import { useAuthStore } from '@/hooks'
import { signInWithApple, signInWithGoogle } from '@/services/authService'
import { MateCard, type MateCardProps } from '@/features/mates/components/MateCard'

const mates: MateCardProps[] = [
  {
    name: '楊子禎',
    flag: '🇹🇼',
    vibe: 'Chill',
    sports: ['慢跑', '瑜珈', '伸展'],
    trying: ['太極', '徒步登山'],
    location: '台北 · 松山',
    blurb: '運動不是拼命，是讓心跟身體慢慢對齊。',
    avatar:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-sky-50 via-white to-white',
  },
  {
    name: '林語庭',
    flag: '🇹🇼',
    vibe: 'Social',
    sports: ['羽球', '瑜珈', '健身房團課'],
    trying: ['皮拉提斯', '攀岩'],
    location: '台北 · 中山',
    blurb: '我運動是為了遇到夥伴，累了也有人一起笑。',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-amber-50 via-white to-white',
  },
  {
    name: '蘇靖安',
    flag: '🇹🇼',
    vibe: 'Flow',
    sports: ['健身房', '跑步機', '瑜珈'],
    trying: ['皮拉提斯', '間歇跑'],
    location: '台北 · 南港',
    blurb: '每天動一點，不知不覺就變成自己的節奏。',
    avatar:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-pink-50 via-white to-white',
  },
  {
    name: '廖若儀',
    flag: '🇹🇼',
    vibe: 'Explorer',
    sports: ['登山', '騎車', '路跑'],
    trying: ['溯溪', '攀岩', 'SUP'],
    location: '台北 · 士林',
    blurb: '我就是喜歡說走就走的那種快感。',
    avatar:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-cyan-50 via-white to-white',
  },
  {
    name: '吳柏恩',
    flag: '🇹🇼',
    vibe: 'Growth',
    sports: ['羽球', '網球', '核心訓練'],
    trying: ['鐵人三項', '壁球'],
    location: '台北 · 文山',
    blurb: '我喜歡學新動作的瞬間——那是我真的在進步。',
    avatar:
      'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-purple-50 via-white to-white',
  },
  {
    name: '張恩均',
    flag: '🇹🇼',
    vibe: 'Supportive',
    sports: ['慢跑', '健走', '輕鬆羽球'],
    trying: ['游泳', '攀岩'],
    location: '台北 · 內湖',
    blurb: '我喜歡陪朋友一起動，就算慢一點也沒關係。',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-lime-50 via-white to-white',
  },
  {
    name: '蘇靖安',
    flag: '🇹🇼',
    vibe: 'Flow',
    sports: ['健身房', '跑步機', '瑜珈'],
    trying: ['皮拉提斯', '間歇跑'],
    location: '台北 · 南港',
    blurb: '每天動一點，不知不覺就變成自己的節奏。',
    avatar:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80',
    accentClassName: 'bg-gradient-to-br from-pink-50 via-white to-white',
  },
]

export function HomePage() {
  const city = '大台北'
  const [showIntroSheet, setShowIntroSheet] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const { isAuthenticated, onboardingStatus } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    onboardingStatus: state.onboardingStatus,
  }))
  const navigate = useNavigate()

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
    navigate('/onboarding')
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
      container.scrollTo({
        left: children[next].offsetLeft,
        behavior: 'smooth',
      })
    }, 3000)
    return () => window.clearTimeout(timeout)
  }, [activeIndex])

  return (
    <div className="relative min-h-screen bg-white pb-24">
      <div className="pointer-events-none absolute inset-x-0 top-0" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pt-4">
        <section className="-mb-2 space-y-4">
          <div className="flex justify-center">
            <button
              type="button"
              className="flex w-full max-w-2xl items-center gap-3 rounded-full border bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-md shadow-blue-100/40 transition hover:shadow-lg"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <MapPin
                className="h-5 w-5"
                strokeWidth={2.2}
                aria-hidden="true"
                color="var(--color-primary)"
              />
              <div className="flex flex-1 items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-slate-900">{city}</span>
                  <span className="text-xs font-medium text-slate-500">目前所在城市</span>
                </div>
              </div>
            </button>
          </div>
        </section>

        <div className="">
          <header className="flex flex-col gap-1.5 pb-4 pt-4 text-center">
            <h1 className="text-[26px] font-bold leading-tight tracking-tight text-slate-900">
              找到你的運動樣子
            </h1>
            <p className="text-sm text-slate-600">從這裡開始，看看附近的氛圍與夥伴。</p>
          </header>

          <section className="pb-12">
            <div
              ref={listRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto [-ms-overflow-style:'none'] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {mates.map((mate, idx) => (
                <MateCard key={`${mate.name}-${idx}`} {...mate} />
              ))}
            </div>
            <div className="mt-3 flex justify-center gap-2">
              {mates.map((mate, idx) => (
                <button
                  key={`${mate.name}-${idx}`}
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
            <h2 className="text-lg font-semibold text-slate-900">建立你的運動身份卡</h2>
            <p className="text-sm text-slate-600">分享你的氛圍與喜好的運動，找到步調相近的夥伴。</p>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition"
              style={{ background: 'var(--gradient-secondary)' }}
              onClick={handleDraftClick}
            >
              建立運動身份卡
            </button>
          </section>
        </div>
      </div>

      <IntroSheet
        open={showIntroSheet}
        onClose={handleCloseIntro}
        description={'SportsMatch 讓你用運動身份找到步調相近的人，不只是報名活動。'}
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
            <h2 className="text-2xl font-bold text-slate-900">先登入，建立你的運動身份</h2>
            <p className="text-sm text-slate-600">
              建立運動卡後，你會看到附近的氛圍與適合一起動的人。
            </p>
          </div>

          <div className="space-y-3">
            <GoogleLoginButton loginGoogle={loginGoogle} />
            <AppleLoginButton loginApple={loginApple} />
            <button
              type="button"
              className="w-full text-sm font-semibold text-blue-600 underline-offset-4 hover:underline"
              onClick={() => {
                setShowLoginPrompt(false)
                window.location.href = '/login?email=alison.wu23@gmail.com'
              }}
            >
              改用 Email 登入
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}

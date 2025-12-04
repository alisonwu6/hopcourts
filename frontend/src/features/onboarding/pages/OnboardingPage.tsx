import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MateCard } from '@/features/mates/components/MateCard'
import { vibeTokens, type Vibe, vibeList } from '@/constants/vibeTokens'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

type Step = 'Vibe' | 'Sports' | 'Trying' | 'Country' | 'Bio' | 'Preview'

const steps: Step[] = ['Vibe', 'Sports', 'Trying', 'Country', 'Bio', 'Preview']

const sportOptions = [
  'Basketball',
  'Running',
  'Gym',
  'Badminton',
  'Pickleball',
  'Soccer',
  'Pilates',
  'Yoga',
  'Tennis',
  'Swimming',
  'Cycling',
  'Boxing',
  'Climbing',
  'Bouldering',
  'HIIT',
  'CrossFit',
  'Table tennis',
  'Volleyball',
  'Beach volleyball',
  'Hiking',
  'Trail running',
  'Rowing',
  'Surfing',
  'Skate',
  'Padel',
  'Rugby',
  'Cricket',
  'Ultimate frisbee',
  'Dodgeball',
  'I am just getting started',
] as const

const tryingOptions = ['Not sure yet', ...sportOptions]

const countryOptions = [
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'New Zealand', flag: '🇳🇿' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'Ireland', flag: '🇮🇪' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Spain', flag: '🇪🇸' },
  { name: 'Italy', flag: '🇮🇹' },
  { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'Sweden', flag: '🇸🇪' },
  { name: 'Norway', flag: '🇳🇴' },
  { name: 'Finland', flag: '🇫🇮' },
  { name: 'Denmark', flag: '🇩🇰' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'South Korea', flag: '🇰🇷' },
  { name: 'China', flag: '🇨🇳' },
  { name: 'Taiwan', flag: '🇹🇼' },
  { name: 'India', flag: '🇮🇳' },
  { name: 'Singapore', flag: '🇸🇬' },
  { name: 'Hong Kong', flag: '🇭🇰' },
  { name: 'Philippines', flag: '🇵🇭' },
  { name: 'Malaysia', flag: '🇲🇾' },
  { name: 'Vietnam', flag: '🇻🇳' },
  { name: 'Thailand', flag: '🇹🇭' },
  { name: 'Indonesia', flag: '🇮🇩' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'Argentina', flag: '🇦🇷' },
] as const

const withAlpha = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [vibe, setVibe] = useState<Vibe | null>(null)
  const [sports, setSports] = useState<string[]>([])
  const [trying, setTrying] = useState<string[]>([])
  const [country, setCountry] = useState<{ name: string; flag: string } | null>(
    null
  )
  const [bio, setBio] = useState('')
  const [countrySearch, setCountrySearch] = useState('')
  const [sportsSearch, setSportsSearch] = useState('')
  const [tryingSearch, setTryingSearch] = useState('')
  const sportsDisplayCount = sports.includes('I am just getting started')
    ? 0
    : sports.length
  const tryingDisplayCount = trying.includes('Not sure yet') ? 0 : trying.length

  const currentStep = steps[stepIndex]
  const neutralAccent = {
    bg: 'linear-gradient(135deg, #e5ecf5 0%, #eef2f7 100%)',
    text: '#1E293B',
    ring: '#cbd5e1',
    card: 'linear-gradient(145deg, rgba(226,232,240,0.18) 0%, rgba(226,232,240,0.08) 100%)',
  }
  const accent = vibe ? vibeTokens[vibe] : neutralAccent

  const progress = useMemo(
    () => ((stepIndex + 1) / steps.length) * 100,
    [stepIndex]
  )

  const toggleSport = (item: string) => {
    setSports((prev) => {
      if (item === 'I am just getting started') {
        return ['I am just getting started']
      }
      const cleaned = prev.filter((s) => s !== 'I am just getting started')
      if (cleaned.includes(item)) return cleaned.filter((s) => s !== item)
      if (cleaned.length >= 3) return cleaned
      return [...cleaned, item]
    })
  }

  const toggleTrying = (item: string) => {
    setTrying((prev) => {
      if (prev.includes(item)) return prev.filter((s) => s !== item)
      if (item === 'Not sure yet') {
        return prev.includes(item) ? [] : ['Not sure yet']
      }
      const cleaned = prev.filter((s) => s !== 'Not sure yet')
      if (cleaned.includes(item)) return cleaned.filter((s) => s !== item)
      if (cleaned.length >= 2) return cleaned
      return [...cleaned, item]
    })
  }

  const nextDisabled = (() => {
    switch (currentStep) {
      case 'Vibe':
        return !vibe
      case 'Sports':
        return sports.length === 0
      case 'Trying':
        return false
      case 'Country':
        return !country
      case 'Bio':
        return bio.trim().length === 0
      default:
        return false
    }
  })()

  const goNext = () => {
    if (stepIndex < steps.length - 1) setStepIndex((s) => s + 1)
    else navigate('/')
  }

  const goBack = () => {
    if (stepIndex > 0) setStepIndex((s) => s - 1)
  }

  const previewCard = {
    name: 'Jamie Thompson',
    flag: country?.flag ?? '🇦🇺',
    vibe: (vibe ?? 'Social') as Vibe,
    sports: sports.length ? sports : ['Pilates', 'Gym', 'Badminton'],
    trying: trying.length ? trying : ['Yoga', 'Social running'],
    location: 'Brisbane',
    blurb: bio,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
  }

  const filteredCountries = useMemo(() => {
    const term = countrySearch.trim().toLowerCase()
    if (!term) return countryOptions
    return countryOptions.filter((c) => c.name.toLowerCase().startsWith(term))
  }, [countrySearch])

  const filteredSports = useMemo(() => {
    const term = sportsSearch.trim().toLowerCase()
    const ordered = [...sportOptions].sort((a, b) => {
      if (a === 'I am just getting started') return -1
      if (b === 'I am just getting started') return 1
      return 0
    })
    if (!term) return ordered
    return ordered.filter((s) => s.toLowerCase().startsWith(term))
  }, [sportsSearch])

  const filteredTrying = useMemo(() => {
    const term = tryingSearch.trim().toLowerCase()
    if (!term) return tryingOptions
    return tryingOptions.filter((s) => s.toLowerCase().startsWith(term))
  }, [tryingSearch])

  return (
    <div>
      <ActionToolbar
        onBack={() => navigate(-1)}
        showFavorite={false}
        showShare={false}
        borderBottom={false}
        title={null}
        contentClassName="max-w-3xl px-0"
      />

      <div
        className="min-h-screen px-4 pb-12 pt-6"
        style={{
          background: 'linear-gradient(180deg, #eef2f7 0%, #f9fbff 100%)',
        }}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="h-1.5 w-full rounded-full bg-slate-200">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${progress}%`, background: accent.ring }}
              />
            </div>
            <div className="text-sm font-semibold text-slate-500">
              {currentStep}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold leading-tight text-slate-900">
                {currentStep === 'Vibe' && "What's your main vibe right now?"}
                {currentStep === 'Sports' && 'Sports you actually play'}
                {currentStep === 'Trying' && 'What do you want to try next?'}
                {currentStep === 'Country' && 'Where do you call home?'}
                {currentStep === 'Bio' && 'One line about why you move'}
                {currentStep === 'Preview' && 'Your mate card preview'}
              </h1>
              <p className="text-base text-slate-600">
                {currentStep === 'Vibe' &&
                  "Just how you'd describe yourself this month — you can always change it."}
                {currentStep === 'Sports' &&
                  'Pick up to 3 — the ones you say yes to most weeks.'}
                {currentStep === 'Trying' &&
                  'Pick up to 2 — it helps people invite you to the right sessions.'}
                {currentStep === 'Country' &&
                  'We use your flag to help you feel at home while you settle into Brisbane’s sport communities.'}
                {currentStep === 'Bio' &&
                  'This shows on your mate card. Keep it honest, keep it short.'}
                {currentStep === 'Preview' &&
                  'This is how others will see you on SportsMatch.'}
              </p>
            </div>
          </div>

          {currentStep === 'Vibe' && (
            <div className="space-y-3">
              {vibeList.map((item) => {
                const selected = vibe === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setVibe(item.id)}
                    className={clsx(
                      'w-full rounded-2xl border px-4 py-4 text-left shadow-sm transition',
                      selected
                        ? 'border-transparent shadow-[0_12px_30px_-18px_rgba(0,0,0,0.3)]'
                        : 'border-slate-200 bg-white/90 hover:bg-white'
                    )}
                    style={
                      selected
                        ? { background: withAlpha(accent.ring, 0.16) }
                        : undefined
                    }
                  >
                    <div className="text-lg font-semibold text-slate-900">
                      {item.title}
                    </div>
                    <div className="text-sm text-slate-600">
                      {item.subtitle}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {currentStep === 'Sports' && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-500">
                {sportsDisplayCount}/3 selected
              </div>
              {sports.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {sports.map((sport) => (
                    <span
                      key={sport}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200"
                    >
                      {sport}
                      <button
                        type="button"
                        className="text-slate-500 hover:text-slate-700"
                        onClick={() => toggleSport(sport)}
                        aria-label={`Remove ${sport}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                <input
                  type="text"
                  value={sportsSearch}
                  onChange={(e) => setSportsSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="Search sports..."
                />
              </div>
              <div className="flex max-h-96 flex-col gap-3 overflow-y-auto pr-1">
                {filteredSports.map((sport) => {
                  const selected = sports.includes(sport)
                  return (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => toggleSport(sport)}
                      className={clsx(
                        'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition',
                        selected
                          ? 'border-transparent shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      )}
                      style={
                        selected
                          ? {
                              background: withAlpha(accent.ring, 0.14),
                              boxShadow: `0 8px 20px -14px ${accent.ring}`,
                            }
                          : undefined
                      }
                    >
                      <span className="text-sm font-semibold text-slate-900">
                        {sport}
                      </span>
                      {selected && (
                        <span className="text-xs font-semibold text-slate-600">
                          ✓
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {currentStep === 'Trying' && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-500">
                {tryingDisplayCount}/2 selected
              </div>
              {trying.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {trying.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200"
                    >
                      {item}
                      <button
                        type="button"
                        className="text-slate-500 hover:text-slate-700"
                        onClick={() => toggleTrying(item)}
                        aria-label={`Remove ${item}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                <input
                  type="text"
                  value={tryingSearch}
                  onChange={(e) => setTryingSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="Search things to try..."
                />
              </div>
              <div className="flex max-h-96 flex-col gap-3 overflow-y-auto pr-1">
                {filteredTrying.map((item) => {
                  const selected = trying.includes(item)
                  const isNotSure = item === 'Not sure yet'
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleTrying(item)}
                      className={clsx(
                        'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition',
                        selected
                          ? 'border-transparent shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      )}
                      style={
                        selected
                          ? {
                              background: withAlpha(accent.ring, 0.14),
                              boxShadow: `0 8px 20px -14px ${accent.ring}`,
                            }
                          : undefined
                      }
                    >
                      <span className="text-sm font-semibold text-slate-900">
                        {item}
                      </span>
                      {selected && (
                        <span className="text-xs font-semibold text-slate-600">
                          ✓
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {currentStep === 'Country' && (
            <div className="space-y-4">
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="Search your country..."
                />
              </div>
              <div className="flex max-h-96 flex-col gap-3 overflow-y-auto pr-1">
                {filteredCountries.map((item) => {
                  const selected = country?.name === item.name
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setCountry(item)}
                      className={clsx(
                        'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition',
                        selected
                          ? 'border-transparent shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      )}
                      style={
                        selected
                          ? {
                              background: withAlpha(accent.ring, 0.14),
                              boxShadow: `0 8px 20px -14px ${accent.ring}`,
                            }
                          : undefined
                      }
                    >
                      <span className="text-lg font-semibold text-slate-900">
                        {item.name}
                      </span>
                      <span
                        className="text-xl"
                        aria-hidden="true"
                      >
                        {item.flag}
                      </span>
                    </button>
                  )
                })}
                {filteredCountries.length === 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                    No matches found
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 'Bio' && (
            <div className="space-y-4">
              <textarea
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                rows={4}
                maxLength={120}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="I move to feel grounded and find my crew wherever I land."
              />
              <div className="text-right text-xs text-slate-500">
                {bio.length}/120
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
                onClick={() =>
                  setBio(
                    'I move to feel grounded and find my crew wherever I land.'
                  )
                }
              >
                Generate for me
              </button>
            </div>
          )}

          {currentStep === 'Preview' && (
            <MateCard
              name={previewCard.name}
              flag={previewCard.flag}
              vibe={previewCard.vibe}
              sports={previewCard.sports}
              trying={previewCard.trying}
              location={previewCard.location}
              blurb={previewCard.blurb}
              avatar={previewCard.avatar}
            />
          )}

          <div className="mt-2 flex items-center justify-between gap-3">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            ) : null}
            <button
              type="button"
              onClick={goNext}
              disabled={nextDisabled}
              className={clsx(
                'flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60',
                stepIndex === 0 ? 'w-full' : 'flex-1',
                nextDisabled ? 'bg-slate-200 text-slate-500' : undefined
              )}
              style={nextDisabled ? undefined : { background: accent.ring }}
            >
              {currentStep === 'Preview' ? 'Save my mate card' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

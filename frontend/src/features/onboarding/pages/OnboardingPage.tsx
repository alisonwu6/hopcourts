import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { ChevronLeft, ChevronRight, Lock, IdCard } from 'lucide-react'
import { MateCard } from '@/features/mates/components/MateCard'
import { vibeTokens, type Vibe, vibeList } from '@/constants/vibeTokens'
import { useSports } from '@/features/sports/hooks/useSports'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { useAuthStore } from '@/hooks'
import {
  useAgeRanges,
  useCities,
  useCountries,
  useVibes,
} from '@/features/dictionaries/hooks'

type Step =
  | 'Vibe'
  | 'Sports'
  | 'Trying'
  | 'Country'
  | 'City'
  | 'Bio'
  | 'Info'
  | 'Preview'
type TimeSlot = '早上' | '下午' | '晚上'
type CityOption = { id: string; label: string }
type AgeRangeOption = { id: string; label: string }

const steps: Step[] = [
  'Vibe',
  'Sports',
  'Trying',
  'Country',
  'City',
  'Bio',
  'Info',
  'Preview',
]

const dayLabels: Record<string, string> = {
  Monday: '週一',
  Tuesday: '週二',
  Wednesday: '週三',
  Thursday: '週四',
  Friday: '週五',
  Saturday: '週六',
  Sunday: '週日',
}
const daysList = Object.keys(dayLabels)
const createDaySlots = () =>
  daysList.reduce<Record<string, TimeSlot[]>>((acc, day) => {
    acc[day] = []
    return acc
  }, {})

type SportChoiceOption = { id: string; label: string }
const stepColors = [
  '#ef4444',
  '#f97316',
  '#facc15',
  '#22c55e',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#8b5cf6',
]
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
  const { user } = useAuthStore()
  const [stepIndex, setStepIndex] = useState(0)
  const [vibe, setVibe] = useState<Vibe | null>(null)
  const [sports, setSports] = useState<string[]>([])
  const [trying, setTrying] = useState<string[]>([])
  const [country, setCountry] = useState<string>('')
  const [city, setCity] = useState('')
  const [bio, setBio] = useState('')
  const [countrySearch, setCountrySearch] = useState('')
  const [sportsSearch, setSportsSearch] = useState('')
  const [tryingSearch, setTryingSearch] = useState('')
  const [username, setUsername] = useState('')
  const [realName, setRealName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [preferredTime, setPreferredTime] = useState<TimeSlot | null>(null)
  const [daySlots, setDaySlots] = useState<Record<string, TimeSlot[]>>(
    createDaySlots()
  )
  const [furthestStep, setFurthestStep] = useState(0)
  const [ageRange, setAgeRange] = useState<string>('')
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(true)
  const { sports: sportsCatalog } = useSports('zh')
  const { items: countries } = useCountries('zh')
  const { items: cities } = useCities(country, 'zh')
  const { items: vibes } = useVibes('zh')
  const { items: ageRanges } = useAgeRanges('zh')
  const sportChoiceOptions = useMemo<SportChoiceOption[]>(
    () => sportsCatalog.map(({ key, label }) => ({ id: key, label })),
    [sportsCatalog]
  )
  const favOptions = useMemo<SportChoiceOption[]>(
    () => [{ id: 'just-started', label: '探索中' }, ...sportChoiceOptions],
    [sportChoiceOptions]
  )
  const tryingOptions = useMemo<SportChoiceOption[]>(
    () => [{ id: 'no-idea', label: '探索中' }, ...sportChoiceOptions],
    [sportChoiceOptions]
  )
  const starterOption = favOptions.find((item) => item.id === 'just-started')
  const starterId = starterOption?.id ?? 'just-started'
  const starterLabel = starterOption?.label ?? '我剛開始運動'
  const unsureId = 'unsure'
  const noIdeaId = 'no-idea'
  const uniqueSports = useMemo(() => Array.from(new Set(sports)), [sports])
  const uniqueTrying = useMemo(() => Array.from(new Set(trying)), [trying])
  const sportsDisplayCount = uniqueSports.includes(starterId)
    ? 0
    : uniqueSports.length
  const tryingDisplayCount = uniqueTrying.some(
    (id) => id === unsureId || id === noIdeaId
  )
    ? 0
    : uniqueTrying.length

  const currentStep = steps[stepIndex]
  const neutralAccent = {
    bg: 'linear-gradient(135deg, #e5ecf5 0%, #eef2f7 100%)',
    text: '#1E293B',
    ring: '#cbd5e1',
    card: 'linear-gradient(145deg, rgba(226,232,240,0.18) 0%, rgba(226,232,240,0.08) 100%)',
  }
  const accent = vibe ? vibeTokens[vibe] : neutralAccent

  const sportOptionMap = useMemo(
    () => new Map(favOptions.map((item) => [item.id, item])),
    [favOptions]
  )
  const tryingOptionMap = useMemo(
    () => new Map(tryingOptions.map((item) => [item.id, item])),
    [tryingOptions]
  )
  const selectedSportsLabels = uniqueSports
    .map((id) => sportOptionMap.get(id)?.label)
    .filter(Boolean) as string[]
  const selectedTryingLabels = uniqueTrying
    .map((id) => tryingOptionMap.get(id)?.label)
    .filter(Boolean) as string[]

  const progress = useMemo(
    () => (furthestStep === 0 ? 0 : ((stepIndex + 1) / steps.length) * 100),
    [stepIndex, furthestStep]
  )
  useEffect(() => {
    setFurthestStep((prev) => Math.max(prev, stepIndex))
  }, [stepIndex])

  useEffect(() => {
    // Scroll back to top when step changes to keep context clear on mobile
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    })
  }, [stepIndex])

  const toggleSport = (itemId: string) => {
    setSports((prev) => {
      if (itemId === starterId) {
        return [starterId]
      }
      const cleaned = prev.filter((s) => s !== starterId)
      const isSelected = cleaned.includes(itemId)
      if (isSelected) {
        return cleaned.filter((s) => s !== itemId)
      }
      if (cleaned.length >= 3) return cleaned
      setTrying((prevTrying) => prevTrying.filter((id) => id !== itemId))
      return [...cleaned, itemId]
    })
  }

  const toggleTrying = (itemId: string) => {
    setTrying((prev) => {
      const isPlaceholder = itemId === unsureId || itemId === noIdeaId
      const isSelected = prev.includes(itemId)
      if (isSelected) return prev.filter((s) => s !== itemId)
      if (isPlaceholder) {
        return [itemId]
      }
      const cleaned = prev.filter((s) => s !== unsureId && s !== noIdeaId)
      if (cleaned.includes(itemId)) return cleaned.filter((s) => s !== itemId)
      if (cleaned.length >= 2) return cleaned
      setSports((prevSports) => prevSports.filter((id) => id !== itemId))
      return [...cleaned, itemId]
    })
  }

  const nextDisabled = (() => {
    switch (currentStep) {
      case 'Vibe':
        return !vibe
      case 'Sports':
        return sports.length === 0
      case 'Trying':
        return trying.length === 0
      case 'Country':
        return !country
      case 'City':
        return city.trim().length === 0
      case 'Bio':
        return bio.trim().length === 0
      case 'Info':
        return (
          displayName.trim().length === 0 ||
          username.trim().length === 0 ||
          realName.trim().length === 0 ||
          preferredTime === null ||
          ageRange.trim().length === 0
        )
      default:
        return false
    }
  })()

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    setSaveError(null)
    navigate('/')
    setSaving(false)
  }

  const goNext = () => {
    if (stepIndex < steps.length - 1) setStepIndex((s) => s + 1)
    else handleSave()
  }

  const goBack = () => {
    if (stepIndex > 0) setStepIndex((s) => s - 1)
  }

  const keyToVibe: Record<string, Vibe> = {
    CHILL: 'Chill',
    SOCIAL: 'Social',
    FLOW: 'Flow',
    EXPLORER: 'Explorer',
    GROWTH: 'Growth',
    COMPETITIVE: 'Competitive',
    SUPPORTIVE: 'Supportive',
  }
  const vibeToKey: Record<Vibe, string> = Object.fromEntries(
    Object.entries(keyToVibe).map(([k, v]) => [v, k])
  ) as Record<Vibe, string>
  const keyToVibeSafe = (key?: string | null) => {
    if (!key) return null
    return keyToVibe[key] || null
  }

  const vibeOptions = useMemo(() => {
    if (!vibes.length) return vibeList
    return vibes.map((v) => {
      const id = keyToVibe[v.key] || (v.key as Vibe)
      return {
        id,
        title: v.label ?? id,
        subtitle: v.subtitle ?? v.label ?? id,
      }
    })
  }, [vibes])

  const countryOptions = useMemo(
    () => countries.map((c) => ({ id: c.key, label: c.label })),
    [countries]
  )

  const cityOptions: CityOption[] = useMemo(
    () => cities.map((c) => ({ id: c.key, label: c.label })),
    [cities]
  )

  const ageRangeOptions: AgeRangeOption[] = useMemo(
    () => ageRanges.map((a) => ({ id: a.key, label: a.label })),
    [ageRanges]
  )

  const selectedCountryLabel =
    countryOptions.find((c) => c.id === country)?.label || ''
  const selectedCityLabel =
    cityOptions.find((c) => c.id === city)?.label || ''

  const previewCard = {
    name: displayName,
    flag: '',
    vibe: (vibe ?? 'Social') as Vibe,
    sports: selectedSportsLabels,
    trying: selectedTryingLabels,
    location: selectedCityLabel || selectedCountryLabel,
    blurb: bio,
    avatar:
      user?.avatar ||
      (user as any)?.user_metadata?.picture ||
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
  }

  const stepLabels: Record<Step, string> = {
    Vibe: '運動氛圍',
    Sports: '我的運動日常',
    Trying: '我想嘗試',
    Country: '我來自',
    City: '現居城市',
    Bio: '聽我說',
    Info: '關於我',
    Preview: '預覽',
  }

  const filteredCountries = useMemo(() => {
    const term = countrySearch.trim().toLowerCase()
    if (!term) return countryOptions
    return countryOptions.filter((c) => c.label.toLowerCase().startsWith(term))
  }, [countrySearch, countryOptions])

  const filteredSports = useMemo(() => {
    const term = sportsSearch.trim().toLowerCase()
    const ordered = [...favOptions].sort((a, b) => {
      if (a.label === starterLabel) return -1
      if (b.label === starterLabel) return 1
      return 0
    })
    const filteredByTrying = ordered.filter((s) => !trying.includes(s.id))
    if (!term) return filteredByTrying
    return filteredByTrying.filter((s) =>
      s.label.toLowerCase().startsWith(term)
    )
  }, [sportsSearch, starterLabel, trying, favOptions])

  const filteredTrying = useMemo(() => {
    const term = tryingSearch.trim().toLowerCase()
    const filteredBySports = tryingOptions.filter((s) => !sports.includes(s.id))
    if (!term) return filteredBySports
    return filteredBySports.filter((s) =>
      s.label.toLowerCase().startsWith(term)
    )
  }, [tryingSearch, sports, tryingOptions])

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
        className="px-4 pb-12 pt-6"
        style={{
          background: 'linear-gradient(180deg, #eef2f7 0%, #f9fbff 100%)',
        }}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="relative h-1.5 w-full rounded-full bg-slate-200">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${progress}%`, background: accent.ring }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-2">
                {steps.map((_, idx) => {
                  const isCompleted =
                    idx === 0 || (idx <= furthestStep && furthestStep > 0)
                  const color = isCompleted
                    ? stepColors[idx] ?? '#e2e8f0'
                    : '#cbd5e1'
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (idx === 0 || idx <= furthestStep) setStepIndex(idx)
                      }}
                      className={clsx(
                        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition shadow-sm ring-2 ring-white/50',
                        isCompleted
                          ? 'opacity-100'
                          : 'opacity-60 cursor-not-allowed'
                      )}
                      aria-label={`前往步驟 ${idx + 1}`}
                      style={{
                        background:
                          idx === steps.length - 1 && isCompleted
                            ? '#fff'
                            : color,
                        color: '#fff',
                      }}
                      disabled={!isCompleted}
                    >
                      {idx === steps.length - 1 ? (
                        <IdCard
                          className="h-6 w-6 text-black"
                          strokeWidth={2.5}
                        />
                      ) : (
                        idx + 1
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="text-sm font-semibold text-slate-500 mt-4">
              {stepLabels[currentStep]}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold leading-tight text-slate-900">
                {currentStep === 'Vibe' && '最近最需要什麼運動節奏？'}
                {currentStep === 'Sports' && '最常說「好，走！」的運動'}
                {currentStep === 'Trying' && '接下來想一起試試什麼？'}
                {currentStep === 'Country' && '你來自哪裡？'}
                {currentStep === 'City' && '你現在住在哪個城市？'}
                {currentStep === 'Bio' &&
                  '一句話，讓大家能知道你目前運動的狀態'}
                {currentStep === 'Info' && '讓夥伴更好地認識你'}
                {currentStep === 'Preview' && '專屬你的運動身份卡'}
              </h1>
              <p className="text-base text-slate-600">
                {currentStep === 'Vibe' &&
                  '選一個最貼近你最近的感覺。我們知道身心節奏會影響我們需要的運動模式，後續調整也沒問題。'}
                {currentStep === 'Sports' &&
                  '選最多 3 項，平常最容易讓你動起來的那些。我們會依照你的習慣，幫你找到步調相近的夥伴。'}
                {currentStep === 'Trying' &&
                  '最多 2 項就好，這能讓夥伴更容易揪你去適合的活動。不用很會，願意開始就很棒。'}
                {currentStep === 'Country' &&
                  '我們會在你的卡片上放小旗幟，讓你感受就算不同文化背景也可以有相同的運動語言。'}
                {currentStep === 'City' &&
                  '目前開放台北與新北，我們會持續新增更多地區。'}
                {currentStep === 'Bio' &&
                  '就像跟一個和你一起動的人分享運動態度或是近況。'}
                {currentStep === 'Info' && ''}
                {currentStep === 'Preview' &&
                  '準備展開新節奏的起點。每一次出門、每一次流汗、每一次遇到新夥伴，都會把這張卡更新成更有故事的版本。你不是一個人開始。在這裡，有和你同樣節奏的人正在等你一起。'}
              </p>
            </div>
          </div>

          {currentStep === 'Vibe' && (
            <div className="space-y-3">
              {vibeOptions.map((item) => {
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
                已選 {sportsDisplayCount}/3
              </div>
              {uniqueSports.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {uniqueSports.map((sportId) => {
                    const label = sportOptionMap.get(sportId)?.label ?? sportId
                    return (
                      <span
                        key={sportId}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200"
                      >
                        {label}
                        <button
                          type="button"
                          className="text-slate-500 hover:text-slate-700"
                          onClick={() => toggleSport(sportId)}
                          aria-label={`Remove ${label}`}
                        >
                          ✕
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                <input
                  type="text"
                  value={sportsSearch}
                  onChange={(e) => setSportsSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="搜尋運動..."
                />
              </div>
              <div className="flex max-h-96 flex-col gap-3 overflow-y-auto pr-1">
                {filteredSports.map((sport) => {
                  const selected = uniqueSports.includes(sport.id)
                  return (
                    <button
                      key={sport.id}
                      type="button"
                      onClick={() => toggleSport(sport.id)}
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
                        {sport.label}
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
                已選 {tryingDisplayCount}/2
              </div>
              {uniqueTrying.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {uniqueTrying.map((itemId) => {
                    const label = tryingOptionMap.get(itemId)?.label ?? itemId
                    return (
                      <span
                        key={itemId}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200"
                      >
                        {label}
                        <button
                          type="button"
                          className="text-slate-500 hover:text-slate-700"
                          onClick={() => toggleTrying(itemId)}
                          aria-label={`Remove ${label}`}
                        >
                          ✕
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                <input
                  type="text"
                  value={tryingSearch}
                  onChange={(e) => setTryingSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="搜尋想嘗試的運動..."
                />
              </div>
              <div className="flex max-h-96 flex-col gap-3 overflow-y-auto pr-1">
                {filteredTrying.map((item) => {
                  const selected = uniqueTrying.includes(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleTrying(item.id)}
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
                        {item.label}
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
                  placeholder="搜尋你的國家/地區..."
                />
              </div>
              <div className="flex max-h-96 flex-col gap-3 overflow-y-auto pr-1">
                {filteredCountries.map((item) => {
                  const selected = country === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCountry(item.id)
                        setCity('')
                      }}
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
                        {item.label}
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

          {currentStep === 'City' && (
            <div className="space-y-4">
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <p className="text-sm font-semibold text-slate-700">
                  現居城市（僅台北/新北）
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {cityOptions.map((option) => {
                  const active = city === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setCity(option.id)}
                      className={clsx(
                        'rounded-full border px-4 py-2 text-sm font-semibold transition',
                        active
                          ? 'border-transparent'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      )}
                      style={
                        active
                          ? {
                              background: withAlpha(accent.ring, 0.18),
                              color: '#0f172a',
                              boxShadow: `0 12px 28px -18px ${accent.ring}`,
                            }
                          : undefined
                      }
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {currentStep === 'Info' && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-blue-50 p-2 text-blue-700">
                    <Lock
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">
                      你的名字，我們會好好保護
                    </p>
                    <p className="text-xs text-slate-500">
                      夥伴在社群裡只會看到你想被怎麼稱呼。真實姓名只會在真的需要安全驗證時才會使用。
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    夥伴怎麼稱呼你？（顯示名稱）
                  </label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                    placeholder="例如: 跳跳虎"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Username
                  </label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                    placeholder="例如: tiger20260101"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    真實姓名（不公開）
                  </label>
                  <input
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                    placeholder="請填寫證件上的姓名（不會公開）"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    年齡區間
                  </label>
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                    <select
                      value={ageRange}
                      onChange={(e) => setAgeRange(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                    >
                      <option
                        value=""
                        disabled
                      >
                        請選擇
                      </option>
                      {ageRangeOptions.map((option) => (
                        <option
                          key={option.id}
                          value={option.id}
                        >
                          {`${option.label}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    通常想在什麼時段運動？
                  </p>
                  <span className="text-xs font-semibold text-slate-500">
                    選 1 個主要時段
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['早上', '下午', '晚上'] as TimeSlot[]).map((slot) => {
                    const active = preferredTime === slot
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          setPreferredTime(slot)
                          setDaySlots(() => {
                            const next: Record<string, TimeSlot[]> = {}
                            daysList.forEach((day) => {
                              next[day] = [slot]
                            })
                            return next
                          })
                        }}
                        className={clsx(
                          'rounded-full border px-4 py-2 text-sm font-semibold transition',
                          active
                            ? 'border-transparent'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        )}
                        style={
                          active
                            ? {
                                background: withAlpha(accent.ring, 0.18),
                                color: '#0f172a',
                                boxShadow: `0 12px 28px -18px ${accent.ring}`,
                              }
                            : undefined
                        }
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>

                <details className="space-y-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                    按天微調（可選）
                  </summary>
                  <div className="space-y-3 pt-1">
                    {daysList.map((day) => (
                      <div
                        key={day}
                        className="space-y-2"
                      >
                        <p className="text-base font-semibold text-slate-800">
                          {dayLabels[day]}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(['早上', '下午', '晚上'] as TimeSlot[]).map(
                            (slot) => {
                              const active = daySlots[day]?.includes(slot)
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() =>
                                    setDaySlots((prev) => {
                                      const next = {
                                        ...prev,
                                        [day]: [...(prev[day] ?? [])],
                                      }
                                      if (next[day].includes(slot)) {
                                        next[day] = next[day].filter(
                                          (s) => s !== slot
                                        )
                                      } else {
                                        next[day].push(slot)
                                      }
                                      return next
                                    })
                                  }
                                  className={clsx(
                                    'min-w-[60px] rounded-full border px-4 py-2 text-sm font-semibold transition',
                                    active
                                      ? 'border-transparent'
                                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                  )}
                                  style={
                                    active
                                      ? {
                                          background: withAlpha(
                                            accent.ring,
                                            0.18
                                          ),
                                          color: '#0f172a',
                                          boxShadow: `0 12px 28px -18px ${accent.ring}`,
                                        }
                                      : undefined
                                  }
                                >
                                  {slot}
                                </button>
                              )
                            }
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>

                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  我們會幫你找到符合節奏的活動與夥伴。
                </div>
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
                {bio.length}/40
              </div>
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

          <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#f9fbff] via-[#f9fbff]/95 to-transparent pb-6 pt-8">
            <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4">
              {stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一步
                </button>
              ) : (
                <div className="flex-1" />
              )}
              <button
                type="button"
                onClick={goNext}
                disabled={nextDisabled || saving || (loadingProfile && !initialized)}
                className={clsx(
                  'pointer-events-auto flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60',
                  stepIndex === 0 ? 'w-full' : 'flex-1',
                  nextDisabled ? 'bg-slate-200 text-slate-500' : undefined
                )}
                style={nextDisabled ? undefined : { background: accent.ring }}
              >
                {currentStep === 'Preview'
                  ? '儲存我的運動卡'
                  : currentStep === 'Info'
                  ? '我的運動卡預覽'
                  : '下一步'}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

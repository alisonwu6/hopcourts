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
  '籃球',
  '跑步',
  '健身',
  '羽球',
  '匹克球',
  '足球',
  '皮拉提斯',
  '瑜伽',
  '網球',
  '游泳',
  '單車',
  '拳擊',
  '攀岩',
  '抱石',
  'HIIT',
  'CrossFit',
  '桌球',
  '排球',
  '沙灘排球',
  '健行',
  '越野跑',
  '划船',
  '衝浪',
  '滑板',
  '板網球',
  '橄欖球',
  '板球',
  '極限飛盤',
  '躲避球',
  '我剛開始接觸運動',
] as const

const tryingOptions = ['暫時不確定', ...sportOptions]

const countryOptions = [
  { name: '台灣', flag: '🇹🇼' },
  { name: '日本', flag: '🇯🇵' },
  { name: '韓國', flag: '🇰🇷' },
  { name: '中國', flag: '🇨🇳' },
  { name: '香港', flag: '🇭🇰' },
  { name: '澳門', flag: '🇲🇴' },
  { name: '新加坡', flag: '🇸🇬' },
  { name: '馬來西亞', flag: '🇲🇾' },
  { name: '越南', flag: '🇻🇳' },
  { name: '泰國', flag: '🇹🇭' },
  { name: '印尼', flag: '🇮🇩' },
  { name: '菲律賓', flag: '🇵🇭' },
  { name: '印度', flag: '🇮🇳' },
  { name: '澳洲', flag: '🇦🇺' },
  { name: '紐西蘭', flag: '🇳🇿' },
  { name: '美國', flag: '🇺🇸' },
  { name: '加拿大', flag: '🇨🇦' },
  { name: '英國', flag: '🇬🇧' },
  { name: '愛爾蘭', flag: '🇮🇪' },
  { name: '德國', flag: '🇩🇪' },
  { name: '法國', flag: '🇫🇷' },
  { name: '西班牙', flag: '🇪🇸' },
  { name: '義大利', flag: '🇮🇹' },
  { name: '荷蘭', flag: '🇳🇱' },
  { name: '瑞典', flag: '🇸🇪' },
  { name: '挪威', flag: '🇳🇴' },
  { name: '芬蘭', flag: '🇫🇮' },
  { name: '丹麥', flag: '🇩🇰' },
  { name: '巴西', flag: '🇧🇷' },
  { name: '阿根廷', flag: '🇦🇷' },
  { name: '南非', flag: '🇿🇦' },
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
  const starterLabel = '我剛開始接觸運動'
  const unsureLabel = '暫時不確定'
  const sportsDisplayCount = sports.includes(starterLabel)
    ? 0
    : sports.length
  const tryingDisplayCount = trying.includes(unsureLabel) ? 0 : trying.length

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
      if (item === starterLabel) {
        return [starterLabel]
      }
      const cleaned = prev.filter((s) => s !== starterLabel)
      if (cleaned.includes(item)) return cleaned.filter((s) => s !== item)
      if (cleaned.length >= 3) return cleaned
      return [...cleaned, item]
    })
  }

  const toggleTrying = (item: string) => {
    setTrying((prev) => {
      if (prev.includes(item)) return prev.filter((s) => s !== item)
      if (item === unsureLabel) {
        return prev.includes(item) ? [] : [unsureLabel]
      }
      const cleaned = prev.filter((s) => s !== unsureLabel)
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
    sports: sports.length ? sports : ['皮拉提斯', '健身', '羽球'],
    trying: trying.length ? trying : ['瑜伽', '社交慢跑'],
    location: '台北',
    blurb: bio,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
  }

  const stepLabels: Record<Step, string> = {
    Vibe: '氛圍',
    Sports: '常打運動',
    Trying: '想嘗試',
    Country: '來自哪裡',
    Bio: '一句話介紹',
    Preview: '預覽',
  }

  const filteredCountries = useMemo(() => {
    const term = countrySearch.trim().toLowerCase()
    if (!term) return countryOptions
    return countryOptions.filter((c) => c.name.toLowerCase().startsWith(term))
  }, [countrySearch])

  const filteredSports = useMemo(() => {
    const term = sportsSearch.trim().toLowerCase()
    const ordered = [...sportOptions].sort((a, b) => {
      if (a === starterLabel) return -1
      if (b === starterLabel) return 1
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
              {stepLabels[currentStep]}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold leading-tight text-slate-900">
                {currentStep === 'Vibe' && '你現在的運動氛圍是什麼？'}
                {currentStep === 'Sports' && '你真的會去的運動'}
                {currentStep === 'Trying' && '接下來想嘗試什麼？'}
                {currentStep === 'Country' && '你來自哪裡？'}
                {currentStep === 'Bio' && '一句話，為什麼想動？'}
                {currentStep === 'Preview' && '你的夥伴卡預覽'}
              </h1>
              <p className="text-base text-slate-600">
                {currentStep === 'Vibe' &&
                  '用最貼近你這個月的感覺來形容，之後都可以再改。'}
                {currentStep === 'Sports' &&
                  '選最多 3 項，每週最常說「好，走！」的那些。'}
                {currentStep === 'Trying' &&
                  '選最多 2 項，讓大家邀你去更合適的場次。'}
                {currentStep === 'Country' &&
                  '我們會顯示你的旗幟，讓你在這裡也有家的感覺。'}
                {currentStep === 'Bio' &&
                  '會顯示在你的夥伴卡上，真誠、簡短就好。'}
                {currentStep === 'Preview' &&
                  '這是別人看到的你的樣子。'}
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
                已選 {sportsDisplayCount}/3
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
                  placeholder="搜尋運動..."
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
                已選 {tryingDisplayCount}/2
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
                  placeholder="搜尋想嘗試的運動..."
                />
              </div>
              <div className="flex max-h-96 flex-col gap-3 overflow-y-auto pr-1">
                {filteredTrying.map((item) => {
                  const selected = trying.includes(item)
                  const isNotSure = item === '暫時不確定'
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
                placeholder="搜尋你的國家/地區..."
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
                上一步
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
              {currentStep === 'Preview' ? '儲存我的運動卡' : '下一步'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

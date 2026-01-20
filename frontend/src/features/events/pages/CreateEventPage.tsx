import clsx from 'clsx'
import type {
  ChangeEvent,
  FormEvent,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'
import { useMemo, useState, useId, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ChevronRight } from 'lucide-react'
import { Button } from '@/components'
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const SKILL_LEVEL_LABELS = {
  mixed: '不限程度',
  beginner: '初階',
  intermediate: '中階',
  advanced: '進階',
} as const
import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { useAuthStore } from '@/hooks'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'
import { BottomSheet } from '@/components/BottomSheet'
import { SheetLayout } from '@/components/SheetLayout'
import { useSports } from '@/features/sports/hooks/useSports'
import { MapPicker, type LatLng } from '@/components/map/MapPicker'

type SkillLevelKey = keyof typeof SKILL_LEVEL_LABELS

const SKILL_LEVEL_ORDER: Record<SkillLevelKey, 1 | 2 | 3 | 4 | 5> = {
  mixed: 2,
  beginner: 1,
  intermediate: 3,
  advanced: 4,
}

type FormState = {
  title: string
  sport: string
  sportKey: string
  startTime: string
  endTime: string
  location: string
  lat: string
  lng: string
  capacity: string
  priceNote: string
  skillLevel: SkillLevelKey
  gender: 'mixed' | 'female' | 'male'
  description: string
  notes: string
}

const initialState: FormState = {
  title: '',
  sport: '',
  sportKey: '',
  startTime: '',
  endTime: '',
  location: '',
  lat: '',
  lng: '',
  capacity: '3',
  priceNote: '現場收費',
  skillLevel: 'mixed',
  gender: 'mixed',
  description: '',
  notes: '',
}

export default function CreateEventPage() {
  const navigate = useNavigate()
  const createEvent = useEventsStore((state) => state.createEvent)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { sports: sportsCatalog } = useSports('zh')
  const [form, setForm] = useState<FormState>(initialState)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [heroPreviews, setHeroPreviews] = useState<string[]>([])
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showSportSheet, setShowSportSheet] = useState(false)
  const [sportSearch, setSportSearch] = useState('')
  const [showLocationSheet, setShowLocationSheet] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [addressMode, setAddressMode] = useState<'auto' | 'manual'>('auto')
  const [reverseGeoError, setReverseGeoError] = useState<string | null>(null)
  const [locationConfirming, setLocationConfirming] = useState(false)
  const [addressLookupPending, setAddressLookupPending] = useState(false)
  const [isAddressClearing, setIsAddressClearing] = useState(false)
  useEffect(() => {
    if (!showLocationSheet || !selectedLocation) return
    if (addressMode !== 'auto') return
    if (!MAPBOX_TOKEN) {
      setReverseGeoError('缺少 Mapbox Token，無法取得地址')
      return
    }

    const { lat, lng } = selectedLocation
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?language=zh-Hant&limit=1&access_token=${MAPBOX_TOKEN}`

    setReverseGeoError(null)
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const place = data?.features?.[0]?.place_name ?? ''
        // Only overwrite the input when the map is the source of truth.
        if (addressMode === 'auto') {
          if (place && place !== selectedAddress) setSelectedAddress(place)
        }
      })
      .catch(() => {
        setReverseGeoError('無法取得地址')
      })
  }, [selectedLocation, showLocationSheet, addressMode, selectedAddress])

  useEffect(() => {
    if (!showLocationSheet) return
    if (isAddressClearing) return
    if (!form.location.trim()) return
    if (selectedLocation) return

    // 只帶入使用者原本輸入的地址文字，不自動幫他重新定位
    setSelectedAddress(form.location.trim())
    setAddressMode('manual')
    setAddressLookupPending(false)
  }, [showLocationSheet, form.location, selectedLocation, isAddressClearing])

  // 使用者輸入地址 3 秒後自動定位地圖，不覆寫輸入文字
  useEffect(() => {
    if (!showLocationSheet) return
    if (addressMode !== 'manual') return
    if (isAddressClearing) return
    const address = selectedAddress.trim()
    if (!address) return

    const handle = setTimeout(async () => {
      setAddressLookupPending(true)
      const loc = await geocodeByAddress(address)
      if (loc) {
        setSelectedLocation(loc)
        setReverseGeoError(null)
      } else {
        setReverseGeoError('無法定位，請再試一次或點地圖')
      }
      setAddressLookupPending(false)
    }, 3000)

    return () => clearTimeout(handle)
  }, [selectedAddress, showLocationSheet, addressMode, isAddressClearing])

  const geocodeByAddress = async (address: string) => {
    if (!MAPBOX_TOKEN || !address.trim()) return null
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address.trim()
    )}.json?language=zh-Hant&limit=1&access_token=${MAPBOX_TOKEN}`
    const res = await fetch(url)
    const data = await res.json()
    const feature = data?.features?.[0]
    if (!feature?.center) return null
    return { lng: feature.center[0], lat: feature.center[1] } as LatLng
  }

  const canSubmit = useMemo(() => {
    return Boolean(
      form.title.trim() &&
      form.sportKey.trim() &&
      form.startTime &&
      form.endTime &&
      Number(form.capacity) > 0 &&
      form.location.trim()
    )
  }, [form])

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target
    if (name === 'skillLevel') {
      setForm((prev) => ({ ...prev, skillLevel: value as SkillLevelKey }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSkillSelect = (level: SkillLevelKey) => {
    setForm((prev) => ({ ...prev, skillLevel: level }))
  }

  const handleGenderSelect = (value: 'mixed' | 'female' | 'male') => {
    setForm((prev) => ({ ...prev, gender: value }))
  }

  const openLocationPicker = () => {
    setReverseGeoError(null)
    if (form.lat && form.lng) {
      setSelectedLocation({ lat: Number(form.lat), lng: Number(form.lng) })
      setSelectedAddress(form.location || '')
      setAddressMode('manual')
    } else {
      // 不預設填入地址或強制 geocode，讓使用者自行選點或輸入
      setSelectedLocation(null)
      setSelectedAddress('')
      setAddressMode('manual')
    }
    setShowLocationSheet(true)
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, 3)
    if (!files.length) return
    const previews = files.map((file) => URL.createObjectURL(file))
    setHeroPreviews(previews)
    event.target.value = ''
  }

  const handleSportSelect = (key: string, label: string) => {
    setForm((prev) => ({ ...prev, sport: label, sportKey: key }))
    setShowSportSheet(false)
  }

  const handleCancel = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || isSubmitting) return
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }

    const capacity = Number(form.capacity)
    const latNum = form.lat ? Number(form.lat) : null
    const lngNum = form.lng ? Number(form.lng) : null
    const startDate = new Date(form.startTime)
    const endDate = new Date(form.endTime)

    if (Number.isNaN(startDate.getTime())) {
      setError('請選擇有效的開始日期與時間。')
      return
    }
    if (Number.isNaN(endDate.getTime())) {
      setError('請選擇有效的結束日期與時間。')
      return
    }
    if (endDate <= startDate) {
      setError('結束時間需晚於開始時間。')
      return
    }
    const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000)
    if (Number.isNaN(durationMinutes) || durationMinutes <= 0) {
      setError('無法計算活動時長，請調整時間。')
      return
    }
    if (Number.isNaN(capacity) || capacity <= 0) {
      setError('人數上限必須大於 0。')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const payload = {
        title: form.title.trim(),
        sport: form.sportKey.trim(),
        description: form.description.trim() || undefined,
        skillLevel: form.skillLevel,
        startTime: startDate,
        duration: durationMinutes,
        maxAttendees: capacity,
        location: {
          lat: latNum,
          lng: lngNum,
          address: form.location.trim(),
          instructions:
            [form.priceNote.trim(), form.notes.trim()].filter(Boolean).join('\n\n') || undefined,
        },
        isFree: true,
        tags: [
          form.gender === 'female'
            ? 'female-only'
            : form.gender === 'male'
              ? 'male-only'
              : 'mixed-gender',
        ],
        difficulty: SKILL_LEVEL_ORDER[form.skillLevel] ?? 2,
      }
      console.log('Submitting event payload:', payload)
      const event = await createEvent(payload)

      navigate(`/event/${event.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : '建立活動失敗。'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-blue-50 pb-16">
        <ActionToolbar
          onBack={handleCancel}
          onToggleFavorite={() => setIsFavorite((prev) => !prev)}
          isFavorite={isFavorite}
          showFavorite={false}
          showShare={false}
          backLabel="取消"
          contentClassName="w-full max-w-3xl px-4 sm:px-6"
        />
        <form
          id="event-form"
          className="mx-auto mt-6 w-full max-w-3xl space-y-4 px-4 pb-8 sm:px-6"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm">
              {error}
            </div>
          )}

          <section className="space-y-8 rounded-[32px] border border-slate-100 bg-white px-6 py-8 shadow-[0_24px_60px_rgba(15,41,77,0.12)] sm:px-8">
            <CoverUploader previews={heroPreviews} onChange={handleImageChange} />

            <FieldSection title="活動基本資料" description="先填最重要的資訊，讓大家一眼看懂。">
              <FloatingField
                label="標題"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                required
              />
              <FloatingField
                label="運動項目"
                name="sport"
                value={form.sport}
                readOnly
                onClick={() => setShowSportSheet(true)}
                placeholder="選擇運動"
                required
              />
              <SkillSelector selected={form.skillLevel} onSelect={handleSkillSelect} />
              <GenderSelector selected={form.gender} onSelect={handleGenderSelect} />
            </FieldSection>

            <FieldSection title="時間與地點" description="設定集合時間與地點。">
              <div className="grid gap-4 sm:grid-cols-2">
                <FloatingField
                  label="開始時間"
                  name="startTime"
                  type="datetime-local"
                  value={form.startTime}
                  onChange={handleInputChange}
                  required
                />
                <FloatingField
                  label="結束時間"
                  name="endTime"
                  type="datetime-local"
                  value={form.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-700">地點</p>
                <button
                  type="button"
                  onClick={openLocationPicker}
                  className="flex w-full items-center justify-between rounded-[14px] border-2 border-slate-300 bg-white px-4 py-4 text-left text-base text-slate-900 shadow-inner transition hover:border-blue-400 hover:shadow-[0_0_0_1px_rgba(59,130,246,0.25)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800">
                        {form.location ? '場地位置' : '場地位置'}
                      </span>
                      <span className="text-sm text-slate-500">
                        {form.location || '點擊選擇位置'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </button>
                {reverseGeoError && <p className="text-xs text-red-500">{reverseGeoError}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FloatingField
                  label="Capacity"
                  name="capacity"
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </FieldSection>

            <FieldSection title="告訴大家期待什麼" description="描述氛圍、目標，或注意事項。">
              <FloatingField
                as="textarea"
                label="描述"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleInputChange}
                supportingText="說明活動的氛圍、步調，讓參加者知道會遇到什麼。"
              />
              <FloatingField
                as="textarea"
                label="給參加者的小提醒"
                name="notes"
                rows={3}
                value={form.notes}
                onChange={handleInputChange}
                supportingText="只給已報名者的最新通知或重要細節。"
              />
            </FieldSection>
          </section>
        </form>

        <ActionBar canSubmit={canSubmit} isSubmitting={isSubmitting} />
      </div>
      <LoginPromptSheet
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onSignup={() => navigate('/signup')}
      />

      <BottomSheet
        open={showSportSheet}
        onClose={() => setShowSportSheet(false)}
        disableContainer
        showHandle={false}
      >
        <SheetLayout
          onClose={() => setShowSportSheet(false)}
          title="選擇運動項目"
          subtitle="從清單中選擇一項運動。"
          height="tall"
          className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
          contentClassName="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          primaryButton={{
            label: '關閉',
            onClick: () => setShowSportSheet(false),
          }}
          showHandle={false}
        >
          <input
            value={sportSearch}
            onChange={(e) => setSportSearch(e.target.value)}
            placeholder="搜尋運動"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none"
          />
          <div className="space-y-2">
            {sportsCatalog
              .filter((sport) => sport.label.toLowerCase().includes(sportSearch.toLowerCase()))
              .map((sport) => {
                const isActive = form.sportKey === sport.key
                return (
                  <button
                    key={sport.key}
                    type="button"
                    onClick={() => handleSportSelect(sport.key, sport.label)}
                    className={clsx(
                      'w-full rounded-2xl border px-4 py-3 text-left text-base font-semibold shadow-sm transition',
                      isActive
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-blue-300'
                    )}
                  >
                    {sport.label}
                  </button>
                )
              })}
          </div>
        </SheetLayout>
      </BottomSheet>

      <BottomSheet
        open={showLocationSheet}
        onClose={() => setShowLocationSheet(false)}
        disableContainer
        showHandle={false}
      >
        <SheetLayout
          onClose={() => setShowLocationSheet(false)}
          title="選擇位置"
          subtitle="在地圖上點擊放置定位點"
          height="tall"
          className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
          contentClassName="flex-1 overflow-hidden px-4 pb-4 pt-2 space-y-3"
          primaryButton={{
            label: locationConfirming ? '定位中...' : '確認',
            onClick: async () => {
              if (locationConfirming) return
              setLocationConfirming(true)
              let loc = selectedLocation
              if (!loc && selectedAddress.trim()) {
                loc = await geocodeByAddress(selectedAddress.trim())
                if (loc) setSelectedLocation(loc)
              }
              if (loc) {
                setForm((prev) => ({
                  ...prev,
                  lat: String(loc!.lat),
                  lng: String(loc!.lng),
                  location: selectedAddress.trim() || prev.location,
                }))
                setShowLocationSheet(false)
              } else {
                setReverseGeoError('無法定位，請再試一次或點地圖')
              }
              setLocationConfirming(false)
            },
            disabled: locationConfirming,
          }}
          showHandle={false}
        >
          <div className="space-y-2 rounded-2xl bg-slate-50 px-3 py-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">場地地址</p>
            </div>

            <div className="relative">
              <input
                type="text"
                value={selectedAddress}
                onChange={(e) => {
                  setSelectedAddress(e.target.value)
                  setAddressMode('manual')
                }}
                placeholder="輸入地址，或點地圖放置定位點"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-3 pr-10 text-sm font-semibold text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none"
              />
              {selectedAddress.trim() && (
                <button
                  type="button"
                  aria-label="Clear address"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500 hover:bg-slate-200"
                  onClick={() => {
                    setIsAddressClearing(true)
                    setSelectedAddress('')
                    setSelectedLocation(null)
                    setAddressMode('manual')
                    setReverseGeoError(null)
                    // allow user to type without the open-sheet initializer re-filling the input
                    setTimeout(() => setIsAddressClearing(false), 0)
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {reverseGeoError && <p className="text-xs text-red-500">{reverseGeoError}</p>}
          </div>

          <div className="h-[56vh] overflow-hidden rounded-2xl border border-slate-200">
            <MapPicker
              value={selectedLocation ?? undefined}
              variant="satellite"
              onChange={(loc) => {
                setSelectedLocation(loc)
                setAddressMode('auto')
              }}
            />
          </div>
        </SheetLayout>
      </BottomSheet>
    </>
  )
}

function ActionBar({ canSubmit, isSubmitting }: { canSubmit: boolean; isSubmitting: boolean }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-blue-50/95 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-4 shadow-[0_-10px_30px_rgba(30,64,175,0.12)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 sm:px-6">
        <Button
          variant="secondary"
          size="sm"
          type="button"
          disabled
          className="flex-1 rounded-full border-blue-200 text-blue-500 hover:bg-blue-50"
        >
          草稿
        </Button>
        <Button
          size="sm"
          type="submit"
          form="event-form"
          disabled={!canSubmit || isSubmitting}
          className="flex-1 rounded-full px-6"
        >
          {isSubmitting ? '發布中…' : '發佈'}
        </Button>
      </div>
    </div>
  )
}

function FieldSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="space-y-4 rounded-[28px] border border-slate-100 bg-slate-50/60 p-4 sm:p-6">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function SkillSelector({
  selected,
  onSelect,
}: {
  selected: SkillLevelKey
  onSelect: (level: SkillLevelKey) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-wide text-slate-500">程度</p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(SKILL_LEVEL_LABELS).map(([level, label]) => {
          const value = level as SkillLevelKey
          const isActive = selected === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              className={clsx(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition',
                isActive
                  ? 'border-blue-500 bg-blue-600 text-white shadow-[0_6px_16px_rgba(30,64,175,0.25)]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600'
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function GenderSelector({
  selected,
  onSelect,
}: {
  selected: 'mixed' | 'female' | 'male'
  onSelect: (value: 'mixed' | 'female' | 'male') => void
}) {
  const options: { id: 'mixed' | 'female' | 'male'; label: string; desc: string }[] = [
    { id: 'mixed', label: '性別混合場', desc: '不限性別，歡迎一起來動。' },
    { id: 'female', label: '女性專屬場', desc: '女性限定，讓夥伴更自在。' },
    { id: 'male', label: '男性專屬場', desc: '男性限定，暢快對戰。' },
  ]

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-wide text-slate-500">性別</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const isActive = selected === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={clsx(
                'flex flex-col items-start rounded-2xl border px-4 py-3 text-left transition',
                isActive
                  ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-[0_6px_16px_rgba(30,64,175,0.18)]'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-blue-200'
              )}
            >
              <span className="text-sm font-semibold">{opt.label}</span>
              <span className="text-xs text-slate-500">{opt.desc}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CoverUploader({
  previews,
  onChange,
}: {
  previews?: string[]
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  const hasImages = previews && previews.length > 0
  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-4">
      <label className="flex min-h-[220px] cursor-pointer flex-col gap-3 rounded-[24px] border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500 transition hover:border-blue-300">
        {hasImages ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {previews!.slice(0, 3).map((src, idx) => (
              <div
                key={src + idx}
                className="relative h-40 overflow-hidden rounded-[20px] ring-1 ring-slate-200"
              >
                <img src={src} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
            <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              Cover photos
            </div>
            <p>場地或活動相關圖片</p>
          </div>
        )}
        <div className="text-center text-xs text-slate-500">點擊或拖曳上傳（最多 3 張）</div>
        <input type="file" accept="image/*" multiple className="hidden" onChange={onChange} />
      </label>
    </div>
  )
}

type FloatingFieldProps =
  | ({
      as?: 'input'
    } & InputHTMLAttributes<HTMLInputElement> &
      CommonFloatingProps)
  | ({
      as: 'textarea'
    } & TextareaHTMLAttributes<HTMLTextAreaElement> &
      CommonFloatingProps)

type CommonFloatingProps = {
  label: string
  supportingText?: string
  characterLimit?: number
}

function FloatingField(props: FloatingFieldProps) {
  const { label, supportingText, characterLimit, ...domProps } = props as any
  const as = domProps.as ?? 'input'
  const id = useId()
  const value =
    'value' in domProps
      ? (domProps.value ?? '')
      : 'defaultValue' in domProps
        ? ((domProps.defaultValue as string | number | readonly string[] | undefined) ?? '')
        : ''
  const hasValue =
    typeof value === 'number'
      ? true
      : Array.isArray(value)
        ? value.length > 0
        : Boolean(value && String(value).trim().length > 0)
  const baseClasses =
    'peer block w-full rounded-[14px] border-2 border-slate-300 bg-white px-4 pt-7 pb-3 text-base text-slate-900 transition focus:border-slate-900 focus:shadow-[0_0_0_1px_rgba(0,0,0,0.2)] focus:outline-none disabled:opacity-60'
  const labelClasses =
    'pointer-events-none absolute left-4 top-2 text-sm font-semibold text-slate-600 bg-white px-1'
  const infoText =
    typeof value === 'string' && characterLimit
      ? `${Math.max(characterLimit - value.length, 0)} characters available`
      : supportingText

  if (as === 'textarea') {
    const {
      as: _as,
      className,
      rows = 4,
      ...rest
    } = domProps as Extract<FloatingFieldProps, { as: 'textarea' }>
    return (
      <div className="space-y-1">
        <div className="relative">
          <textarea
            {...rest}
            id={id}
            rows={rows}
            placeholder={rest.placeholder ?? ' '}
            data-filled={hasValue}
            className={clsx(baseClasses, 'resize-none', className)}
          />
          <label htmlFor={id} className={labelClasses}>
            {label}
          </label>
        </div>
        {infoText && <p className="text-xs text-slate-500">{infoText}</p>}
      </div>
    )
  }

  const {
    as: _as,
    className,
    type = 'text',
    ...rest
  } = domProps as Extract<FloatingFieldProps, { as?: 'input' }>
  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          {...rest}
          id={id}
          type={type}
          placeholder={rest.placeholder ?? ' '}
          data-filled={hasValue}
          className={clsx(baseClasses, className)}
        />
        <label htmlFor={id} className={labelClasses}>
          {label}
        </label>
      </div>
      {infoText && <p className="text-xs text-slate-500">{infoText}</p>}
    </div>
  )
}

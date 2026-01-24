import clsx from 'clsx'
import type {
  ChangeEvent,
  FormEvent,
  MouseEvent,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'
import { useMemo, useState, useId, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, ChevronRight, Trash2 } from 'lucide-react'
import { Button } from '@/components'
import { useAuthStore } from '@/hooks'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'
import { BottomSheet } from '@/components/BottomSheet'
import { SheetLayout } from '@/components/SheetLayout'
import { useSports } from '@/features/sports/hooks/useSports'
import { MapPicker, type LatLng } from '@/components/map/MapPicker'
import { httpPost } from '@/api/http'
import { uploadService } from '@/features/events/services/uploadService'
import { convertFileToWebP } from '@/utils/imageUtils'
import { eventsService } from '@/features/events/services/eventsService'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const SKILL_LEVEL_LABELS = {
  any: '不限程度',
  beginner: '初階',
  intermediate: '中階',
  advanced: '進階',
} as const

type SkillLevelKey = keyof typeof SKILL_LEVEL_LABELS

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
  isFree: boolean
  price: string
  priceNote: string
  skillLevel: SkillLevelKey
  gender: 'mixed' | 'female_only' | 'male_only'
  description: string
  notes: string
  placeName: string
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
  isFree: true,
  price: '',
  priceNote: '現場收費',
  skillLevel: 'any',
  gender: 'mixed',
  description: '',
  notes: '',
  placeName: '',
}

export default function CreateEventPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')
  
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  useEffect(() => {
    if (!editId) return
    const fetchDraft = async () => {
      try {
        const res = await eventsService.getEventById(editId)
        if (res.success && res.data) {
          const draft = res.data
          const toLocalISO = (d: Date | string) => {
             const dateObj = typeof d === 'string' ? new Date(d) : d
             const offset = dateObj.getTimezoneOffset() * 60000
             return new Date(dateObj.getTime() - offset).toISOString().slice(0, 16)
          }
          
          let sportLabel = ''
          if (draft.sport) {
             const found = sportsCatalog.find(s => s.key === draft.sport)
             sportLabel = found?.label || draft.sport
          }

          setForm({
            title: draft.title || '',
            sport: sportLabel,
            sportKey: draft.sport || '',
            startTime: draft.startTime ? toLocalISO(draft.startTime) : '',
            endTime: draft.endTime ? toLocalISO(draft.endTime) : '',
            location: draft.location.name || '',
            lat: draft.location.lat ? String(draft.location.lat) : '',
            lng: draft.location.lng ? String(draft.location.lng) : '',
            capacity: String(draft.maxAttendees || 3),
            isFree: draft.isFree ?? true,
            price: draft.price ? String(draft.price) : '',
            priceNote: '現場收費',
            skillLevel: (draft.skillLevel as SkillLevelKey) || 'any',
            gender: draft.gender || 'mixed',
            description: draft.detail?.description || '',
            notes: '', 
            placeName: draft.location.name || '',
          })
          
          if (draft.location.name) {
             setSelectedAddress(draft.location.name)
             if (draft.location.lat && draft.location.lng) {
                setSelectedLocation({ lat: draft.location.lat, lng: draft.location.lng })
             }
          }
          
          if (draft.photos && draft.photos.length > 0) {
             setHeroPreviews(draft.photos)
          }
        }
      } catch (err) {
        console.error('Failed to load draft', err)
      }
    }
    fetchDraft()
  }, [editId, sportsCatalog])

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

  const handleGenderSelect = (value: FormState['gender']) => {
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



  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(event.target.files ?? []).slice(0, 3)
    if (!rawFiles.length) return

    try {
      const processedFiles = await Promise.all(
        rawFiles.map((file: File) => convertFileToWebP(file))
      )
      const previews = processedFiles.map((file) => URL.createObjectURL(file))
      setHeroPreviews(previews)
      setSelectedFiles(processedFiles)
    } catch (err) {
      console.error('Image processing failed:', err)
    }
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

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>, status: 'draft' | 'published' = 'published') => {
    event?.preventDefault?.()
    if (isSubmitting) return
    
    if (!form.title.trim()) {
      setError('請輸入標題')
      return
    }
    if (!form.sportKey) {
      setError('請選擇運動項目')
      return
    }
    if (!form.startTime) {
      setError('請選擇開始時間')
      return
    }
    if (!form.endTime) {
      setError('請選擇結束時間')
      return
    }
    if (!form.location.trim()) {
      setError('請選擇地點')
      return
    }
    if (!canSubmit) {
       setError('請確認所有必填欄位')
       return
    }

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
      // 1. Upload Images or use existing
      let uploadedPhotoUrls: string[] = []
      if (selectedFiles.length > 0) {
        uploadedPhotoUrls = await Promise.all(
          selectedFiles.map(file => uploadService.uploadSessionPhoto(file))
        )
      } else if (editId && heroPreviews.length > 0) {
        // Keep existing photos if they are remote URLs
        uploadedPhotoUrls = heroPreviews.filter(url => url.startsWith('http'))
      }

      const commonPayload = {
        title: form.title.trim(),
        sport: form.sportKey.trim(),
        description: form.description.trim(),
        notesForAttendees: form.notes.trim(),
        startTime: startDate,
        duration: durationMinutes,
        maxAttendees: capacity,
        location: {
          name: form.placeName.trim(),
          address: form.location.trim(),
          lat: latNum ?? undefined,
          lng: lngNum ?? undefined,
        },
        isFree: form.isFree,
        pricePerPerson: form.price ? parseFloat(form.price) : undefined,
        skillLevel: form.skillLevel,
        gender: form.gender,
        coverPhotoUrl: uploadedPhotoUrls[0],
        status,
      }

      if (editId) {
        // Update existing event
        const res = await eventsService.updateEvent(editId, commonPayload)
        if (res.success) {
          navigate(`/event/${editId}`)
        } else {
          setError(res.error?.message || '更新活動失敗。')
        }
      } else {
        // Create new event
        const res = await eventsService.createEvent(commonPayload)
        if (res.success && res.data) {
          navigate(`/event/${res.data.id}`)
        } else {
          setError(res.error?.message || '發佈活動失敗。')
        }
      }
    } catch (err: any) {
      setError(err?.message || '儲存活動時發生錯誤。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editId) return
    setIsDeleting(true)
    setError(null)
    try {
      const res = await eventsService.deleteEvent(editId)
      if (res.success) {
        navigate('/profile', { replace: true })
      } else {
        setError(res.error?.message || '刪除活動失敗。')
        setShowDeleteConfirm(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除活動失敗。')
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
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
          contentClassName="w-full max-w-3xl px-4 sm:px-6"
          rightContent={
            editId && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex h-10 w-10 items-center justify-center text-red-500 transition hover:bg-red-50 hover:text-red-600 rounded-full"
                aria-label="Delete Event"
              >
                <Trash2 className="h-5 w-5" strokeWidth={2} />
              </button>
            )
          }
        />
        <form
          id="event-form"
          className="mx-auto mt-6 w-full max-w-3xl space-y-4 px-4 pb-8 sm:px-6"
          onSubmit={(e) => handleSubmit(e, 'published')}
        >
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm sticky top-4 z-50">
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
                <div className="space-y-4">
                <FloatingField
                  label="場地名稱 (非必填)"
                  name="placeName"
                  placeholder="例如：大安運動中心"
                  value={form.placeName}
                  onChange={handleInputChange}
                  supportingText="若知道場地具體名稱，請填寫於此。"
                />
                <button
                  type="button"
                  onClick={openLocationPicker}
                  className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100/50 text-blue-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        地址/點地圖選擇
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

            <FieldSection title="費用" description="設定活動的費用資訊。">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200">
                   <input
                     id="is-free-checkbox"
                     type="checkbox"
                     checked={form.isFree}
                     onChange={(e) => setForm(prev => ({ ...prev, isFree: e.target.checked }))}
                     className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                   />
                   <label htmlFor="is-free-checkbox" className="flex flex-1 flex-col">
                     <span className="text-sm font-semibold text-slate-800">免費活動</span>
                     <span className="text-xs text-slate-500">參加者不需要付費。</span>
                   </label>
                </div>
                
                {!form.isFree && (
                  <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <FloatingField
                      label="每人費用 (TWD)"
                      name="price"
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={handleInputChange}
                      placeholder="例如: 200"
                      required={!form.isFree}
                    />
                    <FloatingField
                      label="收費說明"
                      name="priceNote"
                      value={form.priceNote}
                      onChange={handleInputChange}
                      placeholder="例如: 預收、現場收費等"
                    />
                  </div>
                )}
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

        <ActionBar
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          onDraft={() => handleSubmit(undefined, 'draft')}
          onPublish={() => handleSubmit(undefined, 'published')}
        />
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
      
      <BottomSheet
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      >
        <SheetLayout
          onClose={() => setShowDeleteConfirm(false)}
          title="確定要刪除活動嗎？"
          subtitle="一旦刪除，活動資訊將無法恢復。"
          primaryButton={{
            label: isDeleting ? '刪除中...' : '確定刪除',
            onClick: handleDelete,
            variant: 'danger',
            isLoading: isDeleting
          }}
          secondaryButton={{
            label: '取消',
            onClick: () => setShowDeleteConfirm(false),
          }}
        >
          <div className="py-2 text-slate-500 text-sm">此操作無法復原。</div>
        </SheetLayout>
      </BottomSheet>
    </>
  )
}

function ActionBar({
  canSubmit,
  isSubmitting,
  onDraft,
  onPublish,
}: {
  canSubmit: boolean
  isSubmitting: boolean
  onDraft: () => void
  onPublish: () => void
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-blue-50/95 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-4 shadow-[0_-10px_30px_rgba(30,64,175,0.12)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 sm:px-6">
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={onDraft}
          className="flex-1 rounded-full border-blue-200 text-blue-500 hover:bg-blue-50"
          disabled={!canSubmit || isSubmitting}
        >
          草稿
        </Button>
        <Button
          size="sm"
          type="button"
          onClick={onPublish}
          disabled={isSubmitting}
          className={clsx(
            "flex-1 rounded-full px-6",
            !canSubmit && "opacity-50" // Visual cue but clickable
          )}
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
  selected: 'mixed' | 'female_only' | 'male_only'
  onSelect: (value: 'mixed' | 'female_only' | 'male_only') => void
}) {
  const options: { id: 'mixed' | 'female_only' | 'male_only'; label: string; desc: string }[] = [
    { id: 'mixed', label: '性別混合場', desc: '不限性別，歡迎一起來動。' },
    { id: 'female_only', label: '女性專屬場', desc: '女性限定，讓夥伴更自在。' },
    { id: 'male_only', label: '男性專屬場', desc: '男性限定，暢快對戰。' },
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

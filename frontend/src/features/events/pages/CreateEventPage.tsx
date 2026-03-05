import clsx from 'clsx'
import type {
  ChangeEvent,
  FormEvent,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'
import { useMemo, useState, useId, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, ChevronRight, ImagePlus, X } from 'lucide-react'
import { Button } from '@/components'
import { useAuthStore } from '@/hooks'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'
import { BottomSheet } from '@/components/BottomSheet'
import { SheetLayout } from '@/components/SheetLayout'
import { useSports } from '@/features/dictionaries/hooks'
import { MapPicker, type LatLng } from '@/components/map/MapPicker'
import { uploadService } from '@/features/events/services/uploadService'
import { convertFileToWebP } from '@/utils/imageUtils'
import { eventsService } from '@/features/events/services/eventsService'
import { PageLoading } from '@/components/PageLoading'
import { format, addHours } from 'date-fns'
import { zhTW } from 'date-fns/locale'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const SKILL_LEVEL_LABELS = {
  any: 'All levels',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
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
  minPeople: string
  isFree: boolean
  price: string
  priceNote: string
  skillLevel: SkillLevelKey
  gender: 'mixed' | 'female' | 'male'
  notes: string
  placeName: string
}
type RequiredFieldKey =
  | 'title'
  | 'sport'
  | 'capacity'
  | 'minPeople'
  | 'location'
  | 'startTime'
  | 'endTime'
  | 'price'
  | 'priceNote'

const initialState: FormState = {
  title: '',
  sport: '',
  sportKey: '',
  startTime: '',
  endTime: '',
  location: '',
  lat: '',
  lng: '',
  capacity: '',
  minPeople: '',
  isFree: true,
  price: '',
  priceNote: '',
  skillLevel: 'any',
  gender: 'mixed',
  notes: '',
  placeName: '',
}

const normalizeTwdIntegerString = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return ''
  const num = Number(value)
  if (!Number.isFinite(num)) return ''
  return String(Math.round(num))
}

const getTodayMidnightLocalValue = () => format(new Date(), "yyyy-MM-dd'T'00:00")

export default function CreateEventPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { items: sportsCatalog } = useSports('en')
  const [form, setForm] = useState<FormState>(initialState)
  const [error, setError] = useState<string | null>(null)
  const [submittingStatus, setSubmittingStatus] = useState<'draft' | 'published' | null>(null)
  const isSubmitting = submittingStatus !== null
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
  const [costMode, setCostMode] = useState<'total' | 'person'>('total')
  const [isDraftLoading, setIsDraftLoading] = useState(false)
  const [editingEventStatus, setEditingEventStatus] = useState<'draft' | 'published' | null>(null)
  const [editingEventVisibility, setEditingEventVisibility] = useState<'public' | 'private' | null>(
    null
  )
  const [highlightField, setHighlightField] = useState<RequiredFieldKey | null>(null)
  const [fieldHint, setFieldHint] = useState<{
    field: RequiredFieldKey
    message: string
    tone: 'error' | 'muted'
  } | null>(null)
  const highlightTimerRef = useRef<number | null>(null)
  const fieldRefs = useRef<Record<RequiredFieldKey, HTMLDivElement | null>>({
    title: null,
    sport: null,
    capacity: null,
    minPeople: null,
    location: null,
    startTime: null,
    endTime: null,
    price: null,
    priceNote: null,
  })

  const flashFieldError = (field: RequiredFieldKey, message: string) => {
    const el = fieldRefs.current[field]
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setHighlightField(field)
    setFieldHint({ field, message, tone: 'error' })
    if (highlightTimerRef.current) {
      window.clearTimeout(highlightTimerRef.current)
    }
    highlightTimerRef.current = window.setTimeout(() => {
      setHighlightField((prev) => (prev === field ? null : prev))
      setFieldHint((prev) => (prev?.field === field ? { ...prev, tone: 'muted' } : prev))
      highlightTimerRef.current = null
    }, 2000)
  }

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        window.clearTimeout(highlightTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!editId) return
    setIsDraftLoading(true)
    const fetchDraft = async () => {
      try {
        const res = await eventsService.getEventById(editId)
        if (res.success && res.data) {
          const draft = res.data
          setEditingEventStatus((draft.status as 'draft' | 'published' | undefined) ?? null)
          setEditingEventVisibility((draft.visibility as 'public' | 'private' | undefined) ?? null)
          const toLocalISO = (d: Date | string) => {
            if (!d) return ''
            const dateObj = typeof d === 'string' ? new Date(d) : d
            const offset = dateObj.getTimezoneOffset() * 60000
            return new Date(dateObj.getTime() - offset).toISOString().slice(0, 16)
          }

          let sportLabel = ''
          if (draft.sport) {
            const found = sportsCatalog.find((s) => s.key === draft.sport)
            sportLabel = found?.label || draft.sport
          }

          setForm({
            title: draft.title || '',
            sport: sportLabel,
            sportKey: draft.sport || '',
            startTime: draft.startTime ? toLocalISO(draft.startTime) : '',
            endTime: draft.endTime ? toLocalISO(draft.endTime) : '',
            location: draft.location.address || draft.location.name || '',
            lat: draft.location.lat ? String(draft.location.lat) : '',
            lng: draft.location.lng ? String(draft.location.lng) : '',
            capacity: String(draft.maxAttendees || 3),
            minPeople: String(draft.minPeople || 3),
            isFree: draft.isFree ?? true,
            price: (
              draft.priceMode === 'person'
                ? draft.pricePerPerson
                : (draft.priceTotal ?? draft.pricePerPerson)
            )
              ? draft.priceMode === 'person'
                ? normalizeTwdIntegerString(draft.pricePerPerson)
                : draft.maxAttendees
                  ? normalizeTwdIntegerString(
                      draft.priceTotal ?? draft.pricePerPerson * draft.maxAttendees
                    )
                  : normalizeTwdIntegerString(draft.priceTotal ?? draft.pricePerPerson)
              : '',
            priceNote: (draft as any).priceNote || '',
            skillLevel: (draft.skillLevel as SkillLevelKey) || 'any',
            gender: draft.gender || 'mixed',
            notes: draft.detail?.description || draft.description || '',
            placeName: draft.location.name || '',
          })
          setCostMode(draft.priceMode === 'person' ? 'person' : 'total')

          if (draft.location.address || draft.location.name) {
            setSelectedAddress(draft.location.address || draft.location.name || '')
            if (draft.location.lat && draft.location.lng) {
              setSelectedLocation({ lat: draft.location.lat, lng: draft.location.lng })
            }
          }

          if (draft.photos && draft.photos.length > 0) {
            setHeroPreviews(draft.photos)
          }
        } else {
          setError('Unable to load draft: event not found.')
        }
      } catch (err) {
        console.error('Failed to load draft', err)
        setError('An error occurred while loading the draft.')
      } finally {
        setIsDraftLoading(false)
      }
    }
    fetchDraft()
  }, [editId, sportsCatalog])

  // Auto-pin map 2 seconds after address input without overwriting text
  useEffect(() => {
    if (!showLocationSheet) return
    if (addressMode !== 'manual') return
    if (isAddressClearing) return
    const address = selectedAddress.trim()
    if (!address) return

    const handle = setTimeout(async () => {
      setAddressLookupPending(true)
      const loc = await forwardGeocode(address)
      if (loc) {
        setSelectedLocation(loc)
        setReverseGeoError(null)
      } else {
        setReverseGeoError('Please enter a valid address')
      }
      setAddressLookupPending(false)
    }, 2000)

    return () => clearTimeout(handle)
  }, [selectedAddress, showLocationSheet, addressMode, isAddressClearing])

  // Reverse geocode when user moves map (addressMode='auto')
  useEffect(() => {
    if (!showLocationSheet) return
    if (addressMode !== 'auto') return
    if (!selectedLocation) return

    const handle = setTimeout(async () => {
      const addr = await reverseGeocode(selectedLocation)
      if (addr) {
        setSelectedAddress(addr)
      }
    }, 800) // Debounce lightly

    return () => clearTimeout(handle)
  }, [selectedLocation, addressMode, showLocationSheet])

  const forwardGeocode = async (address: string) => {
    if (!MAPBOX_TOKEN || !address.trim()) return null
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address.trim()
    )}.json?language=zh-Hant&limit=1&access_token=${MAPBOX_TOKEN}`
    try {
      const res = await fetch(url)
      const data = await res.json()
      const feature = data?.features?.[0]
      if (!feature?.center) return null
      return { lng: feature.center[0], lat: feature.center[1] } as LatLng
    } catch {
      return null
    }
  }

  const reverseGeocode = async (loc: LatLng) => {
    if (!MAPBOX_TOKEN) return null
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${loc.lng},${loc.lat}.json?language=zh-Hant&limit=1&access_token=${MAPBOX_TOKEN}`
    try {
      const res = await fetch(url)
      const data = await res.json()
      // Prefer precise address (POIs or addresses)
      const feature = data?.features?.[0]
      return feature?.place_name || feature?.text || ''
    } catch {
      return null
    }
  }

  const minPeopleImmediateError = useMemo(() => {
    if (!form.capacity || !form.minPeople) return null
    const capacity = Number(form.capacity)
    const minPeople = Number(form.minPeople)
    if (!Number.isFinite(capacity) || !Number.isFinite(minPeople)) return null
    if (capacity > 0 && minPeople > capacity) {
      return 'Cannot be greater than max participants'
    }
    return null
  }, [form.capacity, form.minPeople])

  const canSubmit = useMemo(() => {
    return Boolean(
      form.title.trim() &&
      form.sportKey.trim() &&
      form.startTime &&
      form.endTime &&
      Number(form.capacity) > 0 &&
      form.location.trim() &&
      !minPeopleImmediateError
    )
  }, [form, minPeopleImmediateError])

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target
    if (name === 'skillLevel') {
      setForm((prev) => ({ ...prev, skillLevel: value as SkillLevelKey }))
      return
    }
    if (name === 'startTime') {
      const newStart = new Date(value)
      if (!Number.isNaN(newStart.getTime())) {
        const newEnd = addHours(newStart, 2)
        setForm((prev) => ({
          ...prev,
          startTime: value,
          endTime: format(newEnd, "yyyy-MM-dd'T'HH:mm"),
        }))
        return
      }
    }
    if (name === 'price') {
      setForm((prev) => ({ ...prev, price: normalizeTwdIntegerString(value) }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const ensureDateTimeDefault = (field: 'startTime' | 'endTime') => {
    setForm((prev) => {
      if (prev[field]) return prev
      return { ...prev, [field]: getTodayMidnightLocalValue() }
    })
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
      // Do not prefill address or force geocode; let users choose point or input manually
      setSelectedLocation(null)
      setSelectedAddress('')
      setAddressMode('manual')
    }
    setShowLocationSheet(true)
  }

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(event.target.files ?? [])
    if (!rawFiles.length) return

    const currentCount = heroPreviews.length
    if (currentCount >= 3) {
      alert('You can upload up to 3 photos')
      event.target.value = ''
      return
    }

    const remaining = 3 - currentCount
    const filesToProcess = rawFiles.slice(0, remaining)

    try {
      const processedFiles = await Promise.all(
        filesToProcess.map((file: File) => convertFileToWebP(file))
      )
      const newPreviews = processedFiles.map((file) => URL.createObjectURL(file))
      setHeroPreviews((prev) => [...prev, ...newPreviews])
      setSelectedFiles((prev) => [...prev, ...processedFiles])
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

  const handleSubmit = async (
    event?: FormEvent<HTMLFormElement>,
    status: 'draft' | 'published' = 'published'
  ) => {
    event?.preventDefault?.()
    if (isSubmitting) return
    setError(null)

    if (!form.title.trim()) {
      flashFieldError('title', 'Please enter an event title')
      return
    }
    if (!form.sportKey) {
      flashFieldError('sport', 'Please select a sport')
      return
    }
    if (!form.capacity || Number(form.capacity) <= 0) {
      flashFieldError('capacity', 'Max participants must be greater than 0')
      return
    }
    if (!form.minPeople || Number(form.minPeople) < 1) {
      flashFieldError('minPeople', 'Cannot be less than 1')
      return
    }
    if (!form.location.trim()) {
      flashFieldError('location', 'Please select a location')
      return
    }
    if (!form.startTime) {
      flashFieldError('startTime', 'Please select a start time')
      return
    }
    if (!form.endTime) {
      flashFieldError('endTime', 'Please select an end time')
      return
    }
    if (!canSubmit) {
      flashFieldError('title', 'Please complete required fields')
      return
    }

    // Cost validation
    if (!form.isFree) {
      if (!form.price || Number(form.price) <= 0) {
        flashFieldError('price', 'Please enter a valid fee')
        return
      }
      if (!form.priceNote.trim()) {
        flashFieldError('priceNote', 'Please enter fee notes')
        return
      }
    }

    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }

    // Capacity & Time Logic
    const capacity = Number(form.capacity)
    const latNum = form.lat ? Number(form.lat) : null
    const lngNum = form.lng ? Number(form.lng) : null

    if (capacity <= 0) {
      flashFieldError('capacity', 'Max participants must be greater than 0')
      return
    }

    const minPeople = Number(form.minPeople)
    if (minPeople < 1) {
      flashFieldError('minPeople', 'Cannot be less than 1')
      return
    }
    if (minPeopleImmediateError) {
      flashFieldError('minPeople', minPeopleImmediateError)
      return
    }
    if (minPeople > capacity) {
      flashFieldError('minPeople', 'Cannot be greater than max participants')
      return
    }

    if (latNum === null || lngNum === null) {
      flashFieldError('location', 'Please confirm venue location on the map')
      return
    }

    const startDate = new Date(form.startTime)
    const endDate = new Date(form.endTime)

    if (Number.isNaN(startDate.getTime())) {
      flashFieldError('startTime', 'Please select a valid start time')
      return
    }
    if (Number.isNaN(endDate.getTime())) {
      flashFieldError('endTime', 'Please select a valid end time')
      return
    }
    if (endDate <= startDate) {
      flashFieldError('endTime', 'End time must be after start time')
      return
    }
    const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000)
    if (Number.isNaN(durationMinutes) || durationMinutes <= 0) {
      setError('Unable to calculate event duration, please adjust times.')
      return
    }
    if (Number.isNaN(capacity) || capacity <= 0) {
      setError('Max participants must be greater than 0。')
      return
    }

    // Calculate per-person price
    let pricePerPerson: number | undefined
    let priceTotal: number | undefined
    if (!form.isFree && form.price) {
      const priceVal = parseFloat(form.price)
      if (!Number.isNaN(priceVal) && capacity > 0) {
        if (costMode === 'total') {
          priceTotal = priceVal
          pricePerPerson = undefined
        } else {
          priceTotal = undefined
          pricePerPerson = priceVal
        }
      }
    }

    setError(null)
    setSubmittingStatus(status)
    try {
      // 1. Upload Images or use existing
      let uploadedPhotoUrls: string[] = []

      // Upload new files
      const newPhotoUrls = await Promise.all(
        selectedFiles.map((file) => uploadService.uploadSessionPhoto(file))
      )

      // Get existing remote URLs
      const existingPhotoUrls = heroPreviews.filter((url) => url.startsWith('http'))

      // Combine: Existing first, then new
      uploadedPhotoUrls = [...existingPhotoUrls, ...newPhotoUrls]

      const commonPayload = {
        title: form.title.trim(),
        sport: form.sportKey.trim(),
        description: form.notes.trim(),
        notesForAttendees: form.notes.trim(),
        priceNote: form.priceNote.trim(),
        startTime: startDate,
        duration: durationMinutes,
        maxAttendees: capacity,
        minPeople: Number(form.minPeople),
        location: {
          name: form.placeName.trim(),
          address: form.location.trim(),
          lat: latNum ?? undefined,
          lng: lngNum ?? undefined,
          source: 'map_select',
        },
        isFree: form.isFree,
        priceTotal,
        pricePerPerson,
        priceMode: costMode,
        skillLevel: form.skillLevel,
        gender: form.gender,
        coverPhotoUrl: uploadedPhotoUrls[0],
        photos: uploadedPhotoUrls,
        status,
      }

      if (editId) {
        // Update existing event
        const res = await eventsService.updateEvent(editId, commonPayload)
        if (res.success) {
          if (status === 'draft') {
            navigate('/profile', { state: { tab: 'upcoming' }, replace: true })
          } else {
            navigate(`/event/${editId}`, { state: { from: 'create-event' }, replace: true })
          }
        } else {
          setError(res.error?.message || 'Failed to update publish status.')
        }
      } else {
        // Create new event
        const res = await eventsService.createEvent(commonPayload)
        if (res.success && res.data) {
          if (status === 'draft') {
            navigate('/profile', { state: { tab: 'upcoming' }, replace: true })
          } else {
            navigate(`/event/${res.data.id}`, { state: { from: 'create-event' }, replace: true })
          }
        } else {
          setError(res.error?.message || 'Failed to publish event.')
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred while saving the event.')
    } finally {
      setSubmittingStatus(null)
    }
  }

  const handleRemoveImage = (index: number) => {
    const targetUrl = heroPreviews[index]
    const isBlob = targetUrl.startsWith('blob:')

    if (isBlob) {
      // Find which selectedFile index this corresponds to
      // Count how many blobs are before this index in heroPreviews
      let blobIndex = 0
      for (let i = 0; i < index; i++) {
        if (heroPreviews[i].startsWith('blob:')) {
          blobIndex++
        }
      }
      setSelectedFiles((prev) => prev.filter((_, i) => i !== blobIndex))
    }

    setHeroPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <>
      <div className="min-h-screen bg-white pb-24">
        <ActionToolbar
          showBack={false}
          onBack={handleCancel}
          onToggleFavorite={() => setIsFavorite((prev) => !prev)}
          isFavorite={isFavorite}
          showFavorite={false}
          showShare={false}
          title={editId ? 'Edit Event' : 'Create Event'}
          contentClassName="w-full max-w-md px-4"
          leftContent={
            <button
              type="button"
              onClick={handleCancel}
              className="flex h-10 w-10 items-center justify-center text-slate-500"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          }
          rightContent={<span className="h-10 w-10" aria-hidden="true" />}
        />
        {isDraftLoading && <PageLoading />}
        <form
          id="event-form"
          className="mx-auto mt-2 w-full max-w-md space-y-6 px-4 pb-8"
          onSubmit={(e) => handleSubmit(e, 'published')}
        >
          {error && (
            <div className="sticky top-4 z-50 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm">
              {error}
            </div>
          )}

          <div className="space-y-8">
            <FieldSection title="Event Basics" description="">
              <div ref={(el) => (fieldRefs.current.title = el)}>
                <FloatingField
                  label="Event Title"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  required
                  hasError={highlightField === 'title'}
                />
                {fieldHint?.field === 'title' && fieldHint.message && (
                  <p
                    className={clsx(
                      'mt-1 px-4 text-xs',
                      fieldHint.tone === 'error' ? 'text-red-500' : 'text-slate-400'
                    )}
                  >
                    {fieldHint.message}
                  </p>
                )}
              </div>
              <div ref={(el) => (fieldRefs.current.sport = el)}>
                <FloatingField
                  label="Sport"
                  name="sport"
                  value={form.sport}
                  readOnly
                  onClick={() => setShowSportSheet(true)}
                  placeholder="Select sport"
                  required
                  hasError={highlightField === 'sport'}
                />
                {fieldHint?.field === 'sport' && fieldHint.message && (
                  <p
                    className={clsx(
                      'mt-1 px-4 text-xs',
                      fieldHint.tone === 'error' ? 'text-red-500' : 'text-slate-400'
                    )}
                  >
                    {fieldHint.message}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <div className="flex-1" ref={(el) => (fieldRefs.current.capacity = el)}>
                  <FloatingField
                    label="Max Participants"
                    name="capacity"
                    type="number"
                    min={1}
                    value={form.capacity}
                    onChange={handleInputChange}
                    required
                    hasError={highlightField === 'capacity'}
                  />
                  {fieldHint?.field === 'capacity' && fieldHint.message && (
                    <p
                      className={clsx(
                        'mt-1 px-4 text-xs',
                        fieldHint.tone === 'error' ? 'text-red-500' : 'text-slate-400'
                      )}
                    >
                      {fieldHint.message}
                    </p>
                  )}
                </div>
                <div className="flex-1" ref={(el) => (fieldRefs.current.minPeople = el)}>
                  <FloatingField
                    label="Min Participants"
                    name="minPeople"
                    type="number"
                    min={1}
                    value={form.minPeople}
                    onChange={handleInputChange}
                    required
                    hasError={highlightField === 'minPeople' || Boolean(minPeopleImmediateError)}
                  />
                  {minPeopleImmediateError ? (
                    <p className="mt-1 px-4 text-xs text-red-500">{minPeopleImmediateError}</p>
                  ) : fieldHint?.field === 'minPeople' && fieldHint.message ? (
                    <p
                      className={clsx(
                        'mt-1 px-4 text-xs',
                        fieldHint.tone === 'error' ? 'text-red-500' : 'text-slate-400'
                      )}
                    >
                      {fieldHint.message}
                    </p>
                  ) : null}
                </div>
              </div>
              <SkillSelector selected={form.skillLevel} onSelect={handleSkillSelect} />
              <GenderSelector selected={form.gender} onSelect={handleGenderSelect} />
            </FieldSection>

            <FieldSection title="Location and Time" description="">
              <div className="space-y-4">
                <div ref={(el) => (fieldRefs.current.location = el)}>
                  <button
                    type="button"
                    onClick={openLocationPicker}
                    className={clsx(
                      'flex w-full items-center justify-between rounded-2xl border bg-slate-50 p-4 transition',
                      highlightField === 'location' ? 'border-red-500' : 'border-slate-200'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100/50 text-blue-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="mb-0.5 text-sm font-bold leading-tight text-slate-900">
                          {form.location || 'Tap to select location'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
                {fieldHint?.field === 'location' && fieldHint.message && (
                  <p
                    className={clsx(
                      'mt-1 px-4 text-xs',
                      fieldHint.tone === 'error' ? 'text-red-500' : 'text-slate-400'
                    )}
                  >
                    {fieldHint.message}
                  </p>
                )}
                {reverseGeoError && <p className="text-xs text-red-500">{reverseGeoError}</p>}

                <FloatingField
                  label="Venue Name (Optional)"
                  name="placeName"
                  placeholder="If you know the venue name, enter it here."
                  value={form.placeName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-4">
                <div ref={(el) => (fieldRefs.current.startTime = el)}>
                  <DateTimeField
                    label="Start Time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleInputChange}
                    onOpen={() => ensureDateTimeDefault('startTime')}
                    required
                    hasError={highlightField === 'startTime'}
                  />
                  {fieldHint?.field === 'startTime' && fieldHint.message && (
                    <p
                      className={clsx(
                        'mt-1 px-4 text-xs',
                        fieldHint.tone === 'error' ? 'text-red-500' : 'text-slate-400'
                      )}
                    >
                      {fieldHint.message}
                    </p>
                  )}
                </div>
                <div ref={(el) => (fieldRefs.current.endTime = el)}>
                  <DateTimeField
                    label="End Time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleInputChange}
                    onOpen={() => ensureDateTimeDefault('endTime')}
                    required
                    hasError={highlightField === 'endTime'}
                  />
                  {fieldHint?.field === 'endTime' && fieldHint.message && (
                    <p
                      className={clsx(
                        'mt-1 px-4 text-xs',
                        fieldHint.tone === 'error' ? 'text-red-500' : 'text-slate-400'
                      )}
                    >
                      {fieldHint.message}
                    </p>
                  )}
                </div>
              </div>
            </FieldSection>

            <FieldSection title="Pricing" description="Set event pricing details.">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition">
                  <input
                    id="is-free-checkbox"
                    type="checkbox"
                    checked={form.isFree}
                    onChange={(e) => setForm((prev) => ({ ...prev, isFree: e.target.checked }))}
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is-free-checkbox" className="flex flex-1 flex-col">
                    <span className="text-sm font-semibold text-slate-800">Free</span>
                  </label>
                </div>

                {!form.isFree && (
                  <div className="grid gap-4 duration-300 animate-in fade-in slide-in-from-top-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <div className="flex rounded-lg bg-slate-100 p-1">
                        {[
                          { key: 'total', label: 'Total Cost' },
                          { key: 'person', label: 'Per Person' },
                        ].map((mode) => (
                          <button
                            key={mode.key}
                            type="button"
                            onClick={() => setCostMode(mode.key as any)}
                            className={clsx(
                              'rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
                              costMode === mode.key
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            )}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                      <span className="text-xs text-slate-400">
                        {costMode === 'total'
                          ? 'Per-person fee is estimated from total participants.'
                          : 'Set per-person fee directly.'}
                      </span>
                    </div>

                    <div ref={(el) => (fieldRefs.current.price = el)}>
                      <FloatingField
                        label={costMode === 'total' ? 'Total Cost (TWD)' : 'Per Person (TWD)'}
                        name="price"
                        type="number"
                        min={0}
                        step={1}
                        value={form.price}
                        onChange={handleInputChange}
                        placeholder={costMode === 'total' ? 'e.g. 2000' : 'e.g. 200'}
                        required={!form.isFree}
                        hasError={highlightField === 'price'}
                        supportingText={
                          form.price && Number(form.capacity) > 0 && costMode === 'total'
                            ? `Est. per person: $${Math.round(Number(form.price) / Number(form.capacity))}`
                            : undefined
                        }
                      />
                      {fieldHint?.field === 'price' && fieldHint.message && (
                        <p
                          className={clsx(
                            'mt-1 px-4 text-xs',
                            fieldHint.tone === 'error' ? 'text-red-500' : 'text-slate-400'
                          )}
                        >
                          {fieldHint.message}
                        </p>
                      )}
                    </div>
                    <div ref={(el) => (fieldRefs.current.priceNote = el)}>
                      <FloatingField
                        as="textarea"
                        rows={3}
                        label="Fee Notes"
                        name="priceNote"
                        value={form.priceNote}
                        onChange={handleInputChange}
                        placeholder="e.g. on-site payment"
                        hasError={highlightField === 'priceNote'}
                      />
                      {fieldHint?.field === 'priceNote' && fieldHint.message && (
                        <p
                          className={clsx(
                            'mt-1 px-4 text-xs',
                            fieldHint.tone === 'error' ? 'text-red-500' : 'text-slate-400'
                          )}
                        >
                          {fieldHint.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </FieldSection>

            <div className="py-1">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 border-t border-dashed border-slate-300" />
                <span className="text-xs font-semibold tracking-wide text-slate-400">
                  Optional below
                </span>
                <div className="h-px flex-1 border-t border-dashed border-slate-300" />
              </div>
            </div>

            <FieldSection title="Event Photos" description="Up to 3 photos">
              <CoverUploader
                previews={heroPreviews}
                onChange={handleImageChange}
                onRemove={handleRemoveImage}
              />
            </FieldSection>

            <FieldSection
              title="Event Description"
              description="Describe the vibe, expectations, or notes."
            >
              <FloatingField
                as="textarea"
                label="Event Description"
                name="notes"
                rows={5}
                value={form.notes}
                onChange={handleInputChange}
              />
            </FieldSection>
          </div>
        </form>

        <ActionBar
          canSubmit={canSubmit}
          submittingStatus={submittingStatus}
          onDraft={() => handleSubmit(undefined, 'draft')}
          onPublish={() => handleSubmit(undefined, 'published')}
          showDraftButton={!editId || editingEventStatus === 'draft'}
          isPublicPublishedEdit={
            !!editId && editingEventStatus === 'published' && editingEventVisibility === 'public'
          }
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
          title="Select Sport"
          subtitle="Pick one sport from the list."
          height="tall"
          className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
          contentClassName="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          primaryButton={{
            label: 'Close',
            onClick: () => setShowSportSheet(false),
          }}
          showHandle={false}
        >
          <input
            value={sportSearch}
            onChange={(e) => setSportSearch(e.target.value)}
            placeholder="Search sports"
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
                        : 'border-slate-200 bg-white text-slate-800'
                    )}
                  >
                    {sport.icon && <span className="mr-2 text-xl">{sport.icon}</span>}
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
          title="Select Location"
          subtitle="Pin location based on your address"
          height="tall"
          className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
          contentClassName="flex-1 overflow-hidden px-4 pb-4 pt-2 space-y-3"
          primaryButton={{
            label: locationConfirming ? 'Processing...' : 'Confirm',
            onClick: async () => {
              if (locationConfirming) return
              setLocationConfirming(true)

              // Allow clearing existing location data
              if (!selectedAddress.trim() && !selectedLocation) {
                setForm((prev) => ({
                  ...prev,
                  location: '',
                  lat: '',
                  lng: '',
                }))
                setReverseGeoError(null)
                setShowLocationSheet(false)
                setLocationConfirming(false)
                return
              }

              let loc = selectedLocation
              if (!loc && selectedAddress.trim()) {
                loc = await forwardGeocode(selectedAddress.trim())
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
                setReverseGeoError('Please enter a valid address')
              }
              setLocationConfirming(false)
            },
            disabled: locationConfirming,
          }}
          showHandle={false}
        >
          <div className="space-y-2 rounded-2xl bg-slate-50 px-3 py-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">Event Address</p>
            </div>

            <div className="relative">
              <input
                type="text"
                value={selectedAddress}
                onChange={(e) => {
                  setSelectedAddress(e.target.value)
                  setAddressMode('manual')
                }}
                placeholder="Please enter an address"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-3 pr-10 text-sm font-semibold text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none"
              />
              {selectedAddress.trim() && (
                <button
                  type="button"
                  aria-label="Clear address"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500"
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

function ActionBar({
  canSubmit,
  submittingStatus,
  onDraft,
  onPublish,
  showDraftButton,
  isPublicPublishedEdit,
}: {
  canSubmit: boolean
  submittingStatus: 'draft' | 'published' | null
  onDraft: () => void
  onPublish: () => void
  showDraftButton: boolean
  isPublicPublishedEdit: boolean
}) {
  const isSubmitting = submittingStatus !== null
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 mx-auto w-full max-w-md bg-white/95 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-4 shadow-[0_-10px_30px_rgba(15,41,77,0.1)] backdrop-blur">
      <div className="flex w-full items-center gap-3 px-4">
        {showDraftButton && (
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={onDraft}
            className="flex-1 rounded-full border-slate-200 text-slate-600"
            disabled={!canSubmit || isSubmitting}
          >
            {submittingStatus === 'draft' ? 'Saving...' : 'Save Draft'}
          </Button>
        )}
        <Button
          size="sm"
          type="button"
          onClick={onPublish}
          disabled={isSubmitting}
          className={clsx(
            showDraftButton ? 'flex-1' : 'w-full',
            'rounded-full px-6',
            !canSubmit && 'opacity-50'
          )}
        >
          {submittingStatus === 'published'
            ? isPublicPublishedEdit
              ? 'Updating...'
              : 'Publishing...'
            : isPublicPublishedEdit
              ? 'Update & Publish'
              : 'Publish'}
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
    <div className="space-y-4 py-2">
      <div className="space-y-1">
        <p className="text-md font-semibold uppercase tracking-wide text-slate-600">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
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
      <p className="text-xs font-semibold tracking-wide text-slate-500">Skill Level</p>
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
                  : 'border-slate-200 bg-white text-slate-600'
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
  const options: { id: 'mixed' | 'female' | 'male'; label: string }[] = [
    { id: 'mixed', label: 'Mixed' },
    { id: 'female', label: 'Women Only' },
    { id: 'male', label: 'Men Only' },
  ]

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-wide text-slate-500">Gender</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = selected === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={clsx(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition',
                isActive
                  ? 'border-blue-500 bg-blue-600 text-white shadow-[0_6px_16px_rgba(30,64,175,0.25)]'
                  : 'border-slate-200 bg-white text-slate-600'
              )}
            >
              {opt.label}
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
  onRemove,
}: {
  previews?: string[]
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRemove?: (index: number) => void
}) {
  const hasImages = previews && previews.length > 0
  const isFull = previews && previews.length >= 3

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/50 p-2">
      <div className="grid grid-cols-3 gap-2">
        {/* Existing Previews */}
        {previews?.slice(0, 3).map((src, idx) => (
          <div
            key={src + idx}
            className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-100 shadow-sm"
          >
            <img src={src} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onRemove(idx)
                }}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}

        {/* Upload Button */}
        {!isFull && (
          <label className="group relative box-border flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-white p-2 transition">
            <div className="group- flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <ImagePlus className="h-4 w-4" />
            </div>
            <p className="group- text-[10px] font-semibold text-slate-500">Upload Photo</p>
            <input type="file" accept="image/*" multiple className="hidden" onChange={onChange} />
          </label>
        )}
      </div>
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
  hasError?: boolean
}

function FloatingField(props: FloatingFieldProps) {
  const { label, supportingText, characterLimit, hasError, ...domProps } = props as any
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
  const baseClasses = clsx(
    'peer block w-full appearance-none min-h-[3.5rem] rounded-[14px] border-2 bg-white px-4 pt-7 pb-3 text-base text-slate-900 transition focus:shadow-[0_0_0_1px_rgba(0,0,0,0.2)] focus:outline-none disabled:opacity-60',
    hasError ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-slate-900'
  )
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

function DateTimeField({
  label,
  value,
  name,
  onChange,
  onOpen,
  required,
  hasError,
}: {
  label: string
  value: string
  name: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onOpen?: () => void
  required?: boolean
  hasError?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null) // Typed ref

  const displayValue = useMemo(() => {
    if (!value) return ''
    try {
      const date = new Date(value)
      return format(date, 'yyyy/MM/dd HH:mm', { locale: zhTW })
    } catch {
      return ''
    }
  }, [value])

  const handleClick = () => {
    onOpen?.()
    if (inputRef.current) {
      if ('showPicker' in inputRef.current) {
        try {
          ;(inputRef.current as any).showPicker()
        } catch (err) {
          // Fallback or ignore if not supported/allowed
          inputRef.current.focus()
        }
      } else {
        inputRef.current.focus()
      }
    }
  }

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'relative w-full rounded-[14px] border-2 bg-white px-4 pb-3 pt-7 transition focus-within:shadow-[0_0_0_1px_rgba(0,0,0,0.2)]',
        hasError
          ? 'border-red-500 focus-within:border-red-500'
          : 'border-slate-300 focus-within:border-slate-900'
      )}
    >
      <label className="pointer-events-none absolute left-4 top-2 bg-white px-1 text-sm font-semibold text-slate-600">
        {label}
      </label>
      <div className={clsx('min-h-[1.5rem] w-full text-base', !displayValue && 'text-slate-400')}>
        {displayValue || 'Please select time'}
      </div>
      <input
        ref={inputRef}
        type="datetime-local"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none opacity-0"
        lang="zh-TW"
      />
    </div>
  )
}

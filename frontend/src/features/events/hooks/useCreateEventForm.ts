import { useMemo, useState, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { addHours, format } from 'date-fns'
import type { ChangeEvent, FormEvent } from 'react'
import { useAuthStore } from '@/hooks'
import { useSports } from '@/features/dictionaries/hooks'
import { inQldBounds, type LatLng } from '@/components/map/MapPicker'
import { uploadService } from '@/features/events/services/uploadService'
import { convertFileToWebP } from '@/utils/imageUtils'
import { eventsService } from '@/features/events/services/eventsService'
import { venueUpcomingEventsKey } from '@/features/venues/hooks/useVenueUpcomingEventsQuery'
import { venueByIdKey } from '@/features/venues/hooks/useVenueByIdQuery'
import { venueTodayEventsKey } from '@/features/venues/hooks/useVenueTodayEventsQuery'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

type SkillLevelKey = 'any' | 'beginner' | 'intermediate' | 'advanced'

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
  gender: 'mixed' | 'female' | 'male' | 'lgbtq'
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

const normalizeAudString = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return ''
  const str = String(value).trim()
  if (/^\d+\.?\d{0,2}$/.test(str)) return str
  const num = Number(str)
  if (!Number.isFinite(num)) return ''
  return String(Math.round(num * 100) / 100)
}

const getTodayMidnightLocalValue = () => format(new Date(), "yyyy-MM-dd'T'00:00")

export function useCreateEventForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')
  const venueLocationState = (location.state as any)?.venueLocation as
    | { name: string; address: string; lat: number; lng: number }
    | undefined

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hostGender = useAuthStore((state) => state.user?.gender)
  const { items: sportsCatalog } = useSports('en')
  const [form, setForm] = useState<FormState>(initialState)
  const [error, setError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
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
  const [isOutsideArea, setIsOutsideArea] = useState(false)
  const [locationConfirming, setLocationConfirming] = useState(false)
  const [addressLookupPending, setAddressLookupPending] = useState(false)
  const [isAddressClearing, setIsAddressClearing] = useState(false)
  const [costMode, setCostMode] = useState<'total' | 'person'>('total')
  const [isDraftLoading, setIsDraftLoading] = useState(false)
  const [editingEventStatus, setEditingEventStatus] = useState<'draft' | 'published' | null>(null)
  const [hasOtherParticipants, setHasOtherParticipants] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [isDeletingEvent, setIsDeletingEvent] = useState(false)
  const [isCancellingEvent, setIsCancellingEvent] = useState(false)
  const [editingEventVisibility, setEditingEventVisibility] = useState<'public' | 'private' | null>(null)
  const [highlightField, setHighlightField] = useState<RequiredFieldKey | null>(null)
  const [fieldHint, setFieldHint] = useState<{
    field: RequiredFieldKey
    message: string
    tone: 'error' | 'muted'
  } | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const highlightTimerRef = useRef<number | null>(null)
  const lastGeocodedRef = useRef<{ address: string; loc: LatLng } | null>(null)
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

  useEffect(() => {
    if (!venueLocationState || editId) return
    setForm((prev) => ({
      ...prev,
      placeName: venueLocationState.name,
      location: venueLocationState.address,
      lat: String(venueLocationState.lat),
      lng: String(venueLocationState.lng),
    }))
    setSelectedAddress(venueLocationState.address)
    setSelectedLocation({ lat: venueLocationState.lat, lng: venueLocationState.lng })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          const nonHostCount = (draft.participants ?? []).filter((p) => p.id !== draft.host?.id).length
          setHasOtherParticipants(nonHostCount > 0)
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
            price: (draft.priceMode === 'person' ? draft.pricePerPerson : (draft.priceTotal ?? draft.pricePerPerson))
              ? draft.priceMode === 'person'
                ? normalizeAudString(draft.pricePerPerson)
                : draft.maxAttendees
                  ? normalizeAudString(draft.priceTotal ?? (draft.pricePerPerson ?? 0) * draft.maxAttendees)
                  : normalizeAudString(draft.priceTotal ?? draft.pricePerPerson)
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
        lastGeocodedRef.current = { address, loc }
        setReverseGeoError(null)
        setIsOutsideArea(false)
      } else {
        setSelectedLocation(null)
        lastGeocodedRef.current = null
        setReverseGeoError("We're currently in soft launch in Greater Brisbane — more areas coming soon!")
        setIsOutsideArea(false)
      }
      setAddressLookupPending(false)
    }, 2000)

    return () => clearTimeout(handle)
  }, [selectedAddress, showLocationSheet, addressMode, isAddressClearing])

  useEffect(() => {
    if (!showLocationSheet) return
    if (addressMode !== 'auto') return
    if (!selectedLocation) return

    const handle = setTimeout(async () => {
      const addr = await reverseGeocode(selectedLocation)
      if (addr) {
        setSelectedAddress(addr)
      }
    }, 800)

    return () => clearTimeout(handle)
  }, [selectedLocation, addressMode, showLocationSheet])

  const forwardGeocode = async (address: string) => {
    if (!MAPBOX_TOKEN || !address.trim()) return null
    // No bbox — let Mapbox resolve the full address globally, then validate the result is in QLD
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address.trim())}.json?language=en&limit=1&country=AU&access_token=${MAPBOX_TOKEN}`
    try {
      const res = await fetch(url)
      const data = await res.json()
      const feature = data?.features?.[0]
      if (!feature?.center) return null
      const loc: LatLng = { lng: feature.center[0], lat: feature.center[1] }
      const regionCtx = feature.context?.find((c: { id: string }) => c.id.startsWith('region.'))
      // Accept if region is explicitly QLD, or if no region context but coords fall within QLD bounds
      if (regionCtx ? regionCtx.short_code !== 'AU-QLD' : !inQldBounds(loc)) return null
      return loc
    } catch {
      return null
    }
  }

  const reverseGeocode = async (loc: LatLng) => {
    if (!MAPBOX_TOKEN) return null
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${loc.lng},${loc.lat}.json?language=en&limit=1&country=AU&access_token=${MAPBOX_TOKEN}`
    try {
      const res = await fetch(url)
      const data = await res.json()
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
      form.title.length <= 70 &&
      form.sportKey.trim() &&
      form.startTime &&
      form.endTime &&
      Number(form.capacity) > 0 &&
      form.location.trim() &&
      !minPeopleImmediateError
    )
  }, [form, minPeopleImmediateError])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    if (name === 'skillLevel') {
      setForm((prev) => ({ ...prev, skillLevel: value as SkillLevelKey }))
      return
    }
    if (name === 'startTime') {
      const newStart = new Date(value)
      if (!Number.isNaN(newStart.getTime())) {
        setForm((prev) => {
          if (!prev.endTime) {
            return { ...prev, startTime: value, endTime: format(addHours(newStart, 2), "yyyy-MM-dd'T'HH:mm") }
          }
          const prevEnd = new Date(prev.endTime)
          const reanchored = new Date(newStart)
          reanchored.setHours(prevEnd.getHours(), prevEnd.getMinutes(), 0, 0)
          return { ...prev, startTime: value, endTime: format(reanchored, "yyyy-MM-dd'T'HH:mm") }
        })
        return
      }
    }
    if (name === 'price') {
      setForm((prev) => ({ ...prev, price: normalizeAudString(value) }))
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

  const changeLocation = (loc: LatLng) => {
    if (!inQldBounds(loc)) {
      setIsOutsideArea(true)
      setSelectedLocation(null)
      return
    }
    setIsOutsideArea(false)
    setSelectedLocation(loc)
    setAddressMode('auto')
  }

  const openLocationPicker = () => {
    setReverseGeoError(null)
    setIsOutsideArea(false)
    if (form.lat && form.lng) {
      setSelectedLocation({ lat: Number(form.lat), lng: Number(form.lng) })
      setSelectedAddress(form.location || '')
      setAddressMode('auto')
    } else {
      setSelectedLocation(null)
      setSelectedAddress('')
      setAddressMode('manual')
    }
    setShowLocationSheet(true)
  }

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(event.target.files ?? [])
    if (!rawFiles.length) return

    setPhotoError(null)

    const currentCount = heroPreviews.length
    if (currentCount >= 3) {
      setPhotoError('You can upload up to 3 photos.')
      event.target.value = ''
      return
    }

    const remaining = 3 - currentCount
    const filesToProcess = rawFiles.slice(0, remaining)
    const MAX_BYTES = 5 * 1024 * 1024

    const results: File[] = []
    for (const file of filesToProcess) {
      let processed: File
      try {
        processed = await convertFileToWebP(file)
        // HEIF compresses better than WebP — retry at smaller dimensions + lower quality if oversized
        if (processed.size > MAX_BYTES) {
          processed = await convertFileToWebP(file, 1280, 0.7)
        }
      } catch {
        // Unsupported format (e.g. HEIC canvas decode failure) — fall back to original
        processed = file
      }

      if (processed.size > MAX_BYTES) {
        const mb = (processed.size / 1024 / 1024).toFixed(1)
        setPhotoError(`Photo is too large (${mb} MB). Please use a photo under 5 MB.`)
        event.target.value = ''
        return
      }

      results.push(processed)
    }

    const newPreviews = results.map((f) => URL.createObjectURL(f))
    setHeroPreviews((prev) => [...prev, ...newPreviews])
    setSelectedFiles((prev) => [...prev, ...results])
    event.target.value = ''
  }

  const handleSportSelect = (key: string, label: string) => {
    setForm((prev) => ({ ...prev, sport: label, sportKey: key }))
    setShowSportSheet(false)
  }

  const handleCancel = () => {
    const state = location.state as any
    if (state?.fromAuth) {
      navigate(state.backTo ?? '/', { replace: true })
      return
    }
    if (window.history.length > 1) {
      navigate(-1)
    } else if (state?.backTo) {
      navigate(state.backTo, { replace: true })
    } else {
      navigate('/')
    }
  }

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>, status: 'draft' | 'published' = 'published') => {
    event?.preventDefault?.()
    if (isSubmitting) return
    setError(null)

    if (!form.title.trim()) {
      flashFieldError('title', 'Please enter an event title')
      return
    }
    if (form.title.length > 70) return
    if (!form.sportKey) {
      flashFieldError('sport', 'Please select a sport')
      return
    }
    if (!form.capacity || Number(form.capacity) <= 0 || Number(form.capacity) > 30) {
      flashFieldError('capacity', 'Max participants must be between 1 and 30')
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

    if (!form.isFree) {
      if (form.price === '' || Number(form.price) < 0 || Number(form.price) > 9999.99) {
        flashFieldError('price', 'Price must be between $0 and $9,999.99')
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
    if (status === 'published' && startDate < new Date()) {
      flashFieldError('startTime', 'Start time cannot be in the past')
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
    if (startDate.toDateString() !== endDate.toDateString()) {
      flashFieldError('endTime', 'Event must start and end on the same day')
      return
    }
    const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000)
    if (Number.isNaN(durationMinutes) || durationMinutes <= 0) {
      setError('Unable to calculate event duration, please adjust times.')
      return
    }
    if (durationMinutes > 480) {
      flashFieldError('endTime', 'Event duration cannot exceed 8 hours')
      return
    }
    if (Number.isNaN(capacity) || capacity <= 0 || capacity > 30) {
      setError('Max participants must be between 1 and 30.')
      return
    }

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
      let uploadedPhotoUrls: string[] = []

      const newPhotoUrls = await Promise.all(selectedFiles.map((file) => uploadService.uploadSessionPhoto(file)))

      const existingPhotoUrls = heroPreviews.filter((url) => url.startsWith('http'))

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
        const res = await eventsService.updateEvent(editId, commonPayload)
        if (res.success) {
          void queryClient.invalidateQueries({ queryKey: ['events', 'my'] })
          if (status === 'draft') {
            navigate('/profile/hosted-events?tab=draft', { replace: true })
          } else {
            const backTo = (location.state as any)?.backTo as string | undefined
            navigate(`/event/${editId}`, {
              state: { from: 'create-event', backTo },
              replace: true,
            })
          }
        } else {
          console.error('Update event failed:', res.error?.message)
          setError('Something went wrong. Please try again.')
        }
      } else {
        const res = await eventsService.createEvent(commonPayload)
        if (res.success && res.data) {
          const backTo = (location.state as any)?.backTo as string | undefined
          const venueId = (location.state as any)?.venueId as string | undefined
          if (venueId) {
            void queryClient.invalidateQueries({ queryKey: venueUpcomingEventsKey(venueId) })
            void queryClient.invalidateQueries({ queryKey: venueTodayEventsKey(venueId) })
            void queryClient.invalidateQueries({ queryKey: venueByIdKey(venueId) })
          }
          void queryClient.invalidateQueries({ queryKey: ['events', 'feed'] })
          void queryClient.invalidateQueries({ queryKey: ['events', 'my'] })
          if (status === 'draft') {
            navigate('/profile/hosted-events?tab=draft', { replace: true })
          } else {
            navigate(`/event/${res.data.id}`, {
              state: { from: 'create-event', backTo },
              replace: true,
            })
          }
        } else {
          console.error('Create event failed:', res.error?.message)
          setError('Something went wrong. Please try again.')
        }
      }
    } catch (err: any) {
      console.error('Save event error:', err?.message)
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmittingStatus(null)
    }
  }

  const handleRemoveImage = (index: number) => {
    const targetUrl = heroPreviews[index]
    const isBlob = targetUrl.startsWith('blob:')

    if (isBlob) {
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

  const confirmLocation = async () => {
    if (locationConfirming) return
    setLocationConfirming(true)

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

    let loc: LatLng | null = selectedLocation
    if (addressMode === 'manual' && selectedAddress.trim()) {
      const trimmed = selectedAddress.trim()
      const cached = lastGeocodedRef.current
      if (cached?.address === trimmed) {
        loc = cached.loc
        setSelectedLocation(loc)
      } else {
        loc = await forwardGeocode(trimmed)
        if (loc) {
          setSelectedLocation(loc)
          lastGeocodedRef.current = { address: trimmed, loc }
        } else {
          setSelectedLocation(null)
          lastGeocodedRef.current = null
        }
      }
    } else if (!loc && selectedAddress.trim()) {
      loc = await forwardGeocode(selectedAddress.trim())
      setSelectedLocation(loc)
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
      setReverseGeoError("We're currently in soft launch in Greater Brisbane — more areas coming soon!")
    }
    setLocationConfirming(false)
  }

  const clearAddress = () => {
    setIsAddressClearing(true)
    setSelectedAddress('')
    setSelectedLocation(null)
    setAddressMode('manual')
    setReverseGeoError(null)
    setIsOutsideArea(false)
    setTimeout(() => setIsAddressClearing(false), 0)
  }

  const setFieldRef =
    (field: RequiredFieldKey) =>
    (element: HTMLDivElement | null): void => {
      fieldRefs.current[field] = element
    }

  const handleDeleteEvent = () => setShowDeleteConfirm(true)

  const confirmDeleteEvent = async () => {
    if (!editId) return
    setIsDeletingEvent(true)
    try {
      const res = await eventsService.deleteEvent(editId)
      if (res.success) {
        void queryClient.invalidateQueries({ queryKey: ['events', 'my', 'hosted'] })
        navigate('/profile/hosted-events?tab=upcoming', { replace: true })
      }
    } catch (err) {
      console.error('Delete failed', err)
    } finally {
      setIsDeletingEvent(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleCancelEvent = () => setShowCancelConfirm(true)

  const confirmCancelEvent = async () => {
    if (!editId) return
    setIsCancellingEvent(true)
    try {
      const res = await eventsService.updateEvent(editId, { status: 'cancelled' } as any)
      if (res.success) {
        void queryClient.invalidateQueries({ queryKey: ['events', 'my', 'hosted'] })
        navigate(`/event/${editId}`, { replace: true, state: { from: 'create-event' } })
      }
    } catch (err) {
      console.error('Cancel failed', err)
    } finally {
      setIsCancellingEvent(false)
      setShowCancelConfirm(false)
    }
  }

  return {
    form,
    setForm,
    editId,
    error,
    photoError,
    submittingStatus,
    canSubmit,
    isFavorite,
    setIsFavorite,
    heroPreviews,
    showLoginPrompt,
    setShowLoginPrompt,
    showSportSheet,
    setShowSportSheet,
    sportSearch,
    setSportSearch,
    showLocationSheet,
    setShowLocationSheet,
    selectedLocation,
    setSelectedLocation,
    selectedAddress,
    setSelectedAddress,
    setAddressMode,
    reverseGeoError,
    setReverseGeoError,
    isOutsideArea,
    changeLocation,
    locationConfirming,
    isDraftLoading,
    editingEventStatus,
    hasOtherParticipants,
    showDeleteConfirm,
    setShowDeleteConfirm,
    showCancelConfirm,
    setShowCancelConfirm,
    isDeletingEvent,
    isCancellingEvent,
    handleDeleteEvent,
    handleCancelEvent,
    confirmDeleteEvent,
    confirmCancelEvent,
    editingEventVisibility,
    highlightField,
    fieldHint,
    costMode,
    setCostMode,
    sportsCatalog,
    minPeopleImmediateError,
    addressLookupPending,
    isAddressClearing,
    clearAddress,
    handleInputChange,
    ensureDateTimeDefault,
    handleSkillSelect,
    handleGenderSelect,
    openLocationPicker,
    handleImageChange,
    handleSportSelect,
    handleCancel,
    handleSubmit,
    handleRemoveImage,
    setFieldRef,
    confirmLocation,
    hostGender,
  }
}

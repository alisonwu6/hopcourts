import { useEffect, useMemo, useRef, useState } from 'react'
import { useSports } from '@/features/dictionaries/hooks'
import { useAuthStore } from '@/hooks'
import type { Sport } from '@/types/dictionary'
import {
  venuesService,
  type OwnershipRole,
  type SubmitOfficialVenueRequest,
  type SubmitPublicVenueRequest,
  type SubmitVenueResponse,
} from '../services/venuesService'

export type { OwnershipRole } from '../services/venuesService'

export type SubmitVenueMode = 'official' | 'public'

export type SubmitVenueFormState = {
  name: string
  address: string
  lat: number | null
  lng: number | null
  sportKeys: string[]
  otherSportLabel: string
  ownershipRole: OwnershipRole | ''
}

export type SubmitVenueField = keyof SubmitVenueFormState
export type SubmitVenueFieldErrors = Partial<Record<SubmitVenueField, string>>
export type SelectedVenueSport = Pick<Sport, 'key' | 'label' | 'icon'>

const initialState: SubmitVenueFormState = {
  name: '',
  address: '',
  lat: null,
  lng: null,
  sportKeys: [],
  otherSportLabel: '',
  ownershipRole: '',
}

const REQUIRED_MESSAGES: Record<Extract<SubmitVenueField, 'name' | 'address' | 'sportKeys' | 'ownershipRole'>, string> = {
  name: 'Please enter a venue name',
  address: 'Please choose a venue address',
  sportKeys: 'Please select at least one sport',
  ownershipRole: 'Please select your relationship to this venue',
}

type UseSubmitVenueFormParams = {
  mode: SubmitVenueMode
  onSuccess: (response: SubmitVenueResponse) => void
  onUnauthenticatedClose: () => void
}

export function useSubmitVenueForm({ mode, onSuccess, onUnauthenticatedClose }: UseSubmitVenueFormParams) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isAuthLoading = useAuthStore((state) => state.isLoading)
  const { items: sportsCatalog } = useSports('en')
  const [form, setForm] = useState<SubmitVenueFormState>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRoleSheet, setShowRoleSheet] = useState(false)
  const [showLocationSheet, setShowLocationSheet] = useState(false)
  const [showSportSheet, setShowSportSheet] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [highlightField, setHighlightField] = useState<SubmitVenueField | null>(null)
  const [fieldErrors, setFieldErrors] = useState<SubmitVenueFieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const highlightTimerRef = useRef<number | null>(null)
  const fieldRefs = useRef<Partial<Record<SubmitVenueField, HTMLDivElement | null>>>({})

  const setFieldRef =
    (field: SubmitVenueField) =>
    (el: HTMLDivElement | null): void => {
      fieldRefs.current[field] = el
    }

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      setShowLoginPrompt(true)
    }
  }, [isAuthLoading, isAuthenticated])

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        window.clearTimeout(highlightTimerRef.current)
      }
    }
  }, [])

  const sports = useMemo(() => sportsCatalog.filter((sport) => sport.is_active !== false), [sportsCatalog])

  const selectedSports = useMemo(() => {
    const sportsByKey = new Map(sports.map((sport) => [sport.key, sport]))
    return form.sportKeys
      .map((key) => sportsByKey.get(key))
      .filter((sport): sport is SelectedVenueSport => Boolean(sport))
  }, [form.sportKeys, sports])

  const clearFieldError = (field: SubmitVenueField) => {
    if (highlightField === field) setHighlightField(null)
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    if (error) setError(null)
  }

  const changeField = <K extends SubmitVenueField>(key: K, value: SubmitVenueFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    clearFieldError(key)
  }

  const applySports = (keys: string[]) => {
    setForm((prev) => ({
      ...prev,
      sportKeys: keys,
      otherSportLabel: '',
    }))
    setShowSportSheet(false)
    clearFieldError('sportKeys')
  }

  const selectRole = (role: OwnershipRole) => {
    setForm((prev) => ({ ...prev, ownershipRole: role }))
    setShowRoleSheet(false)
    clearFieldError('ownershipRole')
  }

  const confirmLocation = (data: { address: string; lat: number; lng: number }) => {
    setForm((prev) => ({ ...prev, address: data.address, lat: data.lat, lng: data.lng }))
    clearFieldError('address')
  }

  const closeLoginPrompt = () => {
    setShowLoginPrompt(false)
    if (!isAuthenticated) {
      onUnauthenticatedClose()
    }
  }

  const validate = (): { field: SubmitVenueField; message: string } | null => {
    if (!form.name.trim()) return { field: 'name', message: REQUIRED_MESSAGES.name }
    if (!form.address.trim() || form.lat == null || form.lng == null) {
      return { field: 'address', message: REQUIRED_MESSAGES.address }
    }
    if (form.sportKeys.length === 0) return { field: 'sportKeys', message: REQUIRED_MESSAGES.sportKeys }
    if (mode === 'official' && !form.ownershipRole) {
      return { field: 'ownershipRole', message: REQUIRED_MESSAGES.ownershipRole }
    }
    return null
  }

  const flashFieldError = (field: SubmitVenueField, message: string) => {
    const el = fieldRefs.current[field]
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })

    setHighlightField(field)
    setFieldErrors({ [field]: message })
    setError(null)

    if (highlightTimerRef.current) {
      window.clearTimeout(highlightTimerRef.current)
    }

    highlightTimerRef.current = window.setTimeout(() => {
      setHighlightField((current) => (current === field ? null : current))
      highlightTimerRef.current = null
    }, 2000)
  }

  const buildPayload = (): SubmitOfficialVenueRequest | SubmitPublicVenueRequest => {
    const base = {
      name: form.name.trim(),
      address: form.address.trim(),
      lat: form.lat as number,
      lng: form.lng as number,
      sport_keys: form.sportKeys,
    }

    if (mode === 'official') {
      return {
        ...base,
        venue_type: 'official',
        ownership_role: form.ownershipRole as OwnershipRole,
      }
    }

    return {
      ...base,
      venue_type: 'public',
    }
  }

  const submit = async () => {
    if (isSubmitting) return

    const invalid = validate()
    if (invalid) {
      flashFieldError(invalid.field, invalid.message)
      return
    }

    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }

    setIsSubmitting(true)
    setError(null)

    const res = await venuesService.submitVenue(buildPayload())

    if (!res.success || !res.data) {
      setIsSubmitting(false)
      setError(res.error?.message || 'Something went wrong. Please try again.')
      return
    }

    onSuccess(res.data)
  }

  return {
    form,
    sports,
    selectedSports,
    isSubmitting,
    highlightField,
    fieldErrors,
    error,
    showRoleSheet,
    setShowRoleSheet,
    showLocationSheet,
    setShowLocationSheet,
    showSportSheet,
    setShowSportSheet,
    showLoginPrompt,
    closeLoginPrompt,
    changeField,
    applySports,
    selectRole,
    confirmLocation,
    setFieldRef,
    submit,
  }
}

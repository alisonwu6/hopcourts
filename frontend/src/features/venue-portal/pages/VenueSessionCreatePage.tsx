import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'
import { venuePortalService } from '../services/venuePortalService'
import { cacheGet, cacheSet } from '../services/venuePortalCache'
import { VenuePortalOutletCtx } from '../layouts/VenuePortalLayout'
import { VenueSessionCreateView } from '../views/VenueSessionCreateView'

const SPORTS = ['Badminton', 'Tennis', 'Pickleball', 'Basketball', 'Table Tennis']

/**
 * VenueSessionCreatePage - Container for creating one-off venue sessions.
 * Orchestrates API calls and form data management.
 */
export function VenueSessionCreatePage() {
  const { venueId } = useParams<{ venueId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { activeVenue } = useOutletContext<VenuePortalOutletCtx>()

  const defaultCourtId = searchParams.get('courtId') || ''
  const defaultCourtName = searchParams.get('courtName') || ''
  const defaultSport = searchParams.get('sport') || ''
  const defaultDate = searchParams.get('date') || ''
  const defaultStartTime = searchParams.get('startTime') || '19:00'
  const defaultEndTime = searchParams.get('endTime') || '21:00'
  const hasSlotPrefill = Boolean(defaultCourtId && defaultDate && defaultStartTime)
  const initialSportKey = normalizeSportKey(defaultSport) || 'BADMINTON'

  // Initialise courts from cache — no spinner on revisit.
  const [loading, setLoading] = useState(false)
  const [courts, setCourts] = useState<{ id: string; name: string; supported_sports?: string[] }[]>(
    () => cacheGet<{ id: string; name: string; supported_sports?: string[] }[]>(`courts:${venueId}`) ?? []
  )

  // Form State
  const [formData, setFormData] = useState({
    title: hasSlotPrefill ? buildDefaultTitle(initialSportKey, defaultCourtName) : '',
    sportKey: initialSportKey,
    court_id: defaultCourtId,
    description: '',
    date: defaultDate,
    startTime: defaultStartTime,
    endTime: defaultEndTime,
    minPeople: 2,
    maxPeople: 4,
    skillLevel: 'any',
    genderRule: 'mixed',
    priceMode: 'total',
    feeNotes: '',
    pricePerPerson: 0,
    isFree: true,
  })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (venueId) {
      loadVenueInfo(venueId)
    }
  }, [venueId])

  const loadVenueInfo = async (id: string) => {
    const res = await venuePortalService.getVenueCourts(id)
    if (res.success && res.data) {
      setCourts(res.data)
      cacheSet(`courts:${id}`, res.data)
    }
  }

  useEffect(() => {
    if (!hasSlotPrefill || !courts.length) return

    const selectedCourt = courts.find((court) => court.id === defaultCourtId)
    if (!selectedCourt) return

    const courtSport = normalizeSportKey(selectedCourt.supported_sports?.[0])
    if (courtSport && formData.sportKey !== courtSport) {
      setFormData((prev) => ({
        ...prev,
        sportKey: courtSport,
        title: buildDefaultTitle(courtSport, selectedCourt.name),
      }))
    }
  }, [courts, defaultCourtId, formData.sportKey, hasSlotPrefill])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!venueId || !activeVenue) return

    const selectedCourt = courts.find((court) => court.id === formData.court_id)
    if (!formData.court_id || !selectedCourt) {
      setFormError('Please select a court before publishing.')
      return
    }

    const payload = {
      title: formData.title,
      sport_key: formData.sportKey,
      date: formatDateForAdminApi(formData.date),
      start_at: formData.startTime,
      end_at: formData.endTime,
      note: formData.description,
      court_id: formData.court_id || null,
      court_name: selectedCourt?.name || null,
      min_people: formData.minPeople,
      max_capacity: formData.maxPeople,
      pricing_model: formData.isFree ? 'free' : 'paid',
      fee: formData.isFree ? null : formData.pricePerPerson,
      price_mode: formData.priceMode,
      price_note: formData.feeNotes || null,
      skill_level: formData.skillLevel,
      gender_rule: formData.genderRule,
    }

    setLoading(true)
    setFormError('')
    try {
      const res = await venuePortalService.createVenueEvent(venueId, payload)
      if (res.success) {
        navigate(`/admin/${venueId}/schedule`, { state: { refresh: true } })
      } else {
        console.error('Publish failed:', res.error?.message)
      }
    } catch (err) {
      console.error('An error occurred while publishing', err)
    }
    setLoading(false)
  }

  const filteredCourts = courts.filter(
    (c) =>
      !c.supported_sports ||
      c.supported_sports.length === 0 ||
      c.supported_sports.some((s) => normalizeSportKey(s) === normalizeSportKey(formData.sportKey))
  )

  // Auto-clear court if no longer valid for the selected sport
  useEffect(() => {
    if (formData.court_id) {
      const isSupported = filteredCourts.some((c) => c.id === formData.court_id)
      if (!isSupported) {
        setFormData((prev) => ({ ...prev, court_id: '' }))
      }
    }
  }, [formData.sportKey, filteredCourts, formData.court_id])

  return (
    <VenueSessionCreateView
      loading={loading}
      venueData={activeVenue}
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/admin')}
      SPORTS={SPORTS}
      courts={filteredCourts}
      hasSlotPrefill={hasSlotPrefill}
      errorMessage={formError}
    />
  )
}

function formatDateForAdminApi(isoDate: string): string {
  const [year, month, day] = (isoDate || '').split('-')
  if (!year || !month || !day) return isoDate
  return `${day}/${month}/${year}`
}

function normalizeSportKey(sport?: string | null): string {
  if (!sport) return ''
  return sport.trim().replace(/[\s-]+/g, '_').toUpperCase()
}

function buildDefaultTitle(sportKey: string, courtName?: string): string {
  const sportLabel = sportKey
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
  return courtName ? `${sportLabel} at ${courtName}` : `${sportLabel} open play`
}

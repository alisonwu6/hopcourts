import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { venuePortalService } from '../services/venuePortalService'
import { cacheGet, cacheSet } from '../services/venuePortalCache'
import { VenueProfileData } from '../views/VenueProfileView'
import { VenuePortalOutletCtx } from '../layouts/VenuePortalLayout'
import { VenueScheduleView } from '../views/VenueScheduleView'
import { useVenueScheduleData } from '../hooks/useVenueScheduleData'

const DAYS = [
  { key: 1, label: 'Mon' },
  { key: 2, label: 'Tue' },
  { key: 3, label: 'Wed' },
  { key: 4, label: 'Thu' },
  { key: 5, label: 'Fri' },
  { key: 6, label: 'Sat' },
  { key: 0, label: 'Sun' },
]

const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']
const GENDERS = ['Mixed', 'Men only', 'Women only']
const SPORTS = ['Badminton', 'Tennis', 'Pickleball', 'Basketball', 'Table Tennis']

const MOCK_PARTICIPANTS = [
  { id: '1', name: 'Alex Johnson', level_rating: 'Intermediate', has_paid: true },
  { id: '2', name: 'Sam Taylor', level_rating: 'Beginner', has_paid: true },
  { id: '3', name: 'Casey Smith', level_rating: 'Advanced', has_paid: true },
]

type Court = { id: string; name: string }

export function VenueSchedulePage() {
  const { venueId } = useParams<{ venueId: string }>()
  const { activeVenue } = useOutletContext<VenuePortalOutletCtx>()
  const location = useLocation()
  const navigate = useNavigate()

  const scheduleData = useVenueScheduleData()
  const { slots, setGeneratedSessions, currentMonth, setViewMode, setSelectedSession } = scheduleData

  // Initialise courts from cache so the page renders immediately on revisit.
  const [courts, setCourts] = useState<Court[]>(() => cacheGet<Court[]>(`courts:${venueId}`) ?? [])

  // Read operating hours from the profile cache (populated when Profile tab is visited).
  const operatingHours = cacheGet<VenueProfileData>(`profile:${venueId}`)?.operating_hours ?? []
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Dedup refs — prevent StrictMode double-invocation from firing duplicate requests.
  const courtsFetchedFor = useRef<string | null>(null)
  const eventsFetchedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!venueId || courtsFetchedFor.current === venueId) return
    courtsFetchedFor.current = venueId
    fetchCourts(venueId)
  }, [venueId])

  useEffect(() => {
    if (!venueId) return
    const key = `${venueId}:${format(currentMonth, 'yyyy-MM')}`
    if (eventsFetchedFor.current === key) return
    eventsFetchedFor.current = key
    fetchEvents(venueId, currentMonth)
  }, [venueId, currentMonth])

  // Refetch events when returning from the create page after a successful submit.
  // Immediately clear the state so a StrictMode double-invocation or back-navigation
  // cannot fire a second fetch.
  useEffect(() => {
    if (!location.state?.refresh || !venueId) return
    navigate(location.pathname, { replace: true, state: {} })
    eventsFetchedFor.current = null
    fetchEvents(venueId, currentMonth)
  }, [location.state?.refresh])

  const fetchCourts = async (id: string) => {
    const res = await venuePortalService.getVenueCourts(id)
    if (res.success && res.data) {
      setCourts(res.data)
      cacheSet(`courts:${id}`, res.data)
    }
  }

  const fetchEvents = async (id: string, month: Date) => {
    // Pad by 14 h (UTC+14, the world's maximum UTC offset) so sessions near
    // month boundaries are never cut off regardless of the venue's timezone.
    const fromDate = startOfMonth(month)
    fromDate.setHours(fromDate.getHours() - 14)
    const toDate = endOfMonth(month)
    toDate.setHours(toDate.getHours() + 14)
    const from = fromDate.toISOString()
    const to = toDate.toISOString()
    const res = await venuePortalService.listVenueEvents(id, { from, to })
    if (!res.success || !res.data) return

    const sessions = Object.entries(res.data).flatMap(([dateKey, events]) => {
      const [day, month, year] = dateKey.split('/').map(Number)
      return (events as any[]).map((ev) => {
        const [hour, minute] = (ev.start_at || '00:00').split(':').map(Number)
        const date = new Date(year, month - 1, day, hour, minute)
        return {
          id: ev.event_id,
          date,
          start_time: ev.start_at || '',
          end_time: '',
          sport: ev.sport || '',
          status: 'published' as const,
          max_participants: ev.max_capacity ?? 0,
          participants_count: ev.participant_count ?? 0,
          court_id: ev.court_id ?? null,
          court_name: ev.court_name ?? null,
          level: '',
          gender: '',
          price: 0,
        }
      })
    })

    setGeneratedSessions(sessions)
  }

  const handleSaveAndGenerate = async () => {
    if (!venueId || slots.length === 0) return

    setSaving(true)
    try {
      const payloads = slots
        .filter((slot) => slot.start_time && slot.end_time)
        .map((slot) => {
          const courtName = slot.court_id
            ? (courts.find((c) => c.id === slot.court_id)?.name ?? slot.court_name)
            : null
          const isFree = slot.price === 0
          const genderStr = String(slot.gender || 'mixed').toLowerCase()
          return {
            sport_key: String(slot.sport || '').toUpperCase().replace(/\s+/g, '_'),
            start_at: slot.start_time,
            end_at: slot.end_time,
            court_id: slot.court_id || null,
            court_name: courtName || null,
            skill_level: String(slot.level || 'any').toLowerCase().replace(/\s+/g, '_'),
            gender_rule: genderStr.includes('women') ? 'women' : genderStr.includes('men') ? 'men' : 'mixed',
            min_people: slot.min_participants || null,
            max_capacity: slot.max_participants,
            pricing_model: isFree ? 'free' : 'paid',
            fee: isFree ? null : slot.price,
            price_mode: slot.price_mode || 'total',
            price_note: slot.price_note || null,
          }
        })

      const results = await Promise.all(
        payloads.map((payload) => venuePortalService.createRecurringEvents(venueId, payload))
      )
      if (results.some((r) => !r.success)) {
        console.error('Some recurring events failed:', results)
      }
      await fetchEvents(venueId, currentMonth)
    } finally {
      setSaving(false)
    }

    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setViewMode('calendar')
    }, 2000)
  }

  return (
    <VenueScheduleView
      {...scheduleData}
      saving={saving}
      venueName={activeVenue?.name_display}
      showSuccess={showSuccess}
      handleSaveAndGenerate={handleSaveAndGenerate}
      DAYS={DAYS}
      SPORTS={SPORTS}
      LEVELS={LEVELS}
      GENDERS={GENDERS}
      courts={courts}
      operatingHours={operatingHours}
      setSelectedSession={(session) => scheduleData.setSelectedSession(session)}
      setViewMode={(mode) => {
        scheduleData.setViewMode(mode)
        scheduleData.setSelectedSession(null)
      }}
    />
  )
}

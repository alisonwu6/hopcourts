import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { startOfMonth, endOfMonth } from 'date-fns'
import { venuePortalService, ManagedVenue } from '../services/venuePortalService'
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

export function VenueSchedulePage() {
  // 1. Container orchestration (Route & Params)
  const { venueId } = useParams<{ venueId: string }>()

  // 2. Logic & State Hook (Round 2 Design)
  const scheduleData = useVenueScheduleData()
  const { slots, setGeneratedSessions, currentMonth, generateMockSessions, setViewMode, setSelectedSession } =
    scheduleData

  // 3. Page-level UI states (Container owns these)
  const [venue, setVenue] = useState<ManagedVenue | null>(null)
  const [courts, setCourts] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // 4. Data Fetching (Container orchestration)
  useEffect(() => {
    if (venueId) fetchData()
  }, [venueId])

  useEffect(() => {
    if (venueId) fetchEvents(venueId, currentMonth)
  }, [venueId, currentMonth])

  const fetchData = async () => {
    setLoading(true)
    const [venuesRes, courtsRes] = await Promise.all([
      venuePortalService.getMyVenues(),
      venuePortalService.getVenueCourts(venueId!),
    ])

    if (venuesRes.success && venuesRes.data) {
      const current = venuesRes.data.find((v) => v.id === venueId) || venuesRes.data[0] || null
      setVenue(current)
    }
    if (courtsRes.success && courtsRes.data) {
      setCourts(courtsRes.data)
    }
    setLoading(false)
  }

  const fetchEvents = async (id: string, month: Date) => {
    const from = startOfMonth(month).toISOString()
    const to = endOfMonth(month).toISOString()
    const res = await venuePortalService.listVenueEvents(id, { from, to })
    if (!res.success || !res.data) return

    const sessions = Object.entries(res.data).flatMap(([dateKey, events]) => {
      // dateKey is "DD/MM/YYYY"
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
          level: '',
          gender: '',
          price: 0,
        }
      })
    })

    setGeneratedSessions(sessions)
  }

  // 5. Flow Control (Container orchestration)
  const handleSaveAndGenerate = async () => {
    if (!venueId) return
    if (slots.length === 0) {
      return
    }

    setSaving(true)
    try {
      const payloads = slots
        .filter((slot) => slot.start_time && slot.end_time)
        .map((slot) => {
          const courtName = slot.court_id ? (courts.find((c) => c.id === slot.court_id)?.name ?? slot.court_name) : null
          const isFree = slot.price === 0
          return {
            sport_key: String(slot.sport || '')
              .toUpperCase()
              .replace(/\s+/g, '_'),
            start_at: slot.start_time,
            end_at: slot.end_time,
            court_id: slot.court_id || null,
            court_name: courtName || null,
            skill_level: String(slot.level || 'any')
              .toLowerCase()
              .replace(/\s+/g, '_'),
            gender_rule: String(slot.gender || 'mixed')
              .toLowerCase()
              .includes('men')
              ? 'men'
              : String(slot.gender || 'mixed')
                    .toLowerCase()
                    .includes('women')
                ? 'women'
                : 'mixed',
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

      const hasFailure = results.some((r) => !r.success)
      if (hasFailure) {
        console.error('Some recurring events failed:', results)
      }

      // Refresh calendar with real events from the API.
      await fetchEvents(venueId, currentMonth)
    } finally {
      setSaving(false)
    }
    setShowSuccess(true)

    // Flow: success -> redirect/switch view
    setTimeout(() => {
      setShowSuccess(false)
      setViewMode('calendar')
    }, 2000)
  }

  // 6. Assemble props for View
  return (
    <VenueScheduleView
      {...scheduleData}
      loading={loading}
      saving={saving}
      venueName={venue?.name_display}
      showSuccess={showSuccess}
      handleSaveAndGenerate={handleSaveAndGenerate}
      DAYS={DAYS}
      SPORTS={SPORTS}
      LEVELS={LEVELS}
      GENDERS={GENDERS}
      courts={courts}
      MOCK_PARTICIPANTS={MOCK_PARTICIPANTS}
      setSelectedSession={(session) => {
        scheduleData.setSelectedSession(session)
        // Potential flow addition here
      }}
      setViewMode={(mode) => {
        scheduleData.setViewMode(mode)
        scheduleData.setSelectedSession(null)
      }}
    />
  )
}

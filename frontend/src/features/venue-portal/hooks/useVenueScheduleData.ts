import { useState, useCallback } from 'react'
import { addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

interface ScheduleSlot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  sport: string
  max_participants: number
  min_participants: number
  level: string
  gender: string
  price: number
  price_mode: 'total' | 'person'
  price_note: string
  court_id?: string
  court_name?: string
}

interface GeneratedSession {
  id: string
  date: Date
  start_time: string
  end_time: string
  sport: string
  status: 'published' | 'cancelled' | 'draft' | 'completed' | 'full'
  max_participants: number
  participants_count: number
  level: string
  gender: string
  price: number
  court_id?: string
}

interface VenueDefaults {
  sport: string
  max_participants: number
  level: string
  gender: string
  price: number
  court_id?: string
}

export function useVenueScheduleData() {
  const [activeDay, setActiveDay] = useState(1)
  const [slots, setSlots] = useState<ScheduleSlot[]>([])
  const [generatedSessions, setGeneratedSessions] = useState<GeneratedSession[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'template'>('calendar')

  const [venueDefaults, setVenueDefaults] = useState<VenueDefaults>({
    sport: 'Badminton',
    max_participants: 4,
    level: 'All Levels',
    gender: 'Mixed',
    price: 15,
  })

  const [selectedSession, setSelectedSession] = useState<GeneratedSession | null>(null)
  const [isEditingSession, setIsEditingSession] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [isCompact, setIsCompact] = useState(false)

  const generateMockSessions = useCallback((currentSlots: ScheduleSlot[]) => {
    const sessions: GeneratedSession[] = []
    const start = new Date()
    const end = addDays(start, 28)

    let current = start
    while (current <= end) {
      const dayOfWeek = current.getDay()
      const matchingSlots = currentSlots.filter((s) => s.day_of_week === dayOfWeek)

      matchingSlots.forEach((slot) => {
        const participants_count = Math.floor(Math.random() * (slot.max_participants + 1))
        const status: GeneratedSession['status'] = participants_count >= slot.max_participants ? 'full' : 'published'

        sessions.push({
          id: Math.random().toString(36).substr(2, 9),
          date: new Date(current),
          start_time: slot.start_time,
          end_time: slot.end_time,
          sport: slot.sport,
          status,
          max_participants: slot.max_participants,
          participants_count,
          level: slot.level,
          gender: slot.gender,
          price: slot.price,
          court_id: slot.court_id,
        })
      })
      current = addDays(current, 1)
    }
    setGeneratedSessions(sessions)
  }, [])

  const handleUpdateSlot = useCallback((id: string, updates: Partial<ScheduleSlot>) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }, [])

  const handleAddSlot = useCallback(() => {
    const newSlot: ScheduleSlot = {
      id: Math.random().toString(36).substr(2, 9),
      day_of_week: activeDay,
      start_time: '',
      end_time: '',
      min_participants: 2,
      price_mode: 'total',
      price_note: '',
      ...venueDefaults,
    }
    setSlots((prev) => [...prev, newSlot])
  }, [activeDay, venueDefaults])

  const handleDeleteSlot = useCallback((id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const handleUpdateSession = useCallback((updates: Partial<GeneratedSession>) => {
    setSelectedSession((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      setGeneratedSessions((currentSessions) => currentSessions.map((s) => (s.id === prev.id ? updated : s)))
      return updated
    })
    setIsEditingSession(false)
  }, [])

  const handleCancelSession = useCallback(() => {
    handleUpdateSession({ status: 'cancelled' })
  }, [handleUpdateSession])

  // Calendar bounds
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  return {
    activeDay,
    setActiveDay,
    slots,
    generatedSessions,
    setGeneratedSessions,
    currentMonth,
    setCurrentMonth,
    viewMode,
    setViewMode,
    venueDefaults,
    setVenueDefaults,
    selectedSession,
    setSelectedSession,
    isEditingSession,
    setIsEditingSession,
    showParticipants,
    setShowParticipants,
    isCompact,
    setIsCompact,
    calendarDays,
    generateMockSessions,
    handleUpdateSlot,
    handleAddSlot,
    handleDeleteSlot,
    handleUpdateSession,
    handleCancelSession,
  }
}

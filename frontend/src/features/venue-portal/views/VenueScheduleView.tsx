import React from 'react'
import { PageLoading } from '@/components/PageLoading'
import { CheckCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

// Internal Components from components/
import { VenueScheduleHeader } from '../components/VenueScheduleHeader'
import { VenueCalendarGrid } from '../components/VenueCalendarGrid'
import { VenueRulesEditor } from '../components/VenueRulesEditor'
import { VenueSessionDrawer } from '../components/VenueSessionDrawer'
import { VenueBottomNav } from '../components/VenueBottomNav'

interface VenueScheduleViewProps {
  loading: boolean
  saving: boolean
  venueName?: string
  viewMode: 'calendar' | 'template'
  setViewMode: (mode: 'calendar' | 'template') => void
  showSuccess: boolean
  selectedSession: any
  setSelectedSession: (session: any) => void
  showParticipants: boolean
  setShowParticipants: (show: boolean) => void
  isEditingSession: boolean
  setIsEditingSession: (editing: boolean) => void
  isCompact: boolean
  setIsCompact: (compact: boolean) => void
  generatedSessions: any[]
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
  calendarDays: Date[]
  slots: any[]
  venueDefaults: any
  setVenueDefaults: (defaults: any) => void
  activeDay: number
  setActiveDay: (day: number) => void
  handleAddSlot: () => void
  handleUpdateSlot: (id: string, updates: any) => void
  handleDeleteSlot: (id: string) => void
  handleSaveAndGenerate: () => void
  handleUpdateSession: (updates: any) => void
  handleCancelSession: () => void
  DAYS: any[]
  SPORTS: string[]
  LEVELS: string[]
  GENDERS: string[]
  MOCK_PARTICIPANTS: any[]
  courts: { id: string; name: string }[]
}

export const VenueScheduleView: React.FC<VenueScheduleViewProps> = ({
  loading,
  saving,
  venueName,
  viewMode,
  setViewMode,
  showSuccess,
  selectedSession,
  setSelectedSession,
  showParticipants,
  setShowParticipants,
  isEditingSession,
  setIsEditingSession,
  isCompact,
  setIsCompact,
  generatedSessions,
  currentMonth,
  setCurrentMonth,
  calendarDays,
  slots,
  venueDefaults,
  setVenueDefaults,
  activeDay,
  setActiveDay,
  handleAddSlot,
  handleUpdateSlot,
  handleDeleteSlot,
  handleSaveAndGenerate,
  handleUpdateSession,
  handleCancelSession,
  DAYS,
  SPORTS,
  LEVELS,
  GENDERS,
  MOCK_PARTICIPANTS,
  courts,
}) => {
  const navigate = useNavigate()
  const { venueId } = useParams()

  if (loading) return <PageLoading />

  const activeEventsCount = generatedSessions.filter((s) => ['published', 'full'].includes(s.status)).length
  const completedEventsCount = generatedSessions.filter((s) => s.status === 'completed').length

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-screen-md bg-slate-50 pb-20 font-sans text-slate-700">
      <VenueScheduleHeader
        venueName={venueName}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSync={handleSaveAndGenerate}
        saving={saving}
      />

      <main className="relative p-4 md:p-6">
        {viewMode === 'calendar' && (
          <div className="mb-6 flex flex-col gap-4">
            {/* Smaller Action Cards Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Create Event (One-off) */}
              <div
                onClick={() => venueId && navigate(`/admin/${venueId}/sessions/create`)}
                className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-indigo-300 hover:bg-slate-50/50 hover:shadow-md"
              >
                <div className="relative z-10">
                  <h3 className="mb-1.5 text-lg font-bold text-slate-800 transition-colors group-hover:text-indigo-700">
                    Create Event
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-slate-500">
                    Create a one-off special event or session outside your regular schedule.
                  </p>
                </div>
                <div className="mt-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      venueId && navigate(`/admin/${venueId}/sessions/create`)
                    }}
                    className="w-fit rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-200"
                  >
                    Create Now
                  </button>
                </div>
              </div>

              {/* Manage Weekly Schedule (CORE) */}
              <div
                onClick={() => setViewMode('template')}
                className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl bg-[#5A29E4] p-5 text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
              >
                <div className="pointer-events-none absolute right-0 top-0 select-none p-4 text-8xl font-black leading-none opacity-[0.08]">
                  📅
                </div>
                <div className="relative z-10">
                  <h3 className="mb-1.5 text-lg font-bold shadow-sm">Manage Weekly Schedule</h3>
                  <p className="mb-4 text-sm font-medium leading-relaxed text-indigo-100">
                    Set your recurring weekly rules. The system will auto-generate sessions for players to join.
                  </p>
                </div>
                <div className="relative z-10 mt-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setViewMode('template')
                    }}
                    className="w-fit rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#5A29E4] shadow-sm transition-colors hover:bg-slate-50"
                  >
                    Set Schedule
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Active Events
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-extrabold tracking-tight text-[#5A29E4]">{activeEventsCount}</div>
                  <div className="text-sm font-medium text-slate-400">Published</div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Completed</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-extrabold tracking-tight text-emerald-500">{completedEventsCount}</div>
                  <div className="text-sm font-medium text-slate-400">Past</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Overlay */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/5 backdrop-blur-[4px] duration-300 animate-in fade-in">
            <div className="flex flex-col items-center rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-2xl duration-200 animate-in zoom-in-95">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 shadow-inner">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Sync Complete</h2>
              <p className="mt-1 text-sm font-bold uppercase tracking-widest text-slate-500 opacity-60">
                Venue Inventory is now live
              </p>
            </div>
          </div>
        )}

        {/* Session UI Parts */}
        {selectedSession && (
          <VenueSessionDrawer
            session={selectedSession}
            onClose={() => {
              setSelectedSession(null)
              setIsEditingSession(false)
              setShowParticipants(false)
            }}
            showParticipants={showParticipants}
            setShowParticipants={setShowParticipants}
            isEditing={isEditingSession}
            setIsEditing={setIsEditingSession}
            onUpdate={handleUpdateSession}
            onCancel={handleCancelSession}
            mockParticipants={MOCK_PARTICIPANTS}
            SPORTS={SPORTS}
          />
        )}

        {viewMode === 'calendar' ? (
          <VenueCalendarGrid
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            calendarDays={calendarDays}
            generatedSessions={generatedSessions}
            isCompact={isCompact}
            setIsCompact={setIsCompact}
            setSelectedSession={setSelectedSession}
            setViewMode={setViewMode}
          />
        ) : (
          <VenueRulesEditor
            venueDefaults={venueDefaults}
            setVenueDefaults={setVenueDefaults}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            slots={slots}
            handleAddSlot={handleAddSlot}
            handleUpdateSlot={handleUpdateSlot}
            handleDeleteSlot={handleDeleteSlot}
            handleSaveAndGenerate={handleSaveAndGenerate}
            saving={saving}
            DAYS={DAYS}
            SPORTS={SPORTS}
            LEVELS={LEVELS}
            GENDERS={GENDERS}
            courts={courts}
          />
        )}
      </main>

      <VenueBottomNav />
    </div>
  )
}

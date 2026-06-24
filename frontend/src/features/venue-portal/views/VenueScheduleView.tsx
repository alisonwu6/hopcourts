import React from 'react'
import { CheckCircle } from 'lucide-react'

// Internal Components from components/
import { VenueCalendarGrid } from '../components/VenueCalendarGrid'
import { VenueRulesEditor } from '../components/VenueRulesEditor'
import { VenueSessionDrawer } from '../components/VenueSessionDrawer'

interface VenueScheduleViewProps {
  saving: boolean
  venueName?: string
  viewMode: 'calendar' | 'template'
  setViewMode: (mode: 'calendar' | 'template') => void
  showSuccess: boolean
  selectedSession: any
  setSelectedSession: (session: any) => void
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
  courts: { id: string; name: string }[]
  operatingHours?: { day: string; open_time: string; close_time: string; is_closed: boolean }[]
}

export const VenueScheduleView: React.FC<VenueScheduleViewProps> = ({
  saving,
  venueName,
  viewMode,
  setViewMode,
  showSuccess,
  selectedSession,
  setSelectedSession,
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
  courts,
  operatingHours,
}) => {
  return (
    <div className="relative w-full font-sans text-slate-700">
      {/* Template-mode inline action strip (replaces the old VenueScheduleHeader actions) */}
      {viewMode === 'template' && (
        <div className="flex items-center justify-between border-b border-[#dfe7dc] bg-white/60 px-5 py-2.5 backdrop-blur-sm">
          <button
            onClick={() => setViewMode('calendar')}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-600"
          >
            ← Calendar
          </button>
          <button
            onClick={handleSaveAndGenerate}
            disabled={saving}
            className="text-[10px] font-black uppercase tracking-widest text-[#2f6d16] transition-opacity hover:opacity-70 disabled:opacity-30"
          >
            {saving ? 'Syncing...' : 'Sync Calendar'}
          </button>
        </div>
      )}

      <main className="relative px-5 py-4">
        {/* Success Overlay */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e2b0b]/5 backdrop-blur-[4px] duration-300 animate-in fade-in">
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
            onClose={() => setSelectedSession(null)}
            onUpdate={handleUpdateSession}
            onCancel={handleCancelSession}
            SPORTS={SPORTS}
          />
        )}

        {viewMode === 'calendar' ? (
          <VenueCalendarGrid
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            calendarDays={calendarDays}
            generatedSessions={generatedSessions}
            setSelectedSession={setSelectedSession}
            courts={courts}
            operatingHours={operatingHours}
            venueName={venueName}
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
    </div>
  )
}

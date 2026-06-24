import React from 'react'
import { Settings, Plus, Trash2, Save, Award, User, DollarSign } from 'lucide-react'
import { VenueButton } from './ui/VenueButton'

interface ScheduleSlot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  sport: string
  max_participants: number
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

interface RulesEditorProps {
  venueDefaults: VenueDefaults
  setVenueDefaults: (defaults: VenueDefaults) => void
  activeDay: number
  setActiveDay: (day: number) => void
  slots: ScheduleSlot[]
  handleAddSlot: () => void
  handleUpdateSlot: (id: string, updates: Partial<ScheduleSlot>) => void
  handleDeleteSlot: (id: string) => void
  handleSaveAndGenerate: () => void
  saving: boolean
  DAYS: { key: number; label: string }[]
  SPORTS: string[]
  LEVELS: string[]
  GENDERS: string[]
  courts: { id: string; name: string }[]
}

export const VenueRulesEditor: React.FC<RulesEditorProps> = ({
  venueDefaults,
  setVenueDefaults,
  activeDay,
  setActiveDay,
  slots,
  handleAddSlot,
  handleUpdateSlot,
  handleDeleteSlot,
  handleSaveAndGenerate,
  saving,
  DAYS,
  SPORTS,
  LEVELS,
  GENDERS,
  courts,
}) => {
  return (
    <div className="w-full space-y-6 font-sans duration-300 animate-in slide-in-from-bottom-2">
      {/* Default Template Settings */}
      <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xl shadow-slate-200/50">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#e8f0d7] bg-[#f0f7e4] shadow-inner">
              <Settings className="h-5 w-5 text-[#2f6d16]" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">Quick Prep Rules</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Templates for new slots
              </p>
            </div>
          </div>

          <div className="hidden flex-col items-end text-right md:flex">
            <div className="mb-1 text-[9px] font-black uppercase tracking-widest text-slate-300">System Mode</div>
            <div className="rounded-full border border-[#e8f0d7]/50 bg-[#f0f7e4]/50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-tight text-[#2f6d16]">
              B2B Auto-Cluster Active
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label className="mb-1.5 ml-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
              Sport
            </label>
            <select
              value={venueDefaults.sport}
              onChange={(e) => setVenueDefaults({ ...venueDefaults, sport: e.target.value })}
              className="w-full rounded-xl border border-slate-200/50 bg-slate-50 px-3 py-2 text-xs font-black tracking-tight text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-[#2f6d16]"
            >
              {SPORTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 ml-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
              Spot / Court
            </label>
            <select
              value={venueDefaults.court_id}
              onChange={(e) => setVenueDefaults({ ...venueDefaults, court_id: e.target.value })}
              className="w-full rounded-xl border border-slate-200/50 bg-slate-50 px-3 py-2 text-xs font-black tracking-tight text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-[#2f6d16]"
            >
              <option value="">No Default</option>
              {courts.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
              Level
            </label>
            <select
              value={venueDefaults.level}
              onChange={(e) => setVenueDefaults({ ...venueDefaults, level: e.target.value })}
              className="w-full rounded-xl border border-slate-200/50 bg-slate-50 px-3 py-2 text-xs font-black tracking-tight text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-[#2f6d16]"
            >
              {LEVELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
              Gender
            </label>
            <select
              value={venueDefaults.gender}
              onChange={(e) => setVenueDefaults({ ...venueDefaults, gender: e.target.value })}
              className="w-full rounded-xl border border-slate-200/50 bg-slate-50 px-3 py-2 text-xs font-black tracking-tight text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-[#2f6d16]"
            >
              {GENDERS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
              Cap.
            </label>
            <input
              type="number"
              value={venueDefaults.max_participants}
              onChange={(e) => setVenueDefaults({ ...venueDefaults, max_participants: parseInt(e.target.value) })}
              className="w-full rounded-xl border border-slate-200/50 bg-slate-50 px-3 py-2 text-xs font-black tracking-tight text-slate-700 focus:border-[#2f6d16]"
            />
          </div>
          <div>
            <label className="mb-1.5 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
              Fee
            </label>
            <input
              type="number"
              value={venueDefaults.price}
              onChange={(e) => setVenueDefaults({ ...venueDefaults, price: parseFloat(e.target.value) })}
              className="w-full rounded-xl border border-slate-200/50 bg-slate-50 px-3 py-2 text-xs font-black tracking-tight text-slate-700 focus:border-[#2f6d16]"
            />
          </div>
        </div>

        <div className="mt-6 border-t border-slate-50 pt-6">
          <p className="max-w-2xl text-[11px] font-semibold leading-relaxed text-slate-400">
            <span className="mr-2 text-[9px] font-bold uppercase tracking-widest text-[#2f6d16]">
              Smart Generation:
            </span>
            Syncing will auto-generate session instances for the next 28 days based on your recurring rules.
          </p>
        </div>
      </div>

      {/* Weekly Day Tabs & Slots */}
      <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/30">
        <div className="flex border-b border-slate-50 bg-slate-50/30 p-2">
          {DAYS.map((day) => (
            <button
              key={day.key}
              onClick={() => setActiveDay(day.key)}
              className={`flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeDay === day.key ? 'bg-white text-[#2f6d16] shadow-lg shadow-[#e8f0d7] ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {day.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                {DAYS.find((d) => d.key === activeDay)?.label}s Recurring Slots
              </h2>
              <p className="mt-1 text-[11px] font-semibold tracking-wide text-slate-400">
                This config will apply every {DAYS.find((d) => d.key === activeDay)?.label} in the calendar
              </p>
            </div>
            <VenueButton
              onClick={handleAddSlot}
              size="md"
              icon={<Plus className="h-4 w-4" />}
            >
              Add New Slot
            </VenueButton>
          </div>

          <div className="space-y-4">
            {slots
              .filter((s) => s.day_of_week === activeDay)
              .map((slot) => (
                <div
                  key={slot.id}
                  className="rounded-[1.5rem] border border-slate-100 bg-slate-50/50 p-6 transition-all duration-300 hover:border-[#e8f0d7] hover:bg-white hover:shadow-md"
                >
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <div>
                        <label className="mb-1.5 ml-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Sport Category
                        </label>
                        <select
                          value={slot.sport}
                          onChange={(e) => handleUpdateSlot(slot.id, { sport: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition-colors focus:border-[#2f6d16]"
                        >
                          {SPORTS.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 ml-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Session Timing
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) => handleUpdateSlot(slot.id, { start_time: e.target.value })}
                            className={`flex-1 rounded-xl border bg-white px-3 py-2.5 text-xs font-black text-slate-700 shadow-sm ${!slot.start_time ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100'}`}
                          />
                          <span className="font-bold text-slate-300">—</span>
                          <input
                            type="time"
                            value={slot.end_time}
                            onChange={(e) => handleUpdateSlot(slot.id, { end_time: e.target.value })}
                            className={`flex-1 rounded-xl border bg-white px-3 py-2.5 text-xs font-black text-slate-700 shadow-sm ${!slot.end_time ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100'}`}
                          />
                        </div>
                      </div>
                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="mb-1.5 ml-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Max Cap.
                          </label>
                          <input
                            type="number"
                            value={slot.max_participants}
                            onChange={(e) =>
                              handleUpdateSlot(slot.id, {
                                max_participants: parseInt(e.target.value),
                              })
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all"
                          />
                        </div>
                        <VenueButton
                          variant="danger"
                          size="md"
                          onClick={() => handleDeleteSlot(slot.id)}
                          icon={<Trash2 className="h-4 w-4" />}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 border-t border-slate-100/80 pt-5 md:grid-cols-4">
                      <div>
                        <label className="mb-1.5 ml-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Spot / Court
                        </label>
                        <select
                          value={slot.court_id}
                          onChange={(e) => handleUpdateSlot(slot.id, { court_id: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition-colors focus:border-[#2f6d16]"
                        >
                          <option value="">No Spot Assigned</option>
                          {courts.map((c) => (
                            <option
                              key={c.id}
                              value={c.id}
                            >
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 ml-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Skill Tier
                        </label>
                        <select
                          value={slot.level}
                          onChange={(e) => handleUpdateSlot(slot.id, { level: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 shadow-sm"
                        >
                          {LEVELS.map((l) => (
                            <option key={l}>{l}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 ml-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Gender Rule
                        </label>
                        <select
                          value={slot.gender}
                          onChange={(e) => handleUpdateSlot(slot.id, { gender: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 shadow-sm"
                        >
                          {GENDERS.map((g) => (
                            <option key={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 ml-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Fee (A$)
                        </label>
                        <input
                          type="number"
                          value={slot.price}
                          onChange={(e) => handleUpdateSlot(slot.id, { price: parseFloat(e.target.value) })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-[#2f6d16] shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {slots.filter((s) => s.day_of_week === activeDay).length === 0 && (
              <div className="flex flex-col items-center rounded-[2rem] border-2 border-dashed border-slate-100/50 bg-slate-50/30 py-20 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-50 bg-white shadow-sm">
                  <Plus className="h-5 w-5 text-slate-200" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  No rules defined for {DAYS.find((d) => d.key === activeDay)?.label}
                </p>
                <button
                  onClick={handleAddSlot}
                  className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#2f6d16] hover:underline"
                >
                  {' '}
                  Create First Slot{' '}
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-slate-50" />
        </div>
      </div>
    </div>
  )
}

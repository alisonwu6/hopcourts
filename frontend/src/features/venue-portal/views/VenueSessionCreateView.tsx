import React from 'react'
import { PageLoading } from '@/components/PageLoading'

interface VenueSessionCreateViewProps {
  loading: boolean
  venueData: any
  formData: any
  setFormData: (data: any) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  SPORTS: string[]
  courts: { id: string; name: string; supported_sports?: string[] }[]
  hasSlotPrefill?: boolean
  errorMessage?: string
}

export const VenueSessionCreateView: React.FC<VenueSessionCreateViewProps> = ({
  loading,
  venueData,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  SPORTS,
  courts,
  hasSlotPrefill = false,
  errorMessage = '',
}) => {
  const SKILL_LEVELS = [
    { label: 'All levels', value: 'any' },
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
  ]

  const GENDERS = [
    { label: 'Mixed', value: 'mixed' },
    { label: 'Women only', value: 'women' },
    { label: 'Men only', value: 'men' },
  ]

  if (loading && !venueData) return <PageLoading />

  const selectedCourt = courts.find((court) => court.id === formData.court_id)

  return (
    <div className="relative w-full font-sans text-slate-700">
      <main className="p-5">
        <div className="relative mb-8 overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm md:p-10">
          <div className="pointer-events-none absolute right-0 top-0 select-none p-10 text-8xl font-black opacity-5">
            ✨
          </div>

          <form
            id="create-event-form"
            onSubmit={onSubmit}
            className="space-y-8"
          >
            {errorMessage && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                {errorMessage}
              </div>
            )}

            {/* 1. Event Basics */}
            <section className="space-y-4">
              <div className="px-1">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {hasSlotPrefill ? 'Review & Make Available' : 'Event Basics'}
                </h2>
                {hasSlotPrefill && (
                  <p className="mt-1 text-xs font-semibold text-[#7b8b72]">
                    Slot details were filled from the court schedule. Review, then publish.
                  </p>
                )}
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Friday midnight open play"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 shadow-inner outline-none transition-all focus:border-[#2f6d16] focus:bg-white focus:ring-4 focus:ring-[#2f6d16]/10"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Sport
                    </label>
                    <select
                      className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 shadow-inner outline-none transition-all focus:border-[#2f6d16] focus:bg-white focus:ring-4 focus:ring-[#2f6d16]/10"
                      value={formData.sportKey}
                      onChange={(e) => setFormData({ ...formData, sportKey: e.target.value })}
                    >
                      {SPORTS.map((s) => (
                        <option
                          key={s}
                          value={toSportKey(s)}
                        >
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Spot / Court
                    </label>
                    {hasSlotPrefill && selectedCourt ? (
                      <div className="rounded-2xl border border-[#dfead0] bg-[#f7fbef] px-4 py-3.5 text-sm font-black text-[#1A3A0A] shadow-inner">
                        {selectedCourt.name}
                      </div>
                    ) : (
                      <select
                        className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 shadow-inner outline-none transition-all focus:border-[#2f6d16] focus:bg-white focus:ring-4 focus:ring-[#2f6d16]/10"
                        value={formData.court_id}
                        onChange={(e) => setFormData({ ...formData, court_id: e.target.value })}
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
                    )}
                  </div>
                </div>
                {hasSlotPrefill && (
                  <div className="grid grid-cols-1 gap-3 rounded-3xl border border-[#dfead0] bg-[#f7fbef] p-4 text-sm font-bold text-[#1A3A0A] md:grid-cols-3">
                    <div>
                      <span className="block text-[9px] font-black uppercase tracking-widest text-[#7b8b72]">Date</span>
                      {formData.date || '-'}
                    </div>
                    <div>
                      <span className="block text-[9px] font-black uppercase tracking-widest text-[#7b8b72]">Time</span>
                      {formData.startTime} - {formData.endTime}
                    </div>
                    <div>
                      <span className="block text-[9px] font-black uppercase tracking-widest text-[#7b8b72]">Court</span>
                      {selectedCourt?.name || 'Selected court'}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 shadow-inner outline-none transition-all focus:border-[#2f6d16] focus:bg-white focus:ring-4 focus:ring-[#2f6d16]/10"
                      value={formData.maxPeople}
                      onChange={(e) => setFormData({ ...formData, maxPeople: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Min Participants
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 shadow-inner outline-none transition-all focus:border-[#2f6d16] focus:bg-white focus:ring-4 focus:ring-[#2f6d16]/10"
                      value={formData.minPeople}
                      onChange={(e) => setFormData({ ...formData, minPeople: Number(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Skill Level
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_LEVELS.map((level) => {
                      const active = formData.skillLevel === level.value
                      return (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, skillLevel: level.value })}
                          className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${active ? 'bg-[#2d3818] text-white shadow-sm shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                          {level.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Gender
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GENDERS.map((gender) => {
                      const active = formData.genderRule === gender.value
                      return (
                        <button
                          key={gender.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, genderRule: gender.value })}
                          className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${active ? 'bg-[#2d3818] text-white shadow-sm shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                          {gender.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Schedule */}
            <section className="space-y-4">
              <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Schedule</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="block px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Session Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 shadow-inner outline-none transition-all focus:border-[#2f6d16] focus:bg-white focus:ring-4 focus:ring-[#2f6d16]/10"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Starts At
                  </label>
                  <input
                    type="time"
                    required
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 shadow-inner outline-none transition-all focus:border-[#2f6d16] focus:bg-white focus:ring-4 focus:ring-[#2f6d16]/10"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Ends At
                  </label>
                  <input
                    type="time"
                    required
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 shadow-inner outline-none transition-all focus:border-[#2f6d16] focus:bg-white focus:ring-4 focus:ring-[#2f6d16]/10"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
            </section>

            {/* 3. Pricing */}
            <section className="space-y-4 border-t border-slate-50 pt-8">
              <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pricing</h2>
              <p className="px-1 text-xs text-slate-400">Set event pricing details.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition">
                  <input
                    id="venue-is-free-checkbox"
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-300 text-[#2f6d16] focus:ring-[#2f6d16]"
                  />
                  <label
                    htmlFor="venue-is-free-checkbox"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Free
                  </label>
                </div>

                {!formData.isFree && (
                  <div className="grid gap-4 duration-200 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                      <div className="flex rounded-lg bg-slate-100 p-1">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, priceMode: 'total' })}
                          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${formData.priceMode === 'total' ? 'bg-white text-[#2f6d16] shadow-sm ring-1 ring-[#2f6d16]' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Total Cost
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, priceMode: 'person' })}
                          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${formData.priceMode === 'person' ? 'bg-white text-[#2f6d16] shadow-sm ring-1 ring-[#2f6d16]' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Per Person
                        </button>
                      </div>
                      <span className="text-xs text-slate-400">
                        {formData.priceMode === 'total'
                          ? 'Per-person cost is estimated from total capacity.'
                          : 'Set the per-person fee directly.'}
                      </span>
                    </div>

                    <div className="relative">
                      <label className="mb-2 block px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {formData.priceMode === 'total' ? 'Total Cost (AUD)' : 'Per Person (AUD)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder={formData.priceMode === 'total' ? 'e.g. 2000' : 'e.g. 200'}
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 shadow-inner outline-none transition-all focus:border-[#2f6d16] focus:bg-white focus:ring-4 focus:ring-[#2f6d16]/10"
                        value={formData.pricePerPerson}
                        onChange={(e) => setFormData({ ...formData, pricePerPerson: Number(e.target.value) || 0 })}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Fee Notes
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. on-site payment"
                        className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 shadow-inner outline-none transition-all focus:border-[#2f6d16] focus:bg-white focus:ring-4 focus:ring-[#2f6d16]/10"
                        value={formData.feeNotes}
                        onChange={(e) => setFormData({ ...formData, feeNotes: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 4. Event Description */}
            <section className="space-y-4">
              <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Event Description
              </h2>
              <div>
                <textarea
                  rows={4}
                  placeholder="e.g. Shuttlecocks provided, intermediate players only..."
                  className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 shadow-inner outline-none transition-all focus:border-[#2f6d16] focus:bg-white focus:ring-4 focus:ring-[#2f6d16]/10"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </section>
          </form>

          {/* Form actions */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              form="create-event-form"
              type="submit"
              disabled={loading}
              className="rounded-full bg-[#2d3818] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1A3A0A] disabled:opacity-40"
            >
              {loading ? 'Publishing...' : hasSlotPrefill ? 'Make Available & Publish' : 'Publish'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

function toSportKey(label: string): string {
  return label.trim().replace(/[\s-]+/g, '_').toUpperCase()
}

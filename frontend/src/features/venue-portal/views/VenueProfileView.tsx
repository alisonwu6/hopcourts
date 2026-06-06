import React, { useState } from 'react'
import { PageLoading } from '@/components/PageLoading'
import { VenueButton } from '../components/ui/VenueButton'
import { Building2, MousePointer2, Settings2 } from 'lucide-react'
import { VenueBottomNav } from '../components/VenueBottomNav'
import { VenuePortalHeader } from '../components/VenuePortalHeader'

interface OperatingDay {
  day: string
  open_time: string
  close_time: string
  is_closed: boolean
}

export interface VenueProfileData {
  name_display: string
  address_display: string
  logo_url: string
  description: string
  amenities: string[]
  spaces: { name: string; supported_sports: string[] }[]
  operating_hours: OperatingDay[]
  social_links: {
    facebook?: string
    instagram?: string
    website?: string
  }
}

interface AmenityItem {
  label: string
  icon: React.ReactNode
}

interface AmenityCategory {
  title: string
  items: AmenityItem[]
}

interface VenueProfileViewProps {
  loading: boolean
  saving: boolean
  mode: 'view' | 'edit'
  onToggleMode: (mode: 'view' | 'edit') => void
  formData: VenueProfileData
  setFormData: (data: VenueProfileData) => void
  onBack: () => void
  onSubmit: (e: React.FormEvent) => void
  onApplyAll: (open: string, close: string) => void
  AMENITIES_CATEGORIES: AmenityCategory[]
}

export const VenueProfileView: React.FC<VenueProfileViewProps> = ({
  loading,
  saving,
  mode,
  onToggleMode,
  formData,
  setFormData,
  onBack,
  onSubmit,
  onApplyAll,
  AMENITIES_CATEGORIES,
}) => {
  const [templateHours, setTemplateHours] = useState({ open: '06:00', close: '22:00' })
  const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  if (loading) return <PageLoading />

  const toggleAmenity = (label: string) => {
    const next = formData.amenities.includes(label)
      ? formData.amenities.filter((a) => a !== label)
      : [...formData.amenities, label]
    setFormData({ ...formData, amenities: next })
  }

  const addSpace = () => {
    setFormData({
      ...formData,
      spaces: [...(formData.spaces || []), { name: '', supported_sports: [] }],
    })
  }

  const removeSpace = (index: number) => {
    const next = [...(formData.spaces || [])]
    next.splice(index, 1)
    setFormData({ ...formData, spaces: next })
  }

  const updateSpaceName = (index: number, name: string) => {
    const next = [...(formData.spaces || [])]
    next[index] = { ...next[index], name }
    setFormData({ ...formData, spaces: next })
  }

  const toggleSportInSpace = (spaceIndex: number, sport: string) => {
    const next = [...(formData.spaces || [])]
    const sports = next[spaceIndex].supported_sports
    const nextSports = sports.includes(sport) ? sports.filter((s) => s !== sport) : [...sports, sport]
    next[spaceIndex] = { ...next[spaceIndex], supported_sports: nextSports }
    setFormData({ ...formData, spaces: next })
  }

  const updateDay = (day: string, field: keyof OperatingDay, value: string | boolean) => {
    const nextHours = formData.operating_hours.map((h) => (h.day === day ? { ...h, [field]: value } : h))
    setFormData({ ...formData, operating_hours: nextHours })
  }

  const leftAction = mode === 'edit' && (
    <button
      type="button"
      onClick={() => !saving && onToggleMode('view')}
      disabled={saving}
      className="p-2 text-[11px] font-black uppercase tracking-widest text-slate-400 transition-all hover:text-slate-600 disabled:opacity-30"
    >
      Cancel
    </button>
  )

  const rightAction =
    mode === 'view' ? (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onToggleMode('edit')
        }}
        className="p-2 text-[11px] font-black uppercase tracking-widest text-[oklch(0.511_0.262_276.966)] transition-opacity hover:opacity-70"
      >
        Edit
      </button>
    ) : (
      <button
        type="submit"
        form="venue-profile-form"
        disabled={saving}
        className="flex items-center gap-1.5 p-2 text-[11px] font-black uppercase tracking-widest text-indigo-600 transition-all hover:text-indigo-700 disabled:opacity-50"
      >
        {saving ? (
          <>
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
            <span>Saving...</span>
          </>
        ) : (
          'Update'
        )}
      </button>
    )

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-screen-md bg-slate-50 pb-20 font-sans text-slate-700">
      <VenuePortalHeader
        title="Venue Profile"
        subtitle={formData.name_display}
        leftAction={leftAction || undefined}
        rightAction={rightAction}
      />

      <main className={mode === 'view' ? 'relative bg-slate-50 pb-4' : 'p-6'}>
        {mode === 'view' ? (
          <div className="border-b border-slate-100 bg-white px-6 py-8 shadow-sm">
            <div className="flex flex-col items-start gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[2.5rem] border-4 border-slate-50 bg-slate-50 text-4xl shadow-sm">
                {formData.logo_url ? (
                  <img
                    src={formData.logo_url}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-slate-400" />
                )}
              </div>
              <div className="mt-2 min-w-0">
                <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900">
                  {formData.name_display}
                </h1>
                <div className="mt-3 flex items-start gap-2 text-sm font-medium text-slate-500">
                  <span className="mt-0.5 text-slate-300">📍</span>
                  <span>{formData.address_display}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/50 bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
                    ✓ OFFICIAL
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">About</h2>
              <p className="rounded-2xl border border-slate-50 bg-slate-50/50 p-4 text-sm font-medium italic leading-relaxed text-slate-600">
                {formData.description ? `"${formData.description}"` : 'No description yet.'}
              </p>
            </div>

            <div className="mt-8">
              <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Amenities & Services
              </h2>
              {formData.amenities.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {formData.amenities.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 rounded-xl border border-slate-100/50 bg-slate-50 px-4 py-2.5"
                    >
                      <span className="text-[oklch(0.511_0.262_276.966)]">✓</span>
                      <span className="text-xs font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-5 text-xs font-bold text-slate-400">
                  No amenities configured yet.
                </div>
              )}
            </div>

            <div className="mt-8">
              <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Courts & Supported Sports
              </h2>
              {formData.spaces && formData.spaces.length > 0 ? (
                <div className="space-y-3">
                  {formData.spaces.map((space, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-100/50 bg-slate-50 p-4"
                    >
                      <div className="mb-2 flex items-center gap-2 font-black uppercase tracking-tight text-slate-700">
                        {space.name || `Unnamed Space`}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {space.supported_sports.length > 0 ? (
                          space.supported_sports.map((sport) => (
                            <span
                              key={sport}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 shadow-sm"
                            >
                              {sport}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs italic text-slate-400">No sports configured</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-5 text-xs font-bold text-slate-400">
                  No courts configured yet.
                </div>
              )}
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operating Hours</h2>
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-100/50 bg-slate-50 p-4">
                {orderedDays.map((day) => {
                  const hour = formData.operating_hours.find((h) => h.day === day)
                  const isConfigured = Boolean(hour)
                  return (
                    <div
                      key={day}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="w-20 text-[9px] font-black uppercase tracking-widest text-slate-500">{day}</span>
                      <div className="mx-4 h-px flex-1 bg-slate-200/50" />
                      {!isConfigured ? (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Not set</span>
                      ) : hour?.is_closed ? (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-red-400">Closed</span>
                      ) : (
                        <span className="font-black tabular-nums text-[oklch(0.511_0.262_276.966)]">
                          {hour?.open_time} — {hour?.close_time}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <form
            id="venue-profile-form"
            onSubmit={onSubmit}
            className="space-y-6"
          >
            {/* Basic Information Section */}
            <div className="flex flex-col items-center rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
              <h2 className="mb-6 w-full border-b border-slate-50 pb-3 text-left text-xs font-black uppercase tracking-widest text-slate-400">
                Basic Information
              </h2>

              <div className="group relative mb-6 h-24 w-24 shrink-0 overflow-hidden rounded-[2rem] border-4 border-white bg-slate-100 shadow-xl">
                {formData.logo_url ? (
                  <img
                    src={formData.logo_url}
                    alt="Logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Building2 className="h-10 w-10 text-slate-400" />
                  </div>
                )}
              </div>

              <div className="w-full space-y-4">
                <div>
                  <label className="mb-2 block flex justify-between px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Venue Name</span>
                    <span className="font-bold text-slate-400 opacity-70">ADMIN MANAGED</span>
                  </label>
                  <div className="w-full cursor-not-allowed select-none rounded-2xl border border-slate-200/60 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700 opacity-80">
                    {formData.name_display}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block flex justify-between px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Address</span>
                    <span className="font-bold text-slate-400 opacity-70">ADMIN MANAGED</span>
                  </label>
                  <div className="w-full cursor-not-allowed select-none rounded-2xl border border-slate-200/60 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700 opacity-80">
                    {formData.address_display}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 shadow-inner outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div>
                  <label className="mb-2 block px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    About
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 shadow-inner outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Spaces & Supported Sports Section */}
            <div className="rounded-[2rem] border border-slate-100 bg-white p-4 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-slate-50 pb-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Courts & Supported Sports
                </h2>
                <button
                  type="button"
                  onClick={addSpace}
                  className="text-[10px] font-black uppercase text-[oklch(0.511_0.262_276.966)] hover:opacity-70"
                >
                  + Add Space
                </button>
              </div>

              <div className="space-y-4">
                {(formData.spaces || []).map((space, index) => (
                  <div
                    key={index}
                    className="group relative rounded-3xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <button
                      type="button"
                      title="Remove"
                      onClick={() => removeSpace(index)}
                      className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-red-500"
                    >
                      ✕
                    </button>

                    <label className="mb-2 block px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Space Name / Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Court 1, Field A, Studio Room"
                      value={space.name}
                      onChange={(e) => updateSpaceName(index, e.target.value)}
                      className="focus:ring-[oklch(0.511_0.262_276.966)]/10 mb-4 w-full rounded-2xl border border-slate-100 bg-white px-4 py-3.5 text-sm font-bold text-slate-900 shadow-inner outline-none transition-all focus:border-[oklch(0.511_0.262_276.966)] focus:ring-4"
                    />

                    <label className="mb-2 block px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Supported Sports
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Badminton', 'Tennis', 'Pickleball', 'Basketball', 'Soccer', 'Padel', 'Volleyball'].map(
                        (sport) => {
                          const isSelected = space.supported_sports.includes(sport)
                          return (
                            <button
                              key={sport}
                              type="button"
                              onClick={() => toggleSportInSpace(index, sport)}
                              className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${isSelected ? 'shadow-[oklch(0.511_0.262_276.966)]/20 border-[oklch(0.511_0.262_276.966)] bg-[oklch(0.511_0.262_276.966)] text-white shadow-md' : 'border-slate-100 bg-white text-slate-400 opacity-60'}`}
                            >
                              {sport}
                            </button>
                          )
                        }
                      )}
                    </div>
                  </div>
                ))}
                {(!formData.spaces || formData.spaces.length === 0) && (
                  <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-8 text-center">
                    <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      No Courts Configured
                    </p>
                    <VenueButton
                      variant="primary"
                      size="sm"
                      type="button"
                      onClick={addSpace}
                    >
                      Add First Space
                    </VenueButton>
                  </div>
                )}
              </div>
            </div>

            {/* Operating Hours Section */}
            <div className="rounded-[2rem] border border-slate-100 bg-white p-4 shadow-sm sm:p-8">
              <h2 className="mb-6 border-b border-slate-50 pb-3 text-xs font-black uppercase tracking-widest text-slate-400">
                Operating Hours
              </h2>

              {/* Quick Template Apply */}
              <div className="mb-8 rounded-2xl border border-indigo-100/50 bg-indigo-50/50 p-4 sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Settings2
                    size={14}
                    className="text-indigo-600"
                  />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-900">
                    Apply Template to All Days
                  </h3>
                </div>
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex-1">
                      <label className="mb-1 ml-1 block text-center text-[8px] font-black uppercase tracking-widest text-indigo-400">
                        Open
                      </label>
                      <input
                        type="time"
                        value={templateHours.open}
                        onChange={(e) => setTemplateHours({ ...templateHours, open: e.target.value })}
                        className="w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-center text-xs font-black text-indigo-600 outline-none"
                      />
                    </div>
                    <div className="pt-4 font-bold text-indigo-200">—</div>
                    <div className="flex-1">
                      <label className="mb-1 ml-1 block text-center text-[8px] font-black uppercase tracking-widest text-indigo-400">
                        Close
                      </label>
                      <input
                        type="time"
                        value={templateHours.close}
                        onChange={(e) => setTemplateHours({ ...templateHours, close: e.target.value })}
                        className="w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-center text-xs font-black text-indigo-600 outline-none"
                      />
                    </div>
                  </div>
                  <VenueButton
                    type="button"
                    variant="primary"
                    size="sm"
                    className="py-2.5 sm:px-4 sm:py-2"
                    onClick={() => onApplyAll(templateHours.open, templateHours.close)}
                    icon={<MousePointer2 size={12} />}
                  >
                    Apply to All
                  </VenueButton>
                </div>
              </div>

              {/* Weekly Schedule List */}
              <div className="flex flex-col gap-3">
                {formData.operating_hours.map((hour) => (
                  <div
                    key={hour.day}
                    className={`flex flex-col items-stretch justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-all sm:flex-row sm:items-center sm:gap-0 sm:p-6 ${hour.is_closed ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start sm:justify-center">
                      <div className="text-[13px] font-black uppercase tracking-widest text-slate-900 sm:text-sm">
                        {hour.day}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => updateDay(hour.day, 'is_closed', !hour.is_closed)}
                          className={`rounded-lg border px-3 py-1 text-[9px] font-black uppercase tracking-[0.15em] transition-all ${hour.is_closed ? 'border-red-100 bg-red-50 text-red-500' : 'border-emerald-100 bg-emerald-50 text-emerald-500'}`}
                        >
                          {hour.is_closed ? 'Closed' : 'Open'}
                        </button>
                      </div>
                    </div>

                    {!hour.is_closed ? (
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 sm:gap-3 sm:border-none sm:bg-transparent sm:p-0">
                        <div className="min-w-0 flex-1">
                          <input
                            type="time"
                            value={hour.open_time}
                            onChange={(e) => updateDay(hour.day, 'open_time', e.target.value)}
                            className="w-full rounded-xl border border-slate-100 bg-white px-4 py-2.5 text-center text-xs font-black text-indigo-600 shadow-sm outline-none transition-all focus:border-indigo-500 focus:bg-white sm:w-28 sm:bg-slate-50 sm:shadow-inner"
                          />
                        </div>
                        <span className="font-bold text-slate-300">—</span>
                        <div className="min-w-0 flex-1">
                          <input
                            type="time"
                            value={hour.close_time}
                            onChange={(e) => updateDay(hour.day, 'close_time', e.target.value)}
                            className="w-full rounded-xl border border-slate-100 bg-white px-4 py-2.5 text-center text-xs font-black text-indigo-600 shadow-sm outline-none transition-all focus:border-indigo-500 focus:bg-white sm:w-28 sm:bg-slate-50 sm:shadow-inner"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pr-0 text-center text-[10px] font-black uppercase italic tracking-[0.2em] text-slate-300 sm:pr-4 sm:text-right">
                        Closed
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities by Categories */}
            {AMENITIES_CATEGORIES.map((category) => (
              <div
                key={category.title}
                className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm"
              >
                <h2 className="mb-6 border-b border-slate-50 pb-3 text-xs font-black uppercase tracking-widest text-slate-400">
                  {category.title}
                </h2>

                <div className="flex flex-col gap-2">
                  {category.items.map((amenity) => {
                    const active = formData.amenities.includes(amenity.label)
                    return (
                      <button
                        key={amenity.label}
                        type="button"
                        onClick={() => toggleAmenity(amenity.label)}
                        className="group flex w-full items-center gap-4 rounded-2xl border border-slate-50 bg-white p-4 transition-all hover:border-slate-200"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-indigo-500 transition-colors group-hover:bg-slate-100">
                          {amenity.icon}
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <div className="text-sm font-black uppercase tracking-tight text-slate-800">
                            {amenity.label}
                          </div>
                        </div>

                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${active ? 'border-indigo-600 bg-indigo-600 shadow-md shadow-indigo-100' : 'border-slate-200 bg-transparent'}`}
                        >
                          {active && <span className="text-xs font-black text-white">✓</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </form>
        )}
      </main>

      <VenueBottomNav />
    </div>
  )
}

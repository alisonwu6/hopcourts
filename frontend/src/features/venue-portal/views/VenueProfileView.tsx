import React, { useState } from 'react'
import { PageLoading } from '@/components/PageLoading'
import {
  ShieldCheck,
  Building2,
  Camera,
  Check,
  Clock3,
  Dumbbell,
  Info,
  MapPin,
  Plus,
  Wrench,
  X,
} from 'lucide-react'

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
  social_links: { facebook?: string; instagram?: string; website?: string }
}

interface AmenityItem { label: string; icon: React.ReactNode }
interface AmenityCategory { title: string; items: AmenityItem[] }

export type EditingSection = 'header' | 'about' | 'amenities' | 'courts' | 'hours' | null

interface VenueProfileViewProps {
  loading: boolean
  saving: boolean
  editingSection: EditingSection
  onEditSection: (section: EditingSection) => void
  formData: VenueProfileData
  setFormData: (data: VenueProfileData) => void
  onBack: () => void
  onSaveSection: (e: React.FormEvent) => void
  onCancelSection: () => void
  onApplyAll: (open: string, close: string) => void
  AMENITIES_CATEGORIES: AmenityCategory[]
}

const ORDERED_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SPORTS = ['Basketball', 'Netball', 'Tennis', 'Badminton', 'Volleyball', 'Soccer', 'Pickleball', 'Padel']

function formatTime(value?: string) {
  if (!value) return ''
  const [h = '0', m = '00'] = value.split(':')
  const hour = Number(h)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'pm' : 'am'}`
}

// AM/PM select — internal value stays in 24h HH:mm, display is 12h am/pm.
function TimeSelect({
  value,
  onChange,
  disabled,
  className,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  className?: string
}) {
  const options: { value: string; label: string }[] = []
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      const val = `${hh}:${mm}`
      const h12 = h % 12 || 12
      const ampm = h < 12 ? 'am' : 'pm'
      options.push({ value: val, label: `${h12}:${mm} ${ampm}` })
    }
  }
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={className}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

// Defined OUTSIDE VenueProfileView so its reference is stable across renders.
// If defined inside, React treats it as a new component type every render,
// unmounting the DOM and resetting textarea cursor position on every keystroke.
function SectionCard({
  id,
  icon,
  iconBg = 'bg-[#e8f0c2] text-[#2f6d16]',
  title,
  readContent,
  editContent,
  editingSection,
  onEditSection,
  onCancelSection,
  onSaveSection,
  saving,
}: {
  id: EditingSection
  icon: React.ReactNode
  iconBg?: string
  title: string
  readContent: React.ReactNode
  editContent: React.ReactNode
  editingSection: EditingSection
  onEditSection: (s: EditingSection) => void
  onCancelSection: () => void
  onSaveSection: (e: React.FormEvent) => void
  saving: boolean
}) {
  const isEditing = editingSection === id
  return (
    <section className="overflow-hidden rounded-[22px] border border-[#dfe7dc] bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>{icon}</div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7c8c76]">{title}</h2>
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancelSection}
              disabled={saving}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 disabled:opacity-40"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onSaveSection as any}
              disabled={saving}
              className="flex h-8 items-center gap-1.5 rounded-full bg-[#2d3818] px-3 text-xs font-bold text-white disabled:opacity-50"
            >
              {saving ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Save
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => onEditSection(id)} className="text-sm font-semibold text-[#2f6d16]">
            Edit
          </button>
        )}
      </div>
      <div className="px-4 pb-4">{isEditing ? editContent : readContent}</div>
    </section>
  )
}

export const VenueProfileView: React.FC<VenueProfileViewProps> = ({
  loading,
  saving,
  editingSection,
  onEditSection,
  formData,
  setFormData,
  onBack,
  onSaveSection,
  onCancelSection,
  onApplyAll,
  AMENITIES_CATEGORIES,
}) => {
  const [templateHours, setTemplateHours] = useState({ open: '06:00', close: '22:00' })

  const amenityMap = new Map(
    AMENITIES_CATEGORIES.flatMap((c) => c.items.map((item) => [item.label, item]))
  )

  const completionChecks = [
    Boolean(formData.name_display),
    Boolean(formData.address_display),
    Boolean(formData.description),
    formData.amenities.length > 0,
    formData.spaces.length > 0,
    formData.operating_hours.length > 0,
  ]
  const completion = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100)

  const toggleAmenity = (label: string) =>
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(label)
        ? formData.amenities.filter((a) => a !== label)
        : [...formData.amenities, label],
    })

  const addSpace = () =>
    setFormData({ ...formData, spaces: [...formData.spaces, { name: '', supported_sports: [] }] })

  const removeSpace = (i: number) => {
    const next = [...formData.spaces]
    next.splice(i, 1)
    setFormData({ ...formData, spaces: next })
  }

  const updateSpaceName = (i: number, name: string) => {
    const next = [...formData.spaces]
    next[i] = { ...next[i], name }
    setFormData({ ...formData, spaces: next })
  }

  const toggleSportInSpace = (si: number, sport: string) => {
    const next = [...formData.spaces]
    const sports = next[si].supported_sports
    next[si] = {
      ...next[si],
      supported_sports: sports.includes(sport) ? sports.filter((s) => s !== sport) : [...sports, sport],
    }
    setFormData({ ...formData, spaces: next })
  }

  const updateDay = (day: string, field: keyof OperatingDay, value: string | boolean) => {
    const hasDay = formData.operating_hours.some((h) => h.day === day)
    const nextHours = hasDay
      ? formData.operating_hours.map((h) => (h.day === day ? { ...h, [field]: value } : h))
      : [
          ...formData.operating_hours,
          {
            day,
            open_time: field === 'open_time' ? String(value) : '06:00',
            close_time: field === 'close_time' ? String(value) : '22:00',
            is_closed: field === 'is_closed' ? Boolean(value) : false,
          },
        ]
    setFormData({ ...formData, operating_hours: nextHours })
  }

  if (loading) return <PageLoading />

  const sectionCtx = { editingSection, onEditSection, onCancelSection, onSaveSection, saving }

  return (
    <div className="relative w-full bg-[#f3faf3] pb-4 font-sans text-slate-700">

      {/* Hero header */}
      <section className="border-b border-[#e4eadf] bg-white px-5 py-5">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-visible rounded-[22px] bg-[#e8f0d7] text-[#2f6d16]">
            {formData.logo_url ? (
              <img src={formData.logo_url} alt="" className="h-full w-full rounded-[22px] object-contain p-2" />
            ) : (
              <Building2 className="h-9 w-9" />
            )}
            <button
              type="button"
              onClick={() => onEditSection('header')}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#2d3818] text-white shadow-sm"
              aria-label="Edit venue logo"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-black leading-tight tracking-tight text-[#1A3A0A]">
              {formData.name_display || 'Venue name'}
            </h1>
            <div className="mt-1 flex items-start gap-1.5 text-xs font-semibold leading-snug text-[#7b8b72]">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>{formData.address_display || 'Address'}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#b8da87] bg-[#eef8df] px-3 text-sm font-semibold text-[#2f6d16]">
            <ShieldCheck className="h-3.5 w-3.5" /> Official
          </span>
          {(formData.spaces?.[0]?.supported_sports || []).slice(0, 2).map((sport) => (
            <span key={sport} className="inline-flex h-8 items-center rounded-full bg-slate-100 px-3 text-sm font-semibold text-[#5a6954]">
              {sport}
            </span>
          ))}
        </div>

        {/* Header edit form — inline below hero */}
        {editingSection === 'header' && (
          <div className="mt-4 space-y-3 rounded-[18px] border border-[#dfe7dc] bg-[#f8faf6] p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7c8c76]">Edit details</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={onCancelSection} disabled={saving} className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
                <button type="button" onClick={onSaveSection as any} disabled={saving} className="flex h-7 items-center gap-1 rounded-full bg-[#2d3818] px-3 text-xs font-bold text-white disabled:opacity-50">
                  {saving ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Check className="h-3 w-3" />}
                  Save
                </button>
              </div>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#9aa893]">Logo URL</p>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full rounded-xl border border-[#dfe7dc] bg-white px-3 py-2.5 text-sm text-[#173a0f] outline-none focus:border-[#2f6d16]"
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
        )}
      </section>

      <div className="space-y-3 px-4 py-4">
        {/* Profile completeness */}
        <section className="rounded-[22px] border border-[#dfe7dc] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#173a0f]">Profile completeness</h2>
            <span className="text-base font-bold text-[#2f6d16]">{completion}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e5eddf]">
            <div className="h-full rounded-full bg-[#2f6d16] transition-all duration-500" style={{ width: `${completion}%` }} />
          </div>
        </section>

        {/* About */}
        <SectionCard
          id="about"
          icon={<Info className="h-4.5 w-4.5" />}
          title="About"
          {...sectionCtx}
          readContent={
            <p className={`text-sm leading-relaxed ${formData.description ? 'text-[#617258]' : 'text-[#b5beb0]'}`}>
              {formData.description || 'Tell players what makes this venue great, courts, vibe, parking, opening hours.'}
            </p>
          }
          editContent={
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              autoFocus
              className="w-full resize-none rounded-[14px] border border-[#dfe7dc] bg-white px-4 py-3 text-sm leading-relaxed text-[#173a0f] outline-none focus:border-[#2f6d16]"
              placeholder="Tell players what makes this venue great, courts, vibe, parking, opening hours."
            />
          }
        />

        {/* Amenities */}
        <SectionCard
          id="amenities"
          icon={<Wrench className="h-4.5 w-4.5 text-blue-500" />}
          iconBg="bg-blue-50 text-blue-500"
          title="Amenities & Services"
          {...sectionCtx}
          readContent={
            formData.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((item) => (
                  <span key={item} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#e7f2d9] px-3 text-xs font-medium text-[#2c5b1b]">
                    <span className="text-slate-400">{amenityMap.get(item)?.icon}</span>
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onEditSection('amenities')}
                className="flex w-full items-center justify-center rounded-[14px] border border-dashed border-[#d3d9cf] bg-[#f8faf6] py-3 text-sm font-semibold text-[#2f6d16]"
              >
                <Plus className="mr-2 h-4 w-4" /> Add amenities
              </button>
            )
          }
          editContent={
            <div className="space-y-4">
              {AMENITIES_CATEGORIES.map((category) => (
                <div key={category.title}>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#9aa893]">{category.title}</p>
                  <div className="flex flex-wrap gap-2">
                    {category.items.map((amenity) => {
                      const active = formData.amenities.includes(amenity.label)
                      return (
                        <button
                          key={amenity.label}
                          type="button"
                          onClick={() => toggleAmenity(amenity.label)}
                          className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition ${
                            active ? 'border-[#b8da87] bg-[#e7f2d9] text-[#2c5b1b]' : 'border-[#dfe7dc] bg-white text-[#7b8b72]'
                          }`}
                        >
                          <span className="text-slate-400">{amenity.icon}</span>
                          {amenity.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          }
        />

        {/* Courts */}
        <SectionCard
          id="courts"
          icon={<Building2 className="h-4.5 w-4.5 text-amber-600" />}
          iconBg="bg-amber-50 text-amber-600"
          title="Courts & Supported Sports"
          {...sectionCtx}
          readContent={
            formData.spaces.length > 0 ? (
              <div className="space-y-2">
                {formData.spaces.map((space, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-[14px] bg-[#f4f7f2] p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f0d7] text-[#2f6d16]">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#173a0f]">{space.name || `Court ${i + 1}`}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {space.supported_sports.map((sport) => (
                          <span key={sport} className="rounded-full bg-[#e7f2d9] px-2 py-0.5 text-[10px] font-medium text-[#2c5b1b]">{sport}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onEditSection('courts')}
                className="flex w-full items-center justify-center rounded-[14px] border border-dashed border-[#d3d9cf] bg-[#f8faf6] py-3 text-sm font-semibold text-[#2f6d16]"
              >
                <Plus className="mr-2 h-4 w-4" /> Add first court
              </button>
            )
          }
          editContent={
            <div className="space-y-3">
              {formData.spaces.map((space, i) => (
                <div key={i} className="rounded-[18px] bg-[#f4f7f2] p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f0d7] text-[#2f6d16]">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      placeholder={`Court ${i + 1}`}
                      value={space.name}
                      onChange={(e) => updateSpaceName(i, e.target.value)}
                      className="min-w-0 flex-1 rounded-xl border border-[#dfe7dc] bg-white px-3 py-2.5 text-sm font-semibold text-[#173a0f] outline-none focus:border-[#2f6d16]"
                    />
                    <button type="button" onClick={() => removeSpace(i)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-400">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SPORTS.map((sport) => {
                      const selected = space.supported_sports.includes(sport)
                      return (
                        <button
                          key={sport}
                          type="button"
                          onClick={() => toggleSportInSpace(i, sport)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            selected ? 'bg-[#e7f2d9] text-[#2c5b1b]' : 'bg-white text-[#7b8b72]'
                          }`}
                        >
                          {sport}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addSpace}
                className="flex w-full items-center justify-center rounded-[14px] border border-dashed border-[#d3d9cf] bg-[#f8faf6] py-3 text-sm font-medium text-[#2f6d16]"
              >
                <Plus className="mr-2 h-4 w-4" /> {formData.spaces.length ? 'Add another court' : 'Add first court'}
              </button>
            </div>
          }
        />

        {/* Operating Hours */}
        <SectionCard
          id="hours"
          icon={<Clock3 className="h-4.5 w-4.5 text-orange-500" />}
          iconBg="bg-orange-50 text-orange-500"
          title="Operating Hours"
          {...sectionCtx}
          readContent={
            <div className="divide-y divide-[#edf1ea]">
              {ORDERED_DAYS.map((day) => {
                const hour = formData.operating_hours.find((h) => h.day === day)
                const isOpen = Boolean(hour && !hour.is_closed)
                return (
                  <div key={day} className="flex items-center py-2">
                    <span className="w-24 shrink-0 text-sm font-semibold text-[#173a0f]">{day}</span>
                    <span className={`flex-1 text-right text-sm font-medium ${isOpen ? 'text-[#2f6d16]' : 'text-[#aab3a4]'}`}>
                      {isOpen ? `${formatTime(hour?.open_time)} – ${formatTime(hour?.close_time)}` : 'Closed'}
                    </span>
                  </div>
                )
              })}
            </div>
          }
          editContent={
            <div className="space-y-3">
              {/* Apply all template */}
              <div className="flex items-center gap-2 rounded-[14px] border border-[#dfe7dc] bg-[#f8faf6] p-3">
                <TimeSelect
                  value={templateHours.open}
                  onChange={(v) => setTemplateHours({ ...templateHours, open: v })}
                  className="h-9 min-w-0 flex-1 rounded-xl border border-[#dfe7dc] bg-white px-2 text-sm font-semibold text-[#2f6d16] outline-none"
                />
                <span className="text-slate-300">–</span>
                <TimeSelect
                  value={templateHours.close}
                  onChange={(v) => setTemplateHours({ ...templateHours, close: v })}
                  className="h-9 min-w-0 flex-1 rounded-xl border border-[#dfe7dc] bg-white px-2 text-sm font-semibold text-[#2f6d16] outline-none"
                />
                <button
                  type="button"
                  onClick={() => onApplyAll(templateHours.open, templateHours.close)}
                  className="h-9 shrink-0 rounded-xl bg-[#2d3818] px-3 text-sm font-semibold text-white"
                >
                  Apply all
                </button>
              </div>
              {/* Per-day rows */}
              <div className="divide-y divide-[#edf1ea]">
                {ORDERED_DAYS.map((day) => {
                  const hour = formData.operating_hours.find((h) => h.day === day) || {
                    day, open_time: '06:00', close_time: '22:00', is_closed: true,
                  }
                  return (
                    <div key={day} className="grid grid-cols-[5rem_1fr_auto_1fr_2.5rem] items-center gap-2 py-2">
                      <span className="text-sm font-semibold text-[#173a0f]">{day}</span>
                      <TimeSelect
                        value={hour.open_time}
                        onChange={(v) => updateDay(day, 'open_time', v)}
                        disabled={hour.is_closed}
                        className="h-9 min-w-0 rounded-xl border border-[#dfe7dc] bg-white px-2 text-sm font-semibold text-[#2f6d16] outline-none disabled:bg-[#f6f7f4] disabled:text-[#aab3a4]"
                      />
                      <span className="text-slate-300">–</span>
                      <TimeSelect
                        value={hour.close_time}
                        onChange={(v) => updateDay(day, 'close_time', v)}
                        disabled={hour.is_closed}
                        className="h-9 min-w-0 rounded-xl border border-[#dfe7dc] bg-white px-2 text-sm font-semibold text-[#2f6d16] outline-none disabled:bg-[#f6f7f4] disabled:text-[#aab3a4]"
                      />
                      <button
                        type="button"
                        onClick={() => updateDay(day, 'is_closed', !hour.is_closed)}
                        className={`relative h-6 w-10 rounded-full transition ${hour.is_closed ? 'bg-[#d7d6d2]' : 'bg-[#3f7b19]'}`}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${hour.is_closed ? 'left-0.5' : 'right-0.5'}`} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          }
        />
      </div>

    </div>
  )
}

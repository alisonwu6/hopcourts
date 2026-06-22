import clsx from 'clsx'
import { ChevronLeft, Gift, ChevronRight, MapPin, ArrowRight, Check } from 'lucide-react'
import { FieldSection, FloatingField, BottomSheet, LocationPickerSheet } from '@/components'
import { SheetLayout } from '@/components/SheetLayout'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import type { Sport } from '@/types/dictionary'
import type { OwnershipRole, SelectedVenueSport, SubmitVenueField, SubmitVenueFormState } from '../hooks/useSubmitVenueForm'
import { SportSelectionSheet } from '../components/SportSelectionSheet'

const VENUE_SECTION_TITLE_CLASS = 'text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400'

export const OWNERSHIP_ROLE_OPTIONS: { value: OwnershipRole; label: string; subtitle: string }[] = [
  { value: 'owner', label: 'Owner', subtitle: 'I own this location' },
  { value: 'manager', label: 'Manager', subtitle: 'I manage day-to-day operations' },
  {
    value: 'official_representative',
    label: 'Official representative',
    subtitle: 'I am authorised to represent this location',
  },
  { value: 'community_organizer', label: 'Community organiser', subtitle: 'I run sessions here regularly' },
]

interface SubmitVenueViewProps {
  form: SubmitVenueFormState
  sports: Sport[]
  selectedSports: SelectedVenueSport[]
  isSubmitting: boolean
  highlightField: SubmitVenueField | null
  fieldErrors: Partial<Record<SubmitVenueField, string>>
  error: string | null
  showRoleSheet: boolean
  setShowRoleSheet: (open: boolean) => void
  showLocationSheet: boolean
  setShowLocationSheet: (open: boolean) => void
  showSportSheet: boolean
  setShowSportSheet: (open: boolean) => void
  onChangeField: <K extends SubmitVenueField>(key: K, value: SubmitVenueFormState[K]) => void
  onApplySports: (keys: string[]) => void
  onSelectRole: (role: OwnershipRole) => void
  onConfirmLocation: (data: { address: string; lat: number; lng: number }) => void
  setFieldRef: (field: SubmitVenueField) => (el: HTMLDivElement | null) => void
  onBack: () => void
  onSubmit: () => void
}

export function SubmitVenueView({
  form,
  sports,
  selectedSports,
  isSubmitting,
  highlightField,
  fieldErrors,
  error,
  showRoleSheet,
  setShowRoleSheet,
  showLocationSheet,
  setShowLocationSheet,
  showSportSheet,
  setShowSportSheet,
  onChangeField,
  onApplySports,
  onSelectRole,
  onConfirmLocation,
  setFieldRef,
  onBack,
  onSubmit,
}: SubmitVenueViewProps) {
  const selectedRole = OWNERSHIP_ROLE_OPTIONS.find((r) => r.value === form.ownershipRole)

  return (
    <>
      <div className="min-h-[100dvh] bg-slate-50/60 pb-32">
        <ActionToolbar
          showBack={false}
          title="Official venue"
          contentClassName="w-full max-w-md px-3"
          leftContent={
            <button
              type="button"
              onClick={onBack}
              className="flex h-10 items-center gap-1 px-2 text-sm font-semibold text-[#1A3A0A] transition active:text-[#2d3818]"
              aria-label="Back"
            >
              <ChevronLeft
                className="h-5 w-5"
                strokeWidth={2.5}
              />
              <span className="hidden sm:inline">Back</span>
            </button>
          }
        />

        <form
          id="submit-venue-form"
          className="mx-auto w-full max-w-md space-y-5 px-4"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <div className="flex items-start gap-3 rounded-2xl bg-[#e8f0c2] my-4 p-4">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#1A3A0A] text-[#cce15f]">
              <Gift className="h-5 w-5" />
            </div>
            <p className="text-sm leading-snug text-slate-700">
              <span className="font-bold text-slate-900">Free 14-day trial included.</span> No card needed, billing
              only starts if you choose to stay.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <FieldSection title="VENUE DETAILS" titleClassName={VENUE_SECTION_TITLE_CLASS}>
              <div ref={setFieldRef('name')}>
                <FloatingField
                  label="Venue name"
                  name="name"
                  value={form.name}
                  onChange={(e) => onChangeField('name', e.target.value)}
                  autoComplete="new-password"
                  placeholder="e.g. QUT Sport Basketball and Netball Courts"
                  hasError={highlightField === 'name'}
                  supportingText={fieldErrors.name}
                  required
                />
              </div>
              <div ref={setFieldRef('address')} className="space-y-1">
                <button
                  type="button"
                  onClick={() => setShowLocationSheet(true)}
                  className={clsx(
                    'flex w-full items-center justify-between rounded-2xl border-2 bg-white px-4 py-3 text-left transition',
                    highlightField === 'address' ? 'border-red-500' : 'border-slate-300 hover:border-slate-400'
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#e8f0c2] text-[#1A3A0A]">
                      <MapPin
                        className="h-5 w-5"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Address</span>
                      <span
                        className={clsx(
                          'truncate text-sm',
                          form.address ? 'font-semibold text-slate-900' : 'text-slate-400'
                        )}
                      >
                        {form.address || 'Tap to drop a pin on the map'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className="h-5 w-5 flex-none text-slate-400"
                    strokeWidth={2}
                  />
                </button>
                {fieldErrors.address && (
                  <p
                    className={clsx(
                      'px-4 text-xs transition-colors duration-500',
                      highlightField === 'address' ? 'text-red-500' : 'text-slate-500'
                    )}
                  >
                    {fieldErrors.address}
                  </p>
                )}
              </div>
            </FieldSection>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <FieldSection title="SPORTS HAPPEN HERE" titleClassName={VENUE_SECTION_TITLE_CLASS}>
              <div ref={setFieldRef('sportKeys')} className="space-y-1">
                <button
                  type="button"
                  onClick={() => setShowSportSheet(true)}
                  className={clsx(
                    'flex w-full items-center justify-between gap-3 rounded-2xl border-2 bg-white p-4 text-left transition',
                    highlightField === 'sportKeys' ? 'border-red-500' : 'border-slate-300 hover:border-slate-400'
                  )}
                >
                  {selectedSports.length ? (
                    <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                      {selectedSports.map((sport) => (
                        <span
                          key={sport.key}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                        >
                          {sport.icon && <span>{sport.icon}</span>}
                          {sport.label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="min-w-0 flex-1 text-base text-slate-400">Select sports...</span>
                  )}
                  <ChevronRight
                    className="h-5 w-5 flex-none text-slate-400"
                    strokeWidth={2}
                  />
                </button>
                {fieldErrors.sportKeys && (
                  <p
                    className={clsx(
                      'px-4 text-xs transition-colors duration-500',
                      highlightField === 'sportKeys' ? 'text-red-500' : 'text-slate-500'
                    )}
                  >
                    {fieldErrors.sportKeys}
                  </p>
                )}
              </div>
            </FieldSection>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="space-y-4">
              <div ref={setFieldRef('contactPerson')}>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Contact person
                  </span>
                  <input
                    type="text"
                    value={form.contactPerson}
                    onChange={(event) => onChangeField('contactPerson', event.target.value)}
                    className={clsx(
                      'w-full rounded-[18px] border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400',
                      highlightField === 'contactPerson' ? 'border-red-500' : 'border-slate-200'
                    )}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </label>
                {fieldErrors.contactPerson && (
                  <p
                    className={clsx(
                      'mt-1.5 px-4 text-xs transition-colors duration-500',
                      highlightField === 'contactPerson' ? 'text-red-500' : 'text-slate-500'
                    )}
                  >
                    {fieldErrors.contactPerson}
                  </p>
                )}
              </div>

              <div ref={setFieldRef('ownershipRole')} className="space-y-1">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Your role
                </span>
                <button
                  type="button"
                  onClick={() => setShowRoleSheet(true)}
                  className={clsx(
                    'flex w-full items-center justify-between rounded-[18px] border bg-white px-4 py-3 text-left text-sm outline-none transition focus:border-slate-400',
                    highlightField === 'ownershipRole' ? 'border-red-500' : 'border-slate-200'
                  )}
                >
                  <span className={clsx(selectedRole ? 'font-medium text-slate-900' : 'text-slate-400')}>
                    {selectedRole ? selectedRole.label : 'Manager, owner, operations lead'}
                  </span>
                  <ChevronRight
                    className="h-5 w-5 flex-none text-slate-400"
                    strokeWidth={2}
                  />
                </button>
                {fieldErrors.ownershipRole && (
                  <p
                    className={clsx(
                      'mt-1.5 px-4 text-xs transition-colors duration-500',
                      highlightField === 'ownershipRole' ? 'text-red-500' : 'text-slate-500'
                    )}
                  >
                    {fieldErrors.ownershipRole}
                  </p>
                )}
              </div>

              <div ref={setFieldRef('contactPhone')}>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Phone
                  </span>
                  <input
                    type="tel"
                    value={form.contactPhone}
                    onChange={(event) => onChangeField('contactPhone', event.target.value)}
                    className={clsx(
                      'w-full rounded-[18px] border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400',
                      highlightField === 'contactPhone' ? 'border-red-500' : 'border-slate-200'
                    )}
                    placeholder="Your phone number"
                    autoComplete="tel"
                  />
                </label>
                {fieldErrors.contactPhone && (
                  <p
                    className={clsx(
                      'mt-1.5 px-4 text-xs transition-colors duration-500',
                      highlightField === 'contactPhone' ? 'text-red-500' : 'text-slate-500'
                    )}
                  >
                    {fieldErrors.contactPhone}
                  </p>
                )}
              </div>

              <div ref={setFieldRef('contactEmail')}>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Email
                  </span>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(event) => onChangeField('contactEmail', event.target.value)}
                    className={clsx(
                      'w-full rounded-[18px] border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400',
                      highlightField === 'contactEmail' ? 'border-red-500' : 'border-slate-200'
                    )}
                    placeholder="Email used for admin approval"
                    autoComplete="email"
                  />
                </label>
                {fieldErrors.contactEmail && (
                  <p
                    className={clsx(
                      'mt-1.5 px-4 text-xs transition-colors duration-500',
                      highlightField === 'contactEmail' ? 'text-red-500' : 'text-slate-500'
                    )}
                  >
                    {fieldErrors.contactEmail}
                  </p>
                )}
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Notes
                </span>
                <textarea
                  value={form.note}
                  onChange={(event) => onChangeField('note', event.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="Any details to help us verify your claim."
                />
              </label>
            </div>
          </div>
        </form>

        <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 bg-white pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-5 shadow-[0_-20px_50px_rgba(15,41,77,0.1)]">
          <div className="px-4">
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#3c4a22] text-base font-bold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit & start free trial'}
              {!isSubmitting && <ArrowRight className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <LocationPickerSheet
        open={showLocationSheet}
        onClose={() => setShowLocationSheet(false)}
        initialValue={
          form.address && form.lat != null && form.lng != null
            ? { address: form.address, lat: form.lat, lng: form.lng }
            : null
        }
        onConfirm={(v) => {
          onConfirmLocation(v)
          setShowLocationSheet(false)
        }}
        title="Venue location"
        subtitle="Drop a pin or type the address"
      />

      <SportSelectionSheet
        open={showSportSheet}
        sports={sports}
        selectedKeys={form.sportKeys}
        onClose={() => setShowSportSheet(false)}
        onApply={onApplySports}
      />

      <BottomSheet
        open={showRoleSheet}
        onClose={() => setShowRoleSheet(false)}
        disableContainer
        showHandle={false}
      >
        <SheetLayout
          onClose={() => setShowRoleSheet(false)}
          title="Your role"
          subtitle="Select the option that best describes you."
          className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
          contentClassName="flex-1 overflow-y-auto px-4 py-3 space-y-2"
          primaryButton={{ label: 'Close', onClick: () => setShowRoleSheet(false) }}
          showHandle={false}
        >
          {OWNERSHIP_ROLE_OPTIONS.map((opt) => {
            const isActive = form.ownershipRole === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSelectRole(opt.value)}
                className={clsx(
                  'flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition',
                  isActive ? 'border-[#1A3A0A] bg-[#f3f7e1]' : 'border-slate-200 bg-white active:bg-slate-50'
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-slate-900">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{opt.subtitle}</p>
                </div>
                {isActive && (
                  <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#1A3A0A] text-white">
                    <Check
                      className="h-4 w-4"
                      strokeWidth={3}
                    />
                  </div>
                )}
              </button>
            )
          })}
        </SheetLayout>
      </BottomSheet>
    </>
  )
}

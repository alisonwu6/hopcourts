import clsx from 'clsx'
import { ChevronLeft, ChevronRight, MapPin, ArrowRight } from 'lucide-react'
import { FieldSection, FloatingField, LocationPickerSheet } from '@/components'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import type { Sport } from '@/types/dictionary'
import type { SelectedVenueSport, SubmitVenueField, SubmitVenueFormState } from '../hooks/useSubmitVenueForm'
import { SportSelectionSheet } from '../components/SportSelectionSheet'

interface SubmitPublicVenueViewProps {
  form: SubmitVenueFormState
  sports: Sport[]
  selectedSports: SelectedVenueSport[]
  isSubmitting: boolean
  highlightField: SubmitVenueField | null
  fieldErrors: Partial<Record<SubmitVenueField, string>>
  error: string | null
  showLocationSheet: boolean
  setShowLocationSheet: (open: boolean) => void
  showSportSheet: boolean
  setShowSportSheet: (open: boolean) => void
  onChangeField: <K extends SubmitVenueField>(key: K, value: SubmitVenueFormState[K]) => void
  onApplySports: (keys: string[]) => void
  onConfirmLocation: (data: { address: string; lat: number; lng: number }) => void
  setFieldRef: (field: SubmitVenueField) => (el: HTMLDivElement | null) => void
  onBack: () => void
  onSwitchToOfficial: () => void
  onSubmit: () => void
}

export function SubmitPublicVenueView({
  form,
  sports,
  selectedSports,
  isSubmitting,
  highlightField,
  fieldErrors,
  error,
  showLocationSheet,
  setShowLocationSheet,
  showSportSheet,
  setShowSportSheet,
  onChangeField,
  onApplySports,
  onConfirmLocation,
  setFieldRef,
  onBack,
  onSwitchToOfficial,
  onSubmit,
}: SubmitPublicVenueViewProps) {
  return (
    <div className="min-h-[100dvh] bg-slate-50/60 pb-32">
      <ActionToolbar
        showBack={false}
        title="Public listing"
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
        id="submit-public-venue-form"
        className="mx-auto mt-2 w-full max-w-md space-y-5 px-4"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <div className="flex items-start gap-3 rounded-2xl bg-[#e8f0c2] p-4">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#1A3A0A] text-[#cce15f]">
            <MapPin className="h-5 w-5" />
          </div>
          <p className="text-sm leading-snug text-slate-700">
            <span className="font-bold text-slate-900">Free, no review needed.</span> Put this court on the map so
            everyone can hop in and play.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <FieldSection title="Venue details">
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
                    <MapPin className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex flex-col">
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
                <ChevronRight className="h-5 w-5 flex-none text-slate-400" strokeWidth={2} />
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
          <FieldSection title="Sports happen here">
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
                  <span className="min-w-0 flex-1 text-base text-slate-400">
                    Select Sports...
                  </span>
                )}
                <ChevronRight className="h-5 w-5 flex-none text-slate-400" strokeWidth={2} />
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
      </form>

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

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 bg-white pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-5 shadow-[0_-20px_50px_rgba(15,41,77,0.1)]">
        <div className="space-y-3 px-4">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#3c4a22] text-base font-bold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add to map'}
            {!isSubmitting && <ArrowRight className="h-5 w-5" />}
          </button>
          <p className="text-center text-xs text-slate-500">
            Is this your venue?{' '}
            <button
              type="button"
              onClick={onSwitchToOfficial}
              className="font-bold text-[#1A3A0A] underline-offset-2 hover:underline"
            >
              Submit as Official instead
            </button>{' '}
            for management tools.
          </p>
        </div>
      </div>
    </div>
  )
}

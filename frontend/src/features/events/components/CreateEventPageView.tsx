import clsx from 'clsx'
import type {
  ChangeEvent,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'
import { useMemo, useId, useRef } from 'react'
import { MapPin, ChevronRight, ImagePlus, X } from 'lucide-react'
import { Button } from '@/components'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'
import { BottomSheet } from '@/components/BottomSheet'
import { SheetLayout } from '@/components/SheetLayout'
import { MapPicker } from '@/components/map/MapPicker'
import { PageLoading } from '@/components/PageLoading'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useCreateEventForm } from '@/features/events/hooks/useCreateEventForm'

const SKILL_LEVEL_LABELS = {
  any: 'All levels',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
} as const

type SkillLevelKey = keyof typeof SKILL_LEVEL_LABELS

type CreateEventPageViewProps = ReturnType<typeof useCreateEventForm>

export function CreateEventPageView({
  form,
  setForm,
  editId,
  error,
  submittingStatus,
  canSubmit,
  isFavorite,
  setIsFavorite,
  heroPreviews,
  showLoginPrompt,
  setShowLoginPrompt,
  showSportSheet,
  setShowSportSheet,
  sportSearch,
  setSportSearch,
  showLocationSheet,
  setShowLocationSheet,
  selectedLocation,
  setSelectedLocation,
  selectedAddress,
  setSelectedAddress,
  setAddressMode,
  reverseGeoError,
  locationConfirming,
  isDraftLoading,
  editingEventStatus,
  editingEventVisibility,
  highlightField,
  fieldHint,
  costMode,
  setCostMode,
  sportsCatalog,
  minPeopleImmediateError,
  clearAddress,
  handleInputChange,
  ensureDateTimeDefault,
  handleSkillSelect,
  handleGenderSelect,
  openLocationPicker,
  handleImageChange,
  handleSportSelect,
  handleCancel,
  handleSignup,
  handleSubmit,
  handleRemoveImage,
  setFieldRef,
  confirmLocation,
}: CreateEventPageViewProps) {
  return (
    <>
      <div className="min-h-screen bg-white pb-24">
        <ActionToolbar
          showBack={false}
          onBack={handleCancel}
          onToggleFavorite={() => setIsFavorite((prev) => !prev)}
          isFavorite={isFavorite}
          showFavorite={false}
          showShare={false}
          title={editId ? 'Edit Event' : 'Create Event'}
          contentClassName="w-full max-w-md px-4"
          leftContent={
            <button
              type="button"
              onClick={handleCancel}
              className="flex h-10 w-10 items-center justify-center text-slate-500"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          }
          rightContent={<span className="h-10 w-10" aria-hidden="true" />}
        />
        {isDraftLoading && <PageLoading />}
        <form
          id="event-form"
          className="mx-auto mt-2 w-full max-w-md space-y-6 px-4 pb-8"
          onSubmit={(e) => handleSubmit(e, 'published')}
        >
          {error && (
            <div className="sticky top-4 z-50 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm">
              {error}
            </div>
          )}

          <div className="space-y-8">
            <FieldSection title="Event Basics" description="">
              <div ref={setFieldRef('title')}>
                <FloatingField
                  label="Event Title"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  required
                  hasError={highlightField === 'title'}
                />
                {fieldHint?.field === 'title' && fieldHint.message && (
                  <p
                    className={clsx(
                      'mt-1 px-4 text-xs',
                      fieldHint.tone === 'error' ? 'text-red-500' : 'text-slate-400'
                    )}
                  >
                    {fieldHint.message}
                  </p>
                )}
              </div>
              <div ref={setFieldRef('sport')}>
                <FloatingField
                  label="Sport"
                  name="sport"
                  value={form.sport}
                  readOnly
                  onClick={() => setShowSportSheet(true)}
                  placeholder="Select sport"
                  required
                  hasError={highlightField === 'sport'}
                />
                {fieldHint?.field === 'sport' && fieldHint.message && (
                  <p
                    className={clsx(
                      'mt-1 px-4 text-xs',
                      fieldHint.tone === 'error' ? 'text-red-500' : 'text-slate-400'
                    )}
                  >
                    {fieldHint.message}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <div className="flex-1" ref={setFieldRef('capacity')}>
                  <FloatingField
                    label="Max Participants"
                    name="capacity"
                    type="number"
                    min={1}
                    value={form.capacity}
                    onChange={handleInputChange}
                    required
                    hasError={highlightField === 'capacity'}
                  />
                  {fieldHint?.field === 'capacity' && fieldHint.message && (
                    <p
                      className={clsx(
                        'mt-1 px-4 text-xs',
                        fieldHint.tone === 'error' ? 'text-red-500' : 'text-slate-400'
                      )}
                    >
                      {fieldHint.message}
                    </p>
                  )}
                </div>
                <div className="flex-1" ref={setFieldRef('minPeople')}>
                  <FloatingField
                    label="Min Participants"
                    name="minPeople"
                    type="number"
                    min={1}
                    value={form.minPeople}
                    onChange={handleInputChange}
                    required
                    hasError={highlightField === 'minPeople' || Boolean(minPeopleImmediateError)}
                  />
                  {minPeopleImmediateError ? (
                    <p className="mt-1 px-4 text-xs text-red-500">{minPeopleImmediateError}</p>
                  ) : fieldHint?.field === 'minPeople' && fieldHint.message ? (
                    <p
                      className={clsx(
                        'mt-1 px-4 text-xs',
                        fieldHint.tone === 'error' ? 'text-red-500' : 'text-slate-400'
                      )}
                    >
                      {fieldHint.message}
                    </p>
                  ) : null}
                </div>
              </div>
              <SkillSelector selected={form.skillLevel} onSelect={handleSkillSelect} />
              <GenderSelector selected={form.gender} onSelect={handleGenderSelect} />
            </FieldSection>

            <FieldSection title="Location and Time" description="">
              <div className="space-y-4">
                <div ref={setFieldRef('location')}>
                  <button
                    type="button"
                    onClick={openLocationPicker}
                    className={clsx(
                      'flex w-full items-center justify-between rounded-2xl border bg-slate-50 p-4 transition',
                      highlightField === 'location' ? 'border-red-500' : 'border-slate-200'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100/50 text-blue-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="mb-0.5 text-sm font-bold leading-tight text-slate-900">
                          {form.location || 'Tap to select location'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
                {fieldHint?.field === 'location' && fieldHint.message && (
                  <p
                    className={clsx(
                      'mt-1 px-4 text-xs',
                      fieldHint.tone === 'error' ? 'text-red-500' : 'text-slate-400'
                    )}
                  >
                    {fieldHint.message}
                  </p>
                )}
                {reverseGeoError && <p className="text-xs text-red-500">{reverseGeoError}</p>}

                <FloatingField
                  label="Venue Name (Optional)"
                  name="placeName"
                  placeholder="If you know the venue name, enter it here."
                  value={form.placeName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-4">
                <div ref={setFieldRef('startTime')}>
                  <DateTimeField
                    label="Start Time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleInputChange}
                    onOpen={() => ensureDateTimeDefault('startTime')}
                    required
                    hasError={highlightField === 'startTime'}
                  />
                  {fieldHint?.field === 'startTime' && fieldHint.message && (
                    <p
                      className={clsx(
                        'mt-1 px-4 text-xs',
                        fieldHint.tone === 'error' ? 'text-red-500' : 'text-slate-400'
                      )}
                    >
                      {fieldHint.message}
                    </p>
                  )}
                </div>
                <div ref={setFieldRef('endTime')}>
                  <DateTimeField
                    label="End Time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleInputChange}
                    onOpen={() => ensureDateTimeDefault('endTime')}
                    required
                    hasError={highlightField === 'endTime'}
                  />
                  {fieldHint?.field === 'endTime' && fieldHint.message && (
                    <p
                      className={clsx(
                        'mt-1 px-4 text-xs',
                        fieldHint.tone === 'error' ? 'text-red-500' : 'text-slate-400'
                      )}
                    >
                      {fieldHint.message}
                    </p>
                  )}
                </div>
              </div>
            </FieldSection>

            <FieldSection title="Pricing" description="Set event pricing details.">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition">
                  <input
                    id="is-free-checkbox"
                    type="checkbox"
                    checked={form.isFree}
                    onChange={(e) => setForm((prev) => ({ ...prev, isFree: e.target.checked }))}
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is-free-checkbox" className="flex flex-1 flex-col">
                    <span className="text-sm font-semibold text-slate-800">Free</span>
                  </label>
                </div>

                {!form.isFree && (
                  <div className="grid gap-4 duration-300 animate-in fade-in slide-in-from-top-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <div className="flex rounded-lg bg-slate-100 p-1">
                        {[
                          { key: 'total', label: 'Total Cost' },
                          { key: 'person', label: 'Per Person' },
                        ].map((mode) => (
                          <button
                            key={mode.key}
                            type="button"
                            onClick={() => setCostMode(mode.key as any)}
                            className={clsx(
                              'rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
                              costMode === mode.key
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            )}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                      <span className="text-xs text-slate-400">
                        {costMode === 'total'
                          ? 'Per-person fee is estimated from total participants.'
                          : 'Set per-person fee directly.'}
                      </span>
                    </div>

                    <div ref={setFieldRef('price')}>
                      <FloatingField
                        label={costMode === 'total' ? 'Total Cost (TWD)' : 'Per Person (TWD)'}
                        name="price"
                        type="number"
                        min={0}
                        step={1}
                        value={form.price}
                        onChange={handleInputChange}
                        placeholder={costMode === 'total' ? 'e.g. 2000' : 'e.g. 200'}
                        required={!form.isFree}
                        hasError={highlightField === 'price'}
                        supportingText={
                          form.price && Number(form.capacity) > 0 && costMode === 'total'
                            ? `Est. per person: $${Math.round(Number(form.price) / Number(form.capacity))}`
                            : undefined
                        }
                      />
                      {fieldHint?.field === 'price' && fieldHint.message && (
                        <p
                          className={clsx(
                            'mt-1 px-4 text-xs',
                            fieldHint.tone === 'error' ? 'text-red-500' : 'text-slate-400'
                          )}
                        >
                          {fieldHint.message}
                        </p>
                      )}
                    </div>
                    <div ref={setFieldRef('priceNote')}>
                      <FloatingField
                        as="textarea"
                        rows={3}
                        label="Fee Notes"
                        name="priceNote"
                        value={form.priceNote}
                        onChange={handleInputChange}
                        placeholder="e.g. on-site payment"
                        hasError={highlightField === 'priceNote'}
                      />
                      {fieldHint?.field === 'priceNote' && fieldHint.message && (
                        <p
                          className={clsx(
                            'mt-1 px-4 text-xs',
                            fieldHint.tone === 'error' ? 'text-red-500' : 'text-slate-400'
                          )}
                        >
                          {fieldHint.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </FieldSection>

            <div className="py-1">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 border-t border-dashed border-slate-300" />
                <span className="text-xs font-semibold tracking-wide text-slate-400">
                  Optional below
                </span>
                <div className="h-px flex-1 border-t border-dashed border-slate-300" />
              </div>
            </div>

            <FieldSection title="Event Photos" description="Up to 3 photos">
              <CoverUploader
                previews={heroPreviews}
                onChange={handleImageChange}
                onRemove={handleRemoveImage}
              />
            </FieldSection>

            <FieldSection
              title="Event Description"
              description="Describe the vibe, expectations, or notes."
            >
              <FloatingField
                as="textarea"
                label="Event Description"
                name="notes"
                rows={5}
                value={form.notes}
                onChange={handleInputChange}
              />
            </FieldSection>
          </div>
        </form>

        <ActionBar
          canSubmit={canSubmit}
          submittingStatus={submittingStatus}
          onDraft={() => handleSubmit(undefined, 'draft')}
          onPublish={() => handleSubmit(undefined, 'published')}
          showDraftButton={!editId || editingEventStatus === 'draft'}
          isPublicPublishedEdit={
            !!editId && editingEventStatus === 'published' && editingEventVisibility === 'public'
          }
        />
      </div>
      <LoginPromptSheet
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onSignup={handleSignup}
      />

      <BottomSheet
        open={showSportSheet}
        onClose={() => setShowSportSheet(false)}
        disableContainer
        showHandle={false}
      >
        <SheetLayout
          onClose={() => setShowSportSheet(false)}
          title="Select Sport"
          subtitle="Pick one sport from the list."
          height="tall"
          className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
          contentClassName="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          primaryButton={{
            label: 'Close',
            onClick: () => setShowSportSheet(false),
          }}
          showHandle={false}
        >
          <input
            value={sportSearch}
            onChange={(e) => setSportSearch(e.target.value)}
            placeholder="Search sports"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none"
          />
          <div className="space-y-2">
            {sportsCatalog
              .filter((sport) => sport.label.toLowerCase().includes(sportSearch.toLowerCase()))
              .map((sport) => {
                const isActive = form.sportKey === sport.key
                return (
                  <button
                    key={sport.key}
                    type="button"
                    onClick={() => handleSportSelect(sport.key, sport.label)}
                    className={clsx(
                      'w-full rounded-2xl border px-4 py-3 text-left text-base font-semibold shadow-sm transition',
                      isActive
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-800'
                    )}
                  >
                    {sport.icon && <span className="mr-2 text-xl">{sport.icon}</span>}
                    {sport.label}
                  </button>
                )
              })}
          </div>
        </SheetLayout>
      </BottomSheet>

      <BottomSheet
        open={showLocationSheet}
        onClose={() => setShowLocationSheet(false)}
        disableContainer
        showHandle={false}
      >
        <SheetLayout
          onClose={() => setShowLocationSheet(false)}
          title="Select Location"
          subtitle="Pin location based on your address"
          height="tall"
          className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
          contentClassName="flex-1 overflow-hidden px-4 pb-4 pt-2 space-y-3"
          primaryButton={{
            label: locationConfirming ? 'Processing...' : 'Confirm',
            onClick: confirmLocation,
            disabled: locationConfirming,
          }}
          showHandle={false}
        >
          <div className="space-y-2 rounded-2xl bg-slate-50 px-3 py-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">Event Address</p>
            </div>

            <div className="relative">
              <input
                type="text"
                value={selectedAddress}
                onChange={(e) => {
                  setSelectedAddress(e.target.value)
                  setAddressMode('manual')
                }}
                placeholder="Please enter an address"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-3 pr-10 text-sm font-semibold text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none"
              />
              {selectedAddress.trim() && (
                <button
                  type="button"
                  aria-label="Clear address"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500"
                  onClick={clearAddress}
                >
                  ×
                </button>
              )}
            </div>

            {reverseGeoError && <p className="text-xs text-red-500">{reverseGeoError}</p>}
          </div>

          <div className="h-[56vh] overflow-hidden rounded-2xl border border-slate-200">
            <MapPicker
              value={selectedLocation ?? undefined}
              variant="satellite"
              onChange={(loc) => {
                setSelectedLocation(loc)
                setAddressMode('auto')
              }}
            />
          </div>
        </SheetLayout>
      </BottomSheet>
    </>
  )
}

function ActionBar({
  canSubmit,
  submittingStatus,
  onDraft,
  onPublish,
  showDraftButton,
  isPublicPublishedEdit,
}: {
  canSubmit: boolean
  submittingStatus: 'draft' | 'published' | null
  onDraft: () => void
  onPublish: () => void
  showDraftButton: boolean
  isPublicPublishedEdit: boolean
}) {
  const isSubmitting = submittingStatus !== null
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 mx-auto w-full max-w-md bg-white/95 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-4 shadow-[0_-10px_30px_rgba(15,41,77,0.1)] backdrop-blur">
      <div className="flex w-full items-center gap-3 px-4">
        {showDraftButton && (
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={onDraft}
            className="flex-1 rounded-full border-slate-200 text-slate-600"
            disabled={!canSubmit || isSubmitting}
          >
            {submittingStatus === 'draft' ? 'Saving...' : 'Save Draft'}
          </Button>
        )}
        <Button
          size="sm"
          type="button"
          onClick={onPublish}
          disabled={isSubmitting}
          className={clsx(
            showDraftButton ? 'flex-1' : 'w-full',
            'rounded-full px-6',
            !canSubmit && 'opacity-50'
          )}
        >
          {submittingStatus === 'published'
            ? isPublicPublishedEdit
              ? 'Updating...'
              : 'Publishing...'
            : isPublicPublishedEdit
              ? 'Update & Publish'
              : 'Publish'}
        </Button>
      </div>
    </div>
  )
}

function FieldSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1">
        <p className="text-md font-semibold uppercase tracking-wide text-slate-600">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function SkillSelector({
  selected,
  onSelect,
}: {
  selected: SkillLevelKey
  onSelect: (level: SkillLevelKey) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-wide text-slate-500">Skill Level</p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(SKILL_LEVEL_LABELS).map(([level, label]) => {
          const value = level as SkillLevelKey
          const isActive = selected === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              className={clsx(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition',
                isActive
                  ? 'border-blue-500 bg-blue-600 text-white shadow-[0_6px_16px_rgba(30,64,175,0.25)]'
                  : 'border-slate-200 bg-white text-slate-600'
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function GenderSelector({
  selected,
  onSelect,
}: {
  selected: 'mixed' | 'female' | 'male'
  onSelect: (value: 'mixed' | 'female' | 'male') => void
}) {
  const options: { id: 'mixed' | 'female' | 'male'; label: string }[] = [
    { id: 'mixed', label: 'Mixed' },
    { id: 'female', label: 'Women Only' },
    { id: 'male', label: 'Men Only' },
  ]

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-wide text-slate-500">Gender</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = selected === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={clsx(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition',
                isActive
                  ? 'border-blue-500 bg-blue-600 text-white shadow-[0_6px_16px_rgba(30,64,175,0.25)]'
                  : 'border-slate-200 bg-white text-slate-600'
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CoverUploader({
  previews,
  onChange,
  onRemove,
}: {
  previews?: string[]
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRemove?: (index: number) => void
}) {
  const isFull = previews && previews.length >= 3

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/50 p-2">
      <div className="grid grid-cols-3 gap-2">
        {previews?.slice(0, 3).map((src, idx) => (
          <div
            key={src + idx}
            className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-100 shadow-sm"
          >
            <img src={src} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onRemove(idx)
                }}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}

        {!isFull && (
          <label className="group relative box-border flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-white p-2 transition">
            <div className="group- flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <ImagePlus className="h-4 w-4" />
            </div>
            <p className="group- text-[10px] font-semibold text-slate-500">Upload Photo</p>
            <input type="file" accept="image/*" multiple className="hidden" onChange={onChange} />
          </label>
        )}
      </div>
    </div>
  )
}

type FloatingFieldProps =
  | ({
      as?: 'input'
    } & InputHTMLAttributes<HTMLInputElement> &
      CommonFloatingProps)
  | ({
      as: 'textarea'
    } & TextareaHTMLAttributes<HTMLTextAreaElement> &
      CommonFloatingProps)

type CommonFloatingProps = {
  label: string
  supportingText?: string
  characterLimit?: number
  hasError?: boolean
}

function FloatingField(props: FloatingFieldProps) {
  const { label, supportingText, characterLimit, hasError, ...domProps } = props as any
  const as = domProps.as ?? 'input'
  const id = useId()
  const value =
    'value' in domProps
      ? (domProps.value ?? '')
      : 'defaultValue' in domProps
        ? ((domProps.defaultValue as string | number | readonly string[] | undefined) ?? '')
        : ''
  const hasValue =
    typeof value === 'number'
      ? true
      : Array.isArray(value)
        ? value.length > 0
        : Boolean(value && String(value).trim().length > 0)
  const baseClasses = clsx(
    'peer block w-full appearance-none min-h-[3.5rem] rounded-[14px] border-2 bg-white px-4 pt-7 pb-3 text-base text-slate-900 transition focus:shadow-[0_0_0_1px_rgba(0,0,0,0.2)] focus:outline-none disabled:opacity-60',
    hasError ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-slate-900'
  )
  const labelClasses =
    'pointer-events-none absolute left-4 top-2 text-sm font-semibold text-slate-600 bg-white px-1'
  const infoText =
    typeof value === 'string' && characterLimit
      ? `${Math.max(characterLimit - value.length, 0)} characters available`
      : supportingText

  if (as === 'textarea') {
    const {
      as: _as,
      className,
      rows = 4,
      ...rest
    } = domProps as Extract<FloatingFieldProps, { as: 'textarea' }>
    return (
      <div className="space-y-1">
        <div className="relative">
          <textarea
            {...rest}
            id={id}
            rows={rows}
            placeholder={rest.placeholder ?? ' '}
            data-filled={hasValue}
            className={clsx(baseClasses, 'resize-none', className)}
          />
          <label htmlFor={id} className={labelClasses}>
            {label}
          </label>
        </div>
        {infoText && <p className="text-xs text-slate-500">{infoText}</p>}
      </div>
    )
  }

  const {
    as: _as,
    className,
    type = 'text',
    ...rest
  } = domProps as Extract<FloatingFieldProps, { as?: 'input' }>
  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          {...rest}
          id={id}
          type={type}
          placeholder={rest.placeholder ?? ' '}
          data-filled={hasValue}
          className={clsx(baseClasses, className)}
        />
        <label htmlFor={id} className={labelClasses}>
          {label}
        </label>
      </div>
      {infoText && <p className="text-xs text-slate-500">{infoText}</p>}
    </div>
  )
}

function DateTimeField({
  label,
  value,
  name,
  onChange,
  onOpen,
  required,
  hasError,
}: {
  label: string
  value: string
  name: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onOpen?: () => void
  required?: boolean
  hasError?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const displayValue = useMemo(() => {
    if (!value) return ''
    try {
      const date = new Date(value)
      return format(date, 'yyyy/MM/dd HH:mm', { locale: enUS })
    } catch {
      return ''
    }
  }, [value])

  const handleClick = () => {
    onOpen?.()
    const input = inputRef.current
    if (!input) return

    try {
      input.showPicker()
    } catch {
      input.focus()
    }
  }

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'relative w-full rounded-[14px] border-2 bg-white px-4 pb-3 pt-7 transition focus-within:shadow-[0_0_0_1px_rgba(0,0,0,0.2)]',
        hasError
          ? 'border-red-500 focus-within:border-red-500'
          : 'border-slate-300 focus-within:border-slate-900'
      )}
    >
      <label className="pointer-events-none absolute left-4 top-2 bg-white px-1 text-sm font-semibold text-slate-600">
        {label}
      </label>
      <div className={clsx('min-h-[1.5rem] w-full text-base', !displayValue && 'text-slate-400')}>
        {displayValue || 'Please select time'}
      </div>
      <input
        ref={inputRef}
        type="datetime-local"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none opacity-0"
        lang="en-US"
      />
    </div>
  )
}

import clsx from 'clsx'
import type { ChangeEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { MapPin, ChevronRight, ImagePlus, X, Ban, Trash2 } from 'lucide-react'
import { Button, AlertDialog, FieldSection, FloatingField } from '@/components'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'
import { BottomSheet } from '@/components/BottomSheet'
import { SheetLayout } from '@/components/SheetLayout'
import { MapPicker, QUEENSLAND_BOUNDS } from '@/components/map/MapPicker'
import { PageLoading } from '@/components/PageLoading'
import { format, addHours } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useCreateEventForm } from '@/features/events/hooks/useCreateEventForm'
import { DateTimeWheelSheet } from '@/components/ui/DateTimeWheelSheet'

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
  photoError,
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
  setReverseGeoError,
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
  handleSkillSelect,
  handleGenderSelect,
  openLocationPicker,
  handleImageChange,
  handleSportSelect,
  handleCancel,
  handleSubmit,
  handleRemoveImage,
  setFieldRef,
  confirmLocation,
  hostGender,
  hasOtherParticipants,
  showDeleteConfirm,
  setShowDeleteConfirm,
  showCancelConfirm,
  setShowCancelConfirm,
  isDeletingEvent,
  isCancellingEvent,
  handleDeleteEvent,
  handleCancelEvent,
  confirmDeleteEvent,
  confirmCancelEvent,
}: CreateEventPageViewProps) {
  return (
    <>
      <div className="relative flex h-[100dvh] flex-col bg-white">
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
              <X
                className="h-5 w-5"
                strokeWidth={2}
              />
            </button>
          }
          rightContent={
            editId ? (
              <div className="flex items-center gap-1">
                {hasOtherParticipants ? (
                  <button
                    type="button"
                    onClick={handleCancelEvent}
                    disabled={isCancellingEvent}
                    className="flex cursor-pointer items-center text-[12px] font-bold uppercase text-white bg-red-500 px-2 py-1 rounded-2xl"
                    aria-label="Cancel event"
                  >
                    <Ban
                      size={12}
                      strokeWidth={3.5}
                      className='mr-1'
                    />
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDeleteEvent}
                    disabled={isDeletingEvent}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition active:bg-slate-200 disabled:opacity-50"
                    aria-label="Delete event"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ) : (
              <span
                className="h-10 w-10"
                aria-hidden="true"
              />
            )
          }
        />
        {isDraftLoading && <PageLoading />}
        {error && (
          <div className="absolute top-14 left-0 right-0 z-50 px-4 pt-2 pointer-events-none">
            <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm pointer-events-auto">
              {error}
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          <form
            id="event-form"
            className="mx-auto mt-2 w-full max-w-md space-y-6 px-4 pb-8"
            onSubmit={(e) => handleSubmit(e, 'published')}
          >

            <div className="space-y-8">
              {hasOtherParticipants && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Some fields are locked because participants have already joined. You can still update the description, photos, and fee notes.
                </div>
              )}
              <div className={clsx(hasOtherParticipants && 'pointer-events-none opacity-50')}>
              <FieldSection
                title="Event Basics"
                description=""
              >
                <div ref={setFieldRef('title')}>
                  <FloatingField
                    label="Event Title"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    required
                    characterLimit={70}
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
                  <div
                    className="flex-1"
                    ref={setFieldRef('capacity')}
                  >
                    <FloatingField
                      label="Max Participants"
                      name="capacity"
                      type="number"
                      min={1}
                      max={30}
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
                  <div
                    className="flex-1"
                    ref={setFieldRef('minPeople')}
                  >
                    <FloatingField
                      label="Min Participants"
                      name="minPeople"
                      type="number"
                      min={1}
                      max={Number(form.capacity) || 30}
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
                <SkillSelector
                  selected={form.skillLevel}
                  onSelect={handleSkillSelect}
                />
                <GenderSelector
                  selected={form.gender}
                  onSelect={handleGenderSelect}
                  hostGender={hostGender}
                />
              </FieldSection>
              </div>

              <div className={clsx(hasOtherParticipants && 'pointer-events-none opacity-50')}>
              <FieldSection
                title="Location and Time"
                description=""
              >
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
                    placeholder="Real name unlocks it for our community"
                    value={form.placeName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-4">
                  <div ref={setFieldRef('startTime')}>
                    <DateTimeField
                      label="Start Time"
                      value={form.startTime}
                      onValueChange={(v) => {
                        setForm((prev) => {
                          if (!prev.endTime) {
                            return {
                              ...prev,
                              startTime: v,
                              endTime: format(addHours(new Date(v), 2), "yyyy-MM-dd'T'HH:mm"),
                            }
                          }
                          const newStart = new Date(v)
                          const prevEnd = new Date(prev.endTime)
                          const reanchored = new Date(newStart)
                          reanchored.setHours(prevEnd.getHours(), prevEnd.getMinutes(), 0, 0)
                          return {
                            ...prev,
                            startTime: v,
                            endTime: format(reanchored, "yyyy-MM-dd'T'HH:mm"),
                          }
                        })
                      }}
                      hasError={highlightField === 'startTime'}
                      minValue={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
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
                      value={form.endTime}
                      onValueChange={(v) => setForm((prev) => ({ ...prev, endTime: v }))}
                      hasError={highlightField === 'endTime'}
                      hideDate
                      minValue={form.startTime || format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                      maxDate={(() => {
                        if (!form.startTime) return undefined
                        const start = new Date(form.startTime)
                        const eightHoursLater = addHours(start, 8)
                        const endOfDay = new Date(start)
                        endOfDay.setHours(23, 59, 0, 0)
                        return eightHoursLater < endOfDay ? eightHoursLater : endOfDay
                      })()}
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
              </div>

              <FieldSection
                title="Pricing"
                description="Set event pricing details."
              >
                <div className="flex flex-col gap-4">
                  <div className={clsx(hasOtherParticipants && 'pointer-events-none opacity-50')}>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition">
                      <input
                        id="is-free-checkbox"
                        type="checkbox"
                        checked={form.isFree}
                        onChange={(e) => setForm((prev) => ({ ...prev, isFree: e.target.checked }))}
                        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="is-free-checkbox"
                        className="flex flex-1 flex-col"
                      >
                        <span className="text-sm font-semibold text-slate-800">Free</span>
                      </label>
                    </div>
                  </div>

                  {!form.isFree && (
                    <div className="grid gap-2 duration-300 animate-in fade-in slide-in-from-top-2 sm:grid-cols-2">
                      <div className={clsx('flex items-center gap-2 sm:col-span-2', hasOtherParticipants && 'pointer-events-none opacity-50')}>
                        <div className="flex rounded-lg bg-slate-100 p-1">
                          {[
                            { key: 'total', label: 'Split Total' },
                            { key: 'person', label: 'Fixed Fee' },
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
                      </div>

                      <div className={clsx(hasOtherParticipants && 'opacity-50')}>
                        <span className="line-clamp-none px-2 text-xs text-slate-400">
                          {costMode === 'total'
                            ? "We'll automatically calculate the cost per person based on max capacity."
                            : 'Set a flat rate for each player joining this game.'}
                        </span>
                      </div>

                      <div
                        ref={setFieldRef('price')}
                        className={clsx(hasOtherParticipants && 'pointer-events-none opacity-50')}
                      >
                        <FloatingField
                          label={costMode === 'total' ? 'Total Cost (AUD)' : 'Fee Per Person (AUD)'}
                          name="price"
                          type="number"
                          min={0}
                          max={9999.99}
                          step={0.01}
                          value={form.price}
                          onChange={handleInputChange}
                          placeholder=""
                          required={!form.isFree}
                          hasError={highlightField === 'price'}
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
                  <span className="text-xs font-semibold tracking-wide text-slate-400">Optional below</span>
                  <div className="h-px flex-1 border-t border-dashed border-slate-300" />
                </div>
              </div>

              <FieldSection
                title="Event Photos"
                description="Up to 3 photos"
              >
                <CoverUploader
                  previews={heroPreviews}
                  onChange={handleImageChange}
                  onRemove={handleRemoveImage}
                />
                {photoError && (
                  <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {photoError}
                  </p>
                )}
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
        </div>

        <ActionBar
          canSubmit={canSubmit}
          submittingStatus={submittingStatus}
          onDraft={() => handleSubmit(undefined, 'draft')}
          onPublish={() => handleSubmit(undefined, 'published')}
          showDraftButton={!editId || editingEventStatus === 'draft'}
          isPublicPublishedEdit={!!editId && editingEventStatus === 'published' && editingEventVisibility === 'public'}
        />
      </div>
      <AlertDialog
        open={showDeleteConfirm}
        onClose={() => {
          if (!isDeletingEvent) setShowDeleteConfirm(false)
        }}
        title="Delete this event?"
        description="This action is permanent and cannot be undone."
        type="error"
        actionLabel={isDeletingEvent ? 'Deleting...' : 'Delete event'}
        cancelLabel="Cancel"
        actionLeft
        onAction={confirmDeleteEvent}
      />

      <AlertDialog
        open={showCancelConfirm}
        onClose={() => {
          if (!isCancellingEvent) setShowCancelConfirm(false)
        }}
        title="Cancel this event?"
        description="All participants will be notified. The event will remain visible as cancelled."
        type="warning"
        actionLabel={isCancellingEvent ? 'Cancelling...' : 'Cancel event'}
        cancelLabel="Keep event"
        onAction={confirmCancelEvent}
      />

      <LoginPromptSheet
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        returnTo={editId ? `/create-event?id=${editId}` : '/create-event'}
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
                      isActive ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-800'
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
        onClose={() => { setShowLocationSheet(false); setReverseGeoError(null) }}
        disableContainer
        showHandle={false}
      >
        <SheetLayout
          onClose={() => { setShowLocationSheet(false); setReverseGeoError(null) }}
          title="Select Location"
          subtitle="Drop a pin or enter your address"
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
                  setReverseGeoError(null)
                }}
                placeholder="Enter address"
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
              maxBounds={QUEENSLAND_BOUNDS}
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
    <div className="w-full shrink-0 bg-white pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-5 shadow-[0_-20px_50px_rgba(15,41,77,0.1)]">
      <div className={clsx('mx-auto flex w-full max-w-md gap-3 px-4', showDraftButton ? 'grid grid-cols-2' : '')}>
        {showDraftButton && (
          <Button
            variant="secondary"
            type="button"
            onClick={onDraft}
            className="h-12 w-full rounded-full border-slate-200 text-base font-semibold text-slate-600 shadow-lg transition"
            disabled={!canSubmit || isSubmitting}
          >
            {submittingStatus === 'draft' ? 'Saving...' : 'Save Draft'}
          </Button>
        )}
        <Button
          type="button"
          onClick={onPublish}
          disabled={isSubmitting}
          className={clsx(
            'h-12 w-full rounded-full text-base font-semibold shadow-lg transition',
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

function SkillSelector({ selected, onSelect }: { selected: SkillLevelKey; onSelect: (level: SkillLevelKey) => void }) {
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
  hostGender,
}: {
  selected: 'mixed' | 'female' | 'male' | 'lgbtq'
  onSelect: (value: 'mixed' | 'female' | 'male' | 'lgbtq') => void
  hostGender?: string | null
}) {
  const options: { id: 'mixed' | 'female' | 'male' | 'lgbtq'; label: string; disabled: boolean }[] = [
    { id: 'mixed', label: 'All genders', disabled: false },
    { id: 'female', label: 'Women Only', disabled: hostGender === 'male' },
    { id: 'male', label: 'Men Only', disabled: hostGender === 'female' },
    { id: 'lgbtq', label: 'LGBT+', disabled: false },
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
              onClick={() => !opt.disabled && onSelect(opt.id)}
              disabled={opt.disabled}
              className={clsx(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition',
                opt.disabled
                  ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                  : isActive
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
            <img
              src={src}
              alt={`Preview ${idx + 1}`}
              className="h-full w-full object-cover"
            />
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
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onChange}
            />
          </label>
        )}
      </div>
    </div>
  )
}

function DateTimeField({
  label,
  value,
  onValueChange,
  hasError,
  minValue,
  maxDate,
  hideDate,
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  hasError?: boolean
  minValue?: string
  maxDate?: Date
  hideDate?: boolean
}) {
  const [sheetOpen, setSheetOpen] = useState(false)

  const displayValue = useMemo(() => {
    if (!value) return ''
    try {
      return format(new Date(value), hideDate ? 'h:mm a' : 'EEE d MMM, h:mm a', { locale: enUS })
    } catch {
      return ''
    }
  }, [value, hideDate])

  return (
    <>
      <div
        onClick={() => setSheetOpen(true)}
        className={clsx(
          'relative w-full cursor-pointer rounded-[14px] border-2 bg-white px-4 pb-3 pt-7 transition',
          hasError ? 'border-red-500' : 'border-slate-300'
        )}
      >
        <label className="pointer-events-none absolute left-4 top-2 bg-white px-1 text-sm font-semibold text-slate-600">
          {label}
        </label>
        <div className={clsx('min-h-[1.5rem] w-full text-base', !displayValue && 'text-slate-400')}>
          {displayValue || 'Select a time'}
        </div>
      </div>
      <DateTimeWheelSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={label}
        value={value}
        minValue={minValue}
        maxDate={maxDate}
        hideDate={hideDate}
        onChange={onValueChange}
      />
    </>
  )
}

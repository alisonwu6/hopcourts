import React from 'react'
import clsx from 'clsx'
import {
  Calendar,
  CircleDollarSign,
  ExternalLink,
  MapPin,
  MessageCircle,
  PersonStanding,
  LandPlot,
  LockKeyhole,
  LockKeyholeOpen,
  Pencil,
  Share,
  Smile,
  Frown,
  Check,
  DoorOpen,
  DoorClosed,
  CircleAlert,
  Route,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { PlayerEvent } from '@/types'
import type { Sport } from '@/types/dictionary'
import { Button, AlertDialog } from '@/components'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'
import { MapPickerSheet } from '@/components/MapPickerSheet'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { PageLoading } from '@/components/PageLoading'
import { BookmarkButton } from './BookmarkButton'
import { ProfileRequiredSheet } from '@/features/profile/components/ProfileRequiredSheet'

type EventDetailAlertState = {
  open: boolean
  title: string
  description: React.ReactNode
  type: 'success' | 'error' | 'info' | 'warning'
  onAction?: () => void
  actionLabel?: string
  cancelLabel?: string
}

type EventDetailViewProps = {
  id?: string
  event: PlayerEvent | null
  isLoading: boolean
  error: string | null
  sports: Sport[]
  currentUserId?: string
  isFavorite: boolean
  showLoginPrompt: boolean
  isJoinSubmitting: boolean
  isCheckingIn: boolean
  hasSignaledOnTheWay: boolean
  showProfileRequired: boolean
  isJoined: boolean
  spotsRemaining: number
  effectiveCheckedIn: boolean
  alertDialog: EventDetailAlertState
  onBack: () => void
  onShare: () => void
  onToggleFavorite: () => void

  onEdit: (eventId: string) => void
  onJoin: () => void
  onCheckIn: () => void

  onCloseLoginPrompt: () => void
  onCloseAlert: () => void
  onCloseProfileRequired: () => void
  onNavigateEvents: () => void
  onNavigateMate: (username: string) => void
  onNavigateVenue: (venueId: string) => void
}

export function EventDetailView({
  id,
  event,
  isLoading,
  error,
  sports,
  currentUserId,
  isFavorite,
  showLoginPrompt,
  isJoinSubmitting,
  isCheckingIn,
  hasSignaledOnTheWay,
  showProfileRequired,
  isJoined,
  spotsRemaining,
  effectiveCheckedIn,
  alertDialog,
  onBack,
  onShare,
  onToggleFavorite,
  onEdit,
  onJoin,
  onCheckIn,
  onCloseLoginPrompt,
  onCloseAlert,
  onCloseProfileRequired,
  onNavigateEvents,
  onNavigateMate,
  onNavigateVenue,
}: EventDetailViewProps) {
  if (isLoading) {
    return <PageLoading />
  }

  if (!event || (id && event.id !== id)) {
    const detailMessage =
      error === 'Request failed' || error === 'Session not found'
        ? 'This event may have been deleted or unpublished.'
        : (error ?? 'This event may have been deleted or unpublished.')

    return (
      <div className="min-h-[100dvh] bg-white">
        <ActionToolbar
          onBack={onBack}
          title="Event Details"
        />
        <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[420px] flex-col items-center justify-center px-6 pb-16 text-center">
          <div className="mb-5 rounded-full bg-slate-100 p-6">
            <Frown className="h-12 w-12 text-slate-400" />
          </div>
          <h3 className="mb-3 text-2xl font-extrabold tracking-tight text-slate-900">Event Not Found</h3>
          <p className="text-md max-w-sm font-medium leading-relaxed text-slate-500">{detailMessage}</p>
          <button
            type="button"
            onClick={onNavigateEvents}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-7 text-base font-semibold text-white shadow-sm transition hover:bg-blue-500"
          >
            Back to events
          </button>
        </div>
      </div>
    )
  }

  const skillLabel =
    event.skillLevel === 'beginner'
      ? 'Beginner'
      : event.skillLevel === 'intermediate'
        ? 'Intermediate'
        : event.skillLevel === 'advanced'
          ? 'Advanced'
          : 'All levels'

  const genderLabel = event.gender === 'female' ? 'Women only' : event.gender === 'male' ? 'Men only' : 'Mixed gender'

  const sportLabel = sports.find((item) => item.key.toUpperCase() === event.sport.toUpperCase())?.label || event.sport

  const minPeople = Math.max(1, event.minPeople ?? 1)
  const maxPeople = Math.max(minPeople, event.maxAttendees ?? minPeople)

  const formatMoney = (value?: number | null) => {
    if (value == null || Number.isNaN(Number(value))) return ''
    return Number(value).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const feeLine2 = (() => {
    if (event.isFree) return 'Free'
    const total = event.priceTotal
    const perPerson = event.pricePerPerson
    if (event.priceMode === 'person') {
      if (perPerson) return `$${formatMoney(perPerson)} / player`
      return 'Paid event'
    }
    if (total != null) {
      const perFull = Math.ceil((total / maxPeople) * 100) / 100
      const perHigh = Math.ceil((total / minPeople) * 100) / 100
      return perHigh !== perFull
        ? `Est. $${formatMoney(perFull)} – $${formatMoney(perHigh)} / player`
        : `Est. $${formatMoney(perFull)} / player`
    }
    return 'Paid event'
  })()

  const feeNote = event.priceNote?.trim() || 'None'
  const participantRule = `Min. ${minPeople} players`
  const isOfficialVenueHost = Boolean(event.isOfficial && event.venueId)
  const locationLabel =
    event.location.name && event.location.name !== event.location.address
      ? `${event.location.name} (${event.location.address})`
      : event.location.address || event.location.name || 'Location TBD'
  const scheduleLabel = formatEventSchedule(event.startTime, event.endTime)
  const updatedAtLabel = event.updatedAt ? formatDateTimeLabel(event.updatedAt) : null

  const [showMapPicker, setShowMapPicker] = React.useState(false)
  const handleOpenMap = () => setShowMapPicker(true)

  const eventEnd = event.endTime
    ? new Date(event.endTime)
    : new Date(new Date(event.startTime).getTime() + 2 * 60 * 60 * 1000)
  const isHost = event.host.id === currentUserId
  const isPast = new Date() > eventEnd

  return (
    <div className="flex h-[100dvh] flex-col">
      <ActionToolbar
        onBack={onBack}
        onShare={onShare}
        onToggleFavorite={onToggleFavorite}
        isFavorite={isFavorite}
        showShare={false}
        showFavorite={false}
        contentClassName="w-full"
        rightContent={
          <>
            {isHost && !isPast && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(event.id)}
                  className="rounded-full bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                  aria-label="Edit event"
                >
                  <Pencil className="h-5 w-5" />
                </button>
              </>
            )}
            {!isPast && (
              <BookmarkButton
                eventId={event.id}
                className="rounded-full bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
              />
            )}
            <button
              type="button"
              onClick={onShare}
              className="rounded-full bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
              aria-label="Share"
            >
              <Share
                className="h-5 w-5"
                strokeWidth={2}
                aria-hidden="true"
              />
            </button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto">
      <div className="w-full space-y-6">
        <div className="relative mb-0 overflow-hidden shadow-[0_25px_70px_rgba(15,41,77,0.12)]">
          <ImageCarousel
            images={
              event.photos && event.photos.length > 0
                ? event.photos
                : ([event.heroImageUrl || event.detail?.heroImageUrl].filter(Boolean) as string[])
            }
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 -mt-6 rounded-t-[32px] bg-white shadow-[0_25px_70px_rgba(15,41,77,0.12)]">
          <div className="mx-auto max-w-[400px] p-5">
            <div className="flex items-center justify-between">
              <div
                className={clsx(
                  'flex items-center gap-3 transition',
                  isOfficialVenueHost || event.host.username ? 'cursor-pointer' : undefined
                )}
                onClick={() => {
                  if (isOfficialVenueHost && event.venueId) {
                    onNavigateVenue(event.venueId)
                    return
                  }
                  if (event.host.username) {
                    onNavigateMate(event.host.username)
                  }
                }}
              >
                <AvatarCircle
                  name={isOfficialVenueHost ? event.venueNameDisplay || event.host.name : event.host.name}
                  src={isOfficialVenueHost ? event.venueLogoUrl : event.host.avatarUrl}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {isOfficialVenueHost ? event.venueNameDisplay || event.host.name : event.host.name}
                  </p>
                  <p className="text-xs text-slate-500">{isOfficialVenueHost ? 'Venue Host' : 'Event Host'}</p>
                </div>
              </div>
              <EventStatusBadge
                status={event.status}
                attendeeCount={event.attendeeCount}
                minPeople={event.minPeople ?? 1}
                startTime={event.startTime}
                endTime={event.endTime}
                isFree={event.isFree}
                isOfficial={event.isOfficial}
              />
            </div>

            <hr className="my-3 border-slate-200" />

            {updatedAtLabel && <p className="mb-6 text-xs text-slate-400">Last updated {updatedAtLabel}</p>}

            <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                {sportLabel}
              </span>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
                {skillLabel}
              </span>
              <span className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-pink-700">
                {genderLabel}
              </span>
            </div>

            <div className="my-4">
              <h1 className="text-[20px] font-semibold text-slate-900">{event.title}</h1>
            </div>

            <div className="space-y-3">
              <InfoRow
                icon={Calendar}
                label={scheduleLabel}
              />
              <div
                className={clsx(
                  'group flex items-start justify-between gap-2 transition',
                  event.venueId ? 'hover:text-blue-600' : 'hover:text-slate-900'
                )}
              >
                <InfoRow
                  icon={MapPin}
                  label={locationLabel}
                />
                <button
                  type="button"
                  aria-label="Open in map"
                  onClick={handleOpenMap}
                  className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <ExternalLink
                    size={14}
                    className="mt-[3px] shrink-0"
                  />
                </button>
              </div>
              {event.courtName && (
                <InfoRow
                  icon={LandPlot}
                  label={`Court: ${event.courtName}`}
                />
              )}
              <InfoRow
                icon={CircleDollarSign}
                label={feeLine2}
              />
              <div className="ml-[52px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs font-semibold tracking-wide text-slate-500">Fee Notes</p>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{feeNote}</p>
              </div>
            </div>

            <hr className="my-6 border-slate-200" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#C8DBFF] bg-[#EEF3FF] text-[#1E6DEB] shadow-[0_4px_10px_rgba(30,109,235,0.12)]">
                    <MessageCircle
                      className="h-4 w-4"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </span>
                  <span>About this event</span>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {event.detail?.description || event.description || 'No description'}
              </p>
            </div>

            <hr className="my-6 border-slate-200" />

            <div className="space-y-3">
              <div className="flex justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <div className="flex items-start gap-2">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#C8DBFF] bg-[#EEF3FF] text-[#1E6DEB] shadow-[0_4px_10px_rgba(30,109,235,0.12)]">
                    <PersonStanding
                      className="h-4 w-4"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="flex flex-1 flex-col gap-1">
                    <span className="flex items-center justify-between">
                      <span>
                        {event.attendeeCount} joined · {spotsRemaining} spots left
                      </span>
                    </span>
                    <span className="flex items-center justify-between">
                      <span className="text-[11px] font-medium normal-case tracking-normal text-slate-400">
                        {participantRule}
                      </span>
                      {spotsRemaining === 0 && event.status !== 'cancelled' && (
                        <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-red-500">
                          Full
                        </span>
                      )}
                    </span>
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-[8px] font-bold text-slate-500">
                  <div className="flex items-center gap-1">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500">
                      <Check
                        className="h-3 w-3 text-white"
                        strokeWidth={3}
                      />
                    </span>
                    <span className="">Checked in</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-400">
                      <Route
                        className="h-3 w-3 text-white"
                        strokeWidth={2.5}
                      />
                    </span>
                    <span className="">On the way</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-400">
                      <CircleAlert
                        className="h-3 w-3 text-white"
                        strokeWidth={2.5}
                      />
                    </span>
                    <span className="">Missed</span>
                  </div>
                </div>
              </div>
              {event.participants.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-3 pt-1">
                    {event.participants.map((participant) => {
                      const isCheckedIn = !!participant.checkedInAt
                      const endTime = event.endTime ? new Date(event.endTime) : new Date(event.startTime)
                      const closeMins = event.checkinCloseMinsAfter ?? 60
                      const closeTime = new Date(endTime.getTime() + closeMins * 60 * 1000)
                      const now = new Date()
                      const isAbsent = !isCheckedIn && now > closeTime
                      const isOnTheWay =
                        !isAbsent &&
                        (!!participant.onTheWayAt || (participant.id === currentUserId && hasSignaledOnTheWay))
                      const displayName = participant.isAnonymous ? 'Guest' : participant.name.split(' ')[0]

                      return (
                        <div
                          key={participant.id}
                          className="flex w-14 cursor-pointer flex-col items-center gap-1.5"
                          onClick={() => {
                            if (participant.username && !participant.isAnonymous) {
                              onNavigateMate(participant.username)
                            }
                          }}
                        >
                          <div className="relative">
                            <AvatarCircle
                              name={participant.name}
                              src={participant.avatarUrl}
                              ringClassName={
                                isCheckedIn
                                  ? 'ring-2 ring-emerald-500'
                                  : isAbsent
                                    ? 'ring-2 ring-slate-400'
                                    : isOnTheWay
                                      ? 'ring-2 ring-amber-400'
                                      : undefined
                              }
                            />
                            <ParticipantStatusBadge
                              isCheckedIn={isCheckedIn}
                              isAbsent={isAbsent}
                              isOnTheWay={isOnTheWay}
                            />
                          </div>
                          <p className="w-full truncate text-center text-[11px] font-medium text-slate-700">
                            {displayName}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <p className="pl-14 text-xs text-slate-300">Be the first to join and kick off the game!</p>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {event.status !== 'cancelled' &&
        event.status !== 'completed' &&
        event.status !== 'draft' &&
        new Date() <= new Date(eventEnd.getTime() + (event.checkinCloseMinsAfter ?? 60) * 60 * 1000) && (
          <JoinBar
            isJoined={isJoined}
            event={event}
            onJoin={onJoin}
            onCheckIn={onCheckIn}
            isCheckingIn={isCheckingIn}
            isJoinSubmitting={isJoinSubmitting}
            hasCheckedIn={effectiveCheckedIn}
            hasSignaledOnTheWay={hasSignaledOnTheWay}
          />
        )}

      <LoginPromptSheet
        open={showLoginPrompt}
        onClose={onCloseLoginPrompt}
        returnTo={id ? `/event/${id}` : undefined}
      />

      <AlertDialog
        open={alertDialog.open}
        onClose={onCloseAlert}
        title={alertDialog.title}
        description={alertDialog.description}
        type={alertDialog.type}
        onAction={alertDialog.onAction}
        actionLabel={alertDialog.actionLabel}
        cancelLabel={alertDialog.cancelLabel}
      />

      <ProfileRequiredSheet
        open={showProfileRequired}
        onClose={onCloseProfileRequired}
      />

      <MapPickerSheet
        open={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        location={event.location}
      />
    </div>
  )
}

function ParticipantStatusBadge({
  isCheckedIn,
  isAbsent,
  isOnTheWay,
}: {
  isCheckedIn: boolean
  isAbsent: boolean
  isOnTheWay: boolean
}) {
  if (isCheckedIn) {
    return (
      <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
        <Check
          className="h-3 w-3 text-white"
          strokeWidth={3}
        />
      </span>
    )
  }
  if (isAbsent) {
    return (
      <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-400 ring-2 ring-white">
        <CircleAlert
          className="h-3 w-3 text-white"
          strokeWidth={2.5}
        />
      </span>
    )
  }
  if (isOnTheWay) {
    return (
      <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 ring-2 ring-white">
        <Route
          className="h-3 w-3 text-white"
          strokeWidth={2.5}
        />
      </span>
    )
  }
  return null
}

function AvatarCircle({ name, src, ringClassName }: { name: string; src?: string; ringClassName?: string }) {
  return (
    <div
      aria-label={name}
      className={clsx(
        'flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100',
        ringClassName
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover object-center"
        />
      ) : (
        <Smile
          className="h-6 w-6 text-slate-300"
          aria-hidden="true"
        />
      )}
    </div>
  )
}

function InfoRow({ icon: Icon, label }: { icon: LucideIcon; label: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#C8DBFF] bg-[#EEF3FF] text-[#1E6DEB] shadow-[0_4px_10px_rgba(30,109,235,0.12)]">
        <Icon
          className="h-4 w-4"
          strokeWidth={2}
          aria-hidden="true"
        />
      </span>
      <span>{label}</span>
    </div>
  )
}

function formatEventSchedule(start: Date | string, end: Date | string) {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const dateLabel = startDate.toLocaleDateString('en-AU', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const startWithSuffix = startDate.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  const endWithSuffix = endDate.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const startSuffix = startWithSuffix.match(/\s(AM|PM)$/)?.[1] ?? ''
  const endSuffix = endWithSuffix.match(/\s(AM|PM)$/)?.[1] ?? ''
  const startCore = startWithSuffix.replace(/\s(AM|PM)$/, '')
  const endCore = endWithSuffix.replace(/\s(AM|PM)$/, '')

  const timeLabel =
    startSuffix && startSuffix === endSuffix
      ? `${startCore}–${endCore} ${endSuffix}`
      : `${startWithSuffix}–${endWithSuffix}`

  return `${dateLabel} · ${timeLabel}`
}

function formatDateTimeLabel(value: Date | string) {
  return new Date(value).toLocaleString('en-AU', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

type JoinBarProps = {
  isJoined: boolean
  event: PlayerEvent
  onJoin: () => void
  onCheckIn: () => void
  isCheckingIn: boolean
  isJoinSubmitting: boolean
  hasCheckedIn: boolean
  hasSignaledOnTheWay: boolean
}

function JoinBar({
  isJoined,
  event,
  onJoin,
  onCheckIn,
  isCheckingIn,
  isJoinSubmitting,
  hasCheckedIn,
  hasSignaledOnTheWay,
}: JoinBarProps) {
  const isFull = event.maxAttendees > 0 && event.attendeeCount >= event.maxAttendees
  const now = new Date()
  const startTime = new Date(event.startTime)
  const endTime = event.endTime ? new Date(event.endTime) : new Date(event.startTime)

  const openMins = event.checkinOpenMinsBefore ?? 10
  const closeMins = event.checkinCloseMinsAfter ?? 60

  const openTime = new Date(startTime.getTime() - openMins * 60 * 1000)
  const effectiveCloseTime = new Date(endTime.getTime() + closeMins * 60 * 1000)
  const isCheckInOpen = now >= openTime && now <= effectiveCloseTime

  // Free + non-official events (open courts, parks) stay open for walk-up joiners even mid-game.
  // Paid or official events: 2h before start, leave is disabled (locked in). New joiners can still hop in but also can't leave.
  const isPublicFree = event.isFree && !event.isOfficial
  const lockTime = new Date(startTime.getTime() - 2 * 60 * 60 * 1000)
  const isBookingsClosed = !isPublicFree && now >= lockTime

  const formatTime = (value: Date) => {
    const dateLabel = value.toLocaleDateString('en-AU', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    const timeLabel = value.toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    return `${dateLabel} · ${timeLabel}`
  }

  let mainButton = (
    <Button
      onClick={onJoin}
      disabled={isJoinSubmitting}
      className="bg-blue-600 text-white"
    >
      {isJoinSubmitting ? (
        <span className="flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
          Processing...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <LockKeyholeOpen className="h-4 w-4" />
          Hop in
        </span>
      )}
    </Button>
  )
  let secondaryButton: React.ReactElement | null = null

  let statusText: React.ReactNode = null

  if (hasCheckedIn) {
    mainButton = (
      <Button
        disabled
        className="cursor-not-allowed !bg-slate-200 !text-slate-400 disabled:opacity-100"
      >
        <span className="flex items-center justify-center gap-2">
          <DoorClosed className="h-4 w-4" />
          Leave
        </span>
      </Button>
    )
    secondaryButton = (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500 bg-transparent text-emerald-600 shadow-none">
        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500">
          <Check
            className="h-3 w-3 text-white"
            strokeWidth={3}
          />
        </span>
        <span className="text-base font-semibold">Checked in</span>
      </div>
    )
  } else if (isJoined) {
    if (isCheckInOpen) {
      mainButton = isBookingsClosed ? (
        <Button
          disabled
          className="cursor-not-allowed !bg-slate-200 !text-slate-400 disabled:opacity-100"
        >
          <span className="flex items-center justify-center gap-2">
            <DoorClosed className="h-4 w-4" />
            Leave
          </span>
        </Button>
      ) : (
        <Button
          onClick={onJoin}
          disabled={isJoinSubmitting}
          className="bg-blue-600 text-white opacity-100"
        >
          {isJoinSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <DoorOpen className="h-4 w-4" />
              Leave
            </span>
          )}
        </Button>
      )
      secondaryButton = (
        <Button
          onClick={onCheckIn}
          disabled={isCheckingIn || isJoinSubmitting}
          className="!hover:bg-emerald-600 !active:bg-emerald-600 !focus:bg-emerald-600 !bg-emerald-600 !text-white"
        >
          {isCheckingIn ? (
            'Locating...'
          ) : (
            <span className="flex items-center justify-center gap-2">
              <LandPlot
                className="h-5 w-5"
                strokeWidth={2}
              />
              Check in
            </span>
          )}
        </Button>
      )
      statusText = (
        <p className="px-4 text-center text-xs font-medium leading-relaxed text-slate-500">
          {hasSignaledOnTheWay
            ? `Your mates know you're OTW. Remember to check in by ${formatTime(effectiveCloseTime)}.`
            : `Check in before ${formatTime(effectiveCloseTime)} so everyone knows you've made it.`}
        </p>
      )
    } else if (now > effectiveCloseTime) {
      mainButton = (
        <Button
          disabled
          className="cursor-not-allowed !bg-slate-200 !text-slate-400 disabled:opacity-100"
        >
          <span className="flex items-center justify-center gap-2">
            <DoorClosed className="h-4 w-4" />
            Leave
          </span>
        </Button>
      )
      secondaryButton = (
        <Button
          disabled
          className="cursor-not-allowed !bg-slate-200 !text-slate-400 disabled:opacity-100"
        >
          <span className="flex items-center justify-center gap-2">
            <LockKeyhole className="h-4 w-4" />
            <span className="text-sm font-semibold">Check in</span>
          </span>
        </Button>
      )
    } else {
      mainButton = isBookingsClosed ? (
        <Button
          disabled
          className="cursor-not-allowed !bg-slate-200 !text-slate-400 disabled:opacity-100"
        >
          <span className="flex items-center justify-center gap-2">
            <DoorClosed className="h-4 w-4" />
            Leave
          </span>
        </Button>
      ) : (
        <Button
          onClick={onJoin}
          disabled={isJoinSubmitting}
          className="bg-blue-600 text-white opacity-100"
        >
          {isJoinSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <DoorOpen className="h-4 w-4" />
              Leave
            </span>
          )}
        </Button>
      )
      secondaryButton = (
        <Button
          disabled
          className="cursor-not-allowed !bg-slate-200 !text-slate-400 disabled:opacity-100"
        >
          <span className="flex items-center justify-center gap-2">
            <LockKeyhole className="h-4 w-4" />
            <span className="text-sm font-semibold">Check in</span>
          </span>
        </Button>
      )
      statusText = isBookingsClosed ? (
        <p className="text-center text-xs font-medium text-slate-500">
          Withdrawals are closed — you're locked in for this one.
        </p>
      ) : (
        <p className="text-center text-xs font-medium text-slate-500">
          Check-in opens {formatTime(openTime)}.<br />
          Let the host know you're there.
        </p>
      )
    }
  } else if (!isPublicFree && now >= startTime && now <= endTime) {
    mainButton = (
      <Button
        disabled
        className="cursor-not-allowed !bg-slate-200 !text-slate-400 disabled:opacity-100"
      >
        <span className="flex items-center justify-center gap-2">
          <LockKeyhole className="h-4 w-4" />
          Bookings closed
        </span>
      </Button>
    )
  } else if (isFull) {
    mainButton = (
      <Button
        disabled
        className="cursor-not-allowed bg-blue-600 text-white"
      >
        <span className="flex items-center justify-center gap-2">
          <LockKeyhole className="h-4 w-4" />
          Hop in (Full)
        </span>
      </Button>
    )
  }

  return (
    <div className="w-full shrink-0 bg-white pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-5 shadow-[0_-20px_50px_rgba(15,41,77,0.1)]">
      <div className="relative mx-auto flex w-full max-w-md flex-col gap-2 px-4">
        {statusText}
        {secondaryButton ? (
          <div className="grid grid-cols-2 gap-3">
            {React.cloneElement(mainButton as React.ReactElement<{ className?: string }>, {
              className: clsx(
                'h-12 w-full rounded-full text-base font-semibold shadow-lg transition',
                (mainButton as React.ReactElement<{ className?: string }>).props.className
              ),
            })}
            {React.cloneElement(secondaryButton as React.ReactElement<{ className?: string }>, {
              className: clsx(
                'h-12 w-full rounded-full text-base font-semibold shadow-lg transition',
                (secondaryButton as React.ReactElement<{ className?: string }>).props.className
              ),
            })}
          </div>
        ) : (
          React.cloneElement(mainButton as React.ReactElement<{ className?: string }>, {
            className: clsx(
              'h-12 w-full rounded-full text-base font-semibold shadow-lg transition',
              (mainButton as React.ReactElement<{ className?: string }>).props.className
            ),
          })
        )}
      </div>
    </div>
  )
}

function ImageCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = event.currentTarget.scrollLeft
    const width = event.currentTarget.clientWidth
    if (width > 0) {
      const newIndex = Math.round(scrollLeft / width)
      setCurrentIndex(newIndex)
    }
  }

  React.useEffect(() => {
    if (images.length <= 1) return

    const timer = setInterval(() => {
      if (containerRef.current) {
        const nextIndex = (currentIndex + 1) % images.length
        const width = containerRef.current.clientWidth
        containerRef.current.scrollTo({
          left: nextIndex * width,
          behavior: 'smooth',
        })
      }
    }, 5000)

    return () => clearInterval(timer)
  }, [currentIndex, images.length])

  if (images.length === 0) {
    return (
      <div
        className="h-[230px] w-full bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(135deg, #DBEAFE, #2563EB)',
        }}
      />
    )
  }

  return (
    <div className="relative h-[320px] w-full">
      <div
        ref={containerRef}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
      >
        {images.map((source, index) => (
          <div
            key={index}
            className="relative h-full min-w-full snap-center overflow-hidden bg-slate-100"
          >
            <img
              src={source}
              alt={`Event photo ${index + 1}`}
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-10 right-4 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}

function EventStatusBadge({
  status,
  startTime,
  endTime,
}: {
  status?: string
  attendeeCount: number
  minPeople: number
  startTime: Date | string
  endTime: Date | string
  isFree?: boolean
  isOfficial?: boolean
}) {
  const now = new Date()
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : new Date(startTime)
  const isPast = now > end
  const isInProgress = now >= start && now <= end

  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-red-600">
        Cancelled
      </span>
    )
  }
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-500">
        Completed
      </span>
    )
  }
  if (status === 'draft') {
    return (
      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-blue-500">
        Draft
      </span>
    )
  }
  if (isPast) {
    return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-500">
        Past
      </span>
    )
  }
  if (isInProgress) {
    return (
      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-green-600">
        In Progress
      </span>
    )
  }
  if (status === 'published') {
    return (
      <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-sky-600">
        Open
      </span>
    )
  }
  return null
}

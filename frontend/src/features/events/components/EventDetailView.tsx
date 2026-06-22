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
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { PlayerEvent } from '@/types'
import type { Sport } from '@/types/dictionary'
import { Button, AlertDialog } from '@/components'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'
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
  hasOtherParticipants: boolean
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
  onSignup: () => void
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
  hasOtherParticipants,
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
  onSignup,
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
    return Math.round(Number(value)).toLocaleString('en-AU')
  }

  const feeLine2 = (() => {
    if (event.isFree) return 'Free'
    const total = event.priceTotal
    const perPerson = event.pricePerPerson
    if (event.priceMode === 'person') {
      if (perPerson) return `Per person $${formatMoney(perPerson)}`
      return 'Paid event (per person)'
    }
    if (total != null) return `Total cost $${formatMoney(total)}`
    if (perPerson) return `Total cost not provided (about $${formatMoney(perPerson)} per person)`
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

  const handleOpenMap = () => {
    if (event.location.lat && event.location.lng) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${event.location.lat},${event.location.lng}`,
        '_blank',
        'noopener,noreferrer'
      )
      return
    }
    const query = event.location.address || event.location.name
    if (query) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
        '_blank',
        'noopener,noreferrer'
      )
    }
  }

  const isHost = event.host.id === currentUserId

  return (
    <div className="min-h-[100dvh] pb-40">
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
            {isHost && (
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
            <BookmarkButton
              eventId={event.id}
              className="rounded-full bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
            />
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
          <div className="mx-auto max-w-[400px] px-5 pb-6 pt-6">
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
              {event.status === 'cancelled' ? (
                <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-red-600">
                  Cancelled
                </span>
              ) : event.maxAttendees > 0 && spotsRemaining === 0 ? (
                <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-orange-600">
                  Full
                </span>
              ) : null}
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
                    className="h-3.5 w-3.5"
                    strokeWidth={2.25}
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
              <div className="flex items-start gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#C8DBFF] bg-[#EEF3FF] text-[#1E6DEB] shadow-[0_4px_10px_rgba(30,109,235,0.12)]">
                  <PersonStanding
                    className="h-4 w-4"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </span>
                <span className="flex flex-col gap-1">
                  <span>
                    {event.attendeeCount} joined · {spotsRemaining} spots left
                  </span>
                  <span className="text-[11px] font-medium normal-case tracking-normal text-slate-400">
                    {participantRule}
                  </span>
                </span>
              </div>

              {event.participants.length > 0 ? (
                event.participants.map((participant) => {
                  const isCheckedIn = !!participant.checkedInAt
                  const isOnTheWay =
                    !!participant.onTheWayAt || (participant.id === currentUserId && hasSignaledOnTheWay)
                  const endTime = new Date(event.endTime)
                  const closeMins = event.checkinCloseMinsAfter ?? 60
                  const closeTime = new Date(endTime.getTime() + closeMins * 60 * 1000)
                  const now = new Date()
                  const isAbsent = !isCheckedIn && now > closeTime

                  return (
                    <div
                      key={participant.id}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 transition"
                      onClick={() => {
                        if (participant.username && !participant.isAnonymous) {
                          onNavigateMate(participant.username)
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <AvatarCircle
                          name={participant.name}
                          src={participant.avatarUrl}
                        />
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{participant.name}</p>
                          {participant.isAnonymous && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                              Guest
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="pr-1">
                        {isCheckedIn ? (
                          <span className="text-xs font-bold text-emerald-600">Checked in</span>
                        ) : isAbsent ? (
                          <span className="text-xs font-bold text-gray-400">Missed it</span>
                        ) : isOnTheWay ? (
                          <span className="text-xs font-bold text-amber-500">On the way</span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">Not checked in</span>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="pl-14 text-xs text-slate-300">Be the first to join and kick off the game!</p>
              )}
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
          </div>
        </div>
      </div>

      {event.status !== 'cancelled' && (
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
        onSignup={onSignup}
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
    </div>
  )
}

function AvatarCircle({ name, src }: { name: string; src?: string }) {
  return (
    <div
      className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100"
      style={
        src
          ? {
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {!src && <Smile className="h-6 w-6 text-slate-300" />}
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

function JoinBar({ isJoined, event, onJoin, onCheckIn, isCheckingIn, isJoinSubmitting, hasCheckedIn, hasSignaledOnTheWay }: JoinBarProps) {
  const isFull = event.maxAttendees > 0 && event.attendeeCount >= event.maxAttendees
  const now = new Date()
  const startTime = new Date(event.startTime)
  const endTime = new Date(event.endTime)

  const openMins = event.checkinOpenMinsBefore ?? 10
  const closeMins = event.checkinCloseMinsAfter ?? 5

  const openTime = new Date(startTime.getTime() - openMins * 60 * 1000)
  const closeTime = new Date(startTime.getTime() + closeMins * 60 * 1000)
  const effectiveCloseTime = endTime
  const isCheckInOpen = now >= openTime && now <= endTime

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
      <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500 bg-transparent shadow-none text-emerald-600">
        <Check className="h-5 w-5" strokeWidth={2.5} />
        <span className="text-base font-semibold">Checked in</span>
      </div>
    )
  } else if (isJoined) {
    if (isCheckInOpen) {
      mainButton = (
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
              <LandPlot className="h-5 w-5" strokeWidth={2} />
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
      mainButton = (
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
      statusText = (
        <p className="text-center text-xs font-medium text-slate-500">
          Check-in opens {formatTime(openTime)}.<br />
          Let the host know you're there.
        </p>
      )
    }
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
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 overflow-hidden bg-white pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-5 shadow-[0_-20px_50px_rgba(15,41,77,0.1)]">
      <div className="relative flex w-full flex-col gap-2 px-4">
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

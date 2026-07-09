import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '@/hooks'
import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { eventsService } from '@/features/events/services/eventsService'
import { useSports } from '@/features/dictionaries/hooks'

const POST_LOGIN_REDIRECT_KEY = 'post_login_redirect'

export function useEventDetailLogic() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const [isFavorite, setIsFavorite] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showGuestJoinModal, setShowGuestJoinModal] = useState(false)
  const [isJoinSubmitting, setIsJoinSubmitting] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [hasSignaledOnTheWay, setHasSignaledOnTheWay] = useState(false)
  const [showProfileRequired, setShowProfileRequired] = useState(false)

  const { isAuthenticated, currentUserId, user } = useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      currentUserId: state.user?.id,
      user: state.user,
    }))
  )

  const {
    selectedEvent: event,
    fetchEventById,
    isLoading,
    error,
    joinEvent,
    leaveEvent,
    checkInToEvent,
  } = useEventsStore(
    useShallow((state) => ({
      selectedEvent: state.selectedEvent,
      fetchEventById: state.fetchEventById,
      isLoading: state.isLoading,
      error: state.error,
      joinEvent: state.joinEvent,
      leaveEvent: state.leaveEvent,
      checkInToEvent: state.checkInToEvent,
    }))
  )
  const { items: sports } = useSports('en')

  const [alertDialog, setAlertDialog] = useState<{
    open: boolean
    title: string
    description?: ReactNode
    type: 'success' | 'error' | 'info' | 'warning'
    onAction?: () => void
    actionLabel?: string
    cancelLabel?: string
    onCancel?: () => void
    isLoading?: boolean
  }>({ open: false, title: '', description: '', type: 'info' })

  useEffect(() => {
    if (id) {
      fetchEventById(id)
    }
  }, [id, fetchEventById])

  const showAlert = (title: string, description: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setAlertDialog({ open: true, title, description, type })
  }

  const handleBack = () => {
    const historyIdx = typeof window !== 'undefined' ? Number(window.history.state?.idx ?? 0) : 0

    if (location.state?.from === 'create-event') {
      if (!Number.isFinite(historyIdx) || historyIdx <= 0) {
        navigate(location.state.backTo ?? '/events', { replace: true })
        return
      }
      navigate(-1)
      return
    }

    if (location.state?.from === 'venue') {
      if (!Number.isFinite(historyIdx) || historyIdx <= 0) {
        navigate(location.state.venueId ? `/venues/${location.state.venueId}` : '/venues', { replace: true })
        return
      }
      navigate(-1)
      return
    }

    if (!Number.isFinite(historyIdx) || historyIdx <= 0) {
      navigate('/events', { replace: true })
      return
    }

    navigate(-1)
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/event/${id}`
    const title = event?.title || 'this event'
    const text = `Check out ${title} on HopCourts`
    const message = `${text}\n${url}`
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch (err: any) {
        if (err?.name !== 'AbortError') console.error(err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(message)
        showAlert('Link copied', 'Share it with your mates!', 'success')
      } catch {
        showAlert('Copy failed', message, 'info')
      }
    }
  }

  const isHost = event?.host?.id === currentUserId
  const isParticipant = event?.participants.some((p) => p.id === currentUserId)
  const nonHostParticipantsCount = event?.participants?.filter((p) => p.id !== event?.host?.id).length ?? 0
  const hasOtherParticipants = nonHostParticipantsCount > 0

  const isJoined = isAuthenticated ? ((event?.joined || isParticipant) ?? false) : false
  const spotsRemaining = event ? Math.max(0, event.maxAttendees - event.attendeeCount) : 0

  const isCheckedInFromServer = useMemo(() => {
    if (!event || !currentUserId) return false
    const me = event.participants.find((p) => p.id === currentUserId)
    return !!me?.checkedInAt
  }, [event, currentUserId])

  const isOnTheWayFromServer = useMemo(() => {
    if (!event || !currentUserId) return false
    const me = event.participants.find((p) => p.id === currentUserId)
    return !!me?.onTheWayAt
  }, [event, currentUserId])

  const effectiveCheckedIn = isAuthenticated ? hasCheckedIn || isCheckedInFromServer : false
  const effectiveOnTheWay = isAuthenticated ? hasSignaledOnTheWay || isOnTheWayFromServer : false

  const submitJoin = async () => {
    if (!id) return
    setIsJoinSubmitting(true)
    try {
      await joinEvent(id)
    } finally {
      setIsJoinSubmitting(false)
    }
  }

  const handleJoinClick = async () => {
    if (isJoinSubmitting) return
    if (!isAuthenticated) {
      try {
        const path = `${location.pathname}${location.search}${location.hash}`
        sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, path)
      } catch (error) {
        console.warn('Failed to persist post-login redirect path:', error)
      }
      setShowLoginPrompt(true)
      return
    }
    if (!event || !id) return
    if (isHost && isJoined) {
      showAlert('Host Required', 'As the organizer, you must be a participant of this event.', 'warning')
      return
    }
    // Guest (anonymous) users skip onboarding + gender gates -- they have no profile
    // data yet, and the intent is a one-tap join.
    const isGuest = !!user?.is_anonymous
    if (!isJoined && !isGuest && !user?.onboarding_completed_at) {
      setShowProfileRequired(true)
      return
    }

    if (!isJoined && !isGuest && event.gender && event.gender !== 'mixed' && event.gender !== 'lgbtq') {
      const currentUser = useAuthStore.getState().user
      const userGender = currentUser?.gender

      if (event.gender === 'male' && userGender !== 'male') {
        showAlert("Men's Session", 'This event is reserved for male players.', 'info')
        return
      }

      if (event.gender === 'female' && userGender !== 'female') {
        showAlert("Women's Session", 'This event is reserved for female players.', 'info')
        return
      }
    }

    if (isJoined) {
      setIsJoinSubmitting(true)
      try {
        await leaveEvent(id)
        void queryClient.invalidateQueries({ queryKey: ['events', 'my', 'joined'] })
      } finally {
        setIsJoinSubmitting(false)
      }
    } else {
      await submitJoin()
    }
  }

  // Fired by GuestJoinModal once the anonymous Supabase session is live.
  const handleGuestReady = async () => {
    await submitJoin()
  }

  const handleOpenCheckInSheet = () => {
    setAlertDialog({
      open: true,
      title: 'Where are you?',
      type: 'info',
      actionLabel: "I'm here",
      onAction: () => { void handleCheckIn() },
      cancelLabel: 'On the way',
      onCancel: () => { void handleOnTheWay() },
    })
  }

  const handleCheckIn = async () => {
    if (!id || isCheckingIn) return
    setIsCheckingIn(true)
    try {
      await checkInToEvent(id)
      setHasCheckedIn(true)
      void fetchEventById(id, { force: true })
      showAlert("You're checked in!", 'Have a great game with your mates!', 'success')
    } catch (err: any) {
      const backendError = err.response?.data?.error || err.response?.data || err
      const code = backendError.code
      const details = backendError.details

      if (code === 'CHECKIN_OUTSIDE_TIME_WINDOW') {
        const isLate =
          details?.ends_at && details?.now && new Date(details.now) > new Date(details.ends_at)
        showAlert(
          isLate ? 'Check-in Closed' : 'Too Early to Check In',
          isLate
            ? 'The game has ended. Check-in is no longer available.'
            : 'Check-in opens 15 minutes before kick-off. Please check back closer to game time.',
          'warning'
        )
      } else {
        showAlert(
          'Check-in failed',
          backendError.message || err.message || 'Something went wrong. Please try again.',
          'error'
        )
      }
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleOnTheWay = async () => {
    if (!id || hasSignaledOnTheWay) return
    const res = await eventsService.signalOnTheWay(id)
    if (res.success) {
      setHasSignaledOnTheWay(true)
      showAlert('On the way!', "We've let the host know you're heading over.", 'success')
    } else {
      showAlert('Update Failed', res.error?.message ?? 'Something went wrong. Please try again.', 'warning')
    }
  }

  const clearPostLoginRedirect = () => {
    try {
      sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY)
    } catch (error) {
      console.warn('Failed to clear post-login redirect path:', error)
    }
  }

  return {
    id,
    navigate,
    event,
    isLoading,
    error,
    sports,
    user,
    currentUserId,
    isAuthenticated,
    isFavorite,
    setIsFavorite,
    showLoginPrompt,
    setShowLoginPrompt,
    showGuestJoinModal,
    setShowGuestJoinModal,
    handleGuestReady,
    isJoinSubmitting,
    isCheckingIn,
    showProfileRequired,
    setShowProfileRequired,
    alertDialog,
    setAlertDialog,
    isHost,
    isJoined,
    spotsRemaining,
    effectiveCheckedIn,
    effectiveOnTheWay,
    handleBack,
    handleShare,
    handleJoinClick,
    handleCheckIn,
    handleOnTheWay,
    handleOpenCheckInSheet,
    clearPostLoginRedirect,
  }
}

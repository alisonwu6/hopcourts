import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
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

  const [isFavorite, setIsFavorite] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
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
    description: ReactNode
    type: 'success' | 'error' | 'info' | 'warning'
    onAction?: () => void
    actionLabel?: string
    cancelLabel?: string
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
    if (location.state?.from === 'create-event') {
      navigate('/events')
      return
    }

    const historyIdx = typeof window !== 'undefined' ? Number(window.history.state?.idx ?? 0) : 0

    if (!Number.isFinite(historyIdx) || historyIdx <= 0) {
      navigate('/events', { replace: true })
      return
    }

    navigate(-1)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: event?.title,
          text: 'Come join this event!',
          url: window.location.href,
        })
        .catch(console.error)
    } else {
      window.alert('Share feature coming soon')
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
    if (isHost && event.joined) {
      showAlert('', 'The host must join the event', 'warning')
      return
    }
    if (!event.joined && !user?.onboarding_completed_at) {
      setShowProfileRequired(true)
      return
    }

    if (!event.joined && event.gender && event.gender !== 'mixed') {
      const currentUser = useAuthStore.getState().user
      const userGender = currentUser?.gender

      if (event.gender === 'male' && userGender !== 'male') {
        showAlert('', 'This event is for men only.', 'warning')
        return
      }

      if (event.gender === 'female' && userGender !== 'female') {
        showAlert('', 'This event is for women only.', 'warning')
        return
      }
    }

    if (event.joined) {
      setIsJoinSubmitting(true)
      try {
        await leaveEvent(id)
      } finally {
        setIsJoinSubmitting(false)
      }
    } else {
      setIsJoinSubmitting(true)
      try {
        await joinEvent(id)
      } finally {
        setIsJoinSubmitting(false)
      }
    }
  }

  const handleCheckIn = async () => {
    if (!id || isCheckingIn) return
    setIsCheckingIn(true)

    if (!navigator.geolocation) {
      showAlert(
        'Location Not Supported',
        'Your device does not support GPS location. Check-in is unavailable.',
        'error'
      )
      setIsCheckingIn(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await checkInToEvent(id, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setHasCheckedIn(true)
          void fetchEventById(id, { force: true })

          showAlert("You're all set!", 'Have a great game with your mates!', 'success')
        } catch (err: any) {
          console.error('Check-in error full object:', err)

          const backendError = err.response?.data?.error || err.response?.data || err
          const code = backendError.code
          const details = backendError.details

          if (code === 'CHECKIN_OUTSIDE_RADIUS') {
            const dist = details?.distance_m
            const radius = details?.radius_m
            const gap = Math.max(0, dist - radius)

            const distStr = dist >= 1000 ? `${(dist / 1000).toFixed(1)}km` : `${dist}m`
            const gapStr = gap >= 1000 ? `${(gap / 1000).toFixed(1)}km` : `${gap}m`

            setAlertDialog({
              open: true,
              title: 'Not at the court yet?',
              description: `You’re still ${distStr}km away. Tap "On the way" to let your mates know you’re coming, then check in once you arrive!`,
              type: 'info',
              cancelLabel: 'OK',
              actionLabel: 'On the Way',
              onAction: handleOnTheWay,
            })
          } else if (code === 'CHECKIN_OUTSIDE_TIME_WINDOW') {
            showAlert('Outside check-in window', 'You are currently outside the check-in time window.', 'warning')
          } else {
            showAlert(
              'Check-in failed',
              backendError.message ||
                err.message ||
                'Please make sure you are at the event location and location services are enabled.',
              'error'
            )
          }
        } finally {
          setIsCheckingIn(false)
        }
      },
      (err) => {
        console.error(err)
        const code = err?.code
        if (code === 1) {
          showAlert(
            'Location permission required',
            'Please allow location access in Safari site settings and try again.',
            'warning'
          )
        } else if (code === 2) {
          showAlert(
            'Unable to get location',
            'Signal is unstable or location source is unavailable. Move to an open area and try again.',
            'warning'
          )
        } else if (code === 3) {
          showAlert(
            'Location timeout',
            'Location took too long. Make sure network and GPS are enabled, then try again.',
            'warning'
          )
        } else {
          showAlert('Location failed', 'Please enable location services and try again later.', 'warning')
        }
        setIsCheckingIn(false)
      },
      { enableHighAccuracy: false, timeout: 25000, maximumAge: 30000 }
    )
  }

  const handleOnTheWay = async () => {
    if (!id || hasSignaledOnTheWay) return
    const res = await eventsService.signalOnTheWay(id)
    if (res.success) {
      setHasSignaledOnTheWay(true)
      showAlert('On the way!', "We've let the host know you're heading over.", 'success')
    } else {
      showAlert('Could not update', res.error?.message ?? 'Please try again.', 'warning')
    }
  }

  const handleDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    try {
      const res = await eventsService.deleteEvent(id)
      if (res.success) {
        navigate(-1)
      }
    } catch (err) {
      console.error('Delete failed', err)
    } finally {
      setIsDeleting(false)
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
    showDeleteConfirm,
    setShowDeleteConfirm,
    isDeleting,
    isJoinSubmitting,
    isCheckingIn,
    showProfileRequired,
    setShowProfileRequired,
    alertDialog,
    setAlertDialog,
    hasOtherParticipants,
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
    handleDelete,
    clearPostLoginRedirect,
  }
}

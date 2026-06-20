import { EventDetailView } from '@/features/events/components/EventDetailView'
import { useEventDetailLogic } from '@/features/events/hooks/useEventDetailLogic'
import { GuestJoinModal } from '@/components/GuestJoinModal'

export function EventDetailPage() {
  const {
    id,
    navigate,
    event,
    isLoading,
    error,
    sports,
    currentUserId,
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
    hasOtherParticipants,
    isJoined,
    spotsRemaining,
    effectiveCheckedIn,
    effectiveOnTheWay,
    handleBack,
    handleShare,
    handleJoinClick,
    handleCheckIn,
    handleOnTheWay,
    clearPostLoginRedirect,
  } = useEventDetailLogic()

  return (
    <>
    <EventDetailView
      id={id}
      event={event}
      isLoading={isLoading}
      error={error}
      sports={sports}
      currentUserId={currentUserId}
      isFavorite={isFavorite}
      showLoginPrompt={showLoginPrompt}
      isJoinSubmitting={isJoinSubmitting}
      isCheckingIn={isCheckingIn}
      hasSignaledOnTheWay={effectiveOnTheWay}
      showProfileRequired={showProfileRequired}
      hasOtherParticipants={hasOtherParticipants}
      isJoined={isJoined}
      spotsRemaining={spotsRemaining}
      effectiveCheckedIn={effectiveCheckedIn}
      alertDialog={alertDialog}
      onBack={handleBack}
      onShare={handleShare}
      onToggleFavorite={() => setIsFavorite((previous) => !previous)}
      onEdit={(eventId) => navigate(`/create-event?id=${eventId}`)}
      onJoin={handleJoinClick}
      onCheckIn={handleCheckIn}
      onCloseLoginPrompt={() => {
        setShowLoginPrompt(false)
        clearPostLoginRedirect()
      }}
      onSignup={() => navigate('/signup')}
      onCloseAlert={() => setAlertDialog((previous) => ({ ...previous, open: false }))}
      onCloseProfileRequired={() => setShowProfileRequired(false)}
      onNavigateEvents={() => navigate('/events')}
      onNavigateMate={(username) => navigate(`/mate/${username}`, { state: { from: 'app' } })}
      onNavigateVenue={(venueId) => navigate(`/venues/${venueId}`)}
    />
    <GuestJoinModal
      open={showGuestJoinModal}
      onClose={() => setShowGuestJoinModal(false)}
      onGuestReady={handleGuestReady}
      onSignInInstead={() => setShowLoginPrompt(true)}
    />
    </>
  )
}

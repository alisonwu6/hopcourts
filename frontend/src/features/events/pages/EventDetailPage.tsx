import { EventDetailView } from '@/features/events/components/EventDetailView'
import { useEventDetailLogic } from '@/features/events/hooks/useEventDetailLogic'

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
    isJoined,
    spotsRemaining,
    effectiveCheckedIn,
    handleBack,
    handleShare,
    handleJoinClick,
    handleCheckIn,
    handleDelete,
    clearPostLoginRedirect,
  } = useEventDetailLogic()

  return (
    <EventDetailView
      id={id}
      event={event}
      isLoading={isLoading}
      error={error}
      sports={sports}
      currentUserId={currentUserId}
      isFavorite={isFavorite}
      showLoginPrompt={showLoginPrompt}
      showDeleteConfirm={showDeleteConfirm}
      isDeleting={isDeleting}
      isJoinSubmitting={isJoinSubmitting}
      isCheckingIn={isCheckingIn}
      showProfileRequired={showProfileRequired}
      hasOtherParticipants={hasOtherParticipants}
      isJoined={isJoined}
      spotsRemaining={spotsRemaining}
      effectiveCheckedIn={effectiveCheckedIn}
      alertDialog={alertDialog}
      onBack={handleBack}
      onShare={handleShare}
      onToggleFavorite={() => setIsFavorite((previous) => !previous)}
      onOpenDeleteConfirm={() => setShowDeleteConfirm(true)}
      onCloseDeleteConfirm={() => setShowDeleteConfirm(false)}
      onEdit={(eventId) => navigate(`/create-event?id=${eventId}`)}
      onJoin={handleJoinClick}
      onCheckIn={handleCheckIn}
      onDelete={handleDelete}
      onCloseLoginPrompt={() => {
        setShowLoginPrompt(false)
        clearPostLoginRedirect()
      }}
      onSignup={() => navigate('/signup')}
      onCloseAlert={() => setAlertDialog((previous) => ({ ...previous, open: false }))}
      onCloseProfileRequired={() => setShowProfileRequired(false)}
      onNavigateEvents={() => navigate('/events')}
      onNavigateMate={(username) => navigate(`/mate/${username}`)}
    />
  )
}

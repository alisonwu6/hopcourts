import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { DiscoverEventsPageView } from '@/features/events/components/DiscoverEventsPageView'
import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { useDiscoverEventsData } from '@/features/events/hooks/useDiscoverEventsData'
import { useSports } from '@/features/dictionaries/hooks'
import { useAuthStore } from '@/hooks'

export function DiscoverEventsPage() {
  const navigate = useNavigate()

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const events = useEventsStore((state) => state.events)
  const eventsHasMore = useEventsStore((state) => state.eventsHasMore)
  const isLoading = useEventsStore((state) => state.isLoading)
  const isLoadingMore = useEventsStore((state) => state.isLoadingMore)
  const error = useEventsStore((state) => state.error)
  const fetchEvents = useEventsStore((state) => state.fetchEvents)
  const fetchMoreEvents = useEventsStore((state) => state.fetchMoreEvents)
  const { items: sportsCatalog } = useSports('en')
  const { isAuthenticated, user } = useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      user: state.user,
    }))
  )
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showProfileRequiredSheet, setShowProfileRequiredSheet] = useState(false)
  const [suggestionType, setSuggestionType] = useState<'interests' | 'hosts'>('interests')

  const {
    showMap,
    selectedEventId,
    selectedSports,
    dateRange,
    sports,
    eventsByDay,
    filteredEvents,
    suggestedEvents,
    dateLabel,
    sportLabel,
    hasFilter,
    activeFilter,
    toggleMap,
    clearFilters,
    selectMapEvent,
    applyFilters,
  } = useDiscoverEventsData({
    events,
    sportsCatalog,
    isAuthenticated,
    user,
    suggestionType,
    searchParams,
    setSearchParams,
  })

  // Re-fetch whenever filter changes (initial mount + every filter update)
  useEffect(() => {
    void fetchEvents(activeFilter, { force: hasFilter })
  }, [activeFilter])

  const handleCreateClick = async () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }

    if (user?.onboarding_completed_at) {
      navigate('/create-event')
    } else {
      setShowProfileRequiredSheet(true)
    }
  }

  return (
    <DiscoverEventsPageView
      showMap={showMap}
      hasFilter={hasFilter}
      dateLabel={dateLabel}
      sportLabel={sportLabel}
      filteredEvents={filteredEvents}
      sportsCatalog={sportsCatalog}
      selectedEventId={selectedEventId}
      isAuthenticated={isAuthenticated}
      suggestionType={suggestionType}
      suggestedEvents={suggestedEvents}
      error={error}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      serverHasMore={eventsHasMore}
      onLoadMoreFromServer={() => void fetchMoreEvents(activeFilter)}
      isSearchOpen={isSearchOpen}
      dateRange={dateRange}
      selectedSports={selectedSports}
      sportsOptions={sports}
      eventsByDay={eventsByDay}
      showProfileRequiredSheet={showProfileRequiredSheet}
      showLoginPrompt={showLoginPrompt}
      onOpenSearch={() => setIsSearchOpen(true)}
      onToggleMap={toggleMap}
      onClearFilters={clearFilters}
      onSelectMapEvent={selectMapEvent}
      onClickEventDetail={(eventId) => navigate(`/event/${eventId}`)}
      onChangeSuggestionType={setSuggestionType}
      onCreateClick={handleCreateClick}
      onCloseSearch={() => setIsSearchOpen(false)}
      onApplyFilters={(range, selected) => {
        applyFilters(range, selected)
        setIsSearchOpen(false)
      }}
      onCloseProfileRequired={() => setShowProfileRequiredSheet(false)}
      onCloseLoginPrompt={() => setShowLoginPrompt(false)}
      onSignup={() => navigate('/signup')}
    />
  )
}

import { EventMap } from '@/features/events/components/EventMap'
import { DiscoverEventsHeader } from '@/features/events/components/DiscoverSearch'
import { DiscoverEventsBody } from '@/features/events/components/DiscoverEventsList'
import { DiscoverEventsSearchSheet } from '@/features/events/components/DiscoverSearchSheet'
import { ProfileRequiredSheet } from '@/features/profile/components/ProfileRequiredSheet'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'
import type { PlayerEvent } from '@/types'
import type { Sport } from '@/types/dictionary'
import type { DiscoverSportFilterOption } from '@/features/events/hooks/useDiscoverEventsData'

type DiscoverEventsPageViewProps = {
  showMap: boolean
  hasFilter: boolean
  dateLabel: string
  sportLabel: string
  filteredEvents: PlayerEvent[]
  sportsCatalog: Sport[]
  selectedEventId: string | null
  isAuthenticated: boolean
  suggestionType: 'interests' | 'hosts'
  suggestedEvents: PlayerEvent[]
  error: string | null
  isLoading: boolean
  isLoadingMore: boolean
  serverHasMore: boolean
  onLoadMoreFromServer: () => void
  isSearchOpen: boolean
  dateRange: { start: Date | null; end: Date | null }
  selectedSports: string[]
  sportsOptions: DiscoverSportFilterOption[]
  eventsByDay: Record<string, number>
  showProfileRequiredSheet: boolean
  showLoginPrompt: boolean
  onOpenSearch: () => void
  onToggleMap: () => void
  onClearFilters: () => void
  onSelectMapEvent: (event: PlayerEvent | null) => void
  onClickEventDetail: (eventId: string) => void
  onChangeSuggestionType: (type: 'interests' | 'hosts') => void
  onCreateClick: () => void
  onCloseSearch: () => void
  onApplyFilters: (range: { start: Date | null; end: Date | null }, selected: string[]) => void
  onCloseProfileRequired: () => void
  onCloseLoginPrompt: () => void
}

export function DiscoverEventsPageView({
  showMap,
  hasFilter,
  dateLabel,
  sportLabel,
  filteredEvents,
  sportsCatalog,
  selectedEventId,
  isAuthenticated,
  suggestionType,
  suggestedEvents,
  error,
  isLoading,
  isLoadingMore,
  serverHasMore,
  onLoadMoreFromServer,
  isSearchOpen,
  dateRange,
  selectedSports,
  sportsOptions,
  eventsByDay,
  showProfileRequiredSheet,
  showLoginPrompt,
  onOpenSearch,
  onToggleMap,
  onClearFilters,
  onSelectMapEvent,
  onClickEventDetail,
  onChangeSuggestionType,
  onCreateClick,
  onCloseSearch,
  onApplyFilters,
  onCloseProfileRequired,
  onCloseLoginPrompt,
}: DiscoverEventsPageViewProps) {
  return (
    <div className="min-h-[100dvh] pb-24">
      <DiscoverEventsHeader
        showMap={showMap}
        hasFilter={hasFilter}
        dateLabel={dateLabel}
        sportLabel={sportLabel}
        filteredCount={filteredEvents.length}
        onOpenSearch={onOpenSearch}
        onToggleMap={onToggleMap}
        onClearFilters={onClearFilters}
      />

      {showMap ? (
        <div className="h-[100dvh] w-full">
          <EventMap
            events={filteredEvents}
            sports={sportsCatalog}
            mode="events"
            selectedEventId={selectedEventId}
            onSelectEvent={onSelectMapEvent}
            onClickDetail={(event) => {
              onClickEventDetail(event.id)
            }}
          />
        </div>
      ) : (
        <DiscoverEventsBody
          isAuthenticated={isAuthenticated}
          suggestionType={suggestionType}
          suggestedEvents={suggestedEvents}
          hasFilter={hasFilter}
          error={error}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          serverHasMore={serverHasMore}
          filteredEvents={filteredEvents}
          onChangeSuggestionType={onChangeSuggestionType}
          onCreateClick={onCreateClick}
          onViewDetails={onClickEventDetail}
          onLoadMoreFromServer={onLoadMoreFromServer}
        />
      )}

      <DiscoverEventsSearchSheet
        open={isSearchOpen}
        onClose={onCloseSearch}
        initialDateRange={dateRange}
        initialSports={selectedSports}
        sportsOptions={sportsOptions}
        eventsByDay={eventsByDay}
        onApply={onApplyFilters}
      />

      <ProfileRequiredSheet
        open={showProfileRequiredSheet}
        onClose={onCloseProfileRequired}
        dismissible
      />

      <LoginPromptSheet
        open={showLoginPrompt}
        onClose={onCloseLoginPrompt}
        returnTo="/events"
      />
    </div>
  )
}

import clsx from 'clsx'
import { useMemo } from 'react'
import { EventCard } from '@/features/events/components/EventCard'
import { PageLoading } from '@/components/PageLoading'
import type { PlayerEvent } from '@/types'
import { useCities, useSports } from '@/features/dictionaries/hooks'

type DiscoverEventsBodyProps = {
  isAuthenticated: boolean
  suggestionType: 'interests' | 'hosts'
  suggestedEvents: PlayerEvent[]
  hasFilter: boolean
  error: string | null
  isLoading: boolean
  filteredEvents: PlayerEvent[]
  onChangeSuggestionType: (type: 'interests' | 'hosts') => void
  onCreateClick: () => void
  onViewDetails: (eventId: string) => void
}

export function DiscoverEventsBody({
  isAuthenticated,
  suggestionType,
  suggestedEvents,
  hasFilter,
  error,
  isLoading,
  filteredEvents,
  onChangeSuggestionType,
  onCreateClick,
  onViewDetails,
}: DiscoverEventsBodyProps) {
  const { items: sports } = useSports('en')
  const { items: cities } = useCities(undefined, 'en')

  const sportLabelByKey = useMemo(() => {
    return new Map(sports.map((item) => [item.key.toUpperCase(), item.label]))
  }, [sports])

  const cityLabelByKey = useMemo(() => {
    return new Map(cities.map((item) => [item.key, item.label]))
  }, [cities])

  const resolveSportLabel = (event: PlayerEvent) => {
    return sportLabelByKey.get(event.sport.toUpperCase()) || event.sport
  }

  const resolveCityLabel = (event: PlayerEvent) => {
    if (event.host.cityKey) {
      const cityLabel = cityLabelByKey.get(event.host.cityKey)
      if (cityLabel) return cityLabel
    }
    return event.host.cityName || event.location?.city || 'City TBD'
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 pt-[100px]">
      {isAuthenticated && (
        <div>
          <div className="flex items-center gap-2 pt-2 text-[13px] font-bold tracking-tight text-slate-900">
            <span>Suggestions based on</span>
            <div className="inline-flex h-7 items-center gap-1 rounded-lg bg-slate-100 p-0.5 text-[13px] font-semibold">
              <button
                onClick={() => onChangeSuggestionType('interests')}
                className={clsx(
                  'rounded-md px-2 py-0.5 transition-all',
                  suggestionType === 'interests'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                interests
              </button>
              <button
                onClick={() => onChangeSuggestionType('hosts')}
                className={clsx(
                  'rounded-md px-2 py-0.5 transition-all',
                  suggestionType === 'hosts'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                hosts
              </button>
            </div>
          </div>
          <p className="mt-1 text-[12px] text-slate-500">
            {suggestionType === 'interests'
              ? 'Based on the sports you play.'
              : "Events from hosts you've joined before."}
          </p>

          <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory overflow-x-auto p-4 scroll-smooth">
            <div className="flex gap-4">
              {suggestedEvents.length > 0 ? (
                suggestedEvents.map((event) => (
                  <EventCard
                    key={`suggested-${event.id}`}
                    event={event}
                    sportLabel={resolveSportLabel(event)}
                    cityLabel={resolveCityLabel(event)}
                    className="w-[300px] flex-shrink-0 snap-start"
                    onViewDetails={() => onViewDetails(event.id)}
                  />
                ))
              ) : (
                <div className="w-full rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                  <p className="text-sm">
                    {suggestionType === 'interests'
                      ? 'Nothing here yet. Add more sports to your profile.'
                      : "No events from hosts you've joined before yet."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="my-5 h-[1px] w-full bg-slate-100" />
        </div>
      )}

      <h2 className="mb-6 text-xl font-bold tracking-tight text-slate-900">
        {hasFilter ? 'Search results' : "What's on"}
      </h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <PageLoading fullScreen={false} className="py-20" />
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 shadow-sm">
            <span className="text-5xl">😮</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">No games yet.</h3>
          <p className="mt-2 text-sm text-slate-500">
            Be the one who starts it.
          </p>
          <button
            type="button"
            onClick={onCreateClick}
            className="mt-8 rounded-full bg-blue-600 px-8 py-3 text-base font-bold text-white shadow-lg shadow-blue-200 transition"
          >
            Create event
          </button>
        </div>
      ) : (
        filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            sportLabel={resolveSportLabel(event)}
            cityLabel={resolveCityLabel(event)}
            onViewDetails={() => onViewDetails(event.id)}
          />
        ))
      )}
    </div>
  )
}

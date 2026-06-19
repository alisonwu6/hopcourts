import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import { useSavedEventsStore } from '@/stores/savedEvents.store'
import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { useSports } from '@/features/dictionaries/hooks'
import { EventsPageShell } from '@/features/profile/components/EventsPageShell'
import { EventTimeline } from '@/features/events/components/EventTimeline'
import { CalendarView } from '@/features/profile/components/ProfileEventsPanel'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

const PAGE_SIZE = 20

export function SavedEventsPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)

  const savedIds = useSavedEventsStore((state) => state.savedIds)
  const fetchBookmarks = useSavedEventsStore((state) => state.fetchBookmarks)
  const events = useEventsStore((state) => state.events)
  const fetchEvents = useEventsStore((state) => state.fetchEvents)
  const { items: sportsCatalog } = useSports('en')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      await Promise.all([fetchBookmarks(), events.length === 0 ? fetchEvents() : Promise.resolve()])
      setIsLoading(false)
    }
    void load()
  }, [])

  const savedEvents = events.filter((event) => savedIds.includes(event.id))
  const visibleEvents = savedEvents.slice(0, displayCount)
  const hasMore = displayCount < savedEvents.length

  const sentinelRef = useInfiniteScroll(
    useCallback(() => setDisplayCount((c) => c + PAGE_SIZE), []),
    hasMore && viewMode === 'list'
  )

  const empty = (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
      <div className="p-2">
        <Bookmark className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">No saved events</h3>
      <p className="mt-1 px-10 text-sm text-slate-500">
        Save events you are interested in to keep track of slots and timing.
      </p>
    </div>
  )

  return (
    <EventsPageShell
      title="Saved Events"
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      onBack={() => navigate('/profile')}
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      ) : viewMode === 'calendar' ? (
        <CalendarView
          events={savedEvents}
          sportsCatalog={sportsCatalog}
          mode="joined"
        />
      ) : (
        <>
          <EventTimeline
            events={visibleEvents}
            sportsCatalog={sportsCatalog}
            mode="saved"
            showBookmark
            emptyState={empty}
          />
          <div ref={sentinelRef} className="h-4" />
        </>
      )}
    </EventsPageShell>
  )
}

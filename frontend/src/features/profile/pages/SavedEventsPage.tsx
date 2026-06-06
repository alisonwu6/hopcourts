import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { EventCard } from '@/features/events/components/EventCard'
import { useSavedEventsStore } from '@/stores/savedEvents.store'
import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { Bookmark } from 'lucide-react'

export function SavedEventsPage() {
  const navigate = useNavigate()
  const savedIds = useSavedEventsStore((state) => state.savedIds)
  const events = useEventsStore((state) => state.events)
  const fetchEvents = useEventsStore((state) => state.fetchEvents)
  const isLoading = useEventsStore((state) => state.isLoading)

  useEffect(() => {
    if (events.length === 0) {
      fetchEvents()
    }
  }, [])

  const savedEvents = events.filter((event) => savedIds.includes(event.id))

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ActionToolbar
        title="Saved Events"
        showBack={true}
      />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-slate-400">Loading...</p>
          </div>
        ) : savedEvents.length === 0 ? (
          // empty status
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bookmark className="h-16 w-16 text-slate-300" />
            <p className="text-lg font-bold text-slate-900">No saved events</p>
            <p className="text-sm text-slate-500">Bookmark events to find them here</p>
          </div>
        ) : (
          // map out lists
          savedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onViewDetails={(id) => navigate(`/event/${id}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { EventCard } from '@/features/events/components/EventCard'
import { useSavedEventsStore } from '@/stores/savedEvents.store'
import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { Bookmark } from 'lucide-react'

export function SavedEventsPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  const savedIds = useSavedEventsStore((state) => state.savedIds)
  const fetchBookmarks = useSavedEventsStore((state) => state.fetchBookmarks)

  const events = useEventsStore((state) => state.events)
  const fetchEvents = useEventsStore((state) => state.fetchEvents)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      await Promise.all([fetchBookmarks(), events.length === 0 ? fetchEvents() : Promise.resolve()])
      setIsLoading(false)
    }
    void load()
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
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
            <div className="p-2">
              <Bookmark className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No saved events</h3>
            <p className="mt-1 px-10 text-sm text-slate-500">
              Save events you're interested in to keep track of slots and timing.
            </p>
          </div>
        ) : (
          savedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onViewDetails={(id) => navigate(`/event/${id}`)}
              showBookmark
            />
          ))
        )}
      </div>
    </div>
  )
}

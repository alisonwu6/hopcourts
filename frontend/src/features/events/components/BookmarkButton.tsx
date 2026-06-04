import { Bookmark } from 'lucide-react'
import { useSavedEventsStore } from '@/stores/savedEvents.store'

type BookmarkButtonProps = {
  eventId: string
}

export function BookmarkButton({ eventId }: BookmarkButtonProps) {
  const isSaved = useSavedEventsStore((state) => state.isSaved(eventId))
  const toggleSave = useSavedEventsStore((state) => state.toggleSave)

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        toggleSave(eventId)
      }}
      className="p-2"
    >
      <Bookmark
        className="h-5 w-5"
        fill={isSaved ? 'currentColor' : 'none'}
        strokeWidth={2}
      />
    </button>
  )
}

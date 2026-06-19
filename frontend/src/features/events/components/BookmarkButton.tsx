import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useSavedEventsStore } from '@/stores/savedEvents.store'
import { useAuthStore } from '@/hooks'

type BookmarkButtonProps = {
  eventId: string
  className?: string
}

export function BookmarkButton({ eventId, className }: BookmarkButtonProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isSaved = useSavedEventsStore((state) => state.savedIds.includes(eventId))
  const isSaving = useSavedEventsStore((state) => Boolean(state.isSaving[eventId]))
  const toggleSave = useSavedEventsStore((state) => state.toggleSave)

  if (!isAuthenticated) return null

  return (
    <button
      type="button"
      disabled={isSaving}
      onClick={(e) => {
        e.stopPropagation()
        void toggleSave(eventId)
      }}
      className={className ?? 'p-2 transition disabled:opacity-50'}
      aria-label={isSaved ? 'Remove bookmark' : 'Bookmark event'}
    >
      {isSaved ? (
        <BookmarkCheck className="h-6 w-6" strokeWidth={2} />
      ) : (
        <Bookmark className="h-6 w-6" strokeWidth={2} />
      )}
    </button>
  )
}

import { useState } from 'react'
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
  const [popped, setPopped] = useState(false)

  if (!isAuthenticated) return null

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPopped(true)
    void toggleSave(eventId)
  }

  const iconClass = `${popped ? 'animate-bookmark-pop' : ''}`

  return (
    <button
      type="button"
      disabled={isSaving}
      onClick={handleClick}
      className={className ?? 'p-2 transition disabled:opacity-50'}
      aria-label={isSaved ? 'Remove bookmark' : 'Bookmark event'}
    >
      {isSaved ? (
        <BookmarkCheck
          className={`${iconClass} fill-current`}
          size={18}
          strokeWidth={2}
          onAnimationEnd={() => setPopped(false)}
        />
      ) : (
        <Bookmark
          className={iconClass}
          size={18}
          strokeWidth={2}
          onAnimationEnd={() => setPopped(false)}
        />
      )}
    </button>
  )
}

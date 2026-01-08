import { SessionCardSkeleton } from './SessionCardSkeleton'

export function SessionListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <SessionCardSkeleton key={idx} />
      ))}
    </div>
  )
}

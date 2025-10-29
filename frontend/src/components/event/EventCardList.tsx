import EventCard from './EventCard'
import { EventCardProps } from '@/interfaces/event'
import { mockEvents } from '@/mocks/event'

type Props = {
  events?: EventCardProps[]
}

export default function EventCardList({ events = mockEvents }: Props) {

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        No sessions fit your filters right now, mate. Give the search a wider berth and see what turns up.
      </div>
    )
  }

  return (
    <div className="mx-auto w-full">
      <div className="space-y-6 py-2">
        {events.map((event) => (
          <EventCard
            key={event.id}
            {...event}
          />
        ))}
      </div>
    </div>
  )
}

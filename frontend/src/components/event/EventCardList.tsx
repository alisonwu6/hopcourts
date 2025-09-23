import { EventCardProps } from '@/interfaces/event'
import EventCard from './EventCard'
import { mockEvents } from '@/mocks/event'

export default function EventCardList() {
  return (
    <div className="mx-auto w-full">
      <div className="space-y-6 py-6">
        {mockEvents.map((event: EventCardProps, index: number) => (
          <EventCard key={index} {...event} />
        ))}
      </div>
    </div>
  )
}

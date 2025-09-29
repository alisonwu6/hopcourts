import EventCard from './EventCard'
import { EventCardProps } from '@/interfaces/event'
import { mockEvents } from '@/mocks/event'
import { useCopy } from '@/i18n/LanguageProvider'

type Props = {
  events?: EventCardProps[]
}

export default function EventCardList({ events = mockEvents }: Props) {
  const copy = useCopy()

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        {copy.eventList.emptyMessage}
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

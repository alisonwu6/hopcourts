import { CreateEventPageView } from '@/features/events/components/CreateEventPageView'
import { useCreateEventForm } from '@/features/events/hooks/useCreateEventForm'

export default function CreateEventPage() {
  const createEventForm = useCreateEventForm()

  return <CreateEventPageView {...createEventForm} />
}

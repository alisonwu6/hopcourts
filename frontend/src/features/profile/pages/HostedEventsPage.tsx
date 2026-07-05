import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EventsPageShell } from '@/features/profile/components/EventsPageShell'
import { ProfileEventsPanel } from '@/features/profile/components/ProfileEventsPanel'

export function HostedEventsPage() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  return (
    <EventsPageShell
      title="Hosted Events"
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      onBack={() => navigate('/profile')}
      onAction={() => navigate('/create-event', { state: { backTo: '/profile/hosted-events' } })}
    >
      <ProfileEventsPanel mode="hosted" viewMode={viewMode} />
    </EventsPageShell>
  )
}

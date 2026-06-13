import { useState } from 'react'
import { ArrowLeft, List, CalendarDays } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ProfileEventsPanel } from '@/features/profile/components/ProfileEventsPanel'

export function HostedEventsPage() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="sticky top-0 z-10 flex items-center justify-center border-b border-slate-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="absolute left-2 rounded-full p-2 text-slate-600 hover:bg-slate-100"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <span className="text-lg font-bold text-slate-900">Hosted Events</span>
        <div className="absolute right-4 flex items-center gap-1 rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition ${viewMode === 'calendar' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
          >
            <CalendarDays className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <ProfileEventsPanel mode="hosted" viewMode={viewMode} />
      </div>
    </div>
  )
}

import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ProfileEventsPanel } from '@/features/profile/components/ProfileEventsPanel'

export function JoinedEventsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="relative sticky top-0 z-10 flex items-center justify-center border-b border-slate-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-2 rounded-full p-2 text-slate-600 hover:bg-slate-100"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <span className="text-lg font-bold text-slate-900">我的參與活動</span>
      </div>

      <div className="p-4">
        <ProfileEventsPanel mode="joined" />
      </div>
    </div>
  )
}

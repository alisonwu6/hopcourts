import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Navigation, Share, CheckCircle, AlertCircle } from 'lucide-react'
import { venuesService, ApiVenue } from '../services/venuesService'
import { PageLoading } from '@/components/PageLoading'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { eventsService } from '@/features/events/services/eventsService'
import { EventCard } from '@/features/events/components/EventCard'
import { PlayerEvent } from '@/types'

export function VenueDetailsPage() {
  const { venueId } = useParams<{ venueId: string }>()
  const navigate = useNavigate()
  const [venue, setVenue] = useState<ApiVenue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [sessions, setSessions] = useState<PlayerEvent[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)

  useEffect(() => {
    if (!venueId) return

    const loadVenueData = async () => {
      setLoading(true)
      const res = await venuesService.getVenueById(venueId)
      if (res.success && res.data) {
        setVenue(res.data)
      } else {
        setError(res.error?.message || '無法載入場館資訊')
      }
      setLoading(false)
    }

    const loadSessions = async () => {
      setLoadingSessions(true)
      const res = await eventsService.getEvents({ venueId })
      if (res.success && res.data) {
        setSessions(res.data.data)
      }
      setLoadingSessions(false)
    }

    loadVenueData()
    loadSessions()
  }, [venueId])

  if (loading) return <PageLoading />

  if (error || !venue) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4">
        <p className="text-slate-500">{error || '找不到場館'}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600">返回</button>
      </div>
    )
  }

  const handleClaimRequest = async () => {
    if (!venueId) return
    setIsClaiming(true)
    const res = await venuesService.requestVenueClaim(venueId)
    if (res.success) {
      setClaimSuccess(true)
    } else {
      alert(res.error?.message || '申請失敗')
    }
    setIsClaiming(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <ActionToolbar 
        title={venue.name_display}
        onBack={() => navigate(-1)} 
        showShare
        onShare={() => alert('Share clicked')}
      />
      
      {/* Hero / Basic Info */}
      <div className="bg-white px-4 py-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
             <h1 className="text-2xl font-bold text-slate-900">{venue.name_display}</h1>
             <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
               <MapPin className="h-4 w-4 text-slate-400" />
               <span>{venue.address_display || '無地址資訊'}</span>
             </div>
          </div>
          {venue.logo_url && (
            <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-100 shadow-sm">
              <img src={venue.logo_url} alt="Logo" className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="mt-4 flex gap-2">
          {venue.status === 'claimed' ? (
             <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
               <CheckCircle className="h-3.5 w-3.5" />
               官方認證場館
             </span>
          ) : (
             <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
               <AlertCircle className="h-3.5 w-3.5" />
               未認領
             </span>
          )}
        </div>
      </div>

      {/* Claim CTA (Only for unclaimed) */}
      {venue.status !== 'claimed' && (
        <div className="m-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          {claimSuccess ? (
            <div className="text-center py-2">
              <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <h3 className="text-sm font-bold text-slate-900">申請已送出</h3>
              <p className="mt-1 text-xs text-slate-500">我們將在 1-3 個工作天內完成審核。</p>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-bold text-blue-900">您是場館管理者嗎？</h3>
              <p className="mt-1 text-xs text-blue-700">認領此場館以管理官方資訊、上傳 Logo 並發布官方活動。</p>
              <button 
                onClick={handleClaimRequest}
                disabled={isClaiming}
                className="mt-3 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                {isClaiming ? '傳送中...' : '申請認領場館'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Active Sessions List */}
      <div className="px-4 py-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">場館活動 ({sessions.length})</h2>
        {loadingSessions ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map(session => (
              <EventCard 
                key={session.id} 
                event={session} 
                onViewDetails={(id) => navigate(`/event/${id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white py-8 text-center text-slate-400 shadow-sm border border-slate-100">
            目前無活動
          </div>
        )}
      </div>

    </div>
  )
}

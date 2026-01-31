import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Navigation, Share, CheckCircle, AlertCircle } from 'lucide-react'
import { venuesService, ApiVenue } from '../services/venuesService'
import { PageLoading } from '@/components/PageLoading'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { eventsService } from '@/features/events/services/eventsService'
import { EventCard } from '@/features/events/components/EventCard'
import { PlayerEvent } from '@/types'

import { useAuthStore } from '@/hooks'

// ... imports

export function VenueDetailsPage() {
  const { venueId } = useParams<{ venueId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore() // Get user from store
  
  const [venue, setVenue] = useState<ApiVenue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [showClaimDialog, setShowClaimDialog] = useState(false)
  const [showClaimForm, setShowClaimForm] = useState(false)
  
  // Calculate managementship
  // If managedVenues is string[], use includes. If object[], use some.
  // The lint error `Property 'id' does not exist on type 'string'` implies `v` is inferred as string.
  // So `managedVenues` is likely `string[]`.
  const isVenueManager = user?.managedVenues?.some((v: any) => (typeof v === 'string' ? v === venueId : v.id === venueId))

  // ... (rest of state)
  const [claimFormData, setClaimFormData] = useState({ 
    contact_name: '', 
    contact_person: '',
    contact_title: '',
    contact_phone: '',
    contact_email: '', 
    note: '' 
  })
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

  const handleStartClaim = () => {
    setShowClaimDialog(true)
  }

  const handleContinueToClaim = () => {
    setShowClaimDialog(false)
    setShowClaimForm(true)
  }

  const handleSubmitClaim = async () => {
    if (!venueId) return
    
    // Validate required fields
    if (!claimFormData.contact_name || 
        !claimFormData.contact_person || 
        !claimFormData.contact_title ||
        !claimFormData.contact_phone ||
        !claimFormData.contact_email) {
      alert('請填寫所有必填欄位')
      return
    }
    
    setIsClaiming(true)
    const res = await venuesService.requestVenueClaim(venueId, claimFormData)
    if (res.success) {
      setClaimSuccess(true)
      setShowClaimForm(false)
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

       {/* Status Badge & Management Entry */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
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
          
          
          {isVenueManager && (
             <button 
                onClick={() => navigate('/venue-portal')}
                className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
             >
                ⚙️ 管理場館
             </button>
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
                onClick={handleStartClaim}
                className="mt-3 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-95"
              >
                我是這個場館的管理者
              </button>
            </>
          )}
        </div>
      )}

      {/* Claim Explanation Dialog */}
      {showClaimDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowClaimDialog(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-900">申請成為官方管理者</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>• 你將申請成為此場館的官方管理者</p>
              <p>• 通過後可發布官方活動、查看成效</p>
              <p>• 每個場館僅能有一位官方管理者</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setShowClaimDialog(false)}
                className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                取消
              </button>
              <button 
                onClick={handleContinueToClaim}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                繼續申請
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claim Form Dialog */}
      {showClaimForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowClaimForm(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-900">填寫申請資訊</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">管理者名稱（或公司名）*</label>
                <input 
                  type="text"
                  value={claimFormData.contact_name}
                  onChange={(e) => setClaimFormData({...claimFormData, contact_name: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="例：ABC 運動中心"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">聯絡人姓名 *</label>
                <input 
                  type="text"
                  value={claimFormData.contact_person}
                  onChange={(e) => setClaimFormData({...claimFormData, contact_person: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="例：王小明"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">職務稱呼 *</label>
                <input 
                  type="text"
                  value={claimFormData.contact_title}
                  onChange={(e) => setClaimFormData({...claimFormData, contact_title: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="例：場館經理"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">聯絡電話 *</label>
                <input 
                  type="tel"
                  value={claimFormData.contact_phone}
                  onChange={(e) => setClaimFormData({...claimFormData, contact_phone: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="例：0912-345-678"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">聯絡 Email *</label>
                <input 
                  type="email"
                  value={claimFormData.contact_email}
                  onChange={(e) => setClaimFormData({...claimFormData, contact_email: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">補充說明（選填）</label>
                <textarea 
                  value={claimFormData.note}
                  onChange={(e) => setClaimFormData({...claimFormData, note: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="例：我們是場館經營者"
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setShowClaimForm(false)}
                disabled={isClaiming}
                className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                取消
              </button>
              <button 
                onClick={handleSubmitClaim}
                disabled={isClaiming}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {isClaiming ? '送出中...' : '送出申請'}
              </button>
            </div>
          </div>
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

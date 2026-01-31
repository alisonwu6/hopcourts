import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { venuePortalService } from '../services/venuePortalService'
import { useAuthStore } from '@/hooks'
import { VenueDashboardData } from '../services/venuePortalService'

// Minimal subset of what we need to create a session
// We can use the existing sessionsService or venuePortalService wrapper
// Let's assume we use venuePortalService to keep context clear

export function VenueSessionCreatePage() {
  const { venueId } = useParams<{ venueId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [venueData, setVenueData] = useState<VenueDashboardData['venue'] | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    sportKey: 'BADMINTON', // Default
    description: '',
    date: '',
    startTime: '19:00',
    endTime: '21:00',
    minPeople: 2,
    maxPeople: 4,
    price: 0,
    isFree: true
  })

  useEffect(() => {
    if (venueId) {
      loadVenueInfo(venueId)
    }
  }, [venueId])

  const loadVenueInfo = async (id: string) => {
    setLoading(true)
    const res = await venuePortalService.getVenueDashboard(id)
    if (res.success && res.data) {
      setVenueData(res.data.venue)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!venueId || !venueData) return

    // Combine date and time
    const startAt = new Date(`${formData.date}T${formData.startTime}:00`)
    const endAt = new Date(`${formData.date}T${formData.endTime}:00`)

    // Payload
    const payload = {
      hostUserId: user?.id, // Should be Owner ID
      venueId: venueId,
      sportKey: formData.sportKey,
      title: formData.title,
      description: formData.description,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      locationName: venueData.name_display,
      address: venueData.address_display,
      lat: 0, // Should come from venue data ideally, or backend fills it
      lng: 0,
      minPeople: formData.minPeople,
      maxPeople: formData.maxPeople,
      price: formData.isFree ? 0 : formData.price,
      isFree: formData.isFree,
      status: 'published',
      visibility: 'public',
      isOfficial: true // CRITICAL
    }

    // We can call sessionsService directly OR venuePortalService.
    // Let's add createSession to venuePortalService to encapsulate logic
    setLoading(true)
    try {
        const res = await venuePortalService.createOfficialSession(venueId, payload)
        if (res.success) {
            alert('官方活動發布成功！')
            navigate(`/venue-portal`)
        } else {
            alert('發布失敗: ' + res.error?.message)
        }
    } catch(err) {
        alert('發布發生錯誤')
    }
    setLoading(false)
  }

  if (loading && !venueData) {
    return <div className="p-12 text-center text-slate-500">Loading...</div>
  }

  if (!venueData) {
    return <div className="p-12 text-center text-red-500">Venue not found</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
            <h1 className="font-bold text-slate-800 text-lg">發布官方活動</h1>
            <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-800">取消</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
            <div className="mb-8 flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                <div className="text-2xl">🏟️</div>
                <div>
                    <div className="text-xs uppercase font-bold text-indigo-600 mb-0.5">主辦場館</div>
                    <div className="font-bold text-slate-900">{venueData.name_display}</div>
                    <div className="text-xs text-slate-500">{venueData.address_display}</div>
                </div>
                <div className="ml-auto px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded uppercase">
                    Official
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">活動標題</label>
                        <input 
                            type="text" 
                            required
                            placeholder="例：週五羽球暢打團"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">運動項目</label>
                        <select 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.sportKey}
                            onChange={e => setFormData({...formData, sportKey: e.target.value})}
                        >
                            <option value="BADMINTON">羽球 (Badminton)</option>
                            <option value="BASKETBALL">籃球 (Basketball)</option>
                            <option value="TENNIS">網球 (Tennis)</option>
                            <option value="PICKLEBALL">匹克球 (Pickleball)</option>
                        </select>
                    </div>
                </div>

                {/* 2. Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">日期</label>
                        <input 
                            type="date" 
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.date}
                            onChange={e => setFormData({...formData, date: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">開始時間</label>
                        <input 
                            type="time" 
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.startTime}
                            onChange={e => setFormData({...formData, startTime: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">結束時間</label>
                        <input 
                            type="time" 
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.endTime}
                            onChange={e => setFormData({...formData, endTime: e.target.value})}
                        />
                    </div>
                </div>

                 {/* 3. Description */}
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">活動詳情 (選填)</label>
                    <textarea 
                        rows={3}
                        placeholder="補充說明，例如：提供用球、強度限制等..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                </div>

                {/* 4. Capacity & Price */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-100 pt-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">人數上限</label>
                        <input 
                            type="number" 
                            min="1"
                            max="100"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.maxPeople}
                            onChange={e => setFormData({...formData, maxPeople: parseInt(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">收費模式</label>
                        <div className="flex items-center gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    checked={formData.isFree} 
                                    onChange={() => setFormData({...formData, isFree: true, price: 0})}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-slate-700">免費</span>
                            </label>
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    checked={!formData.isFree} 
                                    onChange={() => setFormData({...formData, isFree: false})}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-slate-700">付費</span>
                            </label>
                        </div>
                    </div>
                     {!formData.isFree && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">費用 (每人)</label>
                            <input 
                                type="number" 
                                min="0"
                                placeholder="TWD"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: parseInt(e.target.value)})}
                            />
                        </div>
                     )}
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)}
                        className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        取消
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20 disabled:opacity-50"
                    >
                        {loading ? '發布中...' : '確認發布活動'}
                    </button>
                </div>

            </form>
        </div>
      </main>
    </div>
  )
}

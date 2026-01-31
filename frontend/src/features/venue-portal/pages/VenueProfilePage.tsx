import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { venuePortalService } from '../services/venuePortalService'

interface VenueProfileData {
  logo_url: string
  cover_url: string
  description: string
  social_links: {
    facebook?: string
    instagram?: string
    website?: string
  }
}

export function VenueProfilePage() {
  const { venueId } = useParams<{ venueId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<VenueProfileData>({
    logo_url: '',
    cover_url: '',
    description: '',
    social_links: {}
  })

  useEffect(() => {
    if (venueId) {
      loadProfile()
    }
  }, [venueId])

  const loadProfile = async () => {
    if (!venueId) return
    setLoading(true)
    const res = await venuePortalService.getVenueProfile(venueId)
    if (res.success && res.data) {
      // Merge with default struct to avoid undefined access
      setFormData({
        logo_url: res.data.logo_url || '',
        cover_url: res.data.cover_url || '',
        description: res.data.description || '',
        social_links: res.data.social_links || {}
      })
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!venueId) return

    setSaving(true)
    const res = await venuePortalService.updateVenueProfile(venueId, formData)
    if (res.success) {
      alert('場館資料更新成功！')
      navigate('/venue-portal')
    } else {
      alert('更新失敗：' + res.error?.message)
    }
    setSaving(false)
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Loading profile...</div>

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate('/venue-portal')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                ←
            </button>
            <h1 className="font-bold text-slate-800 tracking-tight">編輯場館資料</h1>
         </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Branding Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 border-slate-100">品牌形象 (Branding)</h2>
                
                <div className="mb-4">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Logo URL</label>
                    <input 
                        type="url" 
                        value={formData.logo_url}
                        onChange={e => setFormData({...formData, logo_url: e.target.value})}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="https://example.com/logo.png"
                    />
                    <p className="text-xs text-slate-500 mt-1">建議尺寸 200x200px (正方形)</p>
                </div>

                 <div className="mb-4">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Cover Image URL</label>
                    <input 
                        type="url" 
                        value={formData.cover_url}
                        onChange={e => setFormData({...formData, cover_url: e.target.value})}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="https://example.com/cover.jpg"
                    />
                    <p className="text-xs text-slate-500 mt-1">將顯示於場館主頁頂部</p>
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 border-slate-100">詳細資訊</h2>
                
                <div className="mb-4">
                    <label className="block text-sm font-bold text-slate-700 mb-2">場館介紹 (Description)</label>
                    <textarea 
                        rows={5}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="請介紹您的場館設施、特色..."
                    />
                </div>
            </div>

             {/* Social Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 border-slate-100">社群連結</h2>
                
                <div className="grid gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Official Website</label>
                        <input 
                            type="url" 
                            value={formData.social_links.website || ''}
                            onChange={e => setFormData({...formData, social_links: {...formData.social_links, website: e.target.value}})}
                            className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="https://your-venue.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Instagram</label>
                        <input 
                            type="text" 
                            value={formData.social_links.instagram || ''}
                            onChange={e => setFormData({...formData, social_links: {...formData.social_links, instagram: e.target.value}})}
                             className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="@sportsmatch"
                        />
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Facebook</label>
                        <input 
                            type="url" 
                            value={formData.social_links.facebook || ''}
                            onChange={e => setFormData({...formData, social_links: {...formData.social_links, facebook: e.target.value}})}
                             className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="https://facebook.com/..."
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <button 
                    type="button"
                    onClick={() => navigate('/venue-portal')}
                    className="flex-1 py-3 font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                >
                    取消
                </button>
                <button 
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50"
                >
                    {saving ? '儲存中...' : '儲存變更'}
                </button>
            </div>

        </form>
      </main>
    </div>
  )
}

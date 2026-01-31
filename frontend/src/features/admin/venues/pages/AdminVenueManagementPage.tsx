import { useState, useEffect } from 'react'
import { adminVenuesService } from '../services/adminVenuesService'

interface AdminVenue {
  id: string
  name_display: string
  address_display: string
  lat: number
  lng: number
  status: 'unclaimed' | 'claimed'
  claim_id?: string
  claim_status?: string
  contact_email?: string
  last_activity_at?: string
}

export function AdminVenueManagementPage() {
  const [venues, setVenues] = useState<AdminVenue[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingVenue, setEditingVenue] = useState<AdminVenue | null>(null)
  const [patchData, setPatchData] = useState({ name_display: '', address_display: '' })
  const [revokeReason, setRevokeReason] = useState('')

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async (query = '') => {
    setLoading(true)
    const res = await adminVenuesService.getAdminVenues({ search: query })
    if (res.success && res.data) {
      setVenues(res.data)
    }
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchVenues(search)
  }

  const handleRevoke = async (claimId: string) => {
    if (!window.confirm('確定要撤銷此場館的官方認領權限嗎？這是一個高風險操作。')) return
    if (!revokeReason) {
      alert('請填寫撤銷原因')
      return
    }

    const res = await adminVenuesService.revokeVenueClaim(claimId, revokeReason)
    if (res.success) {
      alert('權限已撤銷')
      setRevokeReason('')
      fetchVenues(search)
    } else {
      alert('撤銷失敗')
    }
  }

  const handlePatch = async () => {
    if (!editingVenue) return
    const res = await adminVenuesService.patchVenueDisplay(editingVenue.id, patchData)
    if (res.success) {
      alert('資訊已更新')
      setEditingVenue(null)
      fetchVenues(search)
    } else {
      alert('更新失敗')
    }
  }

  const startEditing = (venue: AdminVenue) => {
    setEditingVenue(venue)
    setPatchData({ name_display: venue.name_display, address_display: venue.address_display })
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">🛡️ C0 Admin Venue 治理層</h1>
            <p className="text-sm text-slate-500">僅供錯誤修正與爭議仲裁，嚴禁干預營運。</p>
          </div>
          <div className="text-xs font-mono text-slate-400">VERSION 1.0</div>
        </header>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <input 
            type="text" 
            placeholder="搜尋場館名稱或 ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button type="submit" className="rounded-lg bg-slate-800 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            搜尋
          </button>
        </form>

        {/* Venue List */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Venue / ID</th>
                <th className="px-4 py-3 font-semibold">狀態</th>
                <th className="px-4 py-3 font-semibold">最後活動</th>
                <th className="px-4 py-3 text-right font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400">載入中...</td></tr>
              ) : venues.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400">查無場館</td></tr>
              ) : venues.map(venue => (
                <tr key={venue.id} className="hover:bg-slate-50 px-4">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{venue.name_display}</div>
                    <div className="text-[10px] text-slate-400">{venue.id}</div>
                    <div className="mt-1 text-xs text-slate-500">{venue.address_display}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      venue.status === 'claimed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {venue.status}
                    </span>
                    {venue.claim_status === 'approved' && (
                      <div className="mt-1 text-[10px] text-blue-600 font-medium">
                        🛡️ {venue.contact_email}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {venue.last_activity_at ? new Date(venue.last_activity_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-right space-y-2">
                    <button 
                      onClick={() => startEditing(venue)}
                      className="text-xs font-semibold text-blue-600 hover:underline block ml-auto"
                    >
                      修正資訊
                    </button>
                    {venue.claim_id && venue.status === 'claimed' && (
                      <div className="flex flex-col items-end gap-1">
                        <input 
                          type="text" 
                          placeholder="撤銷原因..."
                          className="text-[10px] border rounded px-1 w-24"
                          onChange={(e) => setRevokeReason(e.target.value)}
                        />
                        <button 
                          onClick={() => handleRevoke(venue.claim_id!)}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Revoke 權限
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Modal (Simple overlay for C0) */}
        {editingVenue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-lg font-bold text-slate-900">修正顯示資訊</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">顯示名稱</label>
                  <input 
                    type="text" 
                    value={patchData.name_display}
                    onChange={(e) => setPatchData({...patchData, name_display: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">顯示地址</label>
                  <textarea 
                    value={patchData.address_display}
                    onChange={(e) => setPatchData({...patchData, address_display: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button 
                  onClick={() => setEditingVenue(null)}
                  className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-semibold text-slate-700"
                >
                  取消
                </button>
                <button 
                  onClick={handlePatch}
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white"
                >
                  確認修正
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

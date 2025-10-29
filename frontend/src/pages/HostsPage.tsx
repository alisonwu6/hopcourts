import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HostCard } from '@/components'
import { useHostsStore } from '@/hooks'

export function HostsPage() {
  const navigate = useNavigate()
  const { hosts, isLoading, fetchHosts } = useHostsStore()

  useEffect(() => {
    fetchHosts()
  }, [fetchHosts])

  return (
    <div className="pb-24 pt-20">
      <div className="px-4">
        <h1 className="text-lg font-bold text-slate-900">Hosts</h1>
        <p className="text-sm text-slate-500">Follow organisers bringing the best sessions to life.</p>
      </div>

      <div className="px-4 py-6">
        {isLoading ? (
          <div className="py-10 text-center text-slate-500">Loading hosts…</div>
        ) : hosts.length === 0 ? (
          <div className="py-10 text-center text-slate-500">No hosts found</div>
        ) : (
          hosts.map((host) => (
            <HostCard key={host.id} host={host} onViewProfile={() => navigate(`/host/${host.id}`)} />
          ))
        )}
      </div>
    </div>
  )
}

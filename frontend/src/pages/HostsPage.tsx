import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { HostCard } from '@/components'
import { useHostsStore } from '@/hooks'
import { FilterChips } from '@/components/athlete/FilterChips'

const sports = ['All', 'Running', 'Basketball', 'Climbing', 'Tennis']

export function HostsPage() {
  const navigate = useNavigate()
  const [selectedSport, setSelectedSport] = useState('All')
  const { hosts, isLoading, fetchHosts } = useHostsStore()

  useEffect(() => {
    fetchHosts()
  }, [fetchHosts])

  const filteredHosts = useMemo(() => {
    if (selectedSport === 'All') return hosts
    return hosts.filter((host) =>
      host.sports?.some((s) => s.toLowerCase() === selectedSport.toLowerCase())
    )
  }, [hosts, selectedSport])

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      <div className="px-4">
        <h1 className="text-lg font-bold text-blue-900">Hosts</h1>
        <p className="text-sm text-slate-600">Follow organisers bringing the best games to life.</p>
      </div>

      <div
        className="fixed left-0 right-0 z-40 border-b border-slate-200 bg-white shadow-sm"
        style={{ top: `4rem` }}
      >
        <FilterChips
          filters={sports}
          selected={selectedSport}
          onSelect={setSelectedSport}
          className="pt-4"
        />
      </div>

      <div className="px-4 py-6">
        {isLoading ? (
          <div className="py-10 text-center text-slate-600">Loading hosts…</div>
        ) : filteredHosts.length === 0 ? (
          <div className="py-10 text-center text-slate-600">No hosts found</div>
        ) : (
          filteredHosts.map((host) => (
            <HostCard key={host.id} host={host} onViewProfile={() => navigate(`/host/${host.id}`)} />
          ))
        )}
      </div>
    </div>
  )
}

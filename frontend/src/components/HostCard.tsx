import { Host } from '@/types'
import { Button } from './Button'

type HostCardProps = {
  host: Host
  onFollow?: (hostId: string) => void
  onViewProfile?: (hostId: string) => void
}

export function HostCard({ host, onFollow, onViewProfile }: HostCardProps) {
  const hostInitial = host.avatar ?? host.name.charAt(0)

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
          {hostInitial}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900">{host.name}</h3>
            {host.verified && <span className="text-blue-500">✓</span>}
          </div>
          <p className="text-sm text-slate-600 capitalize">{host.type}</p>
        </div>
      </div>

      <p className="mb-4 text-sm text-slate-700">{host.bio}</p>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded bg-blue-50 p-2">
          <p className="font-semibold text-blue-700">{host.gamesHosted}</p>
          <p className="text-xs text-slate-600">games hosted</p>
        </div>
        <div className="rounded bg-blue-50 p-2">
          <p className="font-semibold text-blue-700">{host.rating.toFixed(1)}</p>
          <p className="text-xs text-slate-600">rating</p>
        </div>
        <div className="rounded bg-blue-50 p-2">
          <p className="font-semibold text-blue-700">{host.followerCount}</p>
          <p className="text-xs text-slate-600">followers</p>
        </div>
      </div>

      <div className="flex gap-2">
        {onFollow && (
          <Button className="flex-1 text-sm" onClick={() => onFollow(host.id)}>
            Follow
          </Button>
        )}
        {onViewProfile && (
          <Button variant="secondary" className="flex-1 text-sm" onClick={() => onViewProfile(host.id)}>
            Profile
          </Button>
        )}
      </div>
    </div>
  )
}

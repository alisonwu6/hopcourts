import { useNavigate } from 'react-router-dom'
import { Button } from '@/components'
import { useAuthStore } from '@/hooks'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  if (!user) {
    return (
      <div className="px-4 pt-24">
        <h1 className="text-lg font-bold text-slate-900">Profile</h1>
        <p className="mt-4 text-sm text-slate-600">Please log in to view your profile.</p>
        <Button className="mt-4" onClick={() => navigate('/login')}>
          Sign in
        </Button>
      </div>
    )
  }

  return (
    <div className="pb-24 pt-20">
      <div className="px-4 py-6">
        <div className="mb-6 rounded-2xl bg-white p-6 text-center shadow">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white">
            {user.avatar ?? user.name.charAt(0)}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
          <p className="mt-1 text-sm text-slate-600">📍 {user.location}</p>
          <p className="text-sm text-slate-600">{user.sports.join(', ')}</p>
        </div>

        <div className="mb-6 flex gap-2">
          <Button className="flex-1" onClick={() => navigate('/edit-profile')}>
            Edit Profile
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => navigate('/settings')}>
            Settings
          </Button>
        </div>

        <Button
          variant="tertiary"
          className="w-full text-red-600 hover:underline"
          onClick={async () => {
            await logout()
            navigate('/login', { replace: true })
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  )
}

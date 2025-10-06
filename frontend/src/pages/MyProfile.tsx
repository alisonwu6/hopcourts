import { AthleteCard } from '@/components/athlete/AthleteCard'
import { mockAthlete } from '@/mocks/athlete'
import { useNavigate } from 'react-router-dom'

export default function MyProfile() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#F3F7FB] overflow-x-hidden">
      <AthleteCard
        {...mockAthlete}
        fullBleed
        isOwner
        onEdit={(id) => navigate('/u/me/edit')}
        onAddPost={(id) => console.info('Add post from profile', id)}
      />
    </div>
  )
}

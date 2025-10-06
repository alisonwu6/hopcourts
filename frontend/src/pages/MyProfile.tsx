import { AthleteCard } from '@/components/athlete/AthleteCard'
import { mockAthlete } from '@/mocks/athlete'

export default function MyProfile() {
  return (
    <div className="min-h-screen bg-[#F3F7FB] overflow-x-hidden">
      <AthleteCard
        {...mockAthlete}
        fullBleed
        isOwner
        onEdit={(id) => console.info('Edit athlete card', id)}
        onAddPost={(id) => console.info('Add post from profile', id)}
      />
    </div>
  )
}

import MainLayout from '@/layouts/MainLayout'
import { AthleteCard } from '@/components/athlete/AthleteCard'
import { mockAthlete } from '@/mocks/athlete'

export default function MyProfile() {
  return (
    <MainLayout contentWidth="md">
      <div className="mx-auto max-w-3xl">
        <AthleteCard
          {...mockAthlete}
          isOwner
          onEdit={(id) => console.info('Edit athlete card', id)}
          onAddPost={(id) => console.info('Add post from profile', id)}
        />
      </div>
    </MainLayout>
  )
}

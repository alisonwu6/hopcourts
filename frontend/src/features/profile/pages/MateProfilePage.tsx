import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MateCard, type MateCardProps } from '@/features/mates/components/MateCard'
import { ProfileContent } from './ProfilePage'

export function MateProfilePage() {
  const navigate = useNavigate()
  const { username } = useParams<{ username: string }>()
  const { state } = useLocation() as { state?: { mate?: Partial<MateCardProps> } }
  const mate = state?.mate
  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const goalDaySlots = daysList.reduce<Record<string, string[]>>((acc, day) => {
    acc[day] = []
    return acc
  }, {})

  const profile: MateCardProps = {
    name: mate?.name ?? username ?? 'New mate',
    flag: mate?.flag ?? '🏴',
    vibe: (mate?.vibe as MateCardProps['vibe']) ?? 'Chill',
    sports: mate?.sports ?? ['Basketball', 'Gym'],
    trying: mate?.trying ?? ['Pickleball'],
    location: mate?.location ?? '台北',
    blurb: mate?.blurb ?? 'Let’s play soon!',
    avatar:
      mate?.avatar ??
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=320&q=80',
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-4xl pb-6">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-2xl font-bold text-slate-900">{profile.name}</span>
        </div>
        <div className="px-3 pt-4">
          <MateCard {...profile} />
        </div>
        <div className="mt-4">
          <ProfileContent
            goal={{ sessionsPerWeek: '2', timeOfDay: 'Evenings', days: ['Mon', 'Wed'] }}
            goalDaySlots={goalDaySlots}
            onOpenGoalSheet={() => {}}
            showEdit={false}
          />
        </div>
      </div>
    </div>
  )
}

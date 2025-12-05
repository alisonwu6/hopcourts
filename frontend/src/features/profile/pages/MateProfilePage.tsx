import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { MateCard, type MateCardProps } from '@/features/mates/components/MateCard'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

export function MateProfilePage() {
  const navigate = useNavigate()
  const { username } = useParams<{ username: string }>()
  const { state } = useLocation() as { state?: { mate?: Partial<MateCardProps> } }
  const mate = state?.mate

  const profile: MateCardProps = {
    name: mate?.name ?? username ?? 'New mate',
    flag: mate?.flag ?? '🏴',
    vibe: (mate?.vibe as MateCardProps['vibe']) ?? 'Chill',
    sports: mate?.sports ?? ['Basketball', 'Gym'],
    trying: mate?.trying ?? ['Pickleball'],
    location: mate?.location ?? 'Brisbane',
    blurb: mate?.blurb ?? 'Let’s play soon!',
    avatar:
      mate?.avatar ??
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=320&q=80',
  }

  return (
    <div className="min-h-screen bg-[#f7f8fb]">
      <div className="mx-auto w-full max-w-4xl pb-6">
        <ActionToolbar
          showBack
          onBack={() => navigate(-1)}
          contentClassName="px-3"
          borderBottom
        />
        <div className="px-3 pt-4">
          <MateCard {...profile} />
        </div>
      </div>
    </div>
  )
}

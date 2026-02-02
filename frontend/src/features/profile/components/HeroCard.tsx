import { MateCard, type MateCardProps } from '@/features/mates/components/MateCard'

type Props = {
  profile: MateCardProps | null
  onEdit: () => void
  avatarFallback?: string
  actionLabel?: string
  actionDisabled?: boolean
  showShare?: boolean
  onShare?: () => void
}

export function HeroCard({
  profile,
  onEdit,
  avatarFallback = '',
  actionLabel = '編輯運動卡',
  actionDisabled = false,
  showShare = true,
  onShare,
}: Props) {
  const safeProfile: MateCardProps = profile ?? {
    name: '',
    username: '',
    location: '',
    flag: '',
    vibe: '',
    vibeLabel: '',
    sports: [],
    trying: [],
    blurb: '',
    avatar: avatarFallback,
  }

  return (
    <div className="bg-slate-200">
      <MateCard
        {...safeProfile}
        accentClassName="w-full max-w-none min-w-0 rounded-none bg-transparent px-0 shadow-none"
      />
      <div className="flex justify-center gap-4 py-2">
        <button
          type="button"
          onClick={onEdit}
          disabled={actionDisabled}
          className="w-40 rounded-lg bg-slate-100 px-4 py-1 text-sm font-semibold text-slate-600 disabled:opacity-60"
        >
          {actionLabel}
        </button>
        {showShare && (
          <button
            type="button"
            onClick={onShare}
            className="w-40 rounded-lg bg-slate-100 px-4 py-1 text-sm font-semibold text-slate-600"
          >
            分享
          </button>
        )}
      </div>
    </div>
  )
}

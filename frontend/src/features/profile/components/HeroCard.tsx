import clsx from 'clsx'
import { MateCard, type MateCardProps } from '@/features/mates/components/MateCard'

type Props = {
  profile: MateCardProps | null
  onEdit?: () => void
  avatarFallback?: string
  actionLabel?: string
  actionDisabled?: boolean
  actionClassName?: string
  showShare?: boolean
  onShare?: () => void
  onHostedClick?: () => void
  onJoinedClick?: () => void
  onTeammatesClick?: () => void
  placeholderMode?: boolean
}

export function HeroCard({
  profile,
  onEdit,
  avatarFallback = '',
  actionLabel = 'Edit Activity Card',
  actionDisabled = false,
  actionClassName,
  showShare = true,
  onShare,
  onHostedClick,
  onJoinedClick,
  onTeammatesClick,
  placeholderMode = false,
}: Props) {
  const safeProfile: MateCardProps = profile ?? {
    name: '',
    username: '',
    location: '',
    vibe: null,
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
        onHostedClick={onHostedClick}
        onJoinedClick={onJoinedClick}
        onTeammatesClick={onTeammatesClick}
        placeholderMode={placeholderMode}
      />
      <div className="flex justify-center gap-4 py-2">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            disabled={actionDisabled}
            className={clsx(
              'w-40 rounded-lg bg-slate-100 px-4 py-1 text-sm font-semibold text-slate-600 disabled:opacity-60',
              actionClassName
            )}
          >
            {actionLabel}
          </button>
        )}
        {showShare && (
          <button
            type="button"
            onClick={onShare}
            className="w-40 rounded-lg bg-slate-100 px-4 py-1 text-sm font-semibold text-slate-600"
          >
            Share
          </button>
        )}
      </div>
    </div>
  )
}

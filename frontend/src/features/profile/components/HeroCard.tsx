import { MateCard, type MateCardProps } from '@/features/mates/components/MateCard'

type Props = {
  profile: MateCardProps | null
  onEdit: () => void
  avatarFallback?: string
}

export function HeroCard({ profile, onEdit, avatarFallback = '' }: Props) {
  const safeProfile: MateCardProps = profile ?? {
    name: '',
    username: '',
    location: '',
    flag: '',
    vibe: '',
    sports: [],
    trying: [],
    blurb: '',
    avatar: avatarFallback,
  }

  return (
    <div
      className="cursor-pointer bg-gradient-to-b from-[#e3ebff] to-[#d5e2ff]"
      onClick={onEdit}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onEdit()
      }}
    >
      <MateCard
        {...safeProfile}
        accentClassName="w-full max-w-none min-w-0 rounded-none bg-transparent px-0 shadow-none"
      />
      <div className="flex justify-center py-3">
        <button
          type="button"
          onClick={onEdit}
          className="w-100 max-w-xs rounded-lg bg-slate-100 px-4 py-1 text-sm text-slate-400"
        >
          編輯運動卡
        </button>
      </div>
    </div>
  )
}

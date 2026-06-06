import { PartyPopper } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BottomSheet } from '@/components/BottomSheet'

type Props = {
  open: boolean
  onClose: () => void
}

export function ProfileCompletionSheet({ open, onClose }: Props) {
  const navigate = useNavigate()

  const handleStartExploring = () => {
    onClose()
    navigate('/events')
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      showHandle={false}
      sheetClassName="rounded-t-[32px] border border-white/40 bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.35)]"
      contentClassName="relative px-6 pb-10 pt-6"
      maxWidthClassName="max-w-lg"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <PartyPopper className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Your profile is ready</h3>
        <p className="mt-2 text-sm text-slate-500">
          You’re all set to explore activities and meet new sports mates.
        </p>
        <button
          type="button"
          onClick={handleStartExploring}
          className="mt-8 w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98]"
        >
          Start exploring
        </button>
      </div>
    </BottomSheet>
  )
}

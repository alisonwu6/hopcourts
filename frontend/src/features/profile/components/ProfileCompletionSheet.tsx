import { PartyPopper } from 'lucide-react'
import { BottomSheet } from '@/components/BottomSheet'

type Props = {
  open: boolean
  onClose: () => void
}

export function ProfileCompletionSheet({ open, onClose }: Props) {
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
        <h3 className="text-xl font-bold text-slate-900">運動卡建立完成！</h3>
        <p className="mt-2 text-sm text-slate-500">
          你已經準備好開始探索活動與結識新夥伴了。
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-8 w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98]"
        >
          開始探索
        </button>
      </div>
    </BottomSheet>
  )
}

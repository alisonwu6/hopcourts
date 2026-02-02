import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { BottomSheet } from '@/components/BottomSheet'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm?: () => void
}

export function ProfileRequiredSheet({ open, onClose, onConfirm }: Props) {
  const navigate = useNavigate()

  const handleConfirm = () => {
    // If a custom onConfirm handler is provided, use it (e.g. to open edit sheet directly)
    if (onConfirm) {
      onConfirm()
    } else {
      // Default behavior: navigate to profile page, which should handle the rest
      // Or we can pass a state to tell ProfilePage to open edit mode?
      // For now, let's just go to profile. The user will see their profile and hopefully edit it.
      // But purely navigating to /profile might not open the edit sheet automatically unless we pass state.
      navigate('/profile', { state: { openEdit: true } })
    }
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      showHandle
      sheetClassName="rounded-t-[32px] border border-white/40 bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.35)]"
      contentClassName="px-6 pb-10 pt-6"
      maxWidthClassName="max-w-lg"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Lock className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">請先建立運動卡</h3>
        <p className="mt-2 text-sm text-slate-500">
          在發佈活動前，我們需要先認識你。<br />
          請先填寫基本資料，讓其他夥伴更信任你。
        </p>
        <button
          type="button"
          onClick={handleConfirm}
          className="mt-8 w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98]"
        >
          立即建立
        </button>
      </div>
    </BottomSheet>
  )
}

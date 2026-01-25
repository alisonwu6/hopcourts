import { Link } from 'react-router-dom'
import { BottomSheet } from './BottomSheet'
import { LoginPanel } from './LoginPanel'

type LoginPromptSheetProps = {
  open: boolean
  onClose: () => void
  onSignup: () => void
}

export function LoginPromptSheet({ open, onClose, onSignup }: LoginPromptSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      showHandle={false}
      sheetClassName="rounded-t-[32px] bg-white shadow-[0_-30px_60px_rgba(15,41,77,0.18)]"
      contentClassName="px-6 pb-8 pt-4 text-slate-900"
    >
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -right-2 -top-2 p-2 text-slate-400 hover:text-slate-600"
          aria-label="Close"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="mt-6">
          <LoginPanel variant="sheet" />
        </div>
      </div>
    </BottomSheet>
  )
}

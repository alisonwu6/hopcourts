import { Link } from 'react-router-dom'
import { BottomSheet } from './BottomSheet'
import { LoginPanel } from './LoginPanel'

type LoginPromptSheetProps = {
  open: boolean
  onClose: () => void
  onSignup?: () => void
}

export function LoginPromptSheet({ open, onClose }: LoginPromptSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      showHandle={false}
      sheetClassName="rounded-t-[32px] bg-white shadow-[0_-30px_60px_rgba(15,41,77,0.18)]"
      disableContainer
    >
      <div className="relative flex items-center justify-end px-5 pb-4 pt-5">
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          aria-label="Close"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="px-5 pb-8">
        <LoginPanel variant="sheet" />
      </div>
    </BottomSheet>
  )
}

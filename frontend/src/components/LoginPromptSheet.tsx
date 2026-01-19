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
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">登入或註冊</p>
      </div>
      <div className="mt-4">
        <LoginPanel variant="sheet" />
        <p className="text-center text-sm text-slate-500">
          還沒有帳號嗎？{' '}
          <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
            加入 SportsMatch
          </Link>
        </p>
      </div>
      <div className="mt-6 space-y-3 text-center">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex w-full items-center justify-center text-sm font-semibold text-slate-500 underline transition hover:text-slate-800"
        >
          繼續逛逛
        </button>
      </div>
    </BottomSheet>
  )
}

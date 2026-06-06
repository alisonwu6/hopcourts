import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { BottomSheet } from './BottomSheet'
import { AlertDialog } from './AlertDialog'
import GoogleLoginButton from './button/GoogleLoginButton'
import { signInWithGoogle, signInWithApple } from '@/services/authService'
import { detectInAppBrowserName, isInAppBrowser } from '@/lib/browser'

type LoginPromptSheetProps = {
  open: boolean
  onClose: () => void
  onSignup?: () => void
}

export function LoginPromptSheet({ open, onClose }: LoginPromptSheetProps) {
  const [showInAppDialog, setShowInAppDialog] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState<{
    open: boolean
    title: string
    description: string
    type: 'success' | 'warning'
  }>({ open: false, title: '', description: '', type: 'success' })

  const inApp = useMemo(() => isInAppBrowser(), [])
  const inAppName = useMemo(() => detectInAppBrowserName(), [])

  const loginGoogle = async () => {
    if (inApp) {
      setShowInAppDialog(true)
      return
    }
    const { data, error } = await signInWithGoogle()
    if (error) { alert(error.message); return }
    if (data?.url) window.location.href = data.url
  }

  return (
    <>
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
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Welcome to HopCourts</h1>
            <p className="mt-2 text-sm text-slate-600">
              Find a game near you. Meet people worth playing with.
            </p>
          </div>
          <div className="mx-auto mt-10 flex w-full max-w-[320px] flex-col gap-4">
            <GoogleLoginButton loginGoogle={loginGoogle} />
          </div>
        </div>
      </BottomSheet>

      <AlertDialog
        open={showInAppDialog}
        onClose={() => setShowInAppDialog(false)}
        title="請改用外部瀏覽器登入"
        description={
          <>
            你目前在{inAppName || 'App 內建瀏覽器'}中，Google 登入會被封鎖。
            <br />
            請點右上角「⋯」選單，接續選「使用外部瀏覽器開啟」，開啟後再進行登入。
          </>
        }
        type="warning"
        actionLabel="複製此頁連結"
        onAction={() => {
          navigator.clipboard
            .writeText(window.location.href)
            .then(() => setCopyFeedback({ open: true, title: '已複製連結', description: '請貼到 Safari 或 Chrome 開啟。', type: 'success' }))
            .catch(() => setCopyFeedback({ open: true, title: '複製失敗', description: `請手動複製此連結：${window.location.href}`, type: 'warning' }))
        }}
        cancelLabel="知道了"
      />

      <AlertDialog
        open={copyFeedback.open}
        onClose={() => setCopyFeedback((prev) => ({ ...prev, open: false }))}
        title={copyFeedback.title}
        description={copyFeedback.description}
        type={copyFeedback.type}
      />
    </>
  )
}

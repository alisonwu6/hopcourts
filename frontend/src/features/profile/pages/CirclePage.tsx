import { useState } from 'react'
import { PeopleContent } from './ProfilePage'
import { useAuthStore } from '@/hooks'
import { BottomSheet } from '@/components/BottomSheet'
import { LoginPanel } from '@/components/LoginPanel'

export function CirclePage() {
  const { isAuthenticated } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
  }))
  const [showLoginSheet, setShowLoginSheet] = useState(false)

  return (
    <>
      {isAuthenticated ? (
        <div className="min-h-screen pb-[120px] px-4 pt-4">
          <div className="mx-auto w-full max-w-4xl">
            <PeopleContent />
          </div>
        </div>
      ) : (
        <div className="min-h-screen pb-[120px] px-4 pt-10">
          <div className="mx-auto w-full max-w-4xl pt-4 px-4 space-y-4">
            <h1 className="text-[22px] font-bold leading-tight text-slate-900">
              夥伴圈
            </h1>
            <p className="text-base text-slate-700">
              在 SportsMatch，每一次運動都可能為你帶來一個同行的夥伴。登入後，你會看到那些陪你完成任務、給你
              High Five、和你一起變強的人。
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowLoginSheet(true)}
                className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition"
                style={{ background: 'var(--gradient-secondary)' }}
              >
                登入
              </button>
            </div>
          </div>
        </div>
      )}
      <BottomSheet
        open={showLoginSheet}
        onClose={() => setShowLoginSheet(false)}
        showHandle
        sheetClassName="rounded-t-[32px] border border-white/40 bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.35)]"
        contentClassName="px-4 pb-8 pt-4"
        maxWidthClassName="max-w-lg"
      >
        <LoginPanel variant="sheet" />
      </BottomSheet>
    </>
  )
}

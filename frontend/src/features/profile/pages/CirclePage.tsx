import clsx from 'clsx'
import { useState } from 'react'
import { useAuthStore } from '@/hooks'
import { BottomSheet } from '@/components/BottomSheet'
import { LoginPanel } from '@/components/LoginPanel'
import { useNavigate } from 'react-router-dom'

export function CirclePage() {
  const { isAuthenticated } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
  }))
  const [showLoginSheet, setShowLoginSheet] = useState(false)

  return (
    <>
      {isAuthenticated ? (
        <div className="min-h-screen px-4 pb-[120px] pt-4">
          <div className="mx-auto w-full max-w-4xl">
            <PeopleContent />
          </div>
        </div>
      ) : (
        <div className="min-h-screen px-4 pb-[120px] pt-10">
          <div className="mx-auto w-full max-w-4xl space-y-4 px-4 pt-4">
            <h1 className="text-[22px] font-bold leading-tight text-slate-900">夥伴圈</h1>
            <p className="text-base text-slate-700">
              在
              SportsMatch，每一次運動都可能為你帶來一個同行的夥伴。登入後，你會看到那些陪你完成任務、給你
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

function PeopleContent() {
  const navigate = useNavigate()
  const [subTab, setSubTab] = useState<'connected' | 'playmates'>('connected')
  const connected: Array<any> = []
  const playmates: Array<any> = []
  const goToMate = (mate: { name: string; vibe: string; username?: string }) => {
    const handle = mate.username || mate.name
    navigate(`/${encodeURIComponent(handle)}`, { state: { mate } })
  }

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-10 flex justify-center">
        <div className="flex w-full max-w-sm items-center rounded-full bg-slate-100 p-1">
          {[
            { key: 'connected', label: '夥伴圈' },
            { key: 'playmates', label: '交手夥伴' },
          ].map((tab) => {
            const active = subTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSubTab(tab.key as typeof subTab)}
                className={clsx(
                  'flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold transition',
                  active
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {subTab === 'connected' && (
        <div className="space-y-4 px-3 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">我的夥伴</p>
          {connected.length === 0 ? (
            <EmptyBlock
              title="還沒有夥伴"
              description="加入或建立活動，累積互動後會顯示你的夥伴圈。"
              actionLabel="去逛活動"
              onAction={() => navigate('/events')}
            />
          ) : (
            <div className="space-y-3">
              {connected.map((person) => (
                <button
                  key={person.name}
                  type="button"
                  onClick={() => goToMate({ name: person.name, vibe: 'Chill' })}
                  className="flex w-full items-center gap-4 rounded-2xl border border-slate-200/70 px-4 py-4 text-left shadow-sm transition hover:shadow-md focus:outline-none"
                >
                  <div
                    className={clsx(
                      'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-sm',
                      person.colors
                    )}
                  >
                    {person.name.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-base font-semibold text-slate-900">{person.name}</p>
                    <p className="text-sm text-slate-600">{person.detail}</p>
                    <p className="text-sm text-slate-500">{person.meta}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === 'playmates' && (
        <div className="space-y-4 px-3 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">交手夥伴</p>
          {playmates.length === 0 ? (
            <EmptyBlock
              title="還沒有交手夥伴"
              description="完成活動或互動後，這裡會顯示你圈選的交手夥伴。"
              actionLabel="去逛活動"
              onAction={() => navigate('/events')}
            />
          ) : (
            <div className="space-y-3">
              {playmates.map((mate) => {
                const isAdded = mate.status === 'Added'
                return (
                  <div
                    key={mate.name}
                    className="flex w-full items-center gap-4 rounded-2xl border border-slate-200/70 px-4 py-4 shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => goToMate({ name: mate.name, vibe: 'Chill' })}
                      className="flex items-center gap-4 text-left focus:outline-none"
                    >
                      <div
                        className={clsx(
                          'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-sm',
                          mate.colors
                        )}
                      >
                        {mate.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-base font-semibold text-slate-900">{mate.name}</p>
                        </div>
                        <p className="text-sm text-slate-600">{mate.meta}</p>
                      </div>
                    </button>
                    <div className="ml-auto">
                      <button
                        type="button"
                        className={clsx(
                          'min-w-[64px] rounded-xl px-4 py-2 text-sm font-semibold shadow-sm',
                          isAdded
                            ? 'bg-slate-100 text-slate-500'
                            : 'border border-slate-300 text-slate-900 hover:bg-slate-50'
                        )}
                      >
                        {mate.status}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyBlock({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white/80 px-5 py-8 text-center shadow-sm">
      <p className="text-lg font-extrabold text-slate-900">{title}</p>
      <p className="mt-2 text-sm font-medium text-slate-600">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 w-full max-w-[220px] rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components'
import { LoginPanel } from '@/components/LoginPanel'
import { useAuthStore } from '@/hooks'

export function LoginPage() {
  const navigate = useNavigate()
  const { onboardingStatus, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      if (onboardingStatus?.isComplete) {
        navigate('/', { replace: true })
      } else {
        navigate('/onboarding', { replace: true })
      }
    }
  }, [isAuthenticated, onboardingStatus?.isComplete, navigate])

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto w-full max-w-4xl px-4 py-3 text-center">
          <p className="text-sm font-semibold text-slate-600">登入或註冊</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
        <LoginPanel />

        <section className="rounded-[32px] border border-slate-100 bg-white p-6 text-center shadow-[0_20px_60px_rgba(15,41,77,0.08)] sm:p-8">
          <p className="text-base font-semibold text-slate-900">第一次來 SportsMatch？</p>
          <p className="mt-1 text-sm text-slate-600">
            建立帳號就能發佈活動、收藏喜好，還能紀錄你的出席節奏。
          </p>
          <Button
            variant="secondary"
            className="mt-4 w-full rounded-2xl text-base"
            onClick={() => navigate('/signup')}
          >
            加入 SportsMatch
          </Button>
        </section>
      </div>
    </div>
  )
}

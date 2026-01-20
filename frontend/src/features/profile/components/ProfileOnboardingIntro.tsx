import { useNavigate } from 'react-router-dom'

type Props = {
  onStart?: () => void
}

export function ProfileOnboardingIntro({ onStart }: Props) {
  const navigate = useNavigate()
  const handleStart = () => {
    if (onStart) {
      onStart()
      return
    }
    navigate('/onboarding')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white pb-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 pt-10">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold text-emerald-700">歡迎加入 SportsMatch</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            建立你的運動卡
          </h1>
          <p className="text-sm text-slate-600 sm:text-base">
            讓我們知道你的運動樣子，我們幫你找到適合的的夥伴。
          </p>
          <div className="pt-2">
            <button
              type="button"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
              onClick={handleStart}
            >
              建立我的運動卡
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

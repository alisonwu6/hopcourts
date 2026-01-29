import { useState } from 'react'
import { ChevronRight, ShieldCheck, UserRound, LogOut, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { useAuthStore } from '@/hooks'

type SettingKey = 'about' | 'account' | 'privacy'

const items: { key: SettingKey; label: string; icon: React.ElementType }[] = [
  { key: 'about', label: '關於我們', icon: Info },
  { key: 'account', label: '帳號設定', icon: UserRound },
  { key: 'privacy', label: '隱私與安全', icon: ShieldCheck },
]

export function ProfileSettingsPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore((state) => ({
    logout: state.logout,
  }))
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    await logout()
    setIsLoggingOut(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-white pb-[120px] text-slate-900">
      <ActionToolbar
        onBack={() => navigate(-1)}
        showShare={false}
        showFavorite={false}
        contentClassName="max-w-3xl px-4"
        showBack
        title={<span className="text-lg font-semibold text-slate-900">設定</span>}
        rightContent={<span className="h-10 w-10" aria-hidden="true" />}
        borderBottom
      />
      <div className="mx-auto w-full max-w-3xl px-4 pb-6 pt-2">
        <div className="divide-y divide-slate-200 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
          {items.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className="flex w-full items-center justify-between px-4 py-4 text-left "
              onClick={() => {
                if (key === 'about') {
                  navigate('/about')
                } else if (key === 'account') {
                  navigate('/settings/account')
                } else if (key === 'privacy') {
                  navigate('/settings/privacy')
                }
              }}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-slate-700" />
                <span className="text-base font-medium text-slate-900">{label}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300" />
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-2xl bg-slate-50 shadow-sm ring-1 ring-slate-200/60">
          <button
            className="flex w-full items-center justify-between px-4 py-4 text-left text-slate-500 transition  disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5 text-slate-500" />
              <span className="text-base font-medium">{isLoggingOut ? '登出中…' : '登出'}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

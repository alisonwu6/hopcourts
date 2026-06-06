import { useState } from 'react'
import { ChevronRight, UserRound, LogOut, Info, Mail, FileText, PenLine } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { useAuthStore } from '@/hooks'

const generalItems = [
  { key: 'account', label: 'Account Settings', icon: UserRound },
]

const otherItems = [
  { key: 'about', label: 'About Us', icon: Info },
  { key: 'foundersLetter', label: "Founder’s Letter", icon: PenLine },
  { key: 'guidelines', label: 'Community Guidelines', icon: FileText },
  { key: 'contact', label: 'Contact Us', icon: Mail },
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
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <ActionToolbar
        onBack={() => navigate(-1)}
        showShare={false}
        showFavorite={false}
        contentClassName="max-w-3xl px-4"
        showBack
        title={<span className="text-lg font-semibold text-slate-900">Settings</span>}
        rightContent={<span className="h-10 w-10" aria-hidden="true" />}
        borderBottom
      />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 ml-4 text-sm font-medium text-slate-500">General</h3>
            <div className="divide-y divide-slate-200 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
              {generalItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  className="flex w-full items-center justify-between px-4 py-4 text-left "
                  onClick={() => {
                    if (key === 'account') navigate('/settings/account')
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
          </div>

          <div>
            <h3 className="mb-2 ml-4 text-sm font-medium text-slate-500">HopCourts</h3>
            <div className="divide-y divide-slate-200 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
              {otherItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  className="flex w-full items-center justify-between px-4 py-4 text-left "
                  onClick={() => {
                    if (key === 'about') navigate('/about')
                    if (key === 'foundersLetter') navigate('/founders-letter')
                    if (key === 'guidelines') navigate('/guidelines')
                    if (key === 'contact') navigate('/settings/contact')
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
          </div>
          <div className="mt-3 rounded-2xl bg-slate-50 shadow-sm ring-1 ring-slate-200/60">
            <button
              className="flex w-full items-center justify-between px-4 py-4 text-left text-slate-500 transition  disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5 text-slate-500" />
                <span className="text-base font-medium">{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-auto flex flex-col items-center justify-end pt-8 pb-4">
          <p className="text-xs text-slate-400">
            HopCourts v{__APP_VERSION__}
            {import.meta.env.MODE !== 'production' && (
              <span className="ml-1 opacity-75">({import.meta.env.MODE})</span>
            )}
          </p>
          <p className="mt-1 text-xs text-slate-300">Built for real-world connections</p>
        </div>
      </div>
    </div>
  )
}

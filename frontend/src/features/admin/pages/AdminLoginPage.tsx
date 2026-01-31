import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/hooks'

export function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // Using standard login for now, but redirecting to admin post-login
    await login(email, password)
    // The Guard will handle the role check after hydration
    navigate('/admin/venues')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6 font-sans">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white shadow-xl">
            SM
          </div>
          <h1 className="text-xl font-bold text-slate-900">後台管理</h1>
          <p className="mt-2 text-sm text-slate-500">SportsMatch Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-slate-100">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 ring-1 ring-red-100">
              {error}
            </div>
          )}
          
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400 uppercase">Internal Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="admin@sportsmatch.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400 uppercase">Access Code</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
          >
            {isLoading ? '驗證中...' : '登入'}
          </button>
        </form>

      </div>
    </div>
  )
}

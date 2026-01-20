import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components'
import Header from '@/components/navigation/Header'
import { useAuthStore } from '@/hooks'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignupPage } from '@/features/auth/pages/SignupPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { AuthCallback } from '@/features/auth/pages/AuthCallback'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPassword'
import { OnboardingPage } from '@/features/onboarding/pages/OnboardingPage'
import { DiscoverEventsPage } from '@/features/events/pages/DiscoverEventsPage'
import { EventDetailPage } from '@/features/events/pages/EventDetailPage'
import { MyEventsPage } from '@/features/events/pages/MyEventsPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { CirclePage } from '@/features/profile/pages/CirclePage'
import { ProfileSettingsPage } from '@/features/profile/pages/ProfileSettingsPage'
import { AccountSettingsPage } from '@/features/profile/pages/AccountSettingsPage'
import { PrivacySettingsPage } from '@/features/profile/pages/PrivacySettingsPage'
import { AboutPage } from '@/features/profile/pages/AboutPage'
import CreateEventPage from '@/features/events/pages/CreateEventPage'
import { OnboardingRoute } from '@/routes/OnboardingRoute'
import { HomePage } from '@/features/home/pages/HomePage'

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <div className="p-4 text-center text-sm text-slate-600">載入中…</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { isAuthenticated, onboardingStatus } = useAuthStore()
  const isOnboardingComplete = onboardingStatus?.isComplete ?? false
  const { isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-700">
        <div className="flex items-center gap-3 rounded-full bg-white/80 px-5 py-3 shadow-[0_10px_40px_rgba(15,41,77,0.12)] ring-1 ring-slate-100">
          <span className="relative inline-block h-4 w-4">
            <span className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-70" />
            <span className="relative inline-block h-4 w-4 rounded-full bg-blue-500" />
          </span>
          <span className="text-sm font-semibold">載入中，請稍候…</span>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppChrome showActions={isAuthenticated} showHeader={false}>
            <HomePage />
          </AppChrome>
        }
      />
      <Route
        path="/events"
        element={
          <AppChrome showActions={isAuthenticated}>
            <DiscoverEventsPage />
          </AppChrome>
        }
      />
      <Route
        path="/login"
        element={
          <AppChrome showHeader={false} showActions={false}>
            <LoginPage />
          </AppChrome>
        }
      />
      <Route
        path="/signup"
        element={
          <AppChrome showHeader={false} showActions={false} showNav={false}>
            <SignupPage />
          </AppChrome>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AppChrome showHeader={false} showActions={false} showNav={false}>
            <ForgotPasswordPage />
          </AppChrome>
        }
      />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/auth/reset"
        element={
          <AppChrome showHeader={false} showActions={false} showNav={false}>
            <ResetPasswordPage />
          </AppChrome>
        }
      />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route
        path="/about"
        element={
          <AppChrome showActions={false} showHeader={false} showNav={false}>
            <AboutPage />
          </AppChrome>
        }
      />
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <OnboardingRoute>
              <OnboardingPage />
            </OnboardingRoute>
          </RequireAuth>
        }
      />
      <Route path="/*" element={isAuthenticated ? <AuthenticatedApp /> : <GuestApp />} />
    </Routes>
  )
}

function AppChrome({
  children,
  showActions = true,
  showHeader = true,
  showNav = true,
}: {
  children: ReactNode
  showActions?: boolean
  showHeader?: boolean
  showNav?: boolean
}) {
  const { pathname } = useLocation()
  const noHeaderPaths = ['/events', '/my-events', '/event/', '/create-event']
  const hideHeader = noHeaderPaths.some((segment) => pathname.startsWith(segment))
  const headerVisible = showHeader && !hideHeader
  const navVisible = showNav && !pathname.startsWith('/event/')

  return (
    <div
      style={{
        paddingBottom: navVisible ? 'calc(68px + env(safe-area-inset-bottom, 0px))' : 0,
      }}
    >
      {headerVisible && <Header showActions={showActions} />}
      {children}
      {navVisible && <BottomNav />}
    </div>
  )
}

function AuthenticatedApp() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppChrome showHeader={false}>
            <HomePage />
          </AppChrome>
        }
      />
      <Route
        path="/events"
        element={
          <AppChrome showHeader={false}>
            <DiscoverEventsPage />
          </AppChrome>
        }
      />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route
        path="/event/:id"
        element={
          <AppChrome>
            <EventDetailPage />
          </AppChrome>
        }
      />
      <Route
        path="/my-events"
        element={
          <RequireAuth>
            <AppChrome showHeader={false}>
              <MyEventsPage />
            </AppChrome>
          </RequireAuth>
        }
      />
      <Route
        path="/create-event"
        element={
          <RequireAuth>
            <AppChrome showNav={false}>
              <CreateEventPage />
            </AppChrome>
          </RequireAuth>
        }
      />
      <Route
        path="/circle"
        element={
          <RequireAuth>
            <AppChrome showHeader={false}>
              <CirclePage />
            </AppChrome>
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <AppChrome showHeader={false}>
              <ProfilePage />
            </AppChrome>
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <AppChrome showHeader={false} showNav={false}>
              <ProfileSettingsPage />
            </AppChrome>
          </RequireAuth>
        }
      />
      <Route
        path="/settings/account"
        element={
          <RequireAuth>
            <AppChrome showHeader={false} showNav={false}>
              <AccountSettingsPage />
            </AppChrome>
          </RequireAuth>
        }
      />
      <Route
        path="/settings/privacy"
        element={
          <RequireAuth>
            <AppChrome showHeader={false} showNav={false}>
              <PrivacySettingsPage />
            </AppChrome>
          </RequireAuth>
        }
      />
      <Route path="/mates" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function GuestApp() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppChrome showActions={false} showHeader={false}>
            <HomePage />
          </AppChrome>
        }
      />
      <Route
        path="/events"
        element={
          <AppChrome showActions={false} showHeader={false}>
            <DiscoverEventsPage />
          </AppChrome>
        }
      />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route
        path="/event/:id"
        element={
          <AppChrome showActions={false} showHeader={false}>
            <EventDetailPage />
          </AppChrome>
        }
      />
      <Route
        path="/create-event"
        element={
          <AppChrome showActions={false} showHeader={false} showNav={false}>
            <CreateEventPage />
          </AppChrome>
        }
      />
      <Route
        path="/circle"
        element={
          <AppChrome showActions={false} showHeader={false}>
            <CirclePage />
          </AppChrome>
        }
      />
      <Route
        path="/my-events"
        element={
          <AppChrome showActions={false} showHeader={false}>
            <MyEventsPage />
          </AppChrome>
        }
      />
      <Route path="/mates" element={<Navigate to="/" replace />} />
      <Route
        path="/profile"
        element={
          <AppChrome showActions={false} showHeader={false}>
            <ProfilePage />
          </AppChrome>
        }
      />
      <Route
        path="/settings"
        element={
          <AppChrome showActions={false} showHeader={false} showNav={false}>
            <ProfileSettingsPage />
          </AppChrome>
        }
      />
      <Route
        path="/settings/account"
        element={
          <AppChrome showActions={false} showHeader={false} showNav={false}>
            <AccountSettingsPage />
          </AppChrome>
        }
      />
      <Route
        path="/settings/privacy"
        element={
          <AppChrome showActions={false} showHeader={false} showNav={false}>
            <PrivacySettingsPage />
          </AppChrome>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

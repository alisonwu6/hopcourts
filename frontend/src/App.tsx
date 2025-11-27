import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components'
import Header from '@/components/navigation/Header'
import { useAuthStore } from '@/hooks'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { AuthCallback } from '@/pages/AuthCallback'
import { ResetPasswordPage } from '@/pages/ResetPassword'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { EventsPage } from '@/pages/EventsPage'
import { GameDetailPage } from '@/pages/GameDetailPage'
import { MyGamesPage } from '@/pages/MyGamesPage'
import { ProfilePage } from '@/pages/ProfilePage'
import CreateGamePage from '@/pages/CreateGamePage'
import { OnboardingRoute } from '@/routes/OnboardingRoute'
import { MatesPage } from '@/pages/MatesPage'

export default function App() {
  const { isAuthenticated, onboardingStatus } = useAuthStore()
  const isOnboardingComplete = onboardingStatus?.isComplete ?? false

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppChrome showActions={isAuthenticated}>
            <MatesPage />
          </AppChrome>
        }
      />
      <Route
        path="/events"
        element={
          <AppChrome showActions={isAuthenticated}>
            <EventsPage />
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
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/reset" element={<ResetPasswordPage />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <OnboardingPage />
          </OnboardingRoute>
        }
      />
      <Route
        path="/*"
        element={
          isAuthenticated
            ? isOnboardingComplete
              ? <AuthenticatedApp />
              : <Navigate to="/onboarding" replace />
            : <GuestApp />
        }
      />
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
  const isDetail = pathname.startsWith('/game/') || pathname.startsWith('/create-game')
  const headerVisible = showHeader && !isDetail
  const navVisible = showNav && !isDetail

  return (
    <div style={{ paddingBottom: navVisible ? 'calc(68px + env(safe-area-inset-bottom, 0px))' : 0 }}>
      {headerVisible && <Header showActions={showActions} />}
      {children}
      {navVisible && <BottomNav />}
    </div>
  )
}

function AuthenticatedApp() {
  return (
    <AppChrome>
      <Routes>
        <Route path="/" element={<MatesPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/game/:id" element={<GameDetailPage />} />
        <Route path="/my-games" element={<MyGamesPage />} />
        <Route path="/create-game" element={<CreateGamePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/mates" element={<MatesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppChrome>
  )
}

function GuestApp() {
  return (
    <AppChrome showActions={false}>
      <Routes>
        <Route path="/" element={<MatesPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/game/:id" element={<GameDetailPage />} />
        <Route path="/create-game" element={<CreateGamePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/mates" element={<MatesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppChrome>
  )
}

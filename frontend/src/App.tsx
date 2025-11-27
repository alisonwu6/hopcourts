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
import { EventsPage } from '@/features/events/pages/EventsPage'
import { EventDetailPage } from '@/features/events/pages/EventDetailPage'
import { MyEventsPage } from '@/features/events/pages/MyEventsPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import CreateEventPage from '@/features/events/pages/CreateEventPage'
import { OnboardingRoute } from '@/routes/OnboardingRoute'
import { MatesPage } from '@/features/mates/pages/MatesPage'

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
  const isDetail = pathname.startsWith('/event/') || pathname.startsWith('/create-event')
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
        <Route path="/event/:id" element={<EventDetailPage />} />
        <Route path="/my-events" element={<MyEventsPage />} />
        <Route path="/create-event" element={<CreateEventPage />} />
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
        <Route path="/event/:id" element={<EventDetailPage />} />
        <Route path="/create-event" element={<CreateEventPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/mates" element={<MatesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppChrome>
  )
}

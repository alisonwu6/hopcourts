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
import { MateProfilePage } from '@/features/profile/pages/MateProfilePage'
import { ProfileSettingsPage } from '@/features/profile/pages/ProfileSettingsPage'
import { AccountSettingsPage } from '@/features/profile/pages/AccountSettingsPage'
import { PrivacySettingsPage } from '@/features/profile/pages/PrivacySettingsPage'
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
          <AppChrome showActions={isAuthenticated} showHeader={false}>
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
  const isDetail =
    pathname.startsWith('/event/') ||
    pathname.startsWith('/create-event')
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
    <Routes>
      <Route
        path="/"
        element={
          <AppChrome showHeader={false}>
            <MatesPage />
          </AppChrome>
        }
      />
      <Route
        path="/events"
        element={
          <AppChrome>
            <EventsPage />
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
          <AppChrome>
            <MyEventsPage />
          </AppChrome>
        }
      />
      <Route
        path="/create-event"
        element={
          <AppChrome>
            <CreateEventPage />
          </AppChrome>
        }
      />
      <Route
        path="/profile"
        element={
          <AppChrome showHeader={false}>
            <ProfilePage />
          </AppChrome>
        }
      />
      <Route
        path="/profile/mate"
        element={
          <AppChrome showHeader={false}>
            <MateProfilePage />
          </AppChrome>
        }
      />
      <Route
        path="/:username"
        element={
          <AppChrome showHeader={false}>
            <MateProfilePage />
          </AppChrome>
        }
      />
      <Route
        path="/profile/settings"
        element={
          <AppChrome showHeader={false} showNav={false}>
            <ProfileSettingsPage />
          </AppChrome>
        }
      />
      <Route
        path="/profile/settings/account"
        element={
          <AppChrome showHeader={false} showNav={false}>
            <AccountSettingsPage />
          </AppChrome>
        }
      />
      <Route
        path="/profile/settings/privacy"
        element={
          <AppChrome showHeader={false} showNav={false}>
            <PrivacySettingsPage />
          </AppChrome>
        }
      />
      <Route
        path="/mates"
        element={
          <AppChrome showHeader={false}>
            <MatesPage />
          </AppChrome>
        }
      />
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
            <MatesPage />
          </AppChrome>
        }
      />
      <Route
        path="/events"
        element={
          <AppChrome showActions={false}>
            <EventsPage />
          </AppChrome>
        }
      />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route
        path="/event/:id"
        element={
          <AppChrome showActions={false}>
            <EventDetailPage />
          </AppChrome>
        }
      />
      <Route
        path="/create-event"
        element={
          <AppChrome showActions={false}>
            <CreateEventPage />
          </AppChrome>
        }
      />
      <Route
        path="/mates"
        element={
          <AppChrome showActions={false} showHeader={false}>
            <MatesPage />
          </AppChrome>
        }
      />
      <Route
        path="/profile"
        element={
          <AppChrome showActions={false} showHeader={false}>
            <ProfilePage />
          </AppChrome>
        }
      />
      <Route
        path="/:username"
        element={
          <AppChrome showActions={false} showHeader={false}>
            <MateProfilePage />
          </AppChrome>
        }
      />
      <Route
        path="/profile/settings"
        element={
          <AppChrome showActions={false} showHeader={false} showNav={false}>
            <ProfileSettingsPage />
          </AppChrome>
        }
      />
      <Route
        path="/profile/settings/account"
        element={
          <AppChrome showActions={false} showHeader={false} showNav={false}>
            <AccountSettingsPage />
          </AppChrome>
        }
      />
      <Route
        path="/profile/settings/privacy"
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

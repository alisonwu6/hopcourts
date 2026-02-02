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
import { VenuePage } from '@/features/events/pages/VenuePage'
import { VenueListPage } from '@/features/events/pages/VenueListPage'
import { VenueDetailsPage } from '@/features/venues/pages/VenueDetailsPage'
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
import { MateProfilePage } from '@/features/profile/pages/MateProfilePage'
import { AdminVenueManagementPage } from '@/features/admin/venues/pages/AdminVenueManagementPage'
import { AdminLoginPage } from '@/features/admin/pages/AdminLoginPage'
import { AdminRouteGuard } from '@/features/admin/components/AdminRouteGuard'
import { VenueDashboardPage } from '@/features/venue-portal/pages/VenueDashboardPage'
import { VenueProfilePage } from '@/features/venue-portal/pages/VenueProfilePage'
import { VenueSessionCreatePage } from '@/features/venue-portal/pages/VenueSessionCreatePage'
import { VenuePortalRouteGuard } from '@/features/venue-portal/VenuePortalRouteGuard'
import { PageLoading } from '@/components/PageLoading'

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { isAuthenticated, isLoading, onboardingStatus } = useAuthStore()

  if (isLoading) {
    return <PageLoading message="載入中..." />
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/reset" element={<ResetPasswordPage />} />
      
      <Route
        path="/onboarding/*"
        element={
          <RequireAuth>
            <OnboardingRoute>
              <OnboardingPage />
            </OnboardingRoute>
          </RequireAuth>
        }
      />
      <Route path="/profile/:username" element={<MateProfilePage />} />
      <Route path="/about" element={<AboutPage />} />

      {/* Admin / Governance (C0) */}
      {/*
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin/venues"
        element={
          <AdminRouteGuard>
            <AdminVenueManagementPage />
          </AdminRouteGuard>
        }
      />

      <Route
        path="/venue-portal"
        element={
          <VenuePortalRouteGuard>
             <VenueDashboardPage />
          </VenuePortalRouteGuard>
        }
      />
      <Route
        path="/venue-portal/:venueId/profile"
        element={
          <VenuePortalRouteGuard>
             <VenueProfilePage />
          </VenuePortalRouteGuard>
        }
      />
      <Route
        path="/venue-portal/:venueId/sessions/new"
        element={
          <VenuePortalRouteGuard>
             <VenueSessionCreatePage />
          </VenuePortalRouteGuard>
        }
      />
      */}

      {/* Main App Routes */}
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
      className="mx-auto min-h-screen w-full max-w-md bg-white shadow-2xl"
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
      {/*
      <Route
        path="/venues"
        element={
          <AppChrome showHeader={false}>
            <VenueListPage />
          </AppChrome>
        }
      />
      <Route
        path="/venues/:venueId"
        element={
          <AppChrome showNav={false} showHeader={false}>
            <VenueDetailsPage />
          </AppChrome>
        }
      />
      */}
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
        path="/mate/:username"
        element={
          <AppChrome showHeader={false}>
            <MateProfilePage />
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
      {/*
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
      */}
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
      {/*
      <Route
        path="/venues"
        element={
          <AppChrome showActions={false} showHeader={false}>
            <VenueListPage />
          </AppChrome>
        }
      />
      <Route
        path="/venues/:venueId"
        element={
          <AppChrome showActions={false} showNav={false} showHeader={false}>
            <VenueDetailsPage />
          </AppChrome>
        }
      />
      */}
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
      {/*
      <Route
        path="/circle"
        element={
          <AppChrome showActions={false} showHeader={false}>
            <CirclePage />
          </AppChrome>
        }
      />
      */}
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

import { type ReactNode, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components'
import Header from '@/components/navigation/Header'
import { useAuthStore } from '@/hooks'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignupPage } from '@/features/auth/pages/SignupPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { AuthCallback } from '@/features/auth/pages/AuthCallback'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPassword'
import { DiscoverEventsPage } from '@/features/events/pages/DiscoverEventsPage'
import { EventDetailPage } from '@/features/events/pages/EventDetailPage'
import { VenuePage } from '@/features/events/pages/VenuePage'
import { VenueListPage } from '@/features/events/pages/VenueListPage'
import { VenueDetailsPage } from '@/features/venues/pages/VenueDetailsPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { HostedEventsPage } from '@/features/profile/pages/HostedEventsPage'
import { JoinedEventsPage } from '@/features/profile/pages/JoinedEventsPage'
import { ProfileSettingsPage } from '@/features/profile/pages/ProfileSettingsPage'
import { AccountSettingsPage } from '@/features/profile/pages/AccountSettingsPage'
import { AboutPage } from '@/features/profile/pages/AboutPage'
import { StoryPage } from '@/features/profile/pages/StoryPage'
import { UsageRulesPage } from '@/features/profile/pages/UsageRulesPage'
import { FoundersLetterPage } from '@/features/profile/pages/FoundersLetterPage'
import { ContactUsPage } from '@/features/misc/pages/ContactUsPage'
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage'
import CreateEventPage from '@/features/events/pages/CreateEventPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { MateProfilePage } from '@/features/profile/pages/MateProfilePage'
import { TeammatesPage } from '@/features/profile/pages/TeammatesPage'
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
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return <PageLoading />
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/*
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      {/*
      <Route path="/auth/reset" element={<ResetPasswordPage />} />
      */}
      
      <Route path="/about" element={<AboutPage />} />
      <Route path="/story" element={<StoryPage />} />
      <Route path="/founders-letter" element={<FoundersLetterPage />} />
      <Route path="/guidelines" element={<UsageRulesPage />} />
      <Route path="/rules" element={<Navigate to="/guidelines" replace />} />

      {/* Admin / Governance (C0) */}
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

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const noHeaderPaths = ['/events', '/event/', '/create-event']
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
  const { user } = useAuthStore()
  const location = useLocation()

  // No global onboarding guard - handled within ProfilePage flow

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
        path="/mates/:username"
        element={
          <AppChrome showHeader={false}>
            <MateProfilePage />
          </AppChrome>
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
        path="/circle"
        element={
          <RequireAuth>
            <AppChrome showHeader={false} showNav={false}>
              <TeammatesPage />
            </AppChrome>
          </RequireAuth>
        }
      />
      <Route
        path="/profile/hosted-events"
        element={
          <RequireAuth>
            <AppChrome showHeader={false} showNav={false}>
              <HostedEventsPage />
            </AppChrome>
          </RequireAuth>
        }
      />
      <Route
        path="/profile/joined-events"
        element={
          <RequireAuth>
            <AppChrome showHeader={false} showNav={false}>
              <JoinedEventsPage />
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
        path="/settings/contact"
        element={
          <RequireAuth>
            <AppChrome showHeader={false} showNav={false}>
              <ContactUsPage />
            </AppChrome>
          </RequireAuth>
        }
      />
      <Route
        path="/notifications"
        element={
          <RequireAuth>
            <AppChrome showHeader={false} showNav={false}>
              <NotificationsPage />
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
        path="/mate/:username"
        element={
          <AppChrome showActions={false} showHeader={false}>
            <MateProfilePage />
          </AppChrome>
        }
      />
      <Route
        path="/mates/:username"
        element={
          <AppChrome showActions={false} showHeader={false}>
            <MateProfilePage />
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
      <Route path="/mates" element={<Navigate to="/" replace />} />
      <Route
        path="/profile"
        element={<Navigate to="/events" replace />}
      />
      <Route
        path="/settings"
        element={<Navigate to="/events" replace />}
      />
      <Route
        path="/settings/account"
        element={<Navigate to="/events" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

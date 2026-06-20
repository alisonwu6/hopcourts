import { type ReactNode, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components'
import Header from '@/components/navigation/Header'
import { useAuthStore } from '@/hooks'
import { AuthCallback } from '@/features/auth/pages/AuthCallback'
import { DiscoverEventsPage } from '@/features/events/pages/DiscoverEventsPage'
import { EventDetailPage } from '@/features/events/pages/EventDetailPage'
import { VenueListPage } from '@/features/venues/pages/VenueListPage'
import { VenueDetailsPage } from '@/features/venues/pages/VenueDetailsPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { SavedEventsPage } from '@/features/profile/pages/SavedEventsPage'
import { HostedEventsPage } from '@/features/profile/pages/HostedEventsPage'
import { JoinedEventsPage } from '@/features/profile/pages/JoinedEventsPage'
import { ProfileSettingsPage } from '@/features/settings/pages/SettingsPage'
import { AccountSettingsPage } from '@/features/settings/pages/AccountSettingsPage'
import { AboutPage } from '@/features/settings/pages/AboutPage'
import { StoryPage } from '@/features/settings/pages/StoryPage'
import { UsageRulesPage } from '@/features/profile/pages/UsageRulesPage'
import { FoundersLetterPage } from '@/features/settings/pages/FoundersLetterPage'
import { ContactUsPage } from '@/features/settings/pages/ContactUsPage'
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage'
import CreateEventPage from '@/features/events/pages/CreateEventPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { MateProfilePage } from '@/features/profile/pages/MateProfilePage'
import { MyMatesPage } from '@/features/profile/pages/MyMatesPage'
import { AdminVenueManagementPage } from '@/features/admin/venues/pages/AdminVenueManagementPage'
import { VenueDashboardPage } from '@/features/venue-portal/pages/VenueDashboardPage'
import { VenueProfilePage } from '@/features/venue-portal/pages/VenueProfilePage'
import { VenueSessionCreatePage } from '@/features/venue-portal/pages/VenueSessionCreatePage'
import { VenueSchedulePage } from '@/features/venue-portal/pages/VenueSchedulePage'
import { PageLoading } from '@/components/PageLoading'

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <PageLoading />
  if (!isAuthenticated)
    return (
      <Navigate
        to="/"
        replace
      />
    )
  return children
}

const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  if (isLoading) return null
  if (!isAuthenticated || !user?.role?.includes('admin'))
    return <Navigate to="/" replace />
  return children
}

function AppChrome({
  children,
  showHeader = true,
  showNav = true,
}: {
  children: ReactNode
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
      {headerVisible && <Header />}
      {children}
      {navVisible && <BottomNav />}
    </div>
  )
}

export default function App() {
  const { isLoading } = useAuthStore()

  if (isLoading) {
    return <PageLoading />
  }

  return (
    <Routes>
      {/* Auth */}
      <Route
        path="/auth/callback"
        element={<AuthCallback />}
      />

      {/* Public info pages */}
      <Route
        path="/about"
        element={<AboutPage />}
      />
      <Route
        path="/story"
        element={<StoryPage />}
      />
      <Route
        path="/founders-letter"
        element={<FoundersLetterPage />}
      />
      <Route
        path="/guidelines"
        element={<UsageRulesPage />}
      />
      <Route
        path="/rules"
        element={
          <Navigate
            to="/guidelines"
            replace
          />
        }
      />

      {/* Admin */}
      <Route
        path="/admin/venues"
        element={
          <RequireAdmin>
            <AdminVenueManagementPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/:venueId/schedule"
        element={
          <RequireAuth>
            <VenueSchedulePage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/:venueId/profile"
        element={
          <RequireAuth>
            <VenueProfilePage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/:venueId/sessions/create"
        element={
          <RequireAuth>
            <VenueSessionCreatePage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/:venueId?"
        element={
          <RequireAuth>
            <VenueDashboardPage />
          </RequireAuth>
        }
      />

      {/* Public app routes */}
      <Route
        path="/"
        element={
          <AppChrome showHeader={false}>
            <HomePage />
          </AppChrome>
        }
      />
      <Route
        path="/home"
        element={
          <Navigate
            to="/"
            replace
          />
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
          <AppChrome
            showNav={false}
            showHeader={false}
          >
            <VenueDetailsPage />
          </AppChrome>
        }
      />
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

      {/* Protected routes */}
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
          <AppChrome showHeader={false}>
            <ProfilePage />
          </AppChrome>
        }
      />
      <Route
        path="/my-mates"
        element={
          <RequireAuth>
            <AppChrome
              showHeader={false}
              showNav={false}
            >
              <MyMatesPage />
            </AppChrome>
          </RequireAuth>
        }
      />
      <Route
        path="/profile/hosted-events"
        element={
          <RequireAuth>
            <AppChrome
              showHeader={false}
              showNav={false}
            >
              <HostedEventsPage />
            </AppChrome>
          </RequireAuth>
        }
      />
      <Route
        path="/profile/joined-events"
        element={
          <RequireAuth>
            <AppChrome
              showHeader={false}
              showNav={false}
            >
              <JoinedEventsPage />
            </AppChrome>
          </RequireAuth>
        }
      />
      <Route
        path="/profile/saved-events"
        element={
          <RequireAuth>
            <AppChrome
              showHeader={false}
              showNav={false}
            >
              <SavedEventsPage />
            </AppChrome>
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <AppChrome
              showHeader={false}
              showNav={false}
            >
              <ProfileSettingsPage />
            </AppChrome>
          </RequireAuth>
        }
      />
      <Route
        path="/settings/account"
        element={
          <RequireAuth>
            <AppChrome
              showHeader={false}
              showNav={false}
            >
              <AccountSettingsPage />
            </AppChrome>
          </RequireAuth>
        }
      />
      <Route
        path="/settings/contact"
        element={
          <RequireAuth>
            <AppChrome
              showHeader={false}
              showNav={false}
            >
              <ContactUsPage />
            </AppChrome>
          </RequireAuth>
        }
      />
      <Route
        path="/notifications"
        element={
          <RequireAuth>
            <AppChrome
              showHeader={false}
              showNav={false}
            >
              <NotificationsPage />
            </AppChrome>
          </RequireAuth>
        }
      />

      {/* Fallbacks */}
      <Route
        path="/mates"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  )
}

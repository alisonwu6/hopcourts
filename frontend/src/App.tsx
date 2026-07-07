import { type ReactNode, useLayoutEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components'
import Header from '@/components/navigation/Header'
import { useAuthStore } from '@/hooks'
import { AuthCallback } from '@/features/auth/pages/AuthCallback'
import { DiscoverEventsPage } from '@/features/events/pages/DiscoverEventsPage'
import { EventDetailPage } from '@/features/events/pages/EventDetailPage'
import { VenueListPage } from '@/features/venues/pages/VenueListPage'
import { VenueDetailsPage } from '@/features/venues/pages/VenueDetailsPage'
import { SubmitVenuePage } from '@/features/venues/pages/SubmitVenuePage'
import { SubmitVenueChooserPage } from '@/features/venues/pages/SubmitVenueChooserPage'
import { SubmitPublicVenuePage } from '@/features/venues/pages/SubmitPublicVenuePage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { SavedEventsPage } from '@/features/profile/pages/SavedEventsPage'
import { HostedEventsPage } from '@/features/profile/pages/HostedEventsPage'
import { JoinedEventsPage } from '@/features/profile/pages/JoinedEventsPage'
import { ProfileSettingsPage } from '@/features/settings/pages/SettingsPage'
import { AccountSettingsPage } from '@/features/settings/pages/AccountSettingsPage'
import { AboutPage } from '@/features/settings/pages/AboutPage'
import { GuidelinesPage } from '@/features/profile/pages/GuidelinesPage'
import { WhyHopCourtsPage } from '@/features/settings/pages/WhyHopCourtsPage'
import { ContactUsPage } from '@/features/settings/pages/ContactUsPage'
import { FaqPage } from '@/features/settings/pages/FaqPage'
import { CreatorsLetterPage } from '@/features/settings/pages/CreatorsLetterPage'
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage'
import CreateEventPage from '@/features/events/pages/CreateEventPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { MateProfilePage } from '@/features/profile/pages/MateProfilePage'
import { AdminVenueManagementPage } from '@/features/admin/venues/pages/AdminVenueManagementPage'
import { VenuePortalLayout } from '@/features/venue-portal/layouts/VenuePortalLayout'
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

function ScrollToTop() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    // 'instant' is spec-required to abort any in-progress smooth scroll
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
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

  const noHeaderPaths = ['/events', '/event/', '/create-event']
  const hideHeader = noHeaderPaths.some((segment) => pathname.startsWith(segment))
  const headerVisible = showHeader && !hideHeader
  const navVisible = showNav && !pathname.startsWith('/event/')

  return (
    <div
      className="mx-auto min-h-[100dvh] w-full max-w-md bg-white shadow-2xl"
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
    <>
      <ScrollToTop />
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
        path="/why-hopcourts"
        element={<WhyHopCourtsPage />}
      />
      <Route
        path="/guidelines"
        element={<GuidelinesPage />}
      />
      <Route
        path="/faq"
        element={<FaqPage />}
      />
      <Route
        path="/creators-letter"
        element={<CreatorsLetterPage />}
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

      {/* Admin superuser — must be defined before the portal layout to prevent /:venueId matching "venues" */}
      <Route
        path="/admin/venues"
        element={
          <RequireAdmin>
            <AdminVenueManagementPage />
          </RequireAdmin>
        }
      />

      {/* Venue portal — shared layout keeps header + bottom nav persistent across tab switches */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <VenuePortalLayout />
          </RequireAuth>
        }
      >
        <Route index element={<VenueDashboardPage />} />
        <Route path=":venueId" element={<VenueDashboardPage />} />
        <Route path=":venueId/schedule" element={<VenueSchedulePage />} />
        <Route path=":venueId/profile" element={<VenueProfilePage />} />
        <Route path=":venueId/sessions/create" element={<VenueSessionCreatePage />} />
      </Route>

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
        path="/venues/submit"
        element={
          <AppChrome
            showHeader={false}
            showNav={false}
          >
            <SubmitVenueChooserPage />
          </AppChrome>
        }
      />
      <Route
        path="/venues/submit/public"
        element={
          <AppChrome
            showHeader={false}
            showNav={false}
          >
            <SubmitPublicVenuePage />
          </AppChrome>
        }
      />
      {/* Official venue submission is coming soon — redirect to chooser */}
      <Route
        path="/venues/submit/official"
        element={<Navigate to="/venues/submit" replace />}
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
        element={<Navigate to="/" replace />}
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
        path="/contact"
        element={<ContactUsPage />}
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
    </>
  )
}

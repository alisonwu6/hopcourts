import { Navigate, Route, Routes } from 'react-router-dom'
import { BottomNav } from '@/components'
import Header from '@/components/navigation/Header'
import { useAuthStore, useOnboardingStore } from '@/hooks'
import { Splash } from '@/pages/Splash'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { HomePage } from '@/pages/HomePage'
import { VenuesPage } from '@/pages/VenuesPage'
import { HostsPage } from '@/pages/HostsPage'
import { SessionDetailPage } from '@/pages/SessionDetailPage'
import { MySessionsPage } from '@/pages/MySessionsPage'
import { VenueDetailPage } from '@/pages/VenueDetailPage'
import { ProfilePage } from '@/pages/ProfilePage'

export default function App() {
  const { user } = useAuthStore()
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding)

  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/onboarding"
        element={user ? <OnboardingPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/*"
        element={
          user ? (
            hasCompletedOnboarding ? (
              <AuthenticatedApp />
            ) : (
              <Navigate to="/onboarding" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

function AuthenticatedApp() {
  return (
    <div className="pb-20">
      <Header />
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/venues" element={<VenuesPage />} />
        <Route path="/hosts" element={<HostsPage />} />
        <Route path="/session/:id" element={<SessionDetailPage />} />
        <Route path="/my-sessions" element={<MySessionsPage />} />
        <Route path="/venue/:id" element={<VenueDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

import { Navigate, Route, Routes } from 'react-router-dom'
import { BottomNav } from '@/components'
import Header from '@/components/navigation/Header'
import { useAuthStore, useOnboardingStore } from '@/hooks'
import { LoginPage } from '@/pages/LoginPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { HomePage } from '@/pages/HomePage'
import { VenuesPage } from '@/pages/VenuesPage'
import { HostsPage } from '@/pages/HostsPage'
import { PlayersPage } from '@/pages/PlayersPage'
import { ProfilePage } from '@/pages/ProfilePage'

export default function App() {
  const { user } = useAuthStore()
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding)

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  if (!hasCompletedOnboarding) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  return (
    <div className="pb-20">
      <Header />
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/venues" element={<VenuesPage />} />
        <Route path="/hosts" element={<HostsPage />} />
        <Route path="/me" element={<ProfilePage />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

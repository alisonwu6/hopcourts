import { Navigate, Route, Routes } from 'react-router-dom'
import { BottomNav } from '@/components'
import Header from '@/components/navigation/Header'
import { useAuthStore } from '@/hooks'
import { Splash } from '@/pages/Splash'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { AuthCallback } from '@/pages/AuthCallback'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { HomePage } from '@/pages/HomePage'
import { VenuesPage } from '@/pages/VenuesPage'
import { MatesPage } from '@/pages/MatesPage'
import { GameDetailPage } from '@/pages/GameDetailPage'
import { MyGamesPage } from '@/pages/MyGamesPage'
import { VenueDetailPage } from '@/pages/VenueDetailPage'
import { ProfilePage } from '@/pages/ProfilePage'
import CreateGame from '@/pages/CreateGame'
import { OnboardingRoute } from '@/routes/OnboardingRoute'

export default function App() {
  const { isAuthenticated, onboardingStatus } = useAuthStore()
  const isOnboardingComplete = onboardingStatus?.isComplete ?? false

  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
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

function AuthenticatedApp() {
  return (
    <div className="pb-20">
      <Header />
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/venues" element={<VenuesPage />} />
        <Route path="/mates" element={<MatesPage />} />
        <Route path="/game/:id" element={<GameDetailPage />} />
        <Route path="/my-games" element={<MyGamesPage />} />
        <Route path="/create-game" element={<CreateGame />} />
        <Route path="/venue/:id" element={<VenueDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

function GuestApp() {
  return (
    <div className="pb-20">
      <Header showActions={false} />
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/venues" element={<VenuesPage />} />
        <Route path="/mates" element={<MatesPage />} />
        <Route path="/game/:id" element={<GameDetailPage />} />
        <Route path="/venue/:id" element={<VenueDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

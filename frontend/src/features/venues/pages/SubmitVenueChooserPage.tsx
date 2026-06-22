import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/hooks'
import { LoginPromptSheet } from '@/components'
import { SubmitVenueChooserView } from '../views/SubmitVenueChooserView'

export function SubmitVenueChooserPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isAuthLoading = useAuthStore((state) => state.isLoading)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      setShowLoginPrompt(true)
    }
  }, [isAuthLoading, isAuthenticated])

  const handleLoginSheetClose = () => {
    setShowLoginPrompt(false)
    if (!isAuthenticated) {
      navigate('/venues', { replace: true })
    }
  }

  return (
    <>
      <SubmitVenueChooserView
        onCancel={() => navigate('/venues')}
        onPickPublic={() => navigate('/venues/submit/public')}
        onPickOfficial={() => navigate('/venues/submit/official')}
      />
      <LoginPromptSheet open={showLoginPrompt} onClose={handleLoginSheetClose} returnTo="/venues/submit" />
    </>
  )
}

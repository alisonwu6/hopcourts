import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertDialog, LoginPromptSheet } from '@/components'
import { useSubmitVenueForm } from '../hooks/useSubmitVenueForm'
import { SubmitPublicVenueView } from '../views/SubmitPublicVenueView'

export function SubmitPublicVenuePage() {
  const navigate = useNavigate()
  const [successDialog, setSuccessDialog] = useState<{
    open: boolean
    venueName: string
    venueId: string | null
  }>({ open: false, venueName: '', venueId: null })

  const form = useSubmitVenueForm({
    mode: 'public',
    onUnauthenticatedClose: () => navigate('/venues', { replace: true }),
    onSuccess: (venue) => {
      setSuccessDialog({ open: true, venueName: venue.name_display, venueId: venue.venue_id ?? null })
    },
  })

  return (
    <>
      <SubmitPublicVenueView
        form={form.form}
        sports={form.sports}
        selectedSports={form.selectedSports}
        isSubmitting={form.isSubmitting}
        highlightField={form.highlightField}
        fieldErrors={form.fieldErrors}
        error={form.error}
        showLocationSheet={form.showLocationSheet}
        setShowLocationSheet={form.setShowLocationSheet}
        showSportSheet={form.showSportSheet}
        setShowSportSheet={form.setShowSportSheet}
        onChangeField={form.changeField}
        onApplySports={form.applySports}
        onConfirmLocation={form.confirmLocation}
        setFieldRef={form.setFieldRef}
        onBack={() => navigate(-1)}
        onSwitchToOfficial={() => navigate('/venues/submit/official', { replace: true })}
        onSubmit={form.submit}
      />
      <LoginPromptSheet open={form.showLoginPrompt} onClose={form.closeLoginPrompt} returnTo="/venues/submit/public" />
      <AlertDialog
        open={successDialog.open}
        onClose={() => {
          setSuccessDialog((prev) => ({ ...prev, open: false }))
          navigate(
            successDialog.venueId ? `/venues/${successDialog.venueId}` : '/venues',
            { replace: true, state: { from: 'submit' } }
          )
        }}
        title="Good on ya!"
        description={
          <>
            Thanks for putting{' '}
            <span className="font-semibold text-slate-700">{successDialog.venueName}</span> on the map.
          </>
        }
        type="success"
        actionLabel="Done"
      />
    </>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertDialog, LoginPromptSheet } from '@/components'
import { useSubmitVenueForm } from '../hooks/useSubmitVenueForm'
import { SubmitPublicVenueView } from '../views/SubmitPublicVenueView'

export function SubmitPublicVenuePage() {
  const navigate = useNavigate()
  const [successDialog, setSuccessDialog] = useState({ open: false, venueName: '' })
  const form = useSubmitVenueForm({
    mode: 'public',
    onUnauthenticatedClose: () => navigate('/venues', { replace: true }),
    onSuccess: (venue) => {
      setSuccessDialog({ open: true, venueName: venue.name_display })
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
        onBack={() => navigate('/venues/submit')}
        onSwitchToOfficial={() => navigate('/venues/submit/official', { replace: true })}
        onSubmit={form.submit}
      />
      <LoginPromptSheet open={form.showLoginPrompt} onClose={form.closeLoginPrompt} />
      <AlertDialog
        open={successDialog.open}
        onClose={() => {
          setSuccessDialog((prev) => ({ ...prev, open: false }))
          navigate('/venues', { replace: true })
        }}
        title="Venue added"
        description={
          <>
            <span className="font-semibold text-slate-700">{successDialog.venueName}</span> is now on the map.
          </>
        }
        type="success"
        actionLabel="Done"
      />
    </>
  )
}

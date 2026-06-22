import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertDialog, LoginPromptSheet } from '@/components'
import { useSubmitVenueForm } from '../hooks/useSubmitVenueForm'
import { SubmitVenueView } from '../views/SubmitVenueView'

export function SubmitVenuePage() {
  const navigate = useNavigate()
  const [successDialog, setSuccessDialog] = useState<{
    open: boolean
    venueName: string
    venueId: string | null
  }>({ open: false, venueName: '', venueId: null })

  const form = useSubmitVenueForm({
    mode: 'official',
    onUnauthenticatedClose: () => navigate('/venues', { replace: true }),
    onSuccess: (venue) => {
      setSuccessDialog({
        open: true,
        venueName: venue.name_display,
        venueId: venue.venue_id ?? null,
      })
    },
  })

  return (
    <>
      <SubmitVenueView
        form={form.form}
        sports={form.sports}
        selectedSports={form.selectedSports}
        isSubmitting={form.isSubmitting}
        highlightField={form.highlightField}
        fieldErrors={form.fieldErrors}
        error={form.error}
        showRoleSheet={form.showRoleSheet}
        setShowRoleSheet={form.setShowRoleSheet}
        showLocationSheet={form.showLocationSheet}
        setShowLocationSheet={form.setShowLocationSheet}
        showSportSheet={form.showSportSheet}
        setShowSportSheet={form.setShowSportSheet}
        onChangeField={form.changeField}
        onApplySports={form.applySports}
        onSelectRole={form.selectRole}
        onConfirmLocation={form.confirmLocation}
        setFieldRef={form.setFieldRef}
        onBack={() => navigate('/venues/submit')}
        onSubmit={form.submit}
      />
      <LoginPromptSheet open={form.showLoginPrompt} onClose={form.closeLoginPrompt} returnTo="/venues/submit/official" />
      <AlertDialog
        open={successDialog.open}
        onClose={() => {
          setSuccessDialog((prev) => ({ ...prev, open: false }))
          navigate('/venues', { replace: true })
        }}
        title="Venue is live!"
        description={
          <>
            <span className="font-semibold text-slate-700">{successDialog.venueName}</span> is now on the map. Your
            14-day trial has started.
          </>
        }
        type="success"
        actionLabel="Go to your venue"
        onAction={() => {
          if (successDialog.venueId) navigate(`/admin/${successDialog.venueId}`, { replace: true })
        }}
      />
    </>
  )
}

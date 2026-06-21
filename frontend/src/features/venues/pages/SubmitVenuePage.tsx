import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertDialog, LoginPromptSheet } from '@/components'
import { useSubmitVenueForm } from '../hooks/useSubmitVenueForm'
import { SubmitVenueView } from '../views/SubmitVenueView'

export function SubmitVenuePage() {
  const navigate = useNavigate()
  const [successDialog, setSuccessDialog] = useState<{ open: boolean; venueName: string; trialEndsAt?: string | null }>({
    open: false,
    venueName: '',
    trialEndsAt: null,
  })
  const form = useSubmitVenueForm({
    mode: 'official',
    onUnauthenticatedClose: () => navigate('/venues', { replace: true }),
    onSuccess: (venue) => {
      setSuccessDialog({
        open: true,
        venueName: venue.name_display,
        trialEndsAt: venue.trial_ends_at,
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
        onBack={() => navigate('/venues/submit')}
        onSubmit={form.submit}
      />
      <LoginPromptSheet open={form.showLoginPrompt} onClose={form.closeLoginPrompt} />
      <AlertDialog
        open={successDialog.open}
        onClose={() => {
          setSuccessDialog((prev) => ({ ...prev, open: false }))
          navigate('/venues', { replace: true })
        }}
        title="Official venue submitted"
        description={
          <>
            <span className="font-semibold text-slate-700">{successDialog.venueName}</span> is live now. Your 14-day
            trial has started.
          </>
        }
        type="success"
        actionLabel="Done"
      />
    </>
  )
}

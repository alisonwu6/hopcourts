import { useState } from 'react'
import { Shield, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { AlertDialog } from '@/components/AlertDialog'
import { useAuthStore } from '@/hooks'
import { profileService } from '@/features/profile/services/profileService'

export function AccountSettingsPage() {
  const navigate = useNavigate()
  const { user, setAuthData } = useAuthStore()
  const email = user?.email || 'Not set'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showOngoingWarning, setShowOngoingWarning] = useState(false)
  const [showDeleteFailed, setShowDeleteFailed] = useState(false)
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)

  const attemptDelete = async (force = false) => {
    try {
      await profileService.deleteAccount(force)
      setShowDeleteConfirm(false)
      setShowOngoingWarning(false)
      setShowDeleteSuccess(true)
    } catch (error: any) {
      console.error('Failed to delete account:', error)
      const code = error?.details?.error?.code
      if (code === 'ONGOING_EVENT') {
        setShowDeleteConfirm(false)
        setShowOngoingWarning(true)
      } else {
        setShowDeleteFailed(true)
      }
    }
  }

  return (
    <div className="min-h-[100dvh] bg-white pb-[120px] text-slate-900">
      <ActionToolbar
        onBack={() => navigate('/settings')}
        showShare={false}
        showFavorite={false}
        title={<span className="text-lg font-semibold text-slate-900">Account Settings</span>}
        contentClassName="max-w-3xl px-4"
        borderBottom
      />

      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-8 pt-4">
        <Section
          title="Account Information"
          icon={<UserRound className="h-5 w-5 text-slate-500" />}
        >
          <Row
            label="Email"
            value={email}
          />
        </Section>

        <Section
          title="Danger Zone"
          icon={<Shield className="h-5 w-5 text-rose-400" />}
        >
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full rounded-lg bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
          >
            Delete Account
          </button>
        </Section>
      </div>

      {/* Step 1 — Standard confirmation */}
      <AlertDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete your account?"
        description="Your login access will be removed. Any upcoming events you're hosting will be cancelled."
        type="error"
        actionLabel="Continue"
        cancelLabel="Cancel"
        actionLeft
        onAction={() => attemptDelete(false)}
      />

      {/* Step 2 — Ongoing event warning */}
      <AlertDialog
        open={showOngoingWarning}
        onClose={() => setShowOngoingWarning(false)}
        title="You have an active event right now"
        description="Your participants are expecting you. Are you sure you still want to delete your account?"
        type="warning"
        actionLabel="Yes, delete anyway"
        cancelLabel="Cancel"
        actionLeft
        onAction={() => attemptDelete(true)}
      />

      <AlertDialog
        open={showDeleteFailed}
        onClose={() => setShowDeleteFailed(false)}
        title="Failed to delete account"
        description="Something went wrong. Please try again later."
        type="error"
        actionLabel="OK"
        onAction={() => setShowDeleteFailed(false)}
      />

      <AlertDialog
        open={showDeleteSuccess}
        onClose={() => {
          setShowDeleteSuccess(false)
          setAuthData(null, null)
          navigate('/')
        }}
        title="Account deleted"
        description="Your account has been successfully deleted. We're sorry to see you go."
        type="success"
        actionLabel="OK"
        onAction={() => {
          setShowDeleteSuccess(false)
          setAuthData(null, null)
          navigate('/')
        }}
      />
    </div>
  )
}

function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200/70">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-sm text-slate-800">{value}</span>
    </div>
  )
}

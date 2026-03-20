import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Navigation, Share, CheckCircle, AlertCircle } from 'lucide-react'
import { venuesService, ApiVenue } from '../services/venuesService'
import { PageLoading } from '@/components/PageLoading'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { eventsService } from '@/features/events/services/eventsService'
import { EventCard } from '@/features/events/components/EventCard'
import { PlayerEvent } from '@/types'

import { useAuthStore } from '@/hooks'

// ... imports

export function VenueDetailsPage() {
  const { venueId } = useParams<{ venueId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore() // Get user from store

  const [venue, setVenue] = useState<ApiVenue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [showClaimDialog, setShowClaimDialog] = useState(false)
  const [showClaimForm, setShowClaimForm] = useState(false)

  // Calculate managementship
  // If managedVenues is string[], use includes. If object[], use some.
  // The lint error `Property 'id' does not exist on type 'string'` implies `v` is inferred as string.
  // So `managedVenues` is likely `string[]`.
  const isVenueManager = user?.managedVenues?.some((v: any) =>
    typeof v === 'string' ? v === venueId : v.id === venueId
  )

  // ... (rest of state)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [claimFormData, setClaimFormData] = useState({
    contact_name: '',
    contact_person: '',
    contact_title: '',
    contact_phone: '',
    contact_email: '',
    note: '',
  })
  const [sessions, setSessions] = useState<PlayerEvent[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)

  useEffect(() => {
    if (!venueId) return

    const loadVenueData = async () => {
      setLoading(true)
      const res = await venuesService.getVenueById(venueId)
      if (res.success && res.data) {
        setVenue(res.data)
      } else {
        setError(res.error?.message || 'Unable to load venue information')
      }
      setLoading(false)
    }

    const loadSessions = async () => {
      setLoadingSessions(true)
      const res = await eventsService.getEvents({ venueId })
      if (res.success && res.data) {
        setSessions(res.data.data)
      }
      setLoadingSessions(false)
    }

    loadVenueData()
    loadSessions()
  }, [venueId])

  if (loading) return <PageLoading />

  if (error || !venue) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4">
        <p className="text-slate-500">{error || 'Venue not found'}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600">
          Back
        </button>
      </div>
    )
  }

  const handleStartClaim = () => {
    setShowClaimDialog(true)
  }

  const handleContinueToClaim = () => {
    setShowClaimDialog(false)
    setShowClaimForm(true)
  }

  const handleSubmitClaim = async () => {
    if (!venueId) return

    // Validate required fields
    const newErrors: Record<string, boolean> = {
      contact_name: !claimFormData.contact_name.trim(),
      contact_person: !claimFormData.contact_person.trim(),
      contact_title: !claimFormData.contact_title.trim(),
      contact_phone: !claimFormData.contact_phone.trim(),
      contact_email: !claimFormData.contact_email.trim(),
    }

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors)
      return
    }

    setErrors({})

    setIsClaiming(true)
    const res = await venuesService.requestVenueClaim(venueId, {
      ...claimFormData,
      contact_email: claimFormData.contact_email,
    })
    if (res.success) {
      setClaimSuccess(true)
      setShowClaimForm(false)
    } else {
      alert(res.error?.message || 'Application failed')
    }
    setIsClaiming(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      <ActionToolbar
        title={venue.name_display}
        onBack={() => navigate(-1)}
        showShare
        onShare={() => alert('Share clicked')}
      />

      {/* Hero / Basic Info */}
      <div className="bg-white px-4 py-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{venue.name_display}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>{venue.address_display || 'No address information'}</span>
            </div>
          </div>
          {venue.logo_url && (
            <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-100 shadow-sm">
              <img src={venue.logo_url} alt="Logo" className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        {/* Status Badge & Management Entry */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            {venue.status === 'claimed' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                <CheckCircle className="h-3.5 w-3.5" />
                Officially Verified Venue
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                <AlertCircle className="h-3.5 w-3.5" />
                Unclaimed
              </span>
            )}
          </div>

          {isVenueManager && (
            <button
              onClick={() => navigate('/venue-portal')}
              className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-slate-800"
            >
              ⚙️ Manage Venue
            </button>
          )}
        </div>
      </div>

      {/* Claim CTA (Only for unclaimed) */}
      {venue.status !== 'claimed' && (
        <div className="m-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          {claimSuccess ? (
            <div className="py-2 text-center">
              <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
              <h3 className="text-sm font-bold text-slate-900">Application submitted</h3>
              <p className="mt-1 text-xs text-slate-500">
                We will complete the review within 1-3 business days.
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-bold text-blue-900">Are you the venue manager?</h3>
              <p className="mt-1 text-xs text-blue-700">
                Claim this venue to manage official info, upload a logo, and publish official
                events.
              </p>
              <button
                onClick={handleStartClaim}
                className="mt-3 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-95"
              >
                I am the manager of this venue
              </button>
            </>
          )}
        </div>
      )}

      {/* Claim Explanation Dialog */}
      {showClaimDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowClaimDialog(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-slate-900">
              Apply to become the official manager
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>• You are applying to become this venue's official manager</p>
              <p>• After approval, you can publish official events and view performance</p>
              <p>• Each venue can have only one official manager</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowClaimDialog(false)}
                className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleContinueToClaim}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claim Form Dialog */}
      {showClaimForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowClaimForm(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-slate-900">Apply to manage this venue</h2>
            <p className="mt-2 text-sm text-slate-500">
              Tell us a bit about your role at this venue.
              <br />
              Our team will review your request before granting access.
            </p>
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Organization / Venue name *
                </label>
                <input
                  type="text"
                  value={claimFormData.contact_name}
                  onChange={(e) => {
                    setClaimFormData({ ...claimFormData, contact_name: e.target.value })
                    if (errors.contact_name) setErrors({ ...errors, contact_name: false })
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                    errors.contact_name
                      ? 'border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="e.g. ABC Sports Center"
                />
                {errors.contact_name && <p className="mt-1 text-xs text-red-500">This field is required</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Your name *
                </label>
                <input
                  type="text"
                  value={claimFormData.contact_person}
                  onChange={(e) => {
                    setClaimFormData({ ...claimFormData, contact_person: e.target.value })
                    if (errors.contact_person) setErrors({ ...errors, contact_person: false })
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                    errors.contact_person
                      ? 'border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="e.g. Alex Wang"
                />
                {errors.contact_person && <p className="mt-1 text-xs text-red-500">This field is required</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Your role at this venue *
                </label>
                <input
                  type="text"
                  value={claimFormData.contact_title}
                  onChange={(e) => {
                    setClaimFormData({ ...claimFormData, contact_title: e.target.value })
                    if (errors.contact_title) setErrors({ ...errors, contact_title: false })
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                    errors.contact_title
                      ? 'border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="e.g. Venue manager / Owner / Staff"
                />
                {errors.contact_title && <p className="mt-1 text-xs text-red-500">This field is required</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Contact phone *
                </label>
                <input
                  type="tel"
                  value={claimFormData.contact_phone}
                  onChange={(e) => {
                    setClaimFormData({ ...claimFormData, contact_phone: e.target.value })
                    if (errors.contact_phone) setErrors({ ...errors, contact_phone: false })
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                    errors.contact_phone
                      ? 'border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="e.g. +886 912 345 678"
                />
                {errors.contact_phone && <p className="mt-1 text-xs text-red-500">This field is required</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Email *
                </label>
                <input
                  type="email"
                  value={claimFormData.contact_email}
                  onChange={(e) => {
                    setClaimFormData({ ...claimFormData, contact_email: e.target.value })
                    if (errors.contact_email) setErrors({ ...errors, contact_email: false })
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                    errors.contact_email
                      ? 'border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="contact@example.com"
                />
                {errors.contact_email && <p className="mt-1 text-xs text-red-500">This field is required</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Additional details (optional)
                </label>
                <textarea
                  value={claimFormData.note}
                  onChange={(e) => setClaimFormData({ ...claimFormData, note: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. I manage bookings for this venue."
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowClaimForm(false)}
                className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitClaim}
                disabled={isClaiming}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {isClaiming ? 'Submitting...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions List */}
      <div className="px-4 py-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Venue Events ({sessions.length})</h2>
        {loadingSessions ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <EventCard
                key={session.id}
                event={session}
                onViewDetails={(id) => navigate(`/event/${id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-100 bg-white py-8 text-center text-slate-400 shadow-sm">
            No events at the moment
          </div>
        )}
      </div>
    </div>
  )
}

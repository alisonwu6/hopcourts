import { FormEvent, useEffect, useRef, useState } from 'react'
import { Frown } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertDialog } from '@/components/AlertDialog'
import { BottomSheet } from '@/components/BottomSheet'
import { useAuthStore } from '@/hooks'
import { venuesService, ApiVenue, VenueClaimRequest } from '../services/venuesService'
import { eventsService } from '@/features/events/services/eventsService'
import { sessionService } from '@/services/sessionService'
import { supabase } from '@/lib/supabase'
import { PageLoading } from '@/components/PageLoading'
import { VenueDetailsView } from '../views/VenueDetailsView'

type ClaimFormState = Omit<VenueClaimRequest, 'contact_name'>

const EMPTY_CLAIM_FORM: ClaimFormState = {
  contact_person: '',
  contact_title: '',
  contact_phone: '',
  contact_email: '',
  note: '',
}

const formatClaimLocationAddress = (address?: string | null) => {
  if (!address) return 'Address not listed'

  return address
    .replace(/\bRoad\b/gi, 'Rd')
    .replace(/\bStreet\b/gi, 'St')
    .replace(/\bAvenue\b/gi, 'Ave')
    .replace(/\bQueensland\b/gi, '')
    .replace(/\bAustralia\b/gi, '')
    .replace(/\b\d{4}\b/g, '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(', ')
}

export function VenueDetailsPage() {
  const { venueId } = useParams<{ venueId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [venue, setVenue] = useState<ApiVenue | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [isClaimSheetOpen, setIsClaimSheetOpen] = useState(false)
  const [claimForm, setClaimForm] = useState<ClaimFormState>(EMPTY_CLAIM_FORM)
  const [claimError, setClaimError] = useState('')
  const [claimSuccess, setClaimSuccess] = useState<{
    open: boolean
    venueName: string
    venueId: string | null
  }>({ open: false, venueName: '', venueId: null })
  const claimActionTakenRef = useRef(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!venueId) {
        setIsLoading(false)
        return
      }

      const [venueRes, eventsRes] = await Promise.all([
        venuesService.getVenueById(venueId),
        eventsService.getEvents({ venueId }, { limit: 10 }),
      ])

      if (venueRes.success && venueRes.data) {
        setVenue(venueRes.data)
      } else {
        setNotFound(true)
      }
      if (eventsRes.success && eventsRes.data) {
        setUpcomingEvents(eventsRes.data.data)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [venueId])

  const openClaimSheet = () => {
    setClaimError('')
    setClaimForm({
      ...EMPTY_CLAIM_FORM,
      contact_person: String(user?.name || '').trim(),
      contact_email: String(user?.email || '').trim(),
    })
    setIsClaimSheetOpen(true)
  }

  const closeClaimSheet = () => {
    if (isClaiming) return
    setIsClaimSheetOpen(false)
    setClaimError('')
  }

  const updateClaimField = (field: keyof ClaimFormState, value: string) => {
    setClaimForm((current) => ({ ...current, [field]: value }))
    if (claimError) setClaimError('')
  }

  const handleClaimSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!venue) return

    const payload: VenueClaimRequest = {
      contact_name: String(user?.name || claimForm.contact_person || '').trim(),
      contact_person: claimForm.contact_person.trim(),
      contact_title: claimForm.contact_title.trim(),
      contact_phone: claimForm.contact_phone.trim(),
      contact_email: (claimForm.contact_email || user?.email || '').trim(),
      note: claimForm.note?.trim() || undefined,
    }

    if (!payload.contact_person || !payload.contact_title || !payload.contact_phone || !payload.contact_email) {
      setClaimError('Fill in all required fields to continue.')
      return
    }

    setIsClaiming(true)
    const claimRes = await venuesService.requestVenueClaim(venue.id, payload)
    setIsClaiming(false)

    if (!claimRes.success) {
      setClaimError(claimRes.error?.message || 'Claim failed. Please try again.')
      return
    }

    setIsClaimSheetOpen(false)
    setClaimForm(EMPTY_CLAIM_FORM)
    setClaimError('')

    const activatedVenueId = claimRes.data?.venue_id ?? null

    setClaimSuccess({ open: true, venueName: venue.name_display, venueId: activatedVenueId })
    if (!activatedVenueId) {
      setVenue((v) => (v ? { ...v, has_pending_claim: true } : v))
    }
  }

  const handleGoToPortal = async (venueId: string) => {
    try {
      const { data: sessionData } = await supabase!.auth.getSession()
      if (sessionData?.session?.access_token) {
        const context = await sessionService.bootstrap(sessionData.session.access_token)
        useAuthStore.getState().setAuthData(context.user, context.token)
      }
    } catch {
      // Non-fatal — role will sync on next visit
    }
    navigate(`/admin/${venueId}`, { replace: true })
  }

  const handleShare = async () => {
    if (!venue) return
    const url = `${window.location.origin}/venues/${venue.id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: venue.name_display, url })
      } catch (err: any) {
        if (err?.name !== 'AbortError') console.error(err)
      }
    } else {
      await navigator.clipboard.writeText(url).catch(console.error)
    }
  }

  const handleBack = () => {
    const historyIndex = window.history.state?.idx
    if (typeof historyIndex === 'number' && historyIndex > 0) {
      navigate(-1)
      return
    }
    navigate('/venues')
  }

  if (isLoading) return <PageLoading />

  if (notFound || !venue) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="mb-4 rounded-full bg-slate-100 p-4">
          <Frown className="h-8 w-8 text-slate-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Venue not found</h1>
        <p className="text-sm text-slate-500">This venue may have been removed or the link is incorrect.</p>
        <button
          type="button"
          onClick={() => navigate('/venues')}
          className="mt-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white"
        >
          Explore locations
        </button>
      </div>
    )
  }

  return (
    <>
      <VenueDetailsView
        venue={venue}
        upcomingEvents={upcomingEvents}
        onBack={handleBack}
        onShare={handleShare}
        onClaim={openClaimSheet}
        isClaiming={isClaiming}
        onViewSessionDetails={(sessionId) => navigate(`/event/${sessionId}`)}
      />

      <BottomSheet
        open={isClaimSheetOpen}
        onClose={closeClaimSheet}
        title="Start your free trial"
        description="Enter your details and your 14-day trial activates immediately — no card required."
        maxWidthClassName="max-w-xl"
        sheetClassName="max-h-[86vh]"
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={closeClaimSheet}
              disabled={isClaiming}
              className="flex-1 rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="venue-claim-form"
              disabled={isClaiming}
              className="flex-1 rounded-[18px] bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isClaiming ? 'Starting trial…' : 'Claim & start trial'}
            </button>
          </div>
        }
      >
        <form
          id="venue-claim-form"
          className="max-h-[56vh] space-y-4 overflow-y-auto pr-1"
          onSubmit={handleClaimSubmit}
        >
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Location</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{venue.name_display}</p>
            <p className="mt-1 text-sm text-slate-500">{formatClaimLocationAddress(venue.address_display)}</p>
          </div>

          <div className="rounded-[22px] border border-[#dbe7a7] bg-[#e8f0c2] px-4 py-3 text-sm leading-relaxed text-slate-800">
            <strong className="font-bold text-slate-950">Free 14-day trial included.</strong> No card needed,
            billing only starts if you choose to stay.
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Contact person
              </span>
              <input
                type="text"
                value={claimForm.contact_person}
                onChange={(event) => updateClaimField('contact_person', event.target.value)}
                className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="Your name"
                autoComplete="organization-title"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Your role</span>
              <input
                type="text"
                value={claimForm.contact_title}
                onChange={(event) => updateClaimField('contact_title', event.target.value)}
                className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="Manager, owner, operations lead"
                autoComplete="organization-title"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Phone
              </span>
              <input
                type="tel"
                value={claimForm.contact_phone}
                onChange={(event) => updateClaimField('contact_phone', event.target.value)}
                className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="Your phone number"
                autoComplete="tel"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Email</span>
            <input
              type="email"
              value={claimForm.contact_email}
              onChange={(event) => updateClaimField('contact_email', event.target.value)}
              className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="Your business email"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Notes</span>
            <textarea
              value={claimForm.note || ''}
              onChange={(event) => updateClaimField('note', event.target.value)}
              rows={4}
              className="w-full resize-none rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="Anything else you'd like to tell us?"
            />
          </label>

          {claimError && (
            <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {claimError}
            </div>
          )}
        </form>
      </BottomSheet>

      <AlertDialog
        open={claimSuccess.open}
        onClose={() => {
          setClaimSuccess({ open: false, venueName: '', venueId: null })
          if (!claimActionTakenRef.current && claimSuccess.venueId) {
            navigate('/venues', { replace: true })
          }
          claimActionTakenRef.current = false
        }}
        title={claimSuccess.venueId ? 'Venue is live!' : 'Application submitted'}
        description={
          claimSuccess.venueId ? (
            <>
              <span className="font-semibold text-slate-700">{claimSuccess.venueName}</span> is now on the map. Your
              14-day trial has started.
            </>
          ) : (
            <>
              Your claim for <span className="font-semibold text-slate-700">{claimSuccess.venueName}</span> is under
              review. We'll be in touch shortly.
            </>
          )
        }
        type="success"
        actionLabel={claimSuccess.venueId ? 'Go to your venue' : 'Got it'}
        onAction={
          claimSuccess.venueId
            ? () => {
                claimActionTakenRef.current = true
                handleGoToPortal(claimSuccess.venueId!)
              }
            : undefined
        }
      />
    </>
  )
}

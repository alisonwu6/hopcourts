import { FormEvent, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertDialog } from '@/components/AlertDialog';
import { BottomSheet } from '@/components/BottomSheet';
import { useAuthStore } from '@/hooks';
import { venuesService, ApiVenue, VenueClaimRequest } from '../services/venuesService';
import { eventsService } from '@/features/events/services/eventsService';
import { PageLoading } from '@/components/PageLoading';
import { VenueDetailsView } from '../views/VenueDetailsView';

type ClaimFormState = Omit<VenueClaimRequest, 'contact_name'>

const EMPTY_CLAIM_FORM: ClaimFormState = {
  contact_person: '',
  contact_title: '',
  contact_phone: '',
  contact_email: '',
  note: '',
}

export function VenueDetailsPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [venue, setVenue] = useState<ApiVenue | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimSheetOpen, setIsClaimSheetOpen] = useState(false);
  const [claimForm, setClaimForm] = useState<ClaimFormState>(EMPTY_CLAIM_FORM);
  const [claimError, setClaimError] = useState('');
  const [claimDialog, setClaimDialog] = useState<{
    open: boolean;
    type: 'success' | 'error';
    title: string;
    description: string;
  }>({
    open: false,
    type: 'success',
    title: '',
    description: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!venueId) {
        setIsLoading(false)
        return
      }

      const [venueRes, eventsRes] = await Promise.all([
        venuesService.getVenueById(venueId),
        eventsService.getEvents({ venueId, limit: 10 })
      ]);

      if (venueRes.success && venueRes.data) {
        setVenue(venueRes.data);
      }
      if (eventsRes.success && eventsRes.data) {
        setUpcomingEvents(eventsRes.data.data);
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [venueId]);

  const openClaimSheet = () => {
    setClaimError('');
    setClaimForm({
      ...EMPTY_CLAIM_FORM,
      contact_person: String(user?.name || '').trim(),
      contact_email: String(user?.email || '').trim(),
    });
    setIsClaimSheetOpen(true);
  };

  const closeClaimSheet = () => {
    if (isClaiming) return;
    setIsClaimSheetOpen(false);
    setClaimError('');
  };

  const updateClaimField = (field: keyof ClaimFormState, value: string) => {
    setClaimForm((current) => ({ ...current, [field]: value }));
    if (claimError) setClaimError('');
  };

  const handleClaimSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!venue) return;

    const payload: VenueClaimRequest = {
      contact_name: String(user?.name || claimForm.contact_person || '').trim(),
      contact_person: claimForm.contact_person.trim(),
      contact_title: claimForm.contact_title.trim(),
      contact_phone: claimForm.contact_phone.trim(),
      contact_email: (claimForm.contact_email || user?.email || '').trim(),
      note: claimForm.note?.trim() || undefined,
    };

    if (!payload.contact_person || !payload.contact_title || !payload.contact_phone || !payload.contact_email) {
      setClaimError('Please complete all required fields before submitting.');
      return;
    }

    setIsClaiming(true);
    const claimRes = await venuesService.requestVenueClaim(venue.id, payload);
    setIsClaiming(false);

    if (!claimRes.success) {
      setClaimError(claimRes.error?.message || 'Claim request failed.');
      return;
    }

    setIsClaimSheetOpen(false);
    setClaimForm(EMPTY_CLAIM_FORM);
    setClaimError('');
    setClaimDialog({
      open: true,
      type: 'success',
      title: 'Application submitted',
      description: 'Your venue claim is now pending review. The admin team will verify the details you provided.',
    });
  };

  const handleShare = async () => {
    if (!venue) return;
    
    const shareData = {
      title: venue.name_display,
      text: `Check out ${venue.name_display} on SportsMatch!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Clipboard failed:', err);
      }
    }
  };

  const handleBack = () => {
    const historyIndex = window.history.state?.idx;
    if (typeof historyIndex === 'number' && historyIndex > 0) {
      navigate(-1);
      return;
    }
    navigate('/venues');
  };

  if (isLoading || !venue) {
    return <PageLoading />;
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
        title="Claim this venue"
        description="Submit the same operator details the admin team will review when approving this venue."
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
              {isClaiming ? 'Submitting…' : 'Submit claim'}
            </button>
          </div>
        }
      >
        <form id="venue-claim-form" className="max-h-[56vh] space-y-4 overflow-y-auto pr-1" onSubmit={handleClaimSubmit}>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Venue</p>
          <p className="mt-2 text-base font-semibold text-slate-900">{venue.name_display}</p>
          <p className="mt-1 text-sm text-slate-500">{venue.address_display || 'No address listed yet'}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Contact person</span>
            <input
              type="text"
              value={claimForm.contact_person}
              onChange={(event) => updateClaimField('contact_person', event.target.value)}
              className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="Primary contact for verification"
              autoComplete="organization-title"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Role</span>
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
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Phone</span>
            <input
              type="tel"
              value={claimForm.contact_phone}
              onChange={(event) => updateClaimField('contact_phone', event.target.value)}
              className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="Best number for verification"
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
            placeholder={user?.email ? `Default: ${user.email}` : 'Email used for admin approval'}
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Supporting note</span>
          <textarea
            value={claimForm.note || ''}
            onChange={(event) => updateClaimField('note', event.target.value)}
            rows={4}
            className="w-full resize-none rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            placeholder="Explain your relationship to this venue or what the admin should verify."
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
        open={claimDialog.open}
        onClose={() => setClaimDialog((current) => ({ ...current, open: false }))}
        title={claimDialog.title}
        description={claimDialog.description}
        type={claimDialog.type}
        actionLabel="OK"
      />
    </>
  );
}

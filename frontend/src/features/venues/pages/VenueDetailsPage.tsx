import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { venuesService, ApiVenue } from '../services/venuesService';
import { eventsService } from '@/features/events/services/eventsService';
import { PageLoading } from '@/components/PageLoading';
import { VenueDetailsView } from '../views/VenueDetailsView';

export function VenueDetailsPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<ApiVenue | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

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

  const handleClaim = async () => {
    if (!venue) return;
    setIsClaiming(true);

    const contact_name = window.prompt('Your full name')?.trim() || ''
    const contact_person = window.prompt('Contact person')?.trim() || contact_name
    const contact_title = window.prompt('Your role/title (e.g. Manager)')?.trim() || ''
    const contact_phone = window.prompt('Phone number')?.trim() || ''
    const contact_email = window.prompt('Contact email')?.trim() || ''
    const note = window.prompt('Optional note/proof (optional)')?.trim() || undefined

    if (!contact_name || !contact_person || !contact_title || !contact_phone || !contact_email) {
      alert('Claim cancelled. Required fields were missing.')
      setIsClaiming(false)
      return
    }

    const claimRes = await venuesService.requestVenueClaim(venue.id, {
      contact_name,
      contact_person,
      contact_title,
      contact_phone,
      contact_email,
      note,
    })

    if (!claimRes.success) {
      alert(claimRes.error?.message || 'Claim request failed')
      setIsClaiming(false)
      return
    }

    alert('Claim request submitted successfully. We will review it soon.')
    setIsClaiming(false);
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

  if (isLoading || !venue) {
    return <PageLoading />;
  }

  return (
    <VenueDetailsView
      venue={venue}
      upcomingEvents={upcomingEvents}
      onBack={() => navigate('/venues')}
      onShare={handleShare}
      onClaim={handleClaim}
      isClaiming={isClaiming}
    />
  );
}

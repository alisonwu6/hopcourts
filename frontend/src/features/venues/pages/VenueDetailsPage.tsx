import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { venuesService, ApiVenue } from '../services/venuesService';
import { eventsService } from '@/features/events/services/eventsService';
import { PageLoading } from '@/components/PageLoading';
import { VenueDetailsView } from '../views/VenueDetailsView';

export function VenueDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<ApiVenue | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [venueRes, eventsRes] = await Promise.all([
        venuesService.getVenueById(id),
        eventsService.getEvents({ venueId: id, limit: 10 })
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
  }, [id]);

  const handleClaim = async () => {
    if (!venue) return;
    setIsClaiming(true);
    // Mock claim process
    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate(`/claim/${venue.id}`);
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
      onBack={() => navigate(-1)}
      onShare={handleShare}
      onClaim={handleClaim}
      isClaiming={isClaiming}
    />
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { venuePortalService, VenueDashboardData } from '../services/venuePortalService';
import { useAuthStore } from '@/hooks';
import { VenueSessionCreateView } from '../views/VenueSessionCreateView';

const SPORTS = ['Badminton', 'Tennis', 'Pickleball', 'Basketball', 'Table Tennis'];

/**
 * VenueSessionCreatePage - Container for creating one-off venue sessions.
 * Orchestrates API calls and form data management.
 */
export function VenueSessionCreatePage() {
    const { venueId } = useParams<{ venueId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    
    const [loading, setLoading] = useState(true);
    const [venueData, setVenueData] = useState<VenueDashboardData['venue'] | null>(null);
    
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        sportKey: 'BADMINTON',
        description: '',
        date: '',
        startTime: '19:00',
        endTime: '21:00',
        minPeople: 2,
        maxPeople: 4,
        pricePerPerson: 0,
        isFree: true
    });

    useEffect(() => {
        if (venueId) {
            loadVenueInfo(venueId);
        }
    }, [venueId]);

    const loadVenueInfo = async (id: string) => {
        setLoading(true);
        const res = await venuePortalService.getVenueDashboard(id);
        if (res.success && res.data) {
            setVenueData(res.data.venue);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!venueId || !venueData) return;

        // Validation & Preparation
        const startAt = new Date(`${formData.date}T${formData.startTime}:00`);
        const endAt = new Date(`${formData.date}T${formData.endTime}:00`);

        const payload = {
            hostUserId: user?.id,
            venueId: venueId,
            sportKey: formData.sportKey,
            title: formData.title,
            description: formData.description,
            startAt: startAt.toISOString(),
            endAt: endAt.toISOString(),
            locationName: venueData.name_display,
            address: venueData.address_display,
            minPeople: formData.minPeople,
            maxPeople: formData.maxPeople,
            pricePerPerson: formData.isFree ? 0 : formData.pricePerPerson,
            priceMode: 'person',
            isFree: formData.isFree,
            status: 'published',
            visibility: 'public',
            isOfficial: true
        };

        setLoading(true);
        try {
            const res = await venuePortalService.createOfficialSession(venueId, payload);
            if (res.success) {
                navigate(`/venue-portal`);
            } else {
                console.error('Publish failed:', res.error?.message);
            }
        } catch(err) {
            console.error('An error occurred while publishing', err);
        }
        setLoading(false);
    };

    return (
        <VenueSessionCreateView 
            loading={loading}
            venueData={venueData}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/venue-portal')}
            SPORTS={SPORTS}
        />
    );
}

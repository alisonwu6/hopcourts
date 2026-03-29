import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { venuePortalService, ManagedVenue } from '../services/venuePortalService';
import { VenueSessionCreateView } from '../views/VenueSessionCreateView';

const SPORTS = ['Badminton', 'Tennis', 'Pickleball', 'Basketball', 'Table Tennis'];

/**
 * VenueSessionCreatePage - Container for creating one-off venue sessions.
 * Orchestrates API calls and form data management.
 */
export function VenueSessionCreatePage() {
    const { venueId } = useParams<{ venueId: string }>();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [venueData, setVenueData] = useState<ManagedVenue | null>(null);
    const [courts, setCourts] = useState<{ id: string; name: string }[]>([]);
    
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        sportKey: 'BADMINTON',
        court_id: '',
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
        const [myVenueRes, profileRes] = await Promise.all([
            venuePortalService.getMyVenues(),
            venuePortalService.getVenueProfile(id)
        ]);

        if (myVenueRes.success && myVenueRes.data) {
            const current = myVenueRes.data.find((v) => v.id === id) || myVenueRes.data[0] || null
            setVenueData(current)
        }
        if (profileRes.success && profileRes.data) {
            setCourts(profileRes.data.courts || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!venueId || !venueData) return;

        const selectedCourt = courts.find((court) => court.id === formData.court_id)

        const payload = {
            title: formData.title,
            sport_key: formData.sportKey,
            date: formatDateForAdminApi(formData.date),
            start_at: formData.startTime,
            end_at: formData.endTime,
            note: formData.description,
            court_id: formData.court_id || null,
            court_name: selectedCourt?.name || null,
            max_capacity: formData.maxPeople,
            pricing_model: formData.isFree ? 'free' : 'paid',
            fee: formData.isFree ? null : formData.pricePerPerson,
            skill_level: 'beginner',
            gender_rule: 'mixed',
        };

        setLoading(true);
        try {
            const res = await venuePortalService.createVenueEvent(venueId, payload);
            if (res.success) {
                navigate(`/admin`);
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
            onCancel={() => navigate('/admin')}
            SPORTS={SPORTS}
            courts={courts}
        />
    );
}

function formatDateForAdminApi(isoDate: string): string {
    const [year, month, day] = (isoDate || '').split('-')
    if (!year || !month || !day) return isoDate
    return `${day}/${month}/${year}`
}

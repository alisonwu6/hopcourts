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
    const [courts, setCourts] = useState<{ id: string; name: string; supported_sports?: string[] }[]>([]);
    
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
        skillLevel: 'any',
        genderRule: 'mixed',
        priceMode: 'total',
        feeNotes: '',
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
        const [myVenueRes, courtsRes] = await Promise.all([
            venuePortalService.getMyVenues(),
            venuePortalService.getVenueCourts(id)
        ]);

        if (myVenueRes.success && myVenueRes.data) {
            const current = myVenueRes.data.find((v) => v.id === id) || myVenueRes.data[0] || null
            setVenueData(current)
        }
        if (courtsRes.success && courtsRes.data) {
            setCourts(courtsRes.data);
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
            min_people: formData.minPeople,
            max_capacity: formData.maxPeople,
            pricing_model: formData.isFree ? 'free' : 'paid',
            fee: formData.isFree ? null : formData.pricePerPerson,
            price_mode: formData.priceMode,
            price_note: formData.feeNotes || null,
            skill_level: formData.skillLevel,
            gender_rule: formData.genderRule,
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

    const filteredCourts = courts.filter(c => 
        !c.supported_sports || 
        c.supported_sports.length === 0 || 
        c.supported_sports.some(s => s.toUpperCase() === formData.sportKey.toUpperCase())
    );

    // Auto-clear court if no longer valid for the selected sport
    useEffect(() => {
        if (formData.court_id) {
            const isSupported = filteredCourts.some(c => c.id === formData.court_id);
            if (!isSupported) {
                setFormData(prev => ({ ...prev, court_id: '' }));
            }
        }
    }, [formData.sportKey, filteredCourts, formData.court_id]);

    return (
        <VenueSessionCreateView 
            loading={loading}
            venueData={venueData}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/admin')}
            SPORTS={SPORTS}
            courts={filteredCourts}
        />
    );
}

function formatDateForAdminApi(isoDate: string): string {
    const [year, month, day] = (isoDate || '').split('-')
    if (!year || !month || !day) return isoDate
    return `${day}/${month}/${year}`
}

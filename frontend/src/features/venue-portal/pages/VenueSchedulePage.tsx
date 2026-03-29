import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { venuePortalService, ManagedVenue } from '../services/venuePortalService';
import { VenueScheduleView } from '../views/VenueScheduleView';
import { useVenueScheduleData } from '../hooks/useVenueScheduleData';

const DAYS = [
    { key: 1, label: 'Mon' },
    { key: 2, label: 'Tue' },
    { key: 3, label: 'Wed' },
    { key: 4, label: 'Thu' },
    { key: 5, label: 'Fri' },
    { key: 6, label: 'Sat' },
    { key: 0, label: 'Sun' },
];

const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const GENDERS = ['Mixed', 'Men only', 'Women only'];
const SPORTS = ['Badminton', 'Tennis', 'Pickleball', 'Basketball', 'Table Tennis'];

const MOCK_PARTICIPANTS = [
    { id: '1', name: 'Alex Johnson', level_rating: 'Intermediate', has_paid: true },
    { id: '2', name: 'Sam Taylor', level_rating: 'Beginner', has_paid: true },
    { id: '3', name: 'Casey Smith', level_rating: 'Advanced', has_paid: true },
];

export function VenueSchedulePage() {
    // 1. Container orchestration (Route & Params)
    const { venueId } = useParams<{ venueId: string; }>();

    // 2. Logic & State Hook (Round 2 Design)
    const scheduleData = useVenueScheduleData();
    const { 
        slots, 
        generateMockSessions, 
        setViewMode, 
        setSelectedSession 
    } = scheduleData;

    // 3. Page-level UI states (Container owns these)
    const [venue, setVenue] = useState<ManagedVenue | null>(null);
    const [courts, setCourts] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // 4. Data Fetching (Container orchestration)
    useEffect(() => {
        if (venueId) {
            fetchData();
        }
    }, [venueId]);

    const fetchData = async () => {
        setLoading(true);
        const [venuesRes, profileRes] = await Promise.all([
            venuePortalService.getMyVenues(),
            venuePortalService.getVenueProfile(venueId!)
        ]);

        if (venuesRes.success && venuesRes.data) {
            const current = venuesRes.data.find((v) => v.id === venueId) || venuesRes.data[0] || null
            setVenue(current)
        }
        if (profileRes.success && profileRes.data) {
            setCourts(profileRes.data.courts || []);
        }
        setLoading(false);
    };

    // 5. Flow Control (Container orchestration)
    const handleSaveAndGenerate = async () => {
        if (!venueId) return;
        if (slots.length === 0) {
            return;
        }

        setSaving(true);
        try {
            const payloads = slots
                .filter((slot) => slot.start_time && slot.end_time)
                .map((slot) => ({
                    sport_key: String(slot.sport || '').toUpperCase().replace(/\s+/g, '_'),
                    start_at: slot.start_time,
                    end_at: slot.end_time,
                    skill_level: String(slot.level || 'beginner').toLowerCase(),
                    gender_rule: String(slot.gender || 'mixed').toLowerCase().includes('men')
                        ? 'men'
                        : String(slot.gender || 'mixed').toLowerCase().includes('women')
                            ? 'women'
                            : 'mixed',
                    max_capacity: slot.max_participants,
                    pricing_model: slot.price > 0 ? 'paid' : 'free',
                    fee: slot.price > 0 ? slot.price : null,
                }));

            const results = await Promise.all(
                payloads.map((payload) => venuePortalService.createRecurringEvents(venueId, payload))
            );

            const hasFailure = results.some((r) => !r.success);
            if (hasFailure) {
                console.error('Some recurring events failed:', results);
            }

            // Keep local calendar preview in sync until events API list rendering is implemented.
            generateMockSessions(slots);
        } finally {
            setSaving(false);
        }
        setShowSuccess(true);
        
        // Flow: success -> redirect/switch view
        setTimeout(() => {
            setShowSuccess(false);
            setViewMode('calendar');
        }, 2000);
    };

    // 6. Assemble props for View
    return (
        <VenueScheduleView 
            {...scheduleData}
            loading={loading}
            saving={saving}
            venueName={venue?.name_display}
            showSuccess={showSuccess}
            handleSaveAndGenerate={handleSaveAndGenerate}
            DAYS={DAYS}
            SPORTS={SPORTS}
            LEVELS={LEVELS}
            GENDERS={GENDERS}
            courts={courts}
            MOCK_PARTICIPANTS={MOCK_PARTICIPANTS}
            setSelectedSession={(session) => {
                scheduleData.setSelectedSession(session);
                // Potential flow addition here
            }}
            setViewMode={(mode) => {
                scheduleData.setViewMode(mode);
                scheduleData.setSelectedSession(null);
            }}
        />
    );
}

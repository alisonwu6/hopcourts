import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { venuePortalService } from '../services/venuePortalService';
import { VenueProfileView } from '../views/VenueProfileView';
import { 
    Car, 
    Bath, 
    ShowerHead, 
    DoorClosed, 
    Armchair, 
    Lightbulb, 
    Sun, 
    House, 
    ShoppingBag, 
    Users, 
    Droplets, 
    Coffee, 
    SmartphoneNfc, 
    Wifi 
} from 'lucide-react';

const AMENITIES_CATEGORIES = [
    {
        title: 'Facilities',
        items: [
            { label: 'Parking', icon: <Car className="w-3.5 h-3.5" /> },
            { label: 'Restrooms', icon: <Bath className="w-3.5 h-3.5" /> },
            { label: 'Showers', icon: <ShowerHead className="w-3.5 h-3.5" /> },
            { label: 'Changing rooms', icon: <DoorClosed className="w-3.5 h-3.5" /> },
            { label: 'Seating area', icon: <Armchair className="w-3.5 h-3.5" /> }
        ]
    },
    {
        title: 'Playing',
        items: [
            { label: 'Night lighting', icon: <Lightbulb className="w-3.5 h-3.5" /> },
            { label: 'Indoor', icon: <House className="w-3.5 h-3.5" /> },
            { label: 'Outdoor', icon: <Sun className="w-3.5 h-3.5" /> }
        ]
    },
    {
        title: 'Services',
        items: [
            { label: 'Equipment rental', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
            { label: 'Coaching', icon: <Users className="w-3.5 h-3.5" /> }
        ]
    },
    {
        title: 'Convenience',
        items: [
            { label: 'Water refill', icon: <Droplets className="w-3.5 h-3.5" /> },
            { label: 'Vending machine', icon: <Coffee className="w-3.5 h-3.5" /> },
            { label: 'Contactless pay', icon: <SmartphoneNfc className="w-3.5 h-3.5" /> },
            { label: 'Wi-Fi', icon: <Wifi className="w-3.5 h-3.5" /> }
        ]
    }
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface OperatingDay {
    day: string;
    open_time: string;
    close_time: string;
    is_closed: boolean;
}

/**
 * VenueProfilePage - Container for Venue Profile editing.
 * Orchestrates API calls and data flow for the VenueProfileView.
 */
export function VenueProfilePage() {
    const { venueId } = useParams<{ venueId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        logo_url: '',
        description: '',
        amenities: [] as string[],
        operating_hours: DAYS.map(d => ({
            day: d,
            open_time: '06:00',
            close_time: '22:00',
            is_closed: false
        })) as OperatingDay[],
        social_links: {}
    });

    useEffect(() => {
        if (venueId) {
            loadProfile();
        }
    }, [venueId]);

    const loadProfile = async () => {
        if (!venueId) return;
        setLoading(true);
        const res = await venuePortalService.getVenueProfile(venueId);
        if (res.success && res.data) {
            setFormData({
                logo_url: res.data.logo_url || '',
                description: res.data.description || '',
                amenities: res.data.amenities || [],
                operating_hours: res.data.operating_hours || DAYS.map(d => ({
                    day: d,
                    open_time: '06:00',
                    close_time: '22:00',
                    is_closed: false
                })),
                social_links: res.data.social_links || {}
            });
        }
        setLoading(false);
    };

    const handleApplyAll = (open: string, close: string) => {
        setFormData({
            ...formData,
            operating_hours: DAYS.map(d => ({
                day: d,
                open_time: open,
                close_time: close,
                is_closed: false
            }))
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!venueId) return;

        setSaving(true);
        const res = await venuePortalService.updateVenueProfile(venueId, formData);
        if (res.success) {
            navigate('/venue-portal');
        } else {
            console.error('Update failed:', res.error?.message);
        }
        setSaving(false);
    };

    return (
        <VenueProfileView 
            loading={loading}
            saving={saving}
            formData={formData}
            setFormData={setFormData}
            onBack={() => navigate('/venue-portal')}
            onSubmit={handleSubmit}
            onApplyAll={handleApplyAll}
            AMENITIES_CATEGORIES={AMENITIES_CATEGORIES}
        />
    );
}

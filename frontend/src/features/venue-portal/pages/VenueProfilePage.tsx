import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'
import { venuePortalService } from '../services/venuePortalService'
import { cacheGet, cacheSet } from '../services/venuePortalCache'
import { VenuePortalOutletCtx } from '../layouts/VenuePortalLayout'
import { VenueProfileView, VenueProfileData, EditingSection } from '../views/VenueProfileView'
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
  Wifi,
} from 'lucide-react'

const AMENITIES_CATEGORIES = [
  {
    title: 'Facilities',
    items: [
      { label: 'Parking', icon: <Car className="h-3.5 w-3.5" /> },
      { label: 'Restrooms', icon: <Bath className="h-3.5 w-3.5" /> },
      { label: 'Showers', icon: <ShowerHead className="h-3.5 w-3.5" /> },
      { label: 'Changing rooms', icon: <DoorClosed className="h-3.5 w-3.5" /> },
      { label: 'Seating area', icon: <Armchair className="h-3.5 w-3.5" /> },
    ],
  },
  {
    title: 'Playing',
    items: [
      { label: 'Night lighting', icon: <Lightbulb className="h-3.5 w-3.5" /> },
      { label: 'Indoor', icon: <House className="h-3.5 w-3.5" /> },
      { label: 'Outdoor', icon: <Sun className="h-3.5 w-3.5" /> },
    ],
  },
  {
    title: 'Services',
    items: [
      { label: 'Equipment rental', icon: <ShoppingBag className="h-3.5 w-3.5" /> },
      { label: 'Coaching', icon: <Users className="h-3.5 w-3.5" /> },
    ],
  },
  {
    title: 'Convenience',
    items: [
      { label: 'Water refill', icon: <Droplets className="h-3.5 w-3.5" /> },
      { label: 'Vending machine', icon: <Coffee className="h-3.5 w-3.5" /> },
      { label: 'Contactless pay', icon: <SmartphoneNfc className="h-3.5 w-3.5" /> },
      { label: 'Wi-Fi', icon: <Wifi className="h-3.5 w-3.5" /> },
    ],
  },
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

interface OperatingDay {
  day: string
  open_time: string
  close_time: string
  is_closed: boolean
}

const EMPTY_FORM: VenueProfileData = {
  name_display: '',
  address_display: '',
  logo_url: '',
  description: '',
  amenities: [],
  spaces: [],
  operating_hours: [],
  social_links: {},
}

export function VenueProfilePage() {
  const { venueId } = useParams<{ venueId: string }>()
  const navigate = useNavigate()
  const { activeVenue } = useOutletContext<VenuePortalOutletCtx>()

  const [editingSection, setEditingSection] = useState<EditingSection>(null)
  const [saving, setSaving] = useState(false)
  const savedDataRef = useRef<VenueProfileData | null>(null)

  // Read from cache immediately — no spinner on revisit.
  const cachedProfile = venueId ? cacheGet<VenueProfileData>(`profile:${venueId}`) : null
  const [loading, setLoading] = useState(!cachedProfile)
  const [formData, setFormData] = useState<VenueProfileData>(cachedProfile ?? EMPTY_FORM)

  useEffect(() => {
    if (venueId) loadProfile(venueId)
  }, [venueId])

  // Sync venue name/address from layout once it resolves (may lag behind the profile fetch).
  // Also backfills savedDataRef and cache so Cancel restores the correct name.
  useEffect(() => {
    if (!activeVenue) return
    setFormData((prev) => {
      if (prev.name_display === activeVenue.name_display) return prev
      const updated = {
        ...prev,
        name_display: activeVenue.name_display || prev.name_display,
        address_display: activeVenue.address_display || prev.address_display,
      }
      if (savedDataRef.current) {
        savedDataRef.current = { ...savedDataRef.current, ...updated }
        if (venueId) cacheSet(`profile:${venueId}`, savedDataRef.current)
      }
      return updated
    })
  }, [activeVenue])

  const loadProfile = async (id: string) => {
    if (!cachedProfile) setLoading(true)
    const profileRes = await venuePortalService.getVenueProfile(id)

    if (profileRes.success && profileRes.data) {
      const operatingHours = Array.isArray(profileRes.data.operating_hours)
        ? profileRes.data.operating_hours
        : []
      const data: VenueProfileData = {
        name_display: activeVenue?.name_display || formData.name_display || '',
        address_display: activeVenue?.address_display || formData.address_display || '',
        logo_url: profileRes.data.logo_url || '',
        description: profileRes.data.description || '',
        amenities: profileRes.data.amenities || [],
        spaces: Array.isArray(profileRes.data.spaces) ? profileRes.data.spaces : [],
        operating_hours: operatingHours,
        social_links: profileRes.data.social_links || {},
      }
      setFormData(data)
      savedDataRef.current = data
      cacheSet(`profile:${id}`, data)
    }
    setLoading(false)
  }

  const handleApplyAll = (open: string, close: string) => {
    setFormData({
      ...formData,
      operating_hours: DAYS.map((d) => ({
        day: d,
        open_time: open,
        close_time: close,
        is_closed: false,
      })),
    })
  }

  const handleCancelSection = () => {
    if (savedDataRef.current) setFormData(savedDataRef.current)
    setEditingSection(null)
  }

  const handleSaveSection = async (e?: React.FormEvent) => {
    e?.preventDefault?.()
    if (!venueId) return

    setSaving(true)
    const res = await venuePortalService.updateVenueProfile(venueId, formData)
    if (res.success) {
      savedDataRef.current = formData
      cacheSet(`profile:${venueId}`, formData)
      setEditingSection(null)
    } else {
      console.error('Update failed:', res.error?.message)
    }
    setSaving(false)
  }

  return (
    <VenueProfileView
      loading={loading}
      saving={saving}
      editingSection={editingSection}
      onEditSection={setEditingSection}
      formData={formData}
      setFormData={setFormData}
      onBack={() => navigate(-1)}
      onSaveSection={handleSaveSection}
      onCancelSection={handleCancelSection}
      onApplyAll={handleApplyAll}
      AMENITIES_CATEGORIES={AMENITIES_CATEGORIES}
    />
  )
}

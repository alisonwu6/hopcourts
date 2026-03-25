import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { venuePortalService, ManagedVenue, VenueDashboardData } from '../services/venuePortalService'
import { VenueDashboardView } from '../views/VenueDashboardView'

export function VenueDashboardPage() {
  const { venueId } = useParams<{ venueId?: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [venues, setVenues] = useState<ManagedVenue[]>([])
  const [dashboardData, setDashboardData] = useState<VenueDashboardData | null>(null)

  useEffect(() => {
    fetchMyVenues()
  }, [])

  useEffect(() => {
     if (venueId) {
        fetchVenueDashboard(venueId)
     }
  }, [venueId])

  const fetchMyVenues = async () => {
    setLoading(true)
    const res = await venuePortalService.getMyVenues()
    if (res.success && res.data && res.data.length > 0) {
      setVenues(res.data)
      
      // If NO venueId in URL, redirect to the first one
      if (!venueId) {
         navigate(`/venue-portal/${res.data[0].id}`, { replace: true })
      }
    }
    setLoading(false)
  }

  const fetchVenueDashboard = async (id: string) => {
    const res = await venuePortalService.getVenueDashboard(id)
    if (res.success && res.data) {
      setDashboardData(res.data)
    }
  }

  const handleSetVenueId = (id: string) => {
     navigate(`/venue-portal/${id}`)
  }

  return (
    <VenueDashboardView 
      loading={loading}
      venues={venues}
      selectedVenueId={venueId || null}
      setSelectedVenueId={handleSetVenueId}
      dashboardData={dashboardData}
    />
  )
}

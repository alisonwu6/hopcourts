import { useEffect, useState } from 'react'
import { inQldBounds, type LatLng } from '../map/MapPicker'
import type { LocationPickerValue } from './LocationPickerSheet'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export function useLocationPickerSheet({
  open,
  initialValue,
  onConfirm,
}: {
  open: boolean
  initialValue?: LocationPickerValue | null
  onConfirm: (value: LocationPickerValue) => void
}) {
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null)
  const [selectedAddress, setSelectedAddress] = useState('')
  const [addressMode, setAddressMode] = useState<'auto' | 'manual'>('manual')
  const [reverseGeoError, setReverseGeoError] = useState<string | null>(null)
  const [isOutsideArea, setIsOutsideArea] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    if (!open) return
    setReverseGeoError(null)
    setIsOutsideArea(false)
    setIsConfirming(false)
    if (initialValue) {
      setSelectedLocation({ lat: initialValue.lat, lng: initialValue.lng })
      setSelectedAddress(initialValue.address)
      setAddressMode('manual')
    } else {
      setSelectedLocation(null)
      setSelectedAddress('')
      setAddressMode('manual')
    }
  }, [open, initialValue])

  useEffect(() => {
    if (!open) return
    if (addressMode !== 'manual') return
    if (isClearing) return
    const address = selectedAddress.trim()
    if (!address) return

    const handle = window.setTimeout(async () => {
      const loc = await forwardGeocode(address)
      if (loc) {
        if (!inQldBounds(loc)) {
          setIsOutsideArea(true)
          setSelectedLocation(null)
          setReverseGeoError(null)
        } else {
          setIsOutsideArea(false)
          setSelectedLocation(loc)
          setReverseGeoError(null)
        }
      } else {
        setIsOutsideArea(false)
        setReverseGeoError('Please enter a valid address')
      }
    }, 1500)

    return () => window.clearTimeout(handle)
  }, [selectedAddress, open, addressMode, isClearing])

  useEffect(() => {
    if (!open) return
    if (addressMode !== 'auto') return
    if (!selectedLocation) return

    const handle = window.setTimeout(async () => {
      const addr = await reverseGeocode(selectedLocation)
      if (addr) setSelectedAddress(addr)
    }, 600)

    return () => window.clearTimeout(handle)
  }, [selectedLocation, addressMode, open])

  const changeAddress = (address: string) => {
    setSelectedAddress(address)
    setAddressMode('manual')
  }

  const changeLocation = (loc: LatLng) => {
    setSelectedLocation(loc)
    setIsOutsideArea(false)
    setAddressMode('auto')
  }

  const clearAddress = () => {
    setIsClearing(true)
    setSelectedAddress('')
    setSelectedLocation(null)
    setAddressMode('manual')
    setReverseGeoError(null)
    setIsOutsideArea(false)
    window.setTimeout(() => setIsClearing(false), 0)
  }

  const confirm = async () => {
    if (isConfirming) return
    setIsConfirming(true)

    const trimmed = selectedAddress.trim()
    if (!trimmed) {
      setReverseGeoError('Please enter an address')
      setIsConfirming(false)
      return
    }

    let loc = selectedLocation
    if (!loc) {
      loc = await forwardGeocode(trimmed)
    }

    if (!loc) {
      setReverseGeoError('Please enter a valid address')
      setIsConfirming(false)
      return
    }

    onConfirm({ address: trimmed, lat: loc.lat, lng: loc.lng })
    setIsConfirming(false)
  }

  return {
    selectedLocation,
    selectedAddress,
    reverseGeoError,
    isOutsideArea,
    isConfirming,
    changeAddress,
    changeLocation,
    clearAddress,
    confirm,
  }
}

async function forwardGeocode(address: string): Promise<LatLng | null> {
  if (!MAPBOX_TOKEN || !address.trim()) return null
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    address.trim()
  )}.json?language=en&limit=1&country=AU&access_token=${MAPBOX_TOKEN}`
  try {
    const res = await fetch(url)
    const data = await res.json()
    const feature = data?.features?.[0]
    if (!feature?.center) return null
    return { lng: feature.center[0], lat: feature.center[1] }
  } catch {
    return null
  }
}

async function reverseGeocode(loc: LatLng): Promise<string | null> {
  if (!MAPBOX_TOKEN) return null
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${loc.lng},${loc.lat}.json?language=en&limit=1&access_token=${MAPBOX_TOKEN}`
  try {
    const res = await fetch(url)
    const data = await res.json()
    const feature = data?.features?.[0]
    return feature?.place_name || feature?.text || ''
  } catch {
    return null
  }
}

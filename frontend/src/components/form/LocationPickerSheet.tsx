import { BottomSheet } from '../BottomSheet'
import { SheetLayout } from '../SheetLayout'
import { MapPicker, type LatLng } from '../map/MapPicker'
import { useLocationPickerSheet } from './useLocationPickerSheet'

export type LocationPickerValue = {
  address: string
  lat: number
  lng: number
}

interface LocationPickerSheetProps {
  open: boolean
  onClose: () => void
  initialValue?: LocationPickerValue | null
  onConfirm: (value: LocationPickerValue) => void
  title?: string
  subtitle?: string
}

export function LocationPickerSheet({
  open,
  onClose,
  initialValue,
  onConfirm,
  title = 'Select location',
  subtitle = 'Drop a pin or enter your address',
}: LocationPickerSheetProps) {
  const locationPicker = useLocationPickerSheet({ open, initialValue, onConfirm })

  return (
    <BottomSheet open={open} onClose={onClose} disableContainer showHandle={false}>
      <SheetLayout
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        height="tall"
        className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
        contentClassName="flex-1 overflow-hidden px-4 pb-4 pt-2 space-y-3"
        primaryButton={{
          label: locationPicker.isConfirming ? 'Processing...' : 'Confirm',
          onClick: locationPicker.confirm,
          disabled: locationPicker.isConfirming,
        }}
        showHandle={false}
      >
        <div className="space-y-2 rounded-2xl bg-slate-50 px-3 py-3">
          <p className="text-xs font-semibold text-slate-600">Address</p>
          <div className="relative">
            <input
              type="text"
              value={locationPicker.selectedAddress}
              onChange={(e) => locationPicker.changeAddress(e.target.value)}
              placeholder="Street, suburb, postcode"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-3 pr-10 text-sm font-semibold text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none"
            />
            {locationPicker.selectedAddress.trim() && (
              <button
                type="button"
                aria-label="Clear address"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500"
                onClick={locationPicker.clearAddress}
              >
                ×
              </button>
            )}
          </div>
          {locationPicker.reverseGeoError && <p className="text-xs text-red-500">{locationPicker.reverseGeoError}</p>}
        </div>

        <div className="h-[56vh] overflow-hidden rounded-2xl border border-slate-200">
          <MapPicker
            value={locationPicker.selectedLocation ?? undefined}
            variant="satellite"
            onChange={locationPicker.changeLocation}
          />
        </div>
      </SheetLayout>
    </BottomSheet>
  )
}

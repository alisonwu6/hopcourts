import { BottomSheet } from './BottomSheet'

type Location = {
  lat?: number | null
  lng?: number | null
  address?: string | null
  name?: string | null
}

type MapPickerSheetProps = {
  open: boolean
  onClose: () => void
  location: Location
}

function buildAppleMapsUrl({ lat, lng, address, name }: Location): string | null {
  const label = address || name
  if (lat && lng) {
    return label
      ? `maps://maps.apple.com/?q=${encodeURIComponent(label)}&ll=${lat},${lng}`
      : `maps://maps.apple.com/?ll=${lat},${lng}`
  }
  return label ? `maps://maps.apple.com/?q=${encodeURIComponent(label)}` : null
}

function buildGoogleMapsUrl({ lat, lng, address, name }: Location): string | null {
  const label = address || name
  if (lat && lng) {
    return label
      ? `https://www.google.com/maps/place/${encodeURIComponent(label)}/@${lat},${lng},17z`
      : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }
  return label
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`
    : null
}

export function MapPickerSheet({ open, onClose, location }: MapPickerSheetProps) {
  const hasLocation = !!(location.lat || location.lng || location.address || location.name)

  const handlePick = (url: string | null) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      showHandle
      sheetClassName="rounded-t-[28px] bg-white"
    >
      <div className="px-10">
        <p className="mb-4 text-center text-sm font-semibold text-slate-500">Open location in</p>
        {!hasLocation ? (
          <p className="py-4 text-center text-sm text-slate-400">No location set for this event.</p>
        ) : (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handlePick(buildAppleMapsUrl(location))}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left transition active:bg-slate-100"
          >
            <span className="flex h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl">
              <AppleMapsIcon />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Apple Maps</p>
              <p className="text-xs text-slate-400">Default on iPhone &amp; iPad</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handlePick(buildGoogleMapsUrl(location))}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left transition active:bg-slate-100"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
              <GoogleMapsIcon />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Google Maps</p>
              <p className="text-xs text-slate-400">Opens in app if installed</p>
            </div>
          </button>
        </div>
        )}
      </div>
    </BottomSheet>
  )
}

function AppleMapsIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <rect width="40" height="40" fill="#4CB4F1" />
      <ellipse cx="20" cy="35" rx="24" ry="14" fill="#7AB648" />
      <path
        d="M2 38 Q14 22 22 26 Q30 29 38 12"
        stroke="#F0E4C5"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="20" cy="22" rx="3" ry="1.2" fill="rgba(0,0,0,0.18)" />
      <path
        d="M20 7C16.69 7 14 9.69 14 13c0 4.69 6 11 6 11s6-6.31 6-11c0-3.31-2.69-6-6-6z"
        fill="#FF3B30"
      />
      <circle cx="20" cy="13" r="2.4" fill="white" />
    </svg>
  )
}

function GoogleMapsIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

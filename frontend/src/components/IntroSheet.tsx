import { BottomSheet } from './BottomSheet'
import logoUrl from '@/assets/logo.png'

type IntroSheetProps = {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  dismissLabel?: string | null
  showLogo?: boolean
}

export function IntroSheet({
  open,
  onClose,
  title,
  description,
  dismissLabel = '繼續逛逛',
  showLogo = true,
}: IntroSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      showHandle={false}
      sheetClassName="overflow-hidden rounded-t-[44px] border border-white/50 bg-gradient-to-b from-[#FFECCF] via-[#FFF8EB] to-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
      contentClassName="px-6 pb-10 pt-10 text-center text-slate-900"
      backdropClassName="bg-slate-950/50"
    >
      <div className="mx-auto w-full max-w-md">
        {showLogo && (
          <img
            src={logoUrl}
            alt="SportsMatch"
            className="mx-auto h-48 w-auto drop-shadow-lg"
          />
        )}
        {title && <h2 className="text-2xl font-semibold">{title}</h2>}
        {description && (
          <p className="mt-2 whitespace-pre-line text-base font-semibold text-slate-700">
            {description}
          </p>
        )}

        {dismissLabel && (
          <button
            type="button"
            onClick={onClose}
            className="mt-6 inline-flex w-full items-center justify-center text-sm font-semibold text-slate-600 transition hover:text-slate-800"
          >
            {dismissLabel}
          </button>
        )}
      </div>
    </BottomSheet>
  )
}

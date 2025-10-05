import { Plus } from 'lucide-react'
import clsx from 'clsx'

type Props = {
  onClick?: () => void
  className?: string
}

export function CreateCardButton({ onClick, className }: Props) {
  return (
    <button
      type="button"
      onClick={() => {
        console.log('openCreateCard')
        onClick?.()
      }}
      className={clsx(
        'fixed bottom-20 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B8FD2] text-white shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition hover:bg-[#1679b3]',
        className
      )}
      aria-label="Create athlete card"
    >
      <Plus className="h-6 w-6" />
    </button>
  )
}

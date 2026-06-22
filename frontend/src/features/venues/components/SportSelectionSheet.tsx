import clsx from 'clsx'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { BottomSheet } from '@/components'
import { SheetLayout } from '@/components/SheetLayout'
import {
  SPORT_CATEGORY_LABELS,
  type SportSelectionOption,
  useSportSelectionSheet,
} from '../hooks/useSportSelectionSheet'

type SportSelectionSheetProps = {
  open: boolean
  sports: SportSelectionOption[]
  selectedKeys: string[]
  onClose: () => void
  onApply: (keys: string[]) => void
}

export function SportSelectionSheet({ open, sports, selectedKeys, onClose, onApply }: SportSelectionSheetProps) {
  const { categories, groupedSports, pendingKeys, toggleSport } = useSportSelectionSheet({ open, sports, selectedKeys })
  const contentRef = useRef<HTMLDivElement | null>(null)

  const resetScroll = () => {
    if (contentRef.current) contentRef.current.scrollTop = 0
  }

  useLayoutEffect(() => {
    if (!open) return
    resetScroll()
  }, [open])

  useEffect(() => {
    if (!open) return
    const raf = requestAnimationFrame(resetScroll)
    const timer = window.setTimeout(resetScroll, 280)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
    }
  }, [open, categories.length])

  if (!open) return null

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      showHandle={false}
      disableContainer
      sheetClassName="flex h-[86vh] max-h-[86vh] flex-col overflow-hidden"
      contentClassName="flex min-h-0 flex-1 flex-col"
      maxWidthClassName="max-w-[480px]"
    >
      <SheetLayout
        onClose={onClose}
        title="Choose sports"
        subtitle="Select all sports that apply."
        height="tall"
        showHandle
        className="flex h-full w-full flex-col rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
        contentClassName="flex-1 space-y-5 overflow-y-auto px-5 pb-6 pt-6"
        contentRef={contentRef}
        primaryButton={{
          label: 'Apply',
          onClick: () => onApply(pendingKeys),
        }}
      >
        {categories.map((category) => {
          const items = groupedSports[category]
          if (!items?.length) return null
          const label = SPORT_CATEGORY_LABELS[category] || category.replace(/_/g, ' ')

          return (
            <div key={category}>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((sport) => {
                  const active = pendingKeys.includes(sport.key)
                  return (
                    <button
                      key={sport.key}
                      type="button"
                      onClick={() => toggleSport(sport.key)}
                      className={clsx(
                        'flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition',
                        active
                          ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700'
                      )}
                    >
                      {sport.icon && <span className="text-base">{sport.icon}</span>}
                      <span>{sport.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </SheetLayout>
    </BottomSheet>
  )
}

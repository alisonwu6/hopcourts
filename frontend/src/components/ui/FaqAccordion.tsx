import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import type { FaqCategory } from '@/data/faqData'

interface FaqAccordionProps {
  categories: FaqCategory[]
}

export function FaqAccordion({ categories }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {categories.map((cat, ci) => (
        <div key={ci}>
          <div className="mb-2 flex items-center gap-2 px-1">
            <cat.Icon className={clsx('h-4 w-4 flex-shrink-0', cat.iconColor)} />
            <span className={clsx('text-xs font-bold uppercase tracking-widest', cat.labelColor)}>
              {cat.category}
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
            {cat.items.map((item, ii) => {
              const key = `${ci}-${ii}`
              const isOpen = openIndex === key
              return (
                <div key={ii}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : key)}
                    className="flex w-full items-center justify-between px-4 py-4 text-left"
                  >
                    <span className="pr-4 text-base font-medium text-slate-900">{item.q}</span>
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <ChevronDown
                        className={clsx(
                          'h-4 w-4 text-slate-500 transition-transform duration-200',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </span>
                  </button>
                  {isOpen && (
                    <p className="whitespace-pre-line px-4 pb-5 text-sm leading-relaxed text-slate-500">
                      {item.a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

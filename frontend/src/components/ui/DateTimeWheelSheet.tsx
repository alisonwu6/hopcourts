import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react'
import { addDays, format, isSameDay, startOfDay } from 'date-fns'
import { X, CalendarDays } from 'lucide-react'
import { BottomSheet } from '@/components/BottomSheet'

const HOURS = Array.from({ length: 12 }, (_, i) => String(i === 0 ? 12 : i).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const PERIODS = ['AM', 'PM']
const DATE_RANGE = 90
const ITEM_H = 48
const PICKER_H = 240
const DECEL = 0.92

function buildDateItems(minDate: Date) {
  const today = startOfDay(new Date())
  const base = startOfDay(minDate)
  return Array.from({ length: DATE_RANGE }, (_, i) => {
    const d = addDays(base, i)
    return {
      label: isSameDay(d, today) ? `Today ${format(d, 'd MMM')}` : format(d, 'EEE d MMM'),
      date: d,
    }
  })
}

function pmod(n: number, m: number) {
  return ((n % m) + m) % m
}

// ─── WheelColumn ────────────────────────────────────────────────────────────

function WheelColumn({
  items,
  value,
  onChange,
  loop = false,
  flex = 1,
  renderItem,
}: {
  items: string[]
  value: string
  onChange: (val: string) => void
  loop?: boolean
  flex?: number
  renderItem: (item: string, selected: boolean) => ReactNode
}) {
  const n = items.length
  const REPS = loop ? 5 : 1
  const midStart = loop ? n * 2 : 0

  const idxToY = (idx: number) => PICKER_H / 2 - ITEM_H / 2 - idx * ITEM_H
  const yToIdx = (y: number) => (PICKER_H / 2 - ITEM_H / 2 - y) / ITEM_H

  const [y, setY] = useState(() => {
    const vi = items.indexOf(value)
    return idxToY(midStart + Math.max(0, vi))
  })
  const yRef = useRef(y)
  const rafRef = useRef<number | null>(null)

  const stopRaf = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  // Sync position when value changes externally (e.g. sheet re-opens)
  useEffect(() => {
    const vi = items.indexOf(value)
    if (vi < 0) return
    const newY = idxToY(midStart + vi)
    yRef.current = newY
    setY(newY)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup RAF on unmount
  useEffect(() => () => stopRaf(), [])

  const snapToNorm = useCallback(
    (normIdx: number) => {
      stopRaf()
      const target = idxToY(midStart + normIdx)
      const step = () => {
        const diff = target - yRef.current
        if (Math.abs(diff) < 0.3) {
          yRef.current = target
          setY(target)
          onChange(items[normIdx])
          return
        }
        const next = yRef.current + diff * 0.3
        yRef.current = next
        setY(next)
        rafRef.current = requestAnimationFrame(step)
      }
      rafRef.current = requestAnimationFrame(step)
    },
    [items, midStart, onChange], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const snapFromY = useCallback(
    (rawY: number) => {
      const raw = yToIdx(rawY)
      const normIdx = loop
        ? pmod(Math.round(raw), n)
        : Math.max(0, Math.min(n - 1, Math.round(raw)))
      snapToNorm(normIdx)
    },
    [loop, n, snapToNorm], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const divRef = useRef<HTMLDivElement>(null)
  const ts = useRef({ startY: 0, startOff: 0, vel: 0, prevY: 0, prevT: 0 })
  const wheelDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const div = divRef.current
    if (!div) return

    const onStart = (e: TouchEvent) => {
      stopRaf()
      const ty = e.touches[0].clientY
      ts.current = { startY: ty, startOff: yRef.current, vel: 0, prevY: ty, prevT: performance.now() }
    }

    const onMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault()
      const t = ts.current
      const ty = e.touches[0].clientY
      const now = performance.now()
      const dt = now - t.prevT
      if (dt > 0) t.vel = ((ty - t.prevY) / dt) * 16
      t.prevY = ty
      t.prevT = now

      let newY = t.startOff + (ty - t.startY)
      if (!loop) {
        const minY = idxToY(n - 1)
        const maxY = idxToY(0)
        if (newY < minY) newY = minY - Math.pow(minY - newY, 0.5) * 2
        if (newY > maxY) newY = maxY + Math.pow(newY - maxY, 0.5) * 2
      }
      yRef.current = newY
      setY(newY)
    }

    const onEnd = () => {
      let vel = ts.current.vel
      if (Math.abs(vel) > 0.5) {
        const tick = () => {
          vel *= DECEL
          const next = yRef.current + vel
          yRef.current = next
          setY(next)
          if (Math.abs(vel) < 0.5) {
            snapFromY(yRef.current)
            return
          }
          rafRef.current = requestAnimationFrame(tick)
        }
        stopRaf()
        rafRef.current = requestAnimationFrame(tick)
      } else {
        snapFromY(yRef.current)
      }
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      stopRaf()
      if (wheelDebounce.current) clearTimeout(wheelDebounce.current)

      // ~0.5× scale: one mouse-wheel click (~100px delta) ≈ one item (48px)
      let newY = yRef.current - e.deltaY * 0.5
      if (!loop) {
        newY = Math.max(idxToY(n - 1), Math.min(idxToY(0), newY))
      }
      yRef.current = newY
      setY(newY)

      wheelDebounce.current = setTimeout(() => snapFromY(yRef.current), 80)
    }

    div.addEventListener('touchstart', onStart, { passive: true })
    div.addEventListener('touchmove', onMove, { passive: false })
    div.addEventListener('touchend', onEnd, { passive: true })
    div.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      div.removeEventListener('touchstart', onStart)
      div.removeEventListener('touchmove', onMove)
      div.removeEventListener('touchend', onEnd)
      div.removeEventListener('wheel', onWheel)
      if (wheelDebounce.current) clearTimeout(wheelDebounce.current)
    }
  }, [snapFromY]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentNorm = pmod(Math.round(yToIdx(y)), n)

  return (
    <div
      ref={divRef}
      style={{ flex, height: PICKER_H, overflow: 'hidden', position: 'relative', userSelect: 'none' }}
    >
      <div style={{ transform: `translateY(${y}px)`, willChange: 'transform' }}>
        {Array.from({ length: n * REPS }, (_, i) => {
          const norm = i % n
          return (
            <div
              key={i}
              style={{ height: ITEM_H, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => snapToNorm(norm)}
            >
              {renderItem(items[norm], norm === currentNorm)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── DateTimeWheelSheet ──────────────────────────────────────────────────────

type DateTimeWheelSheetProps = {
  open: boolean
  onClose: () => void
  title: string
  value: string
  minValue?: string
  maxDate?: Date
  hideDate?: boolean
  onChange: (isoLocal: string) => void
}

export function DateTimeWheelSheet({
  open,
  onClose,
  title,
  value,
  minValue,
  maxDate,
  hideDate = false,
  onChange,
}: DateTimeWheelSheetProps) {
  const minDate = minValue ? new Date(minValue) : new Date()
  const dateItems = buildDateItems(minDate)
  const dateLabels = dateItems.map((d) => d.label)

  const getInitial = () => {
    const src = value ? new Date(value) : new Date()
    const h = src.getHours()
    const di = dateItems.findIndex((item) => isSameDay(item.date, startOfDay(src)))
    return {
      date: dateLabels[di >= 0 ? di : 0],
      hour: HOURS[h % 12],
      minute: MINUTES[src.getMinutes()],
      period: h < 12 ? 'AM' : 'PM',
    }
  }

  const [selDate, setSelDate] = useState(() => getInitial().date)
  const [selHour, setSelHour] = useState(() => getInitial().hour)
  const [selMinute, setSelMinute] = useState(() => getInitial().minute)
  const [selPeriod, setSelPeriod] = useState(() => getInitial().period)

  useEffect(() => {
    if (!open) return
    const init = getInitial()
    setSelDate(init.date)
    setSelHour(init.hour)
    setSelMinute(init.minute)
    setSelPeriod(init.period)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = () => {
    const di = dateLabels.indexOf(selDate)
    const selectedDate = hideDate
      ? startOfDay(minValue ? new Date(minValue) : new Date())
      : dateItems[di >= 0 ? di : 0].date

    const hourNum = Number(selHour) % 12
    const hour24 = selPeriod === 'AM' ? hourNum : hourNum + 12

    const result = new Date(selectedDate)
    result.setHours(hour24, Number(selMinute), 0, 0)

    if (minValue && result < new Date(minValue)) result.setTime(new Date(minValue).getTime())
    if (maxDate && result > maxDate) result.setTime(maxDate.getTime())

    const pad = (n: number) => String(n).padStart(2, '0')
    const local = `${result.getFullYear()}-${pad(result.getMonth() + 1)}-${pad(result.getDate())}T${pad(result.getHours())}:${pad(result.getMinutes())}`
    onChange(local)
    onClose()
  }

  const renderText = (item: string, selected: boolean): ReactNode => (
    <span
      style={{
        fontSize: selected ? 17 : 14,
        fontWeight: selected ? 700 : 400,
        color: selected ? '#0f172a' : '#94a3b8',
        transition: 'color 0.1s, font-size 0.1s',
        whiteSpace: 'nowrap',
      }}
    >
      {item}
    </span>
  )

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      showHandle={false}
      disableContainer
    >
      <div className="flex flex-col px-5 pb-6 pt-4">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <CalendarDays className="h-5 w-5 text-slate-600" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 className="mb-3 text-2xl font-bold text-slate-900">{title}</h2>

        {/* Picker */}
        <div style={{ position: 'relative', height: PICKER_H, display: 'flex', overflow: 'hidden' }}>
          {/* Gradient mask */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0) 72%, rgba(255,255,255,0.95) 100%)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
          {/* Selection highlight lines */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: PICKER_H / 2 - ITEM_H / 2,
              height: ITEM_H,
              borderTop: '0.5px solid #c7c7cc',
              borderBottom: '0.5px solid #c7c7cc',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* Date column — wider, no loop */}
          {!hideDate && (
            <WheelColumn
              items={dateLabels}
              value={selDate}
              onChange={setSelDate}
              loop={false}
              flex={3}
              renderItem={(item, selected) => (
                <span
                  style={{
                    fontSize: selected ? 15 : 13,
                    fontWeight: selected ? 700 : 400,
                    color: selected ? '#0f172a' : '#94a3b8',
                    transition: 'color 0.1s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item}
                </span>
              )}
            />
          )}

          {/* Hour — loops */}
          <WheelColumn
            items={HOURS}
            value={selHour}
            onChange={setSelHour}
            loop
            renderItem={renderText}
          />

          {/* Minute — loops */}
          <WheelColumn
            items={MINUTES}
            value={selMinute}
            onChange={setSelMinute}
            loop
            renderItem={renderText}
          />

          {/* Period — no loop */}
          <WheelColumn
            items={PERIODS}
            value={selPeriod}
            onChange={setSelPeriod}
            loop={false}
            renderItem={(item, selected) => (
              <span
                style={{
                  fontSize: selected ? 17 : 14,
                  fontWeight: selected ? 700 : 400,
                  color: selected ? '#0f172a' : '#94a3b8',
                  transition: 'color 0.1s, font-size 0.1s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {item}
              </span>
            )}
          />
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className="mt-4 h-12 rounded-2xl bg-blue-600 px-4 text-base font-semibold text-white shadow-sm transition active:bg-blue-700"
        >
          Confirm
        </button>
      </div>
    </BottomSheet>
  )
}

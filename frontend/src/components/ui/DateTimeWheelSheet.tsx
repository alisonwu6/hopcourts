import { useState, useEffect } from 'react'
import { addDays, format, isSameDay, startOfDay } from 'date-fns'
import { X, CalendarDays } from 'lucide-react'
import Picker from 'react-mobile-picker'
import { BottomSheet } from '@/components/BottomSheet'

const HOURS = Array.from({ length: 12 }, (_, i) => String(i === 0 ? 12 : i).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const PERIODS = ['AM', 'PM']
const DATE_RANGE = 90

function buildDateItems(minDate: Date) {
  const today = startOfDay(new Date())
  const base = startOfDay(minDate)
  return Array.from({ length: DATE_RANGE }, (_, i) => {
    const d = addDays(base, i)
    const isToday = isSameDay(d, today)
    return {
      label: isToday ? `Today ${format(d, 'd MMM')}` : format(d, 'EEE d MMM'),
      date: d,
    }
  })
}

type PickerValue = {
  date: string
  period: string
  hour: string
  minute: string
}

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

  const getInitialPicker = (): PickerValue => {
    const src = value ? new Date(value) : new Date()
    const h = src.getHours()
    const targetDay = startOfDay(src)
    const di = dateItems.findIndex((item) => isSameDay(item.date, targetDay))
    return {
      date: dateLabels[di >= 0 ? di : 0],
      period: h < 12 ? 'AM' : 'PM',
      hour: HOURS[h % 12],
      minute: MINUTES[src.getMinutes()],
    }
  }

  const [pickerValue, setPickerValue] = useState<PickerValue>(getInitialPicker)

  useEffect(() => {
    if (open) setPickerValue(getInitialPicker())
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = () => {
    const di = dateLabels.indexOf(pickerValue.date)
    const selectedDate = hideDate
      ? startOfDay(minValue ? new Date(minValue) : new Date())
      : dateItems[di >= 0 ? di : 0].date

    const hourNum = Number(pickerValue.hour) % 12
    const hour24 = pickerValue.period === 'AM' ? hourNum : hourNum + 12

    const result = new Date(selectedDate)
    result.setHours(hour24, Number(pickerValue.minute), 0, 0)

    if (minValue && result < new Date(minValue)) result.setTime(new Date(minValue).getTime())
    if (maxDate && result > maxDate) result.setTime(maxDate.getTime())

    const pad = (n: number) => String(n).padStart(2, '0')
    const local = `${result.getFullYear()}-${pad(result.getMonth() + 1)}-${pad(result.getDate())}T${pad(result.getHours())}:${pad(result.getMinutes())}`
    onChange(local)
    onClose()
  }

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

        <Picker
          value={pickerValue}
          onChange={setPickerValue}
          wheelMode="natural"
          itemHeight={48}
          height={240}
          className="w-full"
          style={{ display: 'flex' }}
        >
          {/* Date — wider column, hidden when hideDate=true */}
          {!hideDate && (
            <Picker.Column
              name="date"
              style={{ flex: 3, minWidth: 0 }}
            >
              {dateLabels.map((label) => (
                <Picker.Item
                  key={label}
                  value={label}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {({ selected }) => (
                    <span
                      style={{
                        fontSize: selected ? 17 : 14,
                        fontWeight: selected ? 700 : 400,
                        color: selected ? '#0f172a' : '#94a3b8',
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </span>
                  )}
                </Picker.Item>
              ))}
            </Picker.Column>
          )}

          {/* Period */}
          <Picker.Column
            name="period"
            style={{ flex: 1 }}
          >
            {PERIODS.map((p) => (
              <Picker.Item
                key={p}
                value={p}
              >
                {({ selected }) => (
                  <span
                    style={{
                      fontSize: selected ? 17 : 14,
                      fontWeight: selected ? 700 : 400,
                      color: selected ? '#0f172a' : '#94a3b8',
                      transition: 'all 0.15s',
                    }}
                  >
                    {p}
                  </span>
                )}
              </Picker.Item>
            ))}
          </Picker.Column>

          {/* Hour */}
          <Picker.Column
            name="hour"
            style={{ flex: 1 }}
          >
            {HOURS.map((h) => (
              <Picker.Item
                key={h}
                value={h}
              >
                {({ selected }) => (
                  <span
                    style={{
                      fontSize: selected ? 17 : 14,
                      fontWeight: selected ? 700 : 400,
                      color: selected ? '#0f172a' : '#94a3b8',
                      transition: 'all 0.15s',
                    }}
                  >
                    {h}
                  </span>
                )}
              </Picker.Item>
            ))}
          </Picker.Column>

          {/* Minute */}
          <Picker.Column
            name="minute"
            style={{ flex: 1 }}
          >
            {MINUTES.map((m) => (
              <Picker.Item
                key={m}
                value={m}
              >
                {({ selected }) => (
                  <span
                    style={{
                      fontSize: selected ? 17 : 14,
                      fontWeight: selected ? 700 : 400,
                      color: selected ? '#0f172a' : '#94a3b8',
                      transition: 'all 0.15s',
                    }}
                  >
                    {m}
                  </span>
                )}
              </Picker.Item>
            ))}
          </Picker.Column>
        </Picker>

        <button
          type="button"
          onClick={handleConfirm}
          className="h-12 rounded-2xl px-4 text-base font-semibold shadow-sm transition bg-blue-600 text-white"
        >
          Confirm
        </button>
      </div>
    </BottomSheet>
  )
}

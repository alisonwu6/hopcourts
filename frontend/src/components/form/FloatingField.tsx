import clsx from 'clsx'
import { useId } from 'react'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type CommonFloatingProps = {
  label: string
  supportingText?: string
  characterLimit?: number
  hasError?: boolean
}

export type FloatingFieldProps =
  | ({ as?: 'input' } & InputHTMLAttributes<HTMLInputElement> & CommonFloatingProps)
  | ({ as: 'textarea' } & TextareaHTMLAttributes<HTMLTextAreaElement> & CommonFloatingProps)

export function FloatingField(props: FloatingFieldProps) {
  const { label, supportingText, characterLimit, hasError, ...domProps } = props as any
  const as = domProps.as ?? 'input'
  const id = useId()
  const value =
    'value' in domProps
      ? (domProps.value ?? '')
      : 'defaultValue' in domProps
        ? ((domProps.defaultValue as string | number | readonly string[] | undefined) ?? '')
        : ''
  const hasValue =
    typeof value === 'number'
      ? true
      : Array.isArray(value)
        ? value.length > 0
        : Boolean(value && String(value).trim().length > 0)

  const baseClasses = clsx(
    'peer block w-full appearance-none min-h-[3.5rem] rounded-[14px] border-2 bg-white px-4 pt-7 pb-3 text-base text-slate-900 transition focus:shadow-[0_0_0_1px_rgba(0,0,0,0.2)] focus:outline-none disabled:opacity-60',
    hasError ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-slate-900'
  )
  const labelClasses =
    'pointer-events-none absolute left-4 top-2 text-sm font-semibold text-slate-600 bg-white px-1'
  const infoText =
    typeof value === 'string' && characterLimit
      ? `${Math.max(characterLimit - value.length, 0)} characters available`
      : supportingText

  if (as === 'textarea') {
    const { as: _as, className, rows = 4, ...rest } = domProps as Extract<FloatingFieldProps, { as: 'textarea' }>
    return (
      <div className="space-y-1">
        <div className="relative">
          <textarea
            {...rest}
            id={id}
            rows={rows}
            placeholder={rest.placeholder ?? ' '}
            data-filled={hasValue}
            className={clsx(baseClasses, 'resize-none', className)}
          />
          <label htmlFor={id} className={labelClasses}>
            {label}
          </label>
        </div>
        {infoText && <p className={clsx('text-xs', hasError ? 'text-red-500' : 'text-slate-500')}>{infoText}</p>}
      </div>
    )
  }

  const { as: _as, className, type = 'text', ...rest } = domProps as Extract<FloatingFieldProps, { as?: 'input' }>
  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          {...rest}
          id={id}
          type={type}
          placeholder={rest.placeholder ?? ' '}
          data-filled={hasValue}
          className={clsx(baseClasses, className)}
        />
        <label htmlFor={id} className={labelClasses}>
          {label}
        </label>
      </div>
      {infoText && <p className={clsx('text-xs', hasError ? 'text-red-500' : 'text-slate-500')}>{infoText}</p>}
    </div>
  )
}

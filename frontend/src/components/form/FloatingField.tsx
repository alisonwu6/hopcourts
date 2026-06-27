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

  const overLimit = typeof value === 'string' && characterLimit ? value.length > characterLimit : false
  const showError = hasError || overLimit
  const infoText =
    typeof value === 'string' && characterLimit
      ? overLimit
        ? `${value.length - characterLimit} characters over the limit`
        : `${characterLimit - value.length} characters remaining`
      : supportingText

  const baseClasses = clsx(
    'peer block w-full appearance-none min-h-[3.5rem] rounded-[14px] border-2 bg-white px-4 pt-7 pb-3 text-base text-slate-900 transition focus:shadow-[0_0_0_1px_rgba(0,0,0,0.2)] focus:outline-none disabled:opacity-60',
    showError ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-slate-900'
  )
  const labelClasses =
    'pointer-events-none absolute left-4 top-2 text-sm font-semibold text-slate-600 bg-white px-1'

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
        {characterLimit != null && typeof value === 'string' && value.length > 0 && (
          <p className={clsx('text-right text-xs transition-colors duration-500', showError ? 'text-red-500' : 'text-slate-500')}>
            {infoText}
          </p>
        )}
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
      {characterLimit != null && typeof value === 'string' && value.length > 0 && (
        <p className={clsx('text-right text-xs transition-colors duration-500', showError ? 'text-red-500' : 'text-slate-500')}>
          {infoText}
        </p>
      )}
    </div>
  )
}

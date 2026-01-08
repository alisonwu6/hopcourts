import clsx from 'clsx'
import type { HTMLAttributes } from 'react'

type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  size?: number
  thickness?: number
}

export function Spinner({ className, size = 18, thickness = 2, ...rest }: SpinnerProps) {
  return (
    <span
      className={clsx('inline-block animate-spin text-slate-500', className)}
      style={{
        width: size,
        height: size,
        borderWidth: thickness,
        borderStyle: 'solid',
        borderColor: 'rgba(148, 163, 184, 0.6)',
        borderTopColor: 'rgba(51, 65, 85, 0.9)',
        borderRadius: '9999px',
      }}
      {...rest}
    />
  )
}

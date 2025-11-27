import clsx from 'clsx'
import { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary'
type ButtonSize = 'md' | 'sm'

type ButtonProps = {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  textClassName?: string
}

const baseClass =
  'inline-flex items-center justify-center rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2'

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-6 py-3',
  sm: 'px-4 py-2 text-sm',
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300',
  secondary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-200',
  tertiary: 'text-blue-600 hover:underline focus:ring-transparent',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className,
  type = 'button',
  textClassName,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        baseClass,
        sizeClasses[size],
        variantClasses[variant],
        textClassName,
        className,
      )}
    >
      {children}
    </button>
  )
}

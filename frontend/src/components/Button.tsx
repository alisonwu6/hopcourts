import { ReactNode } from 'react'
import clsx from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary'

type ButtonProps = {
  children: ReactNode
  variant?: ButtonVariant
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

const baseClass =
  'px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2'

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400',
  secondary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-300',
  tertiary: 'text-blue-600 hover:underline focus:ring-transparent',
}

export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  className,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(baseClass, variantClass[variant], className)}
    >
      {children}
    </button>
  )
}

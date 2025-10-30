import clsx from 'clsx'
import { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary'
type StoryLine = 'player' | 'venue' | 'host'

type ButtonProps = {
  children: ReactNode
  variant?: ButtonVariant
  storyLine?: StoryLine
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

const baseClass =
  'px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2'

const toneVariant: Record<
  StoryLine,
  Record<ButtonVariant, string>
> = {
  player: {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300',
    secondary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-200',
    tertiary: 'text-blue-600 hover:underline focus:ring-transparent',
  },
  venue: {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300',
    secondary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-200',
    tertiary: 'text-blue-600 hover:underline focus:ring-transparent',
  },
  host: {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300',
    secondary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-200',
    tertiary: 'text-blue-600 hover:underline focus:ring-transparent',
  },
}

export function Button({
  children,
  variant = 'primary',
  storyLine = 'player',
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
      className={clsx(baseClass, toneVariant[storyLine][variant], className)}
    >
      {children}
    </button>
  )
}

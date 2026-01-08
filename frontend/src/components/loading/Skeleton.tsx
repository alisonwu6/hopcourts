import clsx from 'clsx'
import type { HTMLAttributes } from 'react'

type Rounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  rounded?: Rounded
}

const roundedMap: Record<Rounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
}

export function Skeleton({ className, rounded = 'lg', ...rest }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden bg-slate-200/80',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.2s_ease-in-out_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
        roundedMap[rounded],
        className
      )}
      {...rest}
    />
  )
}

// Shimmer animation
// tailwindcss doesn't have this built-in; define keyframes via style tag
export function SkeletonStyles() {
  return (
    <style>
      {`@keyframes shimmer {
        100% { transform: translateX(100%); }
      }`}
    </style>
  )
}

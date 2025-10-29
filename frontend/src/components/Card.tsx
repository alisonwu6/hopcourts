import { ReactNode } from 'react'
import clsx from 'clsx'

type CardProps = {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return <div className={clsx('bg-white rounded-lg shadow p-4', className)}>{children}</div>
}

import clsx from 'clsx'
import type { AthleteCardProps } from '@/interfaces/athlete'
import { AthleteCard } from './AthleteCard'

interface Props {
  athletes: AthleteCardProps[]
  className?: string
}

export function AthleteGrid({ athletes, className }: Props) {
  return (
    <div
      className={clsx(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6',
        className
      )}
    >
      {athletes.map((athlete) => (
        <AthleteCard
          key={athlete.id}
          athlete={athlete}
        />
      ))}
    </div>
  )
}

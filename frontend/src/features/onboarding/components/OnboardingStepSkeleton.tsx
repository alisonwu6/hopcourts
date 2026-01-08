import { Skeleton, SkeletonStyles } from '@/components/loading/Skeleton'

export function OnboardingStepSkeleton() {
  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <SkeletonStyles />
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
      <div className="space-y-3 pt-2">
        <Skeleton className="h-11 w-full rounded-2xl" />
        <Skeleton className="h-11 w-full rounded-2xl" />
        <Skeleton className="h-11 w-3/4 rounded-2xl" />
      </div>
      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
  )
}

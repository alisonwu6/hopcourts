import { Skeleton, SkeletonStyles } from '@/components/loading/Skeleton'

export function SessionDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#f3f5f8] pb-12">
      <SkeletonStyles />
      <div className="mx-auto w-full max-w-[400px] space-y-6 pb-8">
        <Skeleton className="h-[230px] w-full rounded-3xl" />
        <div className="-mt-6 rounded-t-[32px] bg-white p-5 shadow-[0_25px_70px_rgba(15,41,77,0.12)]">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>

          <div className="my-6 h-px bg-slate-200" />

          <div className="mt-2 flex justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          <div className="mt-4 space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-36" />
          </div>

          <div className="my-6 h-px bg-slate-200" />

          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>

          <div className="my-6 h-px bg-slate-200" />

          <div className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
        <Skeleton className="mx-auto h-12 w-full max-w-[420px] rounded-full" />
      </div>
    </div>
  )
}

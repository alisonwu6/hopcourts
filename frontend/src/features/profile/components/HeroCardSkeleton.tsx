export function HeroCardSkeleton() {
  return (
    <div className="bg-slate-200">
      <article className="flex w-full flex-col gap-3 rounded-none bg-transparent px-4 py-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="h-24 w-24 flex-shrink-0 animate-pulse rounded-full bg-slate-300" />

          <div className="flex flex-1 flex-col gap-2">
            {/* Name + vibe */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1.5">
                <div className="h-5 w-28 animate-pulse rounded bg-slate-300" />
                <div className="h-3.5 w-20 animate-pulse rounded bg-slate-300" />
              </div>
              <div className="h-[26px] w-16 animate-pulse rounded-full bg-slate-300" />
            </div>

            {/* Stats row */}
            <div className="flex w-full divide-x divide-slate-300/50 border-y border-slate-300/50 py-2">
              {(['Hosted', 'Joined', 'Mates'] as const).map((label, i) => (
                <div key={label} className={`flex-1 ${i === 0 ? 'pr-2' : 'pl-4'}`}>
                  <div className="h-5 w-5 animate-pulse rounded bg-slate-300" />
                  <span className="mt-0.5 block whitespace-nowrap text-[10px] font-medium text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sports tags */}
        <div className="-mt-2 flex flex-col gap-2 text-[12px]">
          <div>
            <span className="uppercase tracking-wide text-slate-500">Favourites:</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {[72, 56, 80].map((w) => (
                <div key={w} className="h-[22px] animate-pulse rounded-full bg-slate-300" style={{ width: w }} />
              ))}
            </div>
          </div>
          <div>
            <span className="uppercase tracking-wide text-slate-500">Want to try:</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {[64, 80].map((w) => (
                <div key={w} className="h-[22px] animate-pulse rounded-full bg-slate-300" style={{ width: w }} />
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="flex items-start gap-2 pt-1">
            <span className="flex w-[3px] shrink-0 self-stretch animate-pulse rounded bg-slate-300" />
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="h-3 w-full animate-pulse rounded bg-slate-300" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-slate-300" />
            </div>
          </div>
        </div>
      </article>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 py-2">
        <div className="h-[30px] w-40 animate-pulse rounded-lg bg-slate-300" />
        <div className="h-[30px] w-40 animate-pulse rounded-lg bg-slate-300" />
      </div>
    </div>
  )
}

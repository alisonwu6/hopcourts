export function EmptyBlock({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white/80 px-5 py-8 text-center shadow-sm">
      <p className="text-lg font-extrabold text-slate-900">{title}</p>
      <p className="mt-2 text-sm font-medium text-slate-600">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 w-full max-w-[220px] rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

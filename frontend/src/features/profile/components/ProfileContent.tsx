import clsx from 'clsx'
import { EmptyBlock } from '@/components/EmptyBlock'
import { dayLabels } from '@/features/profile/constants'
import type { GoalState } from '@/features/profile/types'

type Props = {
  goal: GoalState | null
  goalDaySlots: Record<string, string[]>
  completion: number
  sessionsCompleted?: number
  onOpenGoalSheet: () => void
  showEdit?: boolean
}

export function ProfileContent({
  goal,
  goalDaySlots,
  completion,
  sessionsCompleted = 0,
  onOpenGoalSheet,
  showEdit = true,
}: Props) {
  const preferredTimes = Object.keys(dayLabels).map((day) => ({
    dayLabel: dayLabels[day] ?? day,
    slots: goalDaySlots[day]?.length ? goalDaySlots[day].join(', ') : '尚未設定',
  }))

  const hasDaySlots = Object.values(goalDaySlots).some((slots) => (slots || []).length > 0)
  const hasPrefs =
    !!goal &&
    ((goal.sessionsPerWeek && goal.sessionsPerWeek.trim() !== '') ||
      (goal.timeOfDay && goal.timeOfDay.trim() !== '') ||
      hasDaySlots)

  if (!hasPrefs) {
    return (
      <div className="px-3">
        <EmptyBlock
          title="尚未設定每週節奏"
          description="設定你的每週目標次數與時段，幫你配對到適合的活動與夥伴。"
          actionLabel={showEdit ? '設定每週節奏' : undefined}
          onAction={showEdit ? onOpenGoalSheet : undefined}
        />
      </div>
    )
  }

  return (
    <div className="px-3">
      <div className="space-y-4 overflow-hidden rounded-3xl border border-blue-100 bg-blue-50 shadow-sm">
        <div className="flex items-start justify-between px-5 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            我的每週節奏
          </p>
          {showEdit && (
            <button
              type="button"
              onClick={onOpenGoalSheet}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 "
            >
              編輯
            </button>
          )}
        </div>
        <div className="space-y-3 px-5">
          <p className="text-xl font-bold text-slate-900">
            本週節奏：{goal?.sessionsPerWeek ? `${goal.sessionsPerWeek} 次` : '未設定'}
          </p>
          <p className="text-sm font-semibold text-slate-400">
            本週完成度 {completion}% — {completion === 0 ? '從 0 開始，慢慢來。' : '穩穩前進。'}
          </p>
          <div className="h-3 overflow-hidden rounded-full bg-blue-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="text-base font-semibold text-emerald-600">
            你出現過 {sessionsCompleted || 0} 次 — 讓多巴胺起飛
          </p>
        </div>
        <div className="space-y-2 border-t border-blue-100 bg-white/60 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            你的偏好時段
          </p>
          <p className="text-sm font-semibold text-slate-700">
            常用時段：
            {goal?.timeOfDay && goal.timeOfDay.trim() ? goal.timeOfDay : '尚未設定'}
          </p>
          <div className="space-y-1">
            {preferredTimes.map(({ dayLabel, slots }) => (
              <div
                key={dayLabel}
                className={clsx(
                  'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-800',
                  'bg-slate-50'
                )}
              >
                <span>{dayLabel}</span>
                <span className="font-medium text-slate-500">{slots}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

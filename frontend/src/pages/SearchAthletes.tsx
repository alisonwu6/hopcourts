import MainLayout from '@/layouts/MainLayout'
import Input from '@/components/ui/Input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function SearchAthletes() {

  return (
    <MainLayout>
      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="space-y-4">
          <Input
            placeholder="Search by player, sport, or crew vibe"
            aria-label="Search athletes"
            className="rounded-full"
          />
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Sports</h3>
            <div className="flex flex-wrap gap-2">
              {['Basketball', 'Badminton', 'Climbing', 'Running'].map((sport) => (
                <Badge
                  key={sport}
                  variant="outline"
                  className="cursor-pointer rounded-full border-transparent bg-[var(--color-secondary)]/10 px-3 py-1 text-xs text-[var(--color-secondary)]"
                >
                  {sport}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Level</h3>
            <div className="flex flex-wrap gap-2">
              {['Beginner', 'Social', 'Intermediate', 'Advanced'].map((level) => (
                <Badge
                  key={level}
                  variant="outline"
                  className="cursor-pointer rounded-full border-transparent bg-slate-100 px-3 py-1 text-xs text-slate-600"
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Preferred time</h3>
            <div className="flex flex-wrap gap-2">
              {['Early mornings', 'After work', 'Weekend mornings'].map((slot) => (
                <Badge
                  key={slot}
                  variant="outline"
                  className="cursor-pointer rounded-full border-transparent bg-slate-100 px-3 py-1 text-xs text-slate-600"
                >
                  {slot}
                </Badge>
              ))}
            </div>
          </div>
          <Button className="w-full rounded-full">Apply filters</Button>
        </div>
      </section>
    </MainLayout>
  )
}

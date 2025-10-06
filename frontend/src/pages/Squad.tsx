import { useMemo } from 'react'
import { SquadHeader } from '@/components/squad/SquadHeader'
import { SquadCardCore } from '@/components/squad/SquadCardCore'
import { SquadCardCasual } from '@/components/squad/SquadCardCasual'
import { SquadCardArchived } from '@/components/squad/SquadCardArchived'
import { CreateCardButton } from '@/components/athlete/CreateCardButton'
import { mockSquadPageData } from '@/data/mock/squads'

export default function Squad() {
  const data = useMemo(() => mockSquadPageData, [])

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 text-[#051333]">
      <SquadHeader squad={data.living} />

      <main className="mx-auto w-full max-w-4xl space-y-8 px-4 pb-16 sm:px-6">
        <section className="space-y-4">
          {data.coreSquads.map((squad) => (
            <SquadCardCore key={squad.id} squad={squad} />
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6E6E6E]">Casual squads</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.casualSquads.map((squad) => (
              <SquadCardCasual key={squad.id} squad={squad} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6E6E6E]">Archived</h2>
          <div className="space-y-2">
            {data.archivedSquads.map((squad) => (
              <SquadCardArchived key={squad.id} squad={squad} />
            ))}
          </div>
        </section>
      </main>

      <CreateCardButton className="bottom-24" />
    </div>
  )
}

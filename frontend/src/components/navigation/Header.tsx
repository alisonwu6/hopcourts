import { Link } from 'react-router-dom'
import { colors, appName } from '../lib/theme'
import logoUrl from '@/assets/sportsmatch.png'

export default function Header() {
  return (
    <header className="sticky top-0 z-10">
      <div className="mx-auto max-w-5xl flex items-center justify-center">
        <Link
          to="/home"
          className="flex items-center"
        >
          <img
            className="h-12 w-auto"
            src={logoUrl}
            alt="SportsMatch logo"
            onError={(e) => {
              const t = e.target as HTMLImageElement
              t.style.display = 'none'
            }}
          />
        </Link>
        {/* <nav className="flex items-center gap-4 text-sm">
          <Link to="/home">Explore</Link>
          <Link to="/create">Create</Link>
          <Link to="/squad">Squad</Link>
          <Link to="/me">Me</Link>
        </nav> */}
      </div>
    </header>
  )
}

import { Link } from 'react-router'
import { PATHS } from '../router/paths'

export function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-5xl font-semibold text-primary">404</p>
      <h1 className="text-lg font-medium text-gray-900">გვერდი ვერ მოიძებნა</h1>
      <Link to={PATHS.home} className="text-sm font-medium text-primary hover:underline">
        მთავარ გვერდზე დაბრუნება
      </Link>
    </main>
  )
}

import { Link } from 'react-router'
import { ROLE_LABELS } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import { PATHS } from '../../router/paths'
import { getDisplayName } from '../../utils/user'
import { Button } from '../ui/Button'

export function PlaceholderPage({ title }: { title: string }) {
  const { user, signOut } = useAuth()

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center gap-4 px-4">
      <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
        {user ? ROLE_LABELS[user.role] : 'სტუმარი'}
      </span>
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>

      {user ? (
        <>
          <p className="text-gray-600">გამარჯობა, {getDisplayName(user)}!</p>
          <Button variant="secondary" onClick={signOut}>
            გასვლა
          </Button>
        </>
      ) : (
        <div className="flex gap-3">
          <Link to={PATHS.signIn} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover">
            შესვლა
          </Link>
          <Link to={PATHS.signUp} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            რეგისტრაცია
          </Link>
        </div>
      )}
    </main>
  )
}

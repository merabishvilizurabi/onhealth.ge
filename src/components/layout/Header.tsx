import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { HOME_BY_ROLE, PATHS } from '../../router/paths'
import { getDisplayName } from '../../utils/user'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link to={PATHS.home} className="text-xl font-semibold text-primary">
          OnHealth.ge
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              {user.role !== 'patient' && (
                <Link to={HOME_BY_ROLE[user.role]} className="font-medium text-gray-700 hover:text-primary">
                  პანელი
                </Link>
              )}
              <span className="hidden text-gray-500 sm:inline">{getDisplayName(user)}</span>
              <button
                type="button"
                onClick={signOut}
                className="rounded-lg border border-gray-300 px-3 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                გასვლა
              </button>
            </>
          ) : (
            <>
              <Link to={PATHS.signIn} className="font-medium text-gray-700 hover:text-primary">
                შესვლა
              </Link>
              <Link
                to={PATHS.signUp}
                className="rounded-lg bg-primary px-3 py-2 font-medium text-white hover:bg-primary-hover"
              >
                რეგისტრაცია
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

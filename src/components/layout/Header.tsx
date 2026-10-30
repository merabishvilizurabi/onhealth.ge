import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { useCity } from '../../hooks/useCity'
import { HOME_BY_ROLE, PATHS } from '../../router/paths'
import { getDisplayName } from '../../utils/user'

export function Header() {
  const { user, signOut } = useAuth()
  const { cities, city, setCity } = useCity()

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link to={PATHS.home} className="text-xl font-semibold text-primary">
          OnHealth.ge
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm">
          {/* The user's city: the main page shows doctors from this city */}
          <select
            aria-label="თქვენი ქალაქი"
            value={city}
            onChange={(event) => setCity(event.currentTarget.value)}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">ყველა ქალაქი</option>
            {cities.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          {user ? (
            <>
              {user.role === 'doctor' && (
                <Link to={PATHS.doctorSchedule} className="font-medium text-gray-700 hover:text-primary">
                  განრიგი
                </Link>
              )}
              {user.role !== 'patient' && (
                <Link to={HOME_BY_ROLE[user.role]} className="font-medium text-gray-700 hover:text-primary">
                  პანელი
                </Link>
              )}
              {/* A patient's name opens their profile (visits and account settings) */}
              {user.role === 'patient' ? (
                <Link to={PATHS.profile} className="font-medium text-gray-700 hover:text-primary">
                  {getDisplayName(user)}
                </Link>
              ) : (
                <span className="hidden text-gray-500 sm:inline">{getDisplayName(user)}</span>
              )}
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

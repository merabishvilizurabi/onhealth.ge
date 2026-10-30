import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { HOME_BY_ROLE, PATHS } from '../../router/paths'
import { LogoMark } from './LogoMark'

const linkClass = 'text-gray-900 hover:text-primary'

export function Footer() {
  const { user } = useAuth()

  return (
    <footer className="bg-band">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-14 pb-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <div className="flex max-w-xs flex-col gap-3">
            <Link to={PATHS.home} className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-gray-900">
              <LogoMark className="size-8 text-primary" />
              OnHealth.ge
            </Link>
            <p className="text-gray-900">იპოვე ექიმი შენს ქალაქში და დაჯავშნე ვიზიტი ონლაინ — დარეკვისა და რიგის გარეშე.</p>
          </div>
          <nav aria-label="პლატფორმა" className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-gray-900">პლატფორმა</h2>
            <Link to={PATHS.home} className={linkClass}>
              მთავარი
            </Link>
            <Link to={PATHS.doctors} className={linkClass}>
              ექიმები და ფილტრები
            </Link>
          </nav>
          <nav aria-label="ანგარიში" className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-gray-900">ანგარიში</h2>
            {user ? (
              <Link to={user.role === 'patient' ? PATHS.profile : HOME_BY_ROLE[user.role]} className={linkClass}>
                {user.role === 'patient' ? 'ჩემი პროფილი' : 'ჩემი პანელი'}
              </Link>
            ) : (
              <>
                <Link to={PATHS.signIn} className={linkClass}>
                  შესვლა
                </Link>
                <Link to={PATHS.signUp} className={linkClass}>
                  რეგისტრაცია პაციენტისა და კლინიკისთვის
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-gray-400/50 pt-6 text-sm font-medium text-gray-900">
          <p>© {new Date().getFullYear()} OnHealth.ge — ფინალური პროექტი</p>
        </div>
      </div>
    </footer>
  )
}

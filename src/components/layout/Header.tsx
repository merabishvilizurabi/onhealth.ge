import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { HOME_BY_ROLE, PATHS } from '../../router/paths'
import { getDisplayName } from '../../utils/user'
import { LogoMark } from './LogoMark'

export function Header() {
  const { user, signOut } = useAuth()
  const { pathname } = useLocation()
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null)
  const menuOpen = menuOpenOn === pathname
  const setMenuOpen = (open: boolean) => setMenuOpenOn(open ? pathname : null)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpenOn(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  function renderLinks(stacked: boolean) {
    const divider = stacked ? null : <span aria-hidden="true" className="h-5 w-px bg-gray-300" />

    return (
      <>
        {user ? (
          <>
            <Link
              to={user.role === 'patient' ? PATHS.profile : HOME_BY_ROLE[user.role]}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 font-semibold text-gray-900 hover:text-primary"
            >
              <span
                aria-hidden="true"
                className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary"
              >
                {getDisplayName(user).charAt(0)}
              </span>
              {getDisplayName(user)}
            </Link>
            {divider}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                signOut()
              }}
              className={`font-medium text-primary hover:underline ${stacked ? 'self-start' : ''}`}
            >
              გასვლა
            </button>
          </>
        ) : (
          <>
            <Link
              to={PATHS.signUp}
              onClick={() => setMenuOpen(false)}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              რეგისტრაცია
            </Link>
            {divider}
            <Link
              to={PATHS.signIn}
              onClick={() => setMenuOpen(false)}
              className={`rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover ${stacked ? 'text-center' : ''}`}
            >
              შესვლა
            </Link>
          </>
        )}
      </>
    )
  }

  return (
    <header className="relative z-20 border-b border-gray-300 bg-white/95 backdrop-blur md:sticky md:top-0">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <Link to={PATHS.home} className="flex shrink-0 items-center gap-2 text-2xl font-semibold tracking-tight text-gray-900">
          <LogoMark className="size-9 text-primary" />
          <span>
            OnHealth<span className="text-primary">.ge</span>
          </span>
        </Link>

        <nav aria-label="მთავარი მენიუ" className="hidden items-center gap-5 text-[15px] md:flex">
          {renderLinks(false)}
        </nav>

        <button
          type="button"
          aria-label={menuOpen ? 'მენიუს დახურვა' : 'მენიუს გახსნა'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex size-10 items-center justify-center rounded-lg text-gray-900 hover:bg-gray-100 md:hidden"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="მთავარი მენიუ"
          className="absolute inset-x-0 top-full flex flex-col gap-4 border-b border-gray-300 bg-white px-4 py-5 shadow-lg md:hidden"
        >
          {renderLinks(true)}
        </nav>
      )}
    </header>
  )
}

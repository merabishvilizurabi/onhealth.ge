import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { HOME_BY_ROLE, type RedirectState } from './paths'
export function GuestRoute() {
  const { user } = useAuth()
  const location = useLocation()

  if (user) {
    const from = (location.state as RedirectState | null)?.from
    return <Navigate to={from ?? HOME_BY_ROLE[user.role]} replace />
  }

  return <Outlet />
}

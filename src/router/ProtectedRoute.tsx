import { Navigate, Outlet, useLocation } from 'react-router'
import type { Role } from '../constants/roles'
import { useAuth } from '../hooks/useAuth'
import { HOME_BY_ROLE, PATHS, type RedirectState } from './paths'

interface ProtectedRouteProps {
  allow?: Role[]
}
export function ProtectedRoute({ allow }: ProtectedRouteProps) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const state: RedirectState = { from: location.pathname }
    return <Navigate to={PATHS.signIn} replace state={state} />
  }

  if (allow && !allow.includes(user.role)) {
    return <Navigate to={HOME_BY_ROLE[user.role]} replace />
  }

  return <Outlet />
}

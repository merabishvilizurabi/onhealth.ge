import type { Role } from '../constants/roles'

export const PATHS = {
  home: '/',
  signIn: '/sign-in',
  signUp: '/sign-up',
  doctorDashboard: '/doctor',
  clinicDashboard: '/clinic',
} as const
export const HOME_BY_ROLE: Record<Role, string> = {
  patient: PATHS.home,
  doctor: PATHS.doctorDashboard,
  clinic: PATHS.clinicDashboard,
}
export interface RedirectState {
  from?: string
}

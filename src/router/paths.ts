import type { Role } from '../constants/roles'

export const PATHS = {
  home: '/',
  signIn: '/sign-in',
  signUp: '/sign-up',
  doctorDashboard: '/doctor',
  clinicDashboard: '/clinic',
  clinicDoctor: '/clinic/doctors/:id',
  clinicStats: '/clinic/stats',
  doctors: '/doctors',
  doctorProfile: '/doctors/:id',
  clinicProfile: '/clinics/:id',
  profile: '/profile',
  book: '/book/:id',
} as const

export const doctorProfilePath = (id: string) => `/doctors/${id}`
export const clinicProfilePath = (id: string) => `/clinics/${id}`
export const clinicDoctorPath = (id: string) => `/clinic/doctors/${id}` // a doctor's page inside the clinic dashboard
// The booking page for a chosen clinic, date and time
export const bookingPath = (doctorId: string, slot: { clinic: string; date: string; time: string }) =>
  `/book/${doctorId}?${new URLSearchParams(slot)}`
export const HOME_BY_ROLE: Record<Role, string> = {
  patient: PATHS.home,
  doctor: PATHS.doctorDashboard,
  clinic: PATHS.clinicDashboard,
}
export interface RedirectState {
  from?: string
}

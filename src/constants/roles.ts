export const ROLES = ['patient', 'doctor', 'clinic'] as const

export type Role = (typeof ROLES)[number]

// Who can create an account themselves. Doctors are added by their clinic.
export const SIGN_UP_ROLES = ['patient', 'clinic'] as const

export type SignUpRole = (typeof SIGN_UP_ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  patient: 'პაციენტი',
  doctor: 'ექიმი',
  clinic: 'კლინიკა',
}

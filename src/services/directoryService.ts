import type { SelectOption } from '../constants/authFields'
import type { PublicClinic, PublicDoctor, SpecialtyCount } from '../interface/directory'
import type { Clinic, Doctor } from '../interface/user'
import { getUsers } from './authService'

// Public lists of doctors and clinics (demo accounts + everyone registered in this browser)

export function getDoctors(): PublicDoctor[] {
  return getUsers()
    .filter((user): user is Doctor => user.role === 'doctor')
    .map(({ password: _password, email: _email, ...doctor }) => doctor)
}

export function getClinics(): PublicClinic[] {
  return getUsers()
    .filter((user): user is Clinic => user.role === 'clinic')
    .map(({ password: _password, email: _email, ...clinic }) => clinic)
}

// Clinics as <select> options for the doctor sign-up form
export function getClinicOptions(): SelectOption[] {
  return getClinics().map((clinic) => ({ value: clinic.id, label: `${clinic.clinicName} — ${clinic.city}` }))
}

// Names of the clinics that have verified this doctor (pending links are not shown publicly)
export function getVerifiedClinicNames(doctor: PublicDoctor, clinics: PublicClinic[]): string[] {
  return doctor.clinics
    .filter((membership) => membership.status === 'verified')
    .map((membership) => clinics.find((clinic) => clinic.id === membership.clinicId)?.clinicName)
    .filter((name): name is string => name !== undefined)
}

// Unique doctor specialties with how many doctors have each, most common first
export function getSpecialties(doctors: PublicDoctor[]): SpecialtyCount[] {
  const counts = new Map<string, number>()
  for (const doctor of doctors) {
    const name = doctor.specialty.trim()
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ka'))
}

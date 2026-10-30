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


export function getClinic(id: string): PublicClinic | undefined {
  return getClinics().find((clinic) => clinic.id === id)
}

// Doctors this clinic has verified (pending doctors are not shown publicly)
export function getVerifiedDoctors(clinicId: string, doctors: PublicDoctor[]): PublicDoctor[] {
  return doctors.filter((doctor) =>
    doctor.clinics.some((membership) => membership.clinicId === clinicId && membership.status === 'verified'),
  )
}

// Cities where at least one verified doctor works (for the city picker in the header)
export function getDoctorCities(): string[] {
  const clinics = getClinics()
  const cities = getDoctors().flatMap((doctor) => getVerifiedClinics(doctor, clinics).map((clinic) => clinic.city))
  return [...new Set(cities)].sort((a, b) => a.localeCompare(b, 'ka'))
}

export function getDoctor(id: string): PublicDoctor | undefined {
  return getDoctors().find((doctor) => doctor.id === id)
}

// The clinics that have verified this doctor (pending links are not shown publicly)
export function getVerifiedClinics(doctor: PublicDoctor, clinics: PublicClinic[]): PublicClinic[] {
  return doctor.clinics
    .filter((membership) => membership.status === 'verified')
    .map((membership) => clinics.find((clinic) => clinic.id === membership.clinicId))
    .filter((clinic): clinic is PublicClinic => clinic !== undefined)
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

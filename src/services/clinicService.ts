import type { Clinic, Doctor, MembershipStatus, Patient } from '../interface/user'
import { cancelDoctorVisits } from './appointmentService'
import { getUsers, saveUser } from './authService'
import { saveSchedule } from './scheduleService'

// What a signed-in clinic sees about its own doctors and their patients.
// Unlike the public pages, this includes emails and phone numbers.

export interface ClinicDoctor {
  doctor: Doctor
  status: MembershipStatus
}

// Doctors linked to this clinic, verified or waiting for verification
export function getClinicDoctors(clinicId: string): ClinicDoctor[] {
  return getUsers()
    .filter((user): user is Doctor => user.role === 'doctor')
    .flatMap((doctor) => {
      const membership = doctor.clinics.find((m) => m.clinicId === clinicId)
      return membership ? [{ doctor, status: membership.status }] : []
    })
    .sort((a, b) => a.doctor.fullName.localeCompare(b.doctor.fullName, 'ka'))
}

// Accepts a doctor who is waiting for this clinic's verification
export function verifyDoctor(clinicId: string, doctorId: string): void {
  const entry = getClinicDoctors(clinicId).find((d) => d.doctor.id === doctorId)
  if (!entry || entry.status === 'verified') return
  saveUser({
    ...entry.doctor,
    clinics: entry.doctor.clinics.map((m) => (m.clinicId === clinicId ? { ...m, status: 'verified' } : m)),
  })
}

// Patients by id, to show names and phone numbers next to visits
export function getPatientsById(): Map<string, Patient> {
  return new Map(
    getUsers()
      .filter((user): user is Patient => user.role === 'patient')
      .map((patient) => [patient.id, patient]),
  )
}

type LinkResult = { ok: true; doctor: Doctor } | { ok: false; error: string }

// Adds a doctor who already has an account (e.g. moved here from another clinic).
// They keep their rating and reviews. A doctor works in one city only.
export function linkDoctor(clinic: Clinic, email: string): LinkResult {
  const users = getUsers()
  const doctor = users.find((u): u is Doctor => u.role === 'doctor' && u.email === email.trim().toLowerCase())
  if (!doctor) return { ok: false, error: 'ამ ელ. ფოსტით ექიმი ვერ მოიძებნა' }
  if (doctor.clinics.some((m) => m.clinicId === clinic.id)) return { ok: false, error: 'ეს ექიმი უკვე თქვენს კლინიკაშია' }

  const otherCity = users.find(
    (u): u is Clinic =>
      u.role === 'clinic' && u.city !== clinic.city && doctor.clinics.some((m) => m.clinicId === u.id && m.status === 'verified'),
  )?.city
  if (otherCity) {
    return { ok: false, error: `ექიმი ამჟამად მუშაობს ქალაქში: ${otherCity}. ჯერ იქაურმა კლინიკამ უნდა წაშალოს.` }
  }

  const linked: Doctor = {
    ...doctor,
    clinics: [...doctor.clinics, { clinicId: clinic.id, status: 'verified', joinedAt: new Date().toISOString() }],
  }
  saveUser(linked)
  return { ok: true, doctor: linked }
}

// The doctor no longer works here: their upcoming visits here are cancelled, their hours here
// are cleared, and the link to this clinic is removed. The account, past visits and reviews stay.
export function removeDoctor(clinicId: string, doctorId: string): void {
  const entry = getClinicDoctors(clinicId).find((d) => d.doctor.id === doctorId)
  if (!entry) return
  cancelDoctorVisits(clinicId, doctorId)
  saveSchedule({ doctorId, clinicId, days: [] })
  saveUser({ ...entry.doctor, clinics: entry.doctor.clinics.filter((m) => m.clinicId !== clinicId) })
}

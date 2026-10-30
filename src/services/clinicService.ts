import type { Clinic, Doctor, MembershipStatus, Patient } from '../interface/user'
import { cancelDoctorVisits } from './appointmentService'
import { getUsers, saveUser } from './authService'
import { saveSchedule } from './scheduleService'

export interface ClinicDoctor {
  doctor: Doctor
  status: MembershipStatus
}

export function getClinicDoctors(clinicId: string): ClinicDoctor[] {
  return getUsers()
    .filter((user): user is Doctor => user.role === 'doctor')
    .flatMap((doctor) => {
      const membership = doctor.clinics.find((m) => m.clinicId === clinicId)
      return membership ? [{ doctor, status: membership.status }] : []
    })
    .sort((a, b) => a.doctor.fullName.localeCompare(b.doctor.fullName, 'ka'))
}

export function verifyDoctor(clinicId: string, doctorId: string): void {
  const entry = getClinicDoctors(clinicId).find((d) => d.doctor.id === doctorId)
  if (!entry || entry.status === 'verified') return
  saveUser({
    ...entry.doctor,
    clinics: entry.doctor.clinics.map((m) => (m.clinicId === clinicId ? { ...m, status: 'verified' } : m)),
  })
}

export function getPatientsById(): Map<string, Patient> {
  return new Map(
    getUsers()
      .filter((user): user is Patient => user.role === 'patient')
      .map((patient) => [patient.id, patient]),
  )
}

type LinkResult = { ok: true; doctor: Doctor } | { ok: false; error: string }

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

export function removeDoctor(clinicId: string, doctorId: string): void {
  const entry = getClinicDoctors(clinicId).find((d) => d.doctor.id === doctorId)
  if (!entry) return
  cancelDoctorVisits(clinicId, doctorId)
  saveSchedule({ doctorId, clinicId, days: [] })
  saveUser({ ...entry.doctor, clinics: entry.doctor.clinics.filter((m) => m.clinicId !== clinicId) })
}

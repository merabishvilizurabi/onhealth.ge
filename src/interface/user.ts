import type { Role } from '../constants/roles'

interface BaseUser {
  id: string
  role: Role
  email: string
  password: string
  createdAt: string
}

export interface Patient extends BaseUser {
  role: 'patient'
  fullName: string
  phone: string
}

// A doctor's link to one clinic. "pending" until the clinic verifies the doctor.
// A doctor can work at several clinics, but all in the same city.
export type MembershipStatus = 'pending' | 'verified'

export interface ClinicMembership {
  clinicId: string
  status: MembershipStatus
  joinedAt: string
}

// One paid service a doctor offers, e.g. { name: 'პირველადი კონსულტაცია', price: 50 }
export interface DoctorService {
  name: string
  price: number // GEL
}

export interface Doctor extends BaseUser {
  role: 'doctor'
  fullName: string
  specialty: string
  experienceYears: number
  clinics: ClinicMembership[]
  bio: string // '' when not filled in
  education: string
  languages: string[]
  services: DoctorService[]
}

export interface Clinic extends BaseUser {
  role: 'clinic'
  clinicName: string
  city: string
  address: string
  phone: string
  specialty: string
}

export type User = Patient | Doctor | Clinic

export type FormValues = Record<string, string>

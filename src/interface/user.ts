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

export interface Doctor extends BaseUser {
  role: 'doctor'
  fullName: string
  specialty: string
  experienceYears: number
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

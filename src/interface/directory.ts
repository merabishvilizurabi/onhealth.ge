import type { Clinic, Doctor } from './user'

// What the public pages are allowed to see: no password, no email
export type PublicDoctor = Omit<Doctor, 'password' | 'email'>
export type PublicClinic = Omit<Clinic, 'password' | 'email'>

export interface SpecialtyCount {
  name: string
  count: number
}

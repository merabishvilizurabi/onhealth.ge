import type { Clinic, Doctor } from './user'

export type PublicDoctor = Omit<Doctor, 'password' | 'email'>
export type PublicClinic = Omit<Clinic, 'password' | 'email'>

export interface SpecialtyCount {
  name: string
  count: number
}

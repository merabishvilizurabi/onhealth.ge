import type { DoctorService } from './user'

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface WorkingDay {
  day: Weekday
  start: string
  end: string
}

export interface DoctorSchedule {
  doctorId: string
  clinicId: string
  days: WorkingDay[]
}

type AppointmentStatus = 'booked' | 'cancelled'

export type PaymentMethod = 'online' | 'clinic'

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  clinicId: string
  date: string
  time: string
  status: AppointmentStatus
  cancelledBy?: 'patient' | 'clinic'
  createdAt: string
  service?: DoctorService
  reason?: string
  payment?: PaymentMethod
}

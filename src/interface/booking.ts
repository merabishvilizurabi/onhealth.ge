import type { DoctorService } from './user'

// Weekday numbers follow JavaScript's Date.getDay(): 0 = Sunday, 1 = Monday … 6 = Saturday
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

// One working day at one clinic. Times are "HH:MM", local time.
export interface WorkingDay {
  day: Weekday
  start: string
  end: string
}

// A doctor's weekly hours at one clinic
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
  date: string // "YYYY-MM-DD"
  time: string // "HH:MM"
  status: AppointmentStatus
  createdAt: string
  // Chosen on the booking page. Demo visits and older bookings don't have them.
  service?: DoctorService
  reason?: string
  payment?: PaymentMethod
}

import type { DoctorSchedule, Weekday } from '../interface/booking'

// Working hours of the demo doctors, so booking works on any computer without setup.
// A doctor can change them on the schedule page; the change is saved in localStorage
// and replaces the demo hours for that clinic.

const schedule = (doctor: number, clinic: number, days: Weekday[], start: string, end: string): DoctorSchedule => ({
  doctorId: `demo-doctor-${doctor}`,
  clinicId: `demo-clinic-${clinic}`,
  days: days.map((day) => ({ day, start, end })),
})

export const DEMO_SCHEDULES: DoctorSchedule[] = [
  schedule(1, 1, [1, 3, 5], '10:00', '14:00'),
  schedule(1, 4, [2, 4], '11:00', '17:00'),
  schedule(2, 2, [1, 2, 3, 4, 5], '10:00', '16:00'),
  schedule(3, 3, [1, 2, 3, 4, 5], '09:00', '13:00'),
  schedule(4, 2, [2, 4, 6], '10:00', '15:00'),
  schedule(5, 1, [1, 2, 3, 4], '12:00', '18:00'),
  schedule(6, 1, [1, 3, 5], '09:00', '15:00'),
  schedule(7, 3, [2, 3, 4, 5, 6], '10:00', '14:00'),
  schedule(8, 1, [1, 2, 3, 4, 5], '14:00', '18:00'),
]

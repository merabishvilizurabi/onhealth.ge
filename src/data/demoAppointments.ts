import type { Appointment } from '../interface/booking'
import type { Doctor } from '../interface/user'
import { addDays, toDateKey, weekdayOf } from '../utils/time'
import { DEMO_SCHEDULES } from './demoSchedules'
import { DEMO_USERS } from './demoUsers'

const firstService = (doctorId: string) =>
  DEMO_USERS.find((u): u is Doctor => u.role === 'doctor' && u.id === doctorId)?.services[0]

const visit = (
  id: number,
  patient: number,
  doctor: number,
  clinic: number,
  date: string,
  time: string,
  payment: Appointment['payment'] = 'clinic',
): Appointment => ({
  id: `demo-visit-${id}`,
  patientId: `demo-patient-${patient}`,
  doctorId: `demo-doctor-${doctor}`,
  clinicId: `demo-clinic-${clinic}`,
  date,
  time,
  status: 'booked',
  createdAt: `${date}T08:00:00.000Z`,
  service: firstService(`demo-doctor-${doctor}`),
  payment,
})

function workingDay(doctor: number, clinic: number, offset: number, step: 1 | -1): string {
  const days = DEMO_SCHEDULES.find((s) => s.doctorId === `demo-doctor-${doctor}` && s.clinicId === `demo-clinic-${clinic}`)!.days
  for (let i = offset; ; i += step) {
    const date = toDateKey(addDays(new Date(), i))
    if (days.some((d) => d.day === weekdayOf(date))) return date
  }
}

const recent = (id: number, patient: number, doctor: number, clinic: number, daysAgo: number, time: string, payment: Appointment['payment'] = 'clinic') =>
  visit(id, patient, doctor, clinic, workingDay(doctor, clinic, -daysAgo, -1), time, payment)

const upcoming = (id: number, patient: number, doctor: number, clinic: number, after: number, time: string, reason = '') => ({
  ...visit(id, patient, doctor, clinic, workingDay(doctor, clinic, after, 1), time),
  reason,
})

export const DEMO_APPOINTMENTS: Appointment[] = [
  visit(1, 2, 1, 1, '2026-10-12', '10:00'),
  visit(2, 2, 6, 1, '2026-10-02', '09:00'),
  visit(3, 3, 1, 4, '2026-10-20', '11:00'),
  visit(4, 3, 5, 1, '2026-10-14', '12:00'),
  visit(5, 4, 1, 1, '2026-10-23', '10:30'),
  visit(6, 4, 4, 2, '2026-10-22', '10:00'),
  visit(7, 5, 2, 2, '2026-10-15', '10:00'),
  visit(8, 5, 4, 2, '2026-10-08', '11:00'),
  visit(9, 6, 3, 3, '2026-10-05', '09:00'),
  visit(10, 6, 7, 3, '2026-10-17', '10:00'),
  visit(11, 7, 3, 3, '2026-10-16', '09:30'),
  visit(12, 7, 6, 1, '2026-10-21', '09:00'),
  visit(13, 1, 8, 1, '2026-10-26', '14:00'),

  recent(42, 1, 1, 1, 1, '13:30', 'online'),

  recent(20, 2, 1, 1, 1, '10:00', 'online'),
  recent(21, 3, 5, 1, 1, '13:00'),
  recent(22, 4, 6, 1, 2, '11:00', 'online'),
  recent(23, 5, 8, 1, 2, '15:00'),
  recent(24, 6, 1, 1, 3, '12:00'),
  recent(25, 7, 5, 1, 3, '16:00', 'online'),
  recent(26, 1, 6, 1, 4, '09:30'),
  recent(27, 2, 8, 1, 5, '14:30', 'online'),
  recent(28, 3, 1, 1, 6, '11:30'),
  recent(29, 4, 5, 1, 8, '12:30', 'online'),
  recent(30, 5, 6, 1, 9, '10:30'),
  recent(31, 6, 8, 1, 10, '17:00'),
  recent(32, 7, 1, 1, 12, '13:00', 'online'),
  recent(33, 1, 2, 2, 2, '11:00'),
  recent(34, 3, 4, 2, 4, '12:00', 'online'),
  recent(35, 5, 3, 3, 3, '10:00'),
  recent(36, 2, 5, 1, 15, '14:00', 'online'),
  recent(37, 4, 8, 1, 17, '16:00'),
  recent(38, 6, 6, 1, 19, '12:00'),
  recent(39, 3, 1, 1, 21, '12:30', 'online'),
  recent(40, 7, 5, 1, 24, '17:00'),
  recent(41, 1, 8, 1, 26, '15:30'),

  upcoming(14, 2, 1, 1, 1, '11:00', 'გულის ფრიალი'),
  upcoming(15, 3, 1, 1, 1, '12:30'),
  upcoming(16, 4, 5, 1, 1, '15:00', 'ყოველწლიური გასინჯვა'),
  upcoming(17, 5, 6, 1, 2, '10:00'),
  upcoming(18, 6, 8, 1, 1, '16:30', 'თავის ტკივილი'),
  upcoming(19, 7, 2, 2, 1, '13:00'),
]

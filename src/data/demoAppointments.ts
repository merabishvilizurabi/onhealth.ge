import type { Appointment } from '../interface/booking'
import type { Doctor } from '../interface/user'
import { addDays, toDateKey, weekdayOf } from '../utils/time'
import { DEMO_SCHEDULES } from './demoSchedules'
import { DEMO_USERS } from './demoUsers'

// Visits of the demo patients: past ones (so reviews belong to real visits), recent ones
// (for the clinic's income chart) and upcoming ones (so the dashboards have something to show).
// Every visit is on a day and time the doctor works at that clinic (see demoSchedules.ts).

// The doctor's first service, e.g. "პირველადი კონსულტაცია, 60 ₾"
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

// The doctor's nearest working day at that clinic, starting `offset` days from today and
// moving forward (step 1) or back (step -1). Recent and upcoming demo visits move along with
// the calendar, so the dashboards and the income chart always have data.
function workingDay(doctor: number, clinic: number, offset: number, step: 1 | -1): string {
  const days = DEMO_SCHEDULES.find((s) => s.doctorId === `demo-doctor-${doctor}` && s.clinicId === `demo-clinic-${clinic}`)!.days
  for (let i = offset; ; i += step) {
    const date = toDateKey(addDays(new Date(), i))
    if (days.some((d) => d.day === weekdayOf(date))) return date
  }
}

// A past visit `daysAgo` days ago or earlier, on a day the doctor worked
const recent = (id: number, patient: number, doctor: number, clinic: number, daysAgo: number, time: string, payment: Appointment['payment'] = 'clinic') =>
  visit(id, patient, doctor, clinic, workingDay(doctor, clinic, -daysAgo, -1), time, payment)

const upcoming = (id: number, patient: number, doctor: number, clinic: number, after: number, time: string, reason = '') => ({
  ...visit(id, patient, doctor, clinic, workingDay(doctor, clinic, after, 1), time),
  reason,
})

export const DEMO_APPOINTMENTS: Appointment[] = [
  visit(1, 2, 1, 1, '2026-10-12', '10:00'), // ლაშა → ნინო, ორშაბათი
  visit(2, 2, 6, 1, '2026-10-02', '09:00'), // ლაშა → ლევან, პარასკევი
  visit(3, 3, 1, 4, '2026-10-20', '11:00'), // ეკა → ნინო, სამშაბათი
  visit(4, 3, 5, 1, '2026-10-14', '12:00'), // ეკა → თამარ, ოთხშაბათი
  visit(5, 4, 1, 1, '2026-10-23', '10:30'), // გიორგი → ნინო, პარასკევი
  visit(6, 4, 4, 2, '2026-10-22', '10:00'), // გიორგი → დავით, ხუთშაბათი
  visit(7, 5, 2, 2, '2026-10-15', '10:00'), // ნატა → გიორგი მ., ხუთშაბათი
  visit(8, 5, 4, 2, '2026-10-08', '11:00'), // ნატა → დავით, ხუთშაბათი
  visit(9, 6, 3, 3, '2026-10-05', '09:00'), // სოფო → ანა, ორშაბათი
  visit(10, 6, 7, 3, '2026-10-17', '10:00'), // სოფო → მარიამ, შაბათი
  visit(11, 7, 3, 3, '2026-10-16', '09:30'), // თეა → ანა, პარასკევი
  visit(12, 7, 6, 1, '2026-10-21', '09:00'), // თეა → ლევან, ოთხშაბათი
  // Not reviewed yet: sign in as patient@demo.onhealth.ge to try writing a review
  visit(13, 1, 8, 1, '2026-10-26', '14:00'), // სანდრო → ირაკლი, ორშაბათი

  // For trying the whole flow: სანდრო (patient@demo.onhealth.ge) had a visit with ნინო
  // (doctor1@demo.onhealth.ge) a few days ago. No diagnosis and no review yet: the doctor writes
  // the diagnosis on her dashboard, then the patient sees it and leaves a review in his profile.
  recent(42, 1, 1, 1, 1, '13:30', 'online'), // სანდრო → ნინო

  // Recent (last 4 weeks), for the clinic's income chart. Not reviewed yet.
  recent(20, 2, 1, 1, 1, '10:00', 'online'), // ლაშა → ნინო
  recent(21, 3, 5, 1, 1, '13:00'), // ეკა → თამარ
  recent(22, 4, 6, 1, 2, '11:00', 'online'), // გიორგი → ლევან
  recent(23, 5, 8, 1, 2, '15:00'), // ნატა → ირაკლი
  recent(24, 6, 1, 1, 3, '12:00'), // სოფო → ნინო
  recent(25, 7, 5, 1, 3, '16:00', 'online'), // თეა → თამარ
  recent(26, 1, 6, 1, 4, '09:30'), // სანდრო → ლევან
  recent(27, 2, 8, 1, 5, '14:30', 'online'), // ლაშა → ირაკლი
  recent(28, 3, 1, 1, 6, '11:30'), // ეკა → ნინო
  recent(29, 4, 5, 1, 8, '12:30', 'online'), // გიორგი → თამარ
  recent(30, 5, 6, 1, 9, '10:30'), // ნატა → ლევან
  recent(31, 6, 8, 1, 10, '17:00'), // სოფო → ირაკლი
  recent(32, 7, 1, 1, 12, '13:00', 'online'), // თეა → ნინო
  recent(33, 1, 2, 2, 2, '11:00'), // სანდრო → გიორგი მ.
  recent(34, 3, 4, 2, 4, '12:00', 'online'), // ეკა → დავით
  recent(35, 5, 3, 3, 3, '10:00'), // ნატა → ანა
  recent(36, 2, 5, 1, 15, '14:00', 'online'), // ლაშა → თამარ
  recent(37, 4, 8, 1, 17, '16:00'), // გიორგი → ირაკლი
  recent(38, 6, 6, 1, 19, '12:00'), // სოფო → ლევან
  recent(39, 3, 1, 1, 21, '12:30', 'online'), // ეკა → ნინო
  recent(40, 7, 5, 1, 24, '17:00'), // თეა → თამარ
  recent(41, 1, 8, 1, 26, '15:30'), // სანდრო → ირაკლი

  // Upcoming (ცენტრალური კლინიკა has most of them: central@demo.onhealth.ge)
  upcoming(14, 2, 1, 1, 1, '11:00', 'გულის ფრიალი'), // ლაშა → ნინო
  upcoming(15, 3, 1, 1, 1, '12:30'), // ეკა → ნინო
  upcoming(16, 4, 5, 1, 1, '15:00', 'ყოველწლიური გასინჯვა'), // გიორგი → თამარ
  upcoming(17, 5, 6, 1, 2, '10:00'), // ნატა → ლევან
  upcoming(18, 6, 8, 1, 1, '16:30', 'თავის ტკივილი'), // სოფო → ირაკლი
  upcoming(19, 7, 2, 2, 1, '13:00'), // თეა → გიორგი მ.
]

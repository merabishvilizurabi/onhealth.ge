import type { Appointment } from '../interface/booking'

// Past visits of the demo patients, so their reviews belong to real visits.
// Every visit is on a day and time the doctor works at that clinic (see demoSchedules.ts).

const visit = (id: number, patient: number, doctor: number, clinic: number, date: string, time: string): Appointment => ({
  id: `demo-visit-${id}`,
  patientId: `demo-patient-${patient}`,
  doctorId: `demo-doctor-${doctor}`,
  clinicId: `demo-clinic-${clinic}`,
  date,
  time,
  status: 'booked',
  createdAt: `${date}T08:00:00.000Z`,
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
]

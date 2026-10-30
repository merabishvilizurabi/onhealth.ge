import type { Review } from '../interface/review'
import { DEMO_APPOINTMENTS } from './demoAppointments'
import { DEMO_PATIENTS } from './demoUsers'

// Reviews the demo patients wrote after their visits (demoAppointments.ts).
// Each review belongs to one visit: same patient, doctor and date.

const review = (visitNumber: number, rating: Review['rating'], comment: string): Review => {
  const visit = DEMO_APPOINTMENTS.find((a) => a.id === `demo-visit-${visitNumber}`)!
  const patient = DEMO_PATIENTS.find((p) => p.id === visit.patientId)!
  return {
    id: `demo-review-${visitNumber}`,
    doctorId: visit.doctorId,
    patientId: visit.patientId,
    patientName: patient.fullName.split(' ')[0],
    appointmentId: visit.id,
    rating,
    comment,
    createdAt: `${visit.date}T18:00:00.000Z`,
  }
}

export const DEMO_REVIEWS: Review[] = [
  review(1, 5, 'ყურადღებიანი ექიმი, ყველაფერი დეტალურად ამიხსნა.'),
  review(2, 5, 'დიდი გამოცდილება ეტყობა.'),
  review(3, 5, 'ვიზიტი ზუსტად დროზე დაიწყო.'),
  review(4, 4, 'სწრაფად და გასაგებად.'),
  review(5, 4, 'კარგი კონსულტაცია, ცოტა დამელოდა.'),
  review(6, 4, 'კარგი ექიმი, დეტალური გამოკვლევა.'),
  review(7, 4, 'პროფესიონალი და თავაზიანი.'),
  review(8, 5, 'თავის ტკივილის მიზეზი ბოლოს და ბოლოს გაირკვა.'),
  review(9, 5, 'ბავშვთან ძალიან კარგად იმუშავა.'),
  review(10, 4, 'მშვიდი და მზრუნველი.'),
  review(11, 5, 'საუკეთესო პედიატრი!'),
  review(12, 5, 'სათვალე ზუსტად შემირჩია.'),
]

import type { VisitNote } from '../interface/visitNote'
import { DEMO_APPOINTMENTS } from './demoAppointments'

const note = (visitNumber: number, diagnosis: string, prescription: string): VisitNote => {
  const visit = DEMO_APPOINTMENTS.find((a) => a.id === `demo-visit-${visitNumber}`)!
  return {
    appointmentId: visit.id,
    doctorId: visit.doctorId,
    diagnosis,
    prescription,
    updatedAt: `${visit.date}T12:00:00.000Z`,
  }
}

export const DEMO_VISIT_NOTES: VisitNote[] = [
  note(1, 'არტერიული ჰიპერტენზია, I ხარისხი', 'ლიზინოპრილი 10 მგ, დღეში ერთხელ, დილით.\nწნევის გაზომვა ყოველდღე, 2 კვირაში განმეორებითი ვიზიტი.'),
  note(2, 'მიოპია, ორივე თვალი (-1.5)', 'სათვალე მუდმივი ტარებისთვის.\nკომპიუტერთან მუშაობისას ყოველ საათში 5 წუთი შესვენება.'),
  note(3, 'გულის რითმი ნორმის ფარგლებში', ''),
  note(5, 'სტენოკარდიის ეჭვი გამოირიცხა', 'ეკგ 6 თვეში ერთხელ.\nფიზიკური აქტივობა: სიარული დღეში 30 წუთი.'),
  note(9, 'კონტაქტური დერმატიტი', 'ჰიდროკორტიზონის კრემი 1%, დღეში 2-ჯერ, 7 დღე.\nალერგენთან (ნიკელი) კონტაქტის თავიდან აცილება.'),
]

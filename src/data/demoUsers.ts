import type { Clinic, ClinicMembership, Doctor, DoctorService, MembershipStatus, Patient } from '../interface/user'

// Built-in demo accounts. They are always available (also on a computer with empty
// localStorage), so the main page is never empty and every role can be shown in a demo.
// All demo accounts use the password: demo1234

const DEMO_PASSWORD = 'demo1234'
const CREATED_AT = '2026-10-01T00:00:00.000Z'

const DEMO_CLINICS: Clinic[] = [
  {
    id: 'demo-clinic-1',
    role: 'clinic',
    email: 'central@demo.onhealth.ge',
    password: DEMO_PASSWORD,
    createdAt: CREATED_AT,
    clinicName: 'ცენტრალური კლინიკა',
    city: 'თბილისი',
    address: 'ჭავჭავაძის გამზ. 10',
    phone: '555 00 00 01',
    specialty: 'მრავალპროფილიანი',
  },
  {
    id: 'demo-clinic-2',
    role: 'clinic',
    email: 'seaside@demo.onhealth.ge',
    password: DEMO_PASSWORD,
    createdAt: CREATED_AT,
    clinicName: 'ზღვისპირა სამედიცინო ცენტრი',
    city: 'ბათუმი',
    address: 'რუსთაველის ქ. 25',
    phone: '555 00 00 02',
    specialty: 'კარდიოლოგია, ნევროლოგია',
  },
  {
    id: 'demo-clinic-3',
    role: 'clinic',
    email: 'imereti@demo.onhealth.ge',
    password: DEMO_PASSWORD,
    createdAt: CREATED_AT,
    clinicName: 'იმერეთის კლინიკა',
    city: 'ქუთაისი',
    address: 'წერეთლის ქ. 7',
    phone: '555 00 00 03',
    specialty: 'პედიატრია',
  },
  {
    id: 'demo-clinic-4',
    role: 'clinic',
    email: 'vake@demo.onhealth.ge',
    password: DEMO_PASSWORD,
    createdAt: CREATED_AT,
    clinicName: 'ვაკის სამედიცინო ცენტრი',
    city: 'თბილისი',
    address: 'აბაშიძის ქ. 12',
    phone: '555 00 00 04',
    specialty: 'მრავალპროფილიანი',
  },
]

// Demo doctors are already verified by their clinics, except where "pending" is passed
const member = (clinicNumber: number, status: MembershipStatus = 'verified'): ClinicMembership => ({
  clinicId: `demo-clinic-${clinicNumber}`,
  status,
  joinedAt: CREATED_AT,
})

interface DoctorDetails {
  bio: string
  education: string
  languages: string[]
  services: DoctorService[]
}

const doctor = (
  id: number,
  fullName: string,
  specialty: string,
  experienceYears: number,
  clinics: ClinicMembership[],
  details: DoctorDetails,
): Doctor => ({
  id: `demo-doctor-${id}`,
  role: 'doctor',
  email: `doctor${id}@demo.onhealth.ge`,
  password: DEMO_PASSWORD,
  createdAt: CREATED_AT,
  fullName,
  specialty,
  experienceYears,
  clinics,
  ...details,
})

const KA_EN = ['ქართული', 'ინგლისური']
const KA_RU = ['ქართული', 'რუსული']

// Clinic 1 = ცენტრალური (თბილისი), 2 = ზღვისპირა (ბათუმი), 3 = იმერეთის (ქუთაისი), 4 = ვაკის (თბილისი).
// A doctor works in one city only: all of a doctor's clinics are in the same city.
const DEMO_DOCTORS: Doctor[] = [
  doctor(1, 'ნინო გელაშვილი', 'კარდიოლოგი', 12, [member(1), member(4)], {
    bio: 'გულის რითმის დარღვევები, არტერიული წნევა, ეკგ და გულის ექოსკოპია.',
    education: 'თბილისის სახელმწიფო სამედიცინო უნივერსიტეტი, კარდიოლოგია',
    languages: KA_EN,
    services: [
      { name: 'პირველადი კონსულტაცია', price: 60 },
      { name: 'განმეორებითი ვიზიტი', price: 40 },
      { name: 'ეკგ', price: 25 },
    ],
  }),
  doctor(2, 'გიორგი მაისურაძე', 'კარდიოლოგი', 8, [member(2)], {
    bio: 'პრევენციული კარდიოლოგია და ქოლესტერინის კონტროლი.',
    education: 'ბათუმის შოთა რუსთაველის სახელმწიფო უნივერსიტეტი',
    languages: KA_RU,
    services: [
      { name: 'კონსულტაცია', price: 45 },
      { name: 'ეკგ', price: 20 },
    ],
  }),
  doctor(3, 'ანა ლომიძე', 'პედიატრი', 15, [member(3)], {
    bio: 'ბავშვების პროფილაქტიკური გასინჯვა, აცრების გეგმა და ხშირი დაავადებები.',
    education: 'თბილისის სახელმწიფო სამედიცინო უნივერსიტეტი, პედიატრია',
    languages: KA_EN,
    services: [
      { name: 'პირველადი კონსულტაცია', price: 40 },
      { name: 'პროფილაქტიკური გასინჯვა', price: 30 },
    ],
  }),
  doctor(4, 'დავით ხარაძე', 'ნევროლოგი', 10, [member(2)], {
    bio: 'თავის ტკივილი, თავბრუსხვევა, ძილის დარღვევები.',
    education: 'თბილისის სახელმწიფო სამედიცინო უნივერსიტეტი, ნევროლოგია',
    languages: ['ქართული', 'ინგლისური', 'რუსული'],
    services: [
      { name: 'კონსულტაცია', price: 55 },
      { name: 'განმეორებითი ვიზიტი', price: 35 },
    ],
  }),
  doctor(5, 'თამარ ჩიქოვანი', 'დერმატოლოგი', 6, [member(1)], {
    bio: 'აკნე, ეგზემა, ხალების შემოწმება დერმატოსკოპით.',
    education: 'ივანე ჯავახიშვილის სახელობის თბილისის სახელმწიფო უნივერსიტეტი',
    languages: KA_EN,
    services: [
      { name: 'კონსულტაცია', price: 50 },
      { name: 'დერმატოსკოპია', price: 40 },
    ],
  }),
  doctor(6, 'ლევან ბოლქვაძე', 'ოფთალმოლოგი', 20, [member(1)], {
    bio: 'მხედველობის შემოწმება, თვალის წნევის გაზომვა, სათვალის შერჩევა.',
    education: 'თბილისის სახელმწიფო სამედიცინო უნივერსიტეტი, ოფთალმოლოგია',
    languages: KA_RU,
    services: [
      { name: 'პირველადი კონსულტაცია', price: 50 },
      { name: 'მხედველობის შემოწმება', price: 30 },
    ],
  }),
  doctor(7, 'მარიამ წიკლაური', 'პედიატრი', 4, [member(3)], {
    bio: 'ახალშობილისა და მცირეწლოვანი ბავშვის მეთვალყურეობა.',
    education: 'ქუთაისის აკაკი წერეთლის სახელმწიფო უნივერსიტეტი',
    languages: ['ქართული'],
    services: [{ name: 'კონსულტაცია', price: 30 }],
  }),
  doctor(8, 'ირაკლი ნოზაძე', 'თერაპევტი', 18, [member(1), member(4, 'pending')], {
    bio: 'ზოგადი გასინჯვა, ქრონიკული დაავადებების მართვა, ანალიზების ინტერპრეტაცია.',
    education: 'თბილისის სახელმწიფო სამედიცინო უნივერსიტეტი, შინაგანი მედიცინა',
    languages: KA_EN,
    services: [
      { name: 'კონსულტაცია', price: 35 },
      { name: 'ანალიზების განხილვა', price: 25 },
    ],
  }),
]

const patient = (id: number, email: string, fullName: string, phone: string): Patient => ({
  id: `demo-patient-${id}`,
  role: 'patient',
  email: `${email}@demo.onhealth.ge`,
  password: DEMO_PASSWORD,
  createdAt: CREATED_AT,
  fullName,
  phone,
})

// Demo patients. Their past visits and reviews are in demoAppointments.ts and demoReviews.ts.
export const DEMO_PATIENTS: Patient[] = [
  patient(1, 'patient', 'სანდრო კვარაცხელია', '555 00 00 10'),
  patient(2, 'lasha', 'ლაშა ბერიძე', '555 00 00 11'),
  patient(3, 'eka', 'ეკა კაპანაძე', '555 00 00 12'),
  patient(4, 'giorgi', 'გიორგი მესხი', '555 00 00 13'),
  patient(5, 'nata', 'ნატა ჯაფარიძე', '555 00 00 14'),
  patient(6, 'sopo', 'სოფო გიორგაძე', '555 00 00 15'),
  patient(7, 'tea', 'თეა ხუციშვილი', '555 00 00 16'),
]

export const DEMO_USERS = [...DEMO_CLINICS, ...DEMO_DOCTORS, ...DEMO_PATIENTS]

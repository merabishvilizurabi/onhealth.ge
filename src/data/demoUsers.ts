import type { Clinic, ClinicMembership, Doctor, MembershipStatus, Patient } from '../interface/user'

// Built-in demo accounts. They are always available (also on a computer with empty
// localStorage), so the main page is never empty and every role can be shown in a demo.
// All demo accounts use the password: demo1234

const DEMO_PASSWORD = 'demo1234'
const CREATED_AT = '2026-10-01T00:00:00.000Z'

export const DEMO_CLINICS: Clinic[] = [
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
]

// Demo doctors are already verified by their clinics, except where "pending" is passed
const member = (clinicNumber: number, status: MembershipStatus = 'verified'): ClinicMembership => ({
  clinicId: `demo-clinic-${clinicNumber}`,
  status,
  joinedAt: CREATED_AT,
})

const doctor = (
  id: number,
  fullName: string,
  specialty: string,
  experienceYears: number,
  clinics: ClinicMembership[],
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
})

// Clinic 1 = ცენტრალური (თბილისი), 2 = ზღვისპირა (ბათუმი), 3 = იმერეთის (ქუთაისი)
export const DEMO_DOCTORS: Doctor[] = [
  doctor(1, 'ნინო გელაშვილი', 'კარდიოლოგი', 12, [member(1), member(2)]),
  doctor(2, 'გიორგი მაისურაძე', 'კარდიოლოგი', 8, [member(2)]),
  doctor(3, 'ანა ლომიძე', 'პედიატრი', 15, [member(3)]),
  doctor(4, 'დავით ხარაძე', 'ნევროლოგი', 10, [member(2)]),
  doctor(5, 'თამარ ჩიქოვანი', 'დერმატოლოგი', 6, [member(1)]),
  doctor(6, 'ლევან ბოლქვაძე', 'ოფთალმოლოგი', 20, [member(1)]),
  doctor(7, 'მარიამ წიკლაური', 'პედიატრი', 4, [member(3)]),
  doctor(8, 'ირაკლი ნოზაძე', 'თერაპევტი', 18, [member(1), member(3, 'pending')]),
]

export const DEMO_PATIENTS: Patient[] = [
  {
    id: 'demo-patient-1',
    role: 'patient',
    email: 'patient@demo.onhealth.ge',
    password: DEMO_PASSWORD,
    createdAt: CREATED_AT,
    fullName: 'სანდრო კვარაცხელია',
    phone: '555 00 00 10',
  },
]

export const DEMO_USERS = [...DEMO_CLINICS, ...DEMO_DOCTORS, ...DEMO_PATIENTS]

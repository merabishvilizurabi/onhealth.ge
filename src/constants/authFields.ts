import type { SignUpRole } from './roles'

export interface SelectOption {
  value: string
  label: string
}

export interface FieldConfig {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url' | 'select'
  autoComplete?: string
  placeholder?: string
  options?: SelectOption[]
  emptyOption?: string
}

interface FormSection {
  title?: string
  note?: string
  fields: FieldConfig[]
}

const fullName: FieldConfig = { name: 'fullName', label: 'სახელი და გვარი', autoComplete: 'name' }

const phone: FieldConfig = {
  name: 'phone',
  label: 'ტელეფონი',
  type: 'tel',
  autoComplete: 'tel',
  placeholder: '5XX XX XX XX',
}

const email: FieldConfig = { name: 'email', label: 'ელ. ფოსტა', type: 'email', autoComplete: 'email' }

const passwords: FieldConfig[] = [
  { name: 'password', label: 'პაროლი', type: 'password', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'გაიმეორეთ პაროლი', type: 'password', autoComplete: 'new-password' },
]

export const CLINIC_INFO_FIELDS: FieldConfig[] = [
  { name: 'clinicName', label: 'კლინიკის დასახელება', autoComplete: 'organization' },
  { name: 'city', label: 'ქალაქი', autoComplete: 'address-level2' },
  { name: 'address', label: 'მისამართი', autoComplete: 'street-address' },
  { ...phone, label: 'კლინიკის ტელეფონი', placeholder: '5XX XX XX XX ან 32 2XX XX XX' },
  { name: 'specialty', label: 'პროფილი / სპეციალიზაცია', placeholder: 'მაგ. მრავალპროფილიანი' },
]

export const SIGN_UP_FORM: Record<SignUpRole, FormSection[]> = {
  patient: [
    {
      fields: [
        fullName,
        email,
        ...passwords,
        phone,
      ],
    },
  ],

  clinic: [
    { title: 'კლინიკის ინფორმაცია', fields: CLINIC_INFO_FIELDS },
    {
      title: 'ანგარიშის მონაცემები',
      fields: [{ ...email, label: 'კლინიკის ელ. ფოსტა' }, ...passwords],
    },
  ],
}

export const DOCTOR_FORM: FormSection[] = [
  { title: 'ანგარიშის მონაცემები', fields: [fullName, phone, email, ...passwords] },
  {
    title: 'ექიმის ინფორმაცია',
    fields: [
      { name: 'specialty', label: 'სპეციალობა', placeholder: 'მაგ. კარდიოლოგი' },
      { name: 'experienceYears', label: 'გამოცდილება (წელი)', type: 'number' },
      { name: 'price', label: 'კონსულტაციის ფასი (₾)', type: 'number', placeholder: 'მაგ. 50' },
    ],
  },
  {
    title: 'ექიმის შესახებ (არასავალდებულო)',
    fields: [
      { name: 'bio', label: 'მოკლე აღწერა', placeholder: 'რას მკურნალობს, რა მომსახურებას სთავაზობს' },
      { name: 'education', label: 'განათლება', placeholder: 'მაგ. თსსუ, კარდიოლოგია' },
      { name: 'languages', label: 'ენები', placeholder: 'ქართული, ინგლისური' },
    ],
  },
]

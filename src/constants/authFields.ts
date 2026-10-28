import type { Role } from './roles'

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

export interface FormSection {
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


export const SIGN_UP_FORM: Record<Role, FormSection[]> = {
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

  doctor: [
    { title: 'ანგარიშის მონაცემები', fields: [fullName, email, ...passwords] },
    {
      title: 'ექიმის ინფორმაცია',
      fields: [
        { name: 'specialty', label: 'სპეციალობა', placeholder: 'მაგ. კარდიოლოგი' },
        { name: 'experienceYears', label: 'გამოცდილება (წელი)', type: 'number' },
      ],
    },
  ],

  clinic: [
    {
      title: 'კლინიკის ინფორმაცია',
      fields: [
        { name: 'clinicName', label: 'კლინიკის დასახელება', autoComplete: 'organization' },
        { name: 'city', label: 'ქალაქი', autoComplete: 'address-level2' },
        { name: 'address', label: 'მისამართი', autoComplete: 'street-address' },
        { ...phone, label: 'კლინიკის ტელეფონი', placeholder: '5XX XX XX XX ან 32 2XX XX XX' },
        { name: 'specialty', label: 'პროფილი / სპეციალიზაცია', placeholder: 'მაგ. მრავალპროფილიანი' },
      ],
    },
    {
      title: 'ანგარიშის მონაცემები',
      fields: [{ ...email, label: 'კლინიკის ელ. ფოსტა' }, ...passwords],
    },
  ],
}

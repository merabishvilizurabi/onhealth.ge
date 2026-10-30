import * as z from 'zod'
import { isFullName, isGeorgianPhone } from './rules'

const MESSAGES = {
  required: 'სავალდებულო ველი',
  fullName: 'შეიყვანეთ სახელი და გვარი',
  email: 'შეიყვანეთ სწორი ელ. ფოსტა',
  password: 'მინიმუმ 8 სიმბოლო, მათ შორის ასო და ციფრი',
  confirmPassword: 'პაროლები არ ემთხვევა',
  phone: 'შეიყვანეთ 9-ნიშნა ნომერი, მაგ. 5XX XX XX XX',
  experience: 'შეიყვანეთ წლები 0-დან 70-მდე',
  price: 'შეიყვანეთ ფასი 1-დან 1000 ₾-მდე',
  tooLong: 'ტექსტი ძალიან გრძელია',
  services: 'დაამატეთ ერთი სერვისი მაინც',
  serviceNames: 'სერვისების სახელები არ უნდა მეორდებოდეს',
}

const text = () => z.string({ error: MESSAGES.required })

const requiredText = text().trim().min(1, MESSAGES.required)

const fullName = requiredText.refine(isFullName, MESSAGES.fullName)

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, MESSAGES.tooLong)
    .optional()
    .transform((value) => value ?? '')

const languageList = optionalText(200).transform((value) =>
  value
    .split(',')
    .map((language) => language.trim())
    .filter(Boolean),
)

const email = text()
  .trim()
  .toLowerCase()
  .min(1, MESSAGES.required)
  .pipe(z.email(MESSAGES.email))

const phone = requiredText.refine(isGeorgianPhone, MESSAGES.phone)

const password = text()
  .min(1, MESSAGES.required)
  .min(8, MESSAGES.password)
  .regex(/[A-Za-z]/, MESSAGES.password)
  .regex(/\d/, MESSAGES.password)

const accountFields = {
  email,
  password,
  confirmPassword: text().min(1, MESSAGES.required),
}

const passwordsMatch = {
  check: (data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword,
  options: { error: MESSAGES.confirmPassword, path: ['confirmPassword'] },
}

export const signInSchema = z.object({
  email,
  password: text().min(1, MESSAGES.required),
})

const patientSchema = z
  .object({
    role: z.literal('patient'),
    fullName,
    ...accountFields,
    phone,
  })
  .refine(passwordsMatch.check, passwordsMatch.options)

const clinicInfoFields = {
  clinicName: requiredText,
  city: requiredText,
  address: requiredText,
  phone,
  specialty: requiredText,
}

const clinicSchema = z
  .object({
    role: z.literal('clinic'),
    ...clinicInfoFields,
    ...accountFields,
  })
  .refine(passwordsMatch.check, passwordsMatch.options)

export const signUpSchema = z.discriminatedUnion('role', [patientSchema, clinicSchema])

export type SignUpData = z.infer<typeof signUpSchema>

export const clinicInfoSchema = z.object(clinicInfoFields)

export type ClinicInfoData = z.infer<typeof clinicInfoSchema>

const experienceYears = requiredText
  .transform(Number)
  .pipe(
    z.number({ error: MESSAGES.experience }).int(MESSAGES.experience).min(0, MESSAGES.experience).max(70, MESSAGES.experience),
  )

const price = requiredText
  .transform(Number)
  .pipe(z.number({ error: MESSAGES.price }).int(MESSAGES.price).min(1, MESSAGES.price).max(1000, MESSAGES.price))

const doctorInfoFields = {
  fullName,
  phone,
  specialty: requiredText,
  experienceYears,
  bio: optionalText(300),
  education: optionalText(150),
  languages: languageList,
}

export const doctorSchema = z
  .object({
    ...doctorInfoFields,
    ...accountFields,
    price,
  })
  .refine(passwordsMatch.check, passwordsMatch.options)

export type DoctorData = z.infer<typeof doctorSchema>

export const doctorProfileSchema = z.object({
  ...doctorInfoFields,
  services: z
    .array(z.object({ name: requiredText.max(60, MESSAGES.tooLong), price }))
    .min(1, MESSAGES.services)
    .refine((list) => new Set(list.map((s) => s.name)).size === list.length, MESSAGES.serviceNames),
})

export type DoctorProfileData = z.infer<typeof doctorProfileSchema>

export const profileSchema = z.object({ fullName, phone })

export type ProfileData = z.infer<typeof profileSchema>

export const passwordSchema = z
  .object({
    currentPassword: text().min(1, MESSAGES.required),
    password,
    confirmPassword: text().min(1, MESSAGES.required),
  })
  .refine(passwordsMatch.check, passwordsMatch.options)

export type PasswordData = z.infer<typeof passwordSchema>
export type FormErrors = Record<string, string>

type ValidationResult<T> = { success: true; data: T } | { success: false; errors: FormErrors }

export function validate<S extends z.ZodType>(schema: S, values: unknown): ValidationResult<z.output<S>> {
  const result = schema.safeParse(values)
  if (result.success) return { success: true, data: result.data }

  const errors: FormErrors = {}
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? 'form')
    errors[field] ??= issue.message
  }
  return { success: false, errors }
}

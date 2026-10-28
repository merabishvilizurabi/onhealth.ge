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
  clinic: 'აირჩიეთ კლინიკა',
}

const text = () => z.string({ error: MESSAGES.required })

const requiredText = text().trim().min(1, MESSAGES.required)

const fullName = requiredText.refine(isFullName, MESSAGES.fullName)

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

export type SignInData = z.infer<typeof signInSchema>

const patientSchema = z
  .object({
    role: z.literal('patient'),
    fullName,
    ...accountFields,
    phone,
  })
  .refine(passwordsMatch.check, passwordsMatch.options)

const doctorSchema = z
  .object({
    role: z.literal('doctor'),
    fullName,
    ...accountFields,
    specialty: requiredText,
    experienceYears: requiredText
      .transform(Number)
      .pipe(
        z
          .number({ error: MESSAGES.experience })
          .int(MESSAGES.experience)
          .min(0, MESSAGES.experience)
          .max(70, MESSAGES.experience),
      ),
    clinicId: text().min(1, MESSAGES.clinic),
  })
  .refine(passwordsMatch.check, passwordsMatch.options)

const clinicSchema = z
  .object({
    role: z.literal('clinic'),
    clinicName: requiredText,
    city: requiredText,
    address: requiredText,
    phone,
    specialty: requiredText,
    ...accountFields,
  })
  .refine(passwordsMatch.check, passwordsMatch.options)

export const signUpSchema = z.discriminatedUnion('role', [patientSchema, doctorSchema, clinicSchema])

export type SignUpData = z.infer<typeof signUpSchema>
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

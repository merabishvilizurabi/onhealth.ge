import { useState, type FormEvent } from 'react'
import { DOCTOR_FORM } from '../../constants/authFields'
import type { Clinic, FormValues } from '../../interface/user'
import { addDoctor } from '../../services/authService'
import { linkDoctor } from '../../services/clinicService'
import { doctorSchema, validate, type FormErrors } from '../../validation/authValidation'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface AddDoctorFormProps {
  clinic: Clinic
  onAdded: (message: string) => void
  onCancel: () => void
}

type Mode = 'new' | 'existing'

const MODES: { value: Mode; label: string }[] = [
  { value: 'new', label: 'ახალი ექიმი' },
  { value: 'existing', label: 'უკვე რეგისტრირებული ექიმი' },
]

// A new doctor: the clinic creates the account, and the doctor signs in with this email and password.
// An existing doctor (e.g. moved from another clinic): found by email, keeps their reviews and rating.
export function AddDoctorForm({ clinic, onAdded, onCancel }: AddDoctorFormProps) {
  const [mode, setMode] = useState<Mode>('new')
  const [values, setValues] = useState<FormValues>({})
  const [existingEmail, setExistingEmail] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (mode === 'existing') {
      const result = linkDoctor(clinic, existingEmail)
      if (!result.ok) {
        setErrors({ form: result.error })
        return
      }
      onAdded(`${result.doctor.fullName} დაემატა თქვენს კლინიკაში. სამუშაო საათებს აქ ექიმი თავად შეავსებს განრიგის გვერდზე.`)
      return
    }

    const validation = validate(doctorSchema, values)
    if (!validation.success) {
      setErrors(validation.errors)
      return
    }
    const result = addDoctor(clinic.id, validation.data)
    if (!result.ok) {
      setErrors({ form: result.error })
      return
    }
    onAdded(
      `ექიმი დაემატა. შესვლა შეუძლია ელ. ფოსტით ${validation.data.email} და თქვენ მიერ მითითებული პაროლით. სამუშაო საათებს ექიმი თავად შეავსებს განრიგის გვერდზე.`,
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">ექიმის დამატება</h2>
        <div role="radiogroup" aria-label="ექიმი" className="inline-flex rounded-lg border border-gray-200 p-1">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={mode === m.value}
              onClick={() => {
                setMode(m.value)
                setErrors({})
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                mode === m.value ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'new' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {DOCTOR_FORM.map((section) => (
            <fieldset key={section.title} className="flex min-w-0 flex-col gap-4">
              <legend className="mb-3 text-sm font-semibold text-primary">{section.title}</legend>
              {section.fields.map((field) => (
                <Input
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  type={field.type ?? 'text'}
                  placeholder={field.placeholder}
                  autoComplete={field.name === 'password' || field.name === 'confirmPassword' ? 'new-password' : 'off'}
                  inputMode={field.type === 'number' ? 'numeric' : undefined}
                  value={values[field.name] ?? ''}
                  error={errors[field.name]}
                  onChange={(e) => {
                    const { value } = e.currentTarget
                    setValues((prev) => ({ ...prev, [field.name]: value }))
                  }}
                />
              ))}
            </fieldset>
          ))}
        </div>
      ) : (
        <div className="flex max-w-md flex-col gap-2">
          <Input
            label="ექიმის ელ. ფოსტა"
            type="email"
            value={existingEmail}
            onChange={(e) => setExistingEmail(e.currentTarget.value)}
            autoComplete="off"
          />
          <p className="text-sm text-gray-500">
            ექიმი, რომელსაც უკვე აქვს ანგარიში OnHealth.ge-ზე. მისი შეფასებები და ისტორია შენარჩუნდება.
          </p>
        </div>
      )}

      {errors.form && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.form}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="submit">დამატება</Button>
        <Button variant="secondary" onClick={onCancel}>
          გაუქმება
        </Button>
      </div>
    </form>
  )
}

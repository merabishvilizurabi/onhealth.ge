import { useState, type FormEvent } from 'react'
import { CLINIC_INFO_FIELDS } from '../../constants/authFields'
import { useAuth } from '../../hooks/useAuth'
import type { Clinic, FormValues } from '../../interface/user'
import { clinicInfoSchema, validate, type FormErrors } from '../../validation/authValidation'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface ClinicInfoFormProps {
  clinic: Clinic
  hasDoctors: boolean
  onSaved: () => void
  onCancel: () => void
}

export function ClinicInfoForm({ clinic, hasDoctors, onSaved, onCancel }: ClinicInfoFormProps) {
  const { updateClinic } = useAuth()
  const [values, setValues] = useState<FormValues>({
    clinicName: clinic.clinicName,
    city: clinic.city,
    address: clinic.address,
    phone: clinic.phone,
    specialty: clinic.specialty,
  })
  const [errors, setErrors] = useState<FormErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validation = validate(clinicInfoSchema, values)
    if (!validation.success) {
      setErrors(validation.errors)
      return
    }
    const result = updateClinic(validation.data)
    if (!result.ok) {
      setErrors({ form: result.error })
      return
    }
    onSaved()
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-gray-900">კლინიკის ინფორმაცია</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {CLINIC_INFO_FIELDS.map((field) => (
          <Input
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type ?? 'text'}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            disabled={field.name === 'city' && hasDoctors}
            className={field.name === 'city' && hasDoctors ? 'bg-gray-50 text-gray-900' : ''}
            value={values[field.name] ?? ''}
            error={errors[field.name]}
            onChange={(e) => {
              const { value } = e.currentTarget
              setValues((prev) => ({ ...prev, [field.name]: value }))
            }}
          />
        ))}
        <Input label="ელ. ფოსტა (შესვლისთვის)" value={clinic.email} disabled readOnly className="bg-gray-50 text-gray-900" />
      </div>
      {hasDoctors && (
        <p className="text-xs text-gray-900">
          ქალაქს ვერ შეცვლით, სანამ კლინიკაში ექიმები არიან: ექიმი მხოლოდ ერთ ქალაქში მუშაობს.
        </p>
      )}
      {errors.form && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.form}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="submit">შენახვა</Button>
        <Button variant="secondary" onClick={onCancel}>
          გაუქმება
        </Button>
      </div>
    </form>
  )
}

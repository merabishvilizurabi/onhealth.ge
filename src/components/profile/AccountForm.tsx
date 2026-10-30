import { useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import type { Patient } from '../../interface/user'
import { profileSchema, validate, type FormErrors } from '../../validation/authValidation'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

// Edit name and phone. The email is the sign-in, so it is shown but can't be changed.
export function AccountForm({ patient }: { patient: Patient }) {
  const { updateProfile } = useAuth()
  const [fullName, setFullName] = useState(patient.fullName)
  const [phone, setPhone] = useState(patient.phone)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saved, setSaved] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(false)

    const validation = validate(profileSchema, { fullName, phone })
    if (!validation.success) {
      setErrors(validation.errors)
      return
    }
    const result = updateProfile(validation.data)
    if (!result.ok) {
      setErrors({ form: result.error })
      return
    }
    setErrors({})
    setSaved(true)
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-gray-900">პირადი მონაცემები</h2>
      <Input
        label="სახელი და გვარი"
        value={fullName}
        onChange={(e) => setFullName(e.currentTarget.value)}
        error={errors.fullName}
        autoComplete="name"
      />
      <Input
        label="ტელეფონი"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.currentTarget.value)}
        error={errors.phone}
        autoComplete="tel"
      />
      <Input label="ელ. ფოსტა" value={patient.email} disabled readOnly className="bg-gray-50 text-gray-500" />

      {errors.form && (
        <p role="alert" className="text-sm text-red-600">
          {errors.form}
        </p>
      )}
      {saved && (
        <p role="status" className="text-sm text-green-700">
          ცვლილებები შენახულია
        </p>
      )}
      <Button type="submit" className="self-start">
        შენახვა
      </Button>
    </form>
  )
}

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { passwordSchema, validate, type FormErrors } from '../../validation/authValidation'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

const EMPTY = { currentPassword: '', password: '', confirmPassword: '' }

// Change the password: the current one is needed first
export function PasswordForm() {
  const { changePassword } = useAuth()
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saved, setSaved] = useState(false)

  const setField = (field: keyof typeof EMPTY) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget
    setValues((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(false)

    const validation = validate(passwordSchema, values)
    if (!validation.success) {
      setErrors(validation.errors)
      return
    }
    const result = changePassword(validation.data)
    if (!result.ok) {
      setErrors({ currentPassword: result.error })
      return
    }
    setErrors({})
    setValues(EMPTY)
    setSaved(true)
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-gray-900">პაროლის შეცვლა</h2>
      <Input
        label="მიმდინარე პაროლი"
        type="password"
        value={values.currentPassword}
        onChange={setField('currentPassword')}
        error={errors.currentPassword}
        autoComplete="current-password"
      />
      <Input
        label="ახალი პაროლი"
        type="password"
        value={values.password}
        onChange={setField('password')}
        error={errors.password}
        autoComplete="new-password"
      />
      <Input
        label="გაიმეორეთ ახალი პაროლი"
        type="password"
        value={values.confirmPassword}
        onChange={setField('confirmPassword')}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />
      {saved && (
        <p role="status" className="text-sm text-green-700">
          პაროლი შეიცვალა
        </p>
      )}
      <Button type="submit" className="self-start">
        პაროლის შეცვლა
      </Button>
    </form>
  )
}

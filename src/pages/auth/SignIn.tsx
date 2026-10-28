import { useEffect, useState, type ComponentProps } from 'react'
import { Link, useLocation, useOutletContext } from 'react-router'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../hooks/useAuth'
import type { FormValues } from '../../interface/user'
import type { AuthLayoutContext } from '../../layouts/AuthLayout'
import { PATHS } from '../../router/paths'
import { signInSchema, validate, type FormErrors } from '../../validation/authValidation'

export function SignIn() {
  const { signIn } = useAuth()
  const location = useLocation()
  const { setRole } = useOutletContext<AuthLayoutContext>()

  const [values, setValues] = useState<FormValues>({ email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState('')
  useEffect(() => setRole('patient'), [setRole])

  const handleChange: ComponentProps<'input'>['onChange'] = (event) => {
    const { name, value } = event.currentTarget
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault()
    setFormError('')

    const validation = validate(signInSchema, values)
    if ('errors' in validation) {
      setErrors(validation.errors)
      return
    }
    setErrors({})

    const result = signIn(validation.data.email, validation.data.password)
    if ('error' in result) setFormError(result.error)
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-gray-900 text-center">ავტორიზაცია</h1>

      <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          label="ელ. ფოსტა"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          label="პაროლი"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />

        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        )}

        <Button type="submit" fullWidth>
          შესვლა
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        არ გაქვთ ანგარიში?{' '}
        <Link to={PATHS.signUp} state={location.state} className="font-medium text-primary hover:underline">
          რეგისტრაცია
        </Link>
      </p>
    </>
  )
}

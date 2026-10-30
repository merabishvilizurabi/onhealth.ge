import { useState, type ComponentProps } from 'react'
import { Link, useLocation, useOutletContext } from 'react-router'
import { RoleSelector } from '../../components/auth/RoleSelector'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { SIGN_UP_FORM, type FieldConfig } from '../../constants/authFields'
import type { Role } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import type { FormValues } from '../../interface/user'
import type { AuthLayoutContext } from '../../layouts/AuthLayout'
import { PATHS } from '../../router/paths'
import { getClinicOptions } from '../../services/directoryService'
import { signUpSchema, validate, type FormErrors } from '../../validation/authValidation'

export function SignUp() {
  const { signUp } = useAuth()
  const location = useLocation()
  const { role, setRole } = useOutletContext<AuthLayoutContext>()

  const [values, setValues] = useState<FormValues>({})
  const [errors, setErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState('')
  // Read once when the page opens: demo clinics + clinics registered in this browser
  const [clinicOptions] = useState(getClinicOptions)

  function handleRoleChange(next: Role) {
    setRole(next)
    setErrors({})
    setFormError('')
  }

  function updateValue(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault()
    setFormError('')
    const validation = validate(signUpSchema, { ...values, role })
    if ('errors' in validation) {
      setErrors(validation.errors)
      return
    }
    setErrors({})

    const result = signUp(validation.data)
    if ('error' in result) setFormError(result.error)
  }

  function renderField(field: FieldConfig) {
    const common = {
      name: field.name,
      label: field.label,
      value: values[field.name] ?? '',
      error: errors[field.name],
    }

    if (field.type === 'select') {
      return (
        <Select
          key={field.name}
          {...common}
          options={field.optionsFrom === 'clinics' ? clinicOptions : (field.options ?? [])}
          emptyOption={field.emptyOption}
          onChange={(event) => updateValue(field.name, event.currentTarget.value)}
        />
      )
    }

    return (
      <Input
        key={field.name}
        {...common}
        type={field.type ?? 'text'}
        autoComplete={field.autoComplete}
        placeholder={field.placeholder}
        inputMode={field.type === 'number' ? 'numeric' : undefined}
        onChange={(event) => updateValue(field.name, event.currentTarget.value)}
      />
    )
  }

  const sections = SIGN_UP_FORM[role]
  const hasManySections = sections.length > 1

  return (
    <>
      <h1 className="text-xl font-semibold text-gray-900 text-center">რეგისტრაცია</h1>

      <div className="mx-auto mt-6 max-w-md">
        <RoleSelector value={role} onChange={handleRoleChange} />
      </div>

      <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <div className={hasManySections ? 'grid gap-6 md:gap-8' : ''}>
          {sections.map((section, index) => (
            <fieldset key={section.title ?? index} className="min-w-0">
              {section.title && (
                <legend className="mb-3 text-sm font-semibold text-primary">{section.title}</legend>
              )}
              <div className={`grid gap-4 ${hasManySections ? '' : 'md:grid-cols-2'}`}>
                {section.fields.map(renderField)}
              </div>
              {section.note && <p className="mt-3 text-xs text-gray-500">{section.note}</p>}
            </fieldset>
          ))}
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        )}

        <Button type="submit" fullWidth className="md:w-auto md:self-end md:px-10">
          რეგისტრაცია
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        უკვე გაქვთ ანგარიში?{' '}
        <Link to={PATHS.signIn} state={location.state} className="font-medium text-primary hover:underline">
          შესვლა
        </Link>
      </p>
    </>
  )
}

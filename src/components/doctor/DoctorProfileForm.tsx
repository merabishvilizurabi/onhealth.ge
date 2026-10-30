import { useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import type { Doctor } from '../../interface/user'
import { doctorProfileSchema, validate, type FormErrors } from '../../validation/authValidation'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

type ServiceRow = { name: string; price: string }

export function DoctorProfileForm({ doctor }: { doctor: Doctor }) {
  const { updateDoctor } = useAuth()
  const [values, setValues] = useState({
    fullName: doctor.fullName,
    phone: doctor.phone,
    specialty: doctor.specialty,
    experienceYears: String(doctor.experienceYears),
    bio: doctor.bio,
    education: doctor.education,
    languages: doctor.languages.join(', '),
  })
  const [services, setServices] = useState<ServiceRow[]>(
    doctor.services.map((s) => ({ name: s.name, price: String(s.price) })),
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [saved, setSaved] = useState(false)

  const setField = (name: keyof typeof values) => (value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  function updateService(index: number, change: Partial<ServiceRow>) {
    setServices((prev) => prev.map((s, i) => (i === index ? { ...s, ...change } : s)))
    setSaved(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validation = validate(doctorProfileSchema, { ...values, services })
    if (!validation.success) {
      setErrors(validation.errors)
      setSaved(false)
      return
    }
    const result = updateDoctor(validation.data)
    if (!result.ok) {
      setErrors({ form: result.error })
      return
    }
    setErrors({})
    setSaved(true)
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-gray-900">პროფილის ინფორმაცია</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="სახელი და გვარი" value={values.fullName} error={errors.fullName} onChange={(e) => setField('fullName')(e.currentTarget.value)} />
        <Input
          label="ტელეფონი"
          type="tel"
          placeholder="5XX XX XX XX"
          value={values.phone}
          error={errors.phone}
          onChange={(e) => setField('phone')(e.currentTarget.value)}
        />
        <Input label="სპეციალობა" value={values.specialty} error={errors.specialty} onChange={(e) => setField('specialty')(e.currentTarget.value)} />
        <Input
          label="გამოცდილება (წელი)"
          type="number"
          inputMode="numeric"
          value={values.experienceYears}
          error={errors.experienceYears}
          onChange={(e) => setField('experienceYears')(e.currentTarget.value)}
        />
        <Input
          label="ენები"
          placeholder="ქართული, ინგლისური"
          value={values.languages}
          error={errors.languages}
          onChange={(e) => setField('languages')(e.currentTarget.value)}
        />
        <Input label="განათლება" value={values.education} error={errors.education} onChange={(e) => setField('education')(e.currentTarget.value)} />
        <Input label="მოკლე აღწერა" value={values.bio} error={errors.bio} onChange={(e) => setField('bio')(e.currentTarget.value)} />
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-semibold text-primary">სერვისები და ფასები</legend>
        {services.map((service, index) => (
          <div key={index} className="flex flex-wrap items-end gap-3">
            <div className="min-w-48 flex-1">
              <Input label="სერვისი" value={service.name} onChange={(e) => updateService(index, { name: e.currentTarget.value })} />
            </div>
            <div className="w-28">
              <Input
                label="ფასი (₾)"
                type="number"
                inputMode="numeric"
                value={service.price}
                onChange={(e) => updateService(index, { price: e.currentTarget.value })}
              />
            </div>
            <button
              type="button"
              onClick={() => setServices((prev) => prev.filter((_, i) => i !== index))}
              className="pb-2.5 text-sm font-medium text-gray-900 hover:text-red-600"
            >
              წაშლა
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setServices((prev) => [...prev, { name: '', price: '' }])}
          className="self-start text-sm font-medium text-primary hover:underline"
        >
          + სერვისის დამატება
        </button>
        {errors.services && <p className="text-xs text-red-600">{errors.services}</p>}
        <p className="text-xs text-gray-900">უკვე დაჯავშნილ ვიზიტებს ძველი ფასი შეუნარჩუნდებათ.</p>
      </fieldset>

      {errors.form && (
        <p role="alert" className="text-sm text-red-600">
          {errors.form}
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit">შენახვა</Button>
        {saved && (
          <p role="status" className="text-sm text-green-700">
            ცვლილებები შენახულია
          </p>
        )}
      </div>
    </form>
  )
}

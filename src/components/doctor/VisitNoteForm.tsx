import { useState, type FormEvent } from 'react'
import type { Appointment } from '../../interface/booking'
import type { VisitNote } from '../../interface/visitNote'
import { saveVisitNote } from '../../services/visitNoteService'
import { validate, type FormErrors } from '../../validation/authValidation'
import { DIAGNOSIS_MAX, PRESCRIPTION_MAX, visitNoteSchema } from '../../validation/visitNoteValidation'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface VisitNoteFormProps {
  doctorId: string
  appointment: Appointment
  note?: VisitNote
  onSaved: () => void
  onCancel: () => void
}

export function VisitNoteForm({ doctorId, appointment, note, onSaved, onCancel }: VisitNoteFormProps) {
  const [diagnosis, setDiagnosis] = useState(note?.diagnosis ?? '')
  const [prescription, setPrescription] = useState(note?.prescription ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validation = validate(visitNoteSchema, { diagnosis, prescription })
    if (!validation.success) {
      setErrors(validation.errors)
      return
    }
    const result = saveVisitNote(doctorId, appointment, validation.data)
    if (!result.ok) {
      setErrors({ form: result.error })
      return
    }
    onSaved()
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="mt-2 flex flex-col gap-3 rounded-lg bg-gray-50 p-3">
      <Input
        label="დიაგნოზი"
        value={diagnosis}
        onChange={(e) => setDiagnosis(e.currentTarget.value)}
        maxLength={DIAGNOSIS_MAX}
        placeholder="მაგ. არტერიული ჰიპერტენზია"
        error={errors.diagnosis}
      />
      <div className="flex flex-col gap-1">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-900">
          დანიშნულება (არასავალდებულო)
          <textarea
            value={prescription}
            onChange={(e) => setPrescription(e.currentTarget.value)}
            rows={4}
            maxLength={PRESCRIPTION_MAX}
            placeholder="მედიკამენტები, დოზა, რეკომენდაციები"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        {errors.prescription && <p className="text-xs text-red-600">{errors.prescription}</p>}
      </div>
      {errors.form && (
        <p role="alert" className="text-sm text-red-600">
          {errors.form}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit">შენახვა</Button>
        <Button variant="secondary" onClick={onCancel}>
          გაუქმება
        </Button>
      </div>
    </form>
  )
}

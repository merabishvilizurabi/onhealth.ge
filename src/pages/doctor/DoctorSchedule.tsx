import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { DAY_END, DAY_START, SLOT_MINUTES, WEEKDAYS } from '../../constants/schedule'
import { useAuth } from '../../hooks/useAuth'
import type { Weekday, WorkingDay } from '../../interface/booking'
import type { PublicClinic } from '../../interface/directory'
import type { ClinicMembership } from '../../interface/user'
import { getClinics } from '../../services/directoryService'
import { findOverlap, getSchedule, saveSchedule } from '../../services/scheduleService'
import { fromMinutes, toMinutes } from '../../utils/time'
import { workingDaySchema } from '../../validation/bookingValidation'

// Every half hour from DAY_START to DAY_END, for the time dropdowns
const TIME_OPTIONS: string[] = []
for (let t = toMinutes(DAY_START); t <= toMinutes(DAY_END); t += SLOT_MINUTES) TIME_OPTIONS.push(fromMinutes(t))

type DayRow = { enabled: boolean; start: string; end: string }
type WeekForm = Record<Weekday, DayRow>

function toForm(days: WorkingDay[]): WeekForm {
  const form = {} as WeekForm
  for (const { day } of WEEKDAYS) {
    const saved = days.find((d) => d.day === day)
    form[day] = saved ? { enabled: true, start: saved.start, end: saved.end } : { enabled: false, start: '10:00', end: '18:00' }
  }
  return form
}

const selectClass =
  'rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-40'

function ClinicScheduleForm({ doctorId, clinic, membership }: { doctorId: string; clinic: PublicClinic; membership: ClinicMembership }) {
  const [form, setForm] = useState<WeekForm>(() => toForm(getSchedule(doctorId, clinic.id)?.days ?? []))
  const [errors, setErrors] = useState<Partial<Record<Weekday, string>>>({})
  const [message, setMessage] = useState('')

  function update(day: Weekday, change: Partial<DayRow>) {
    setForm((prev) => ({ ...prev, [day]: { ...prev[day], ...change } }))
    setMessage('')
  }

  function handleSave() {
    const days: WorkingDay[] = []
    const found: Partial<Record<Weekday, string>> = {}

    for (const { day } of WEEKDAYS) {
      const row = form[day]
      if (!row.enabled) continue
      const result = workingDaySchema.safeParse({ day, start: row.start, end: row.end })
      if (result.success) days.push({ day, start: row.start, end: row.end })
      else found[day] = result.error.issues[0].message
    }

    const overlap = Object.keys(found).length === 0 ? findOverlap(doctorId, clinic.id, days) : null
    if (overlap) found[overlap.day] = 'ამ დროს სხვა კლინიკაში მუშაობთ'

    setErrors(found)
    if (Object.keys(found).length > 0) return

    saveSchedule({ doctorId, clinicId: clinic.id, days })
    setMessage('განრიგი შენახულია')
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{clinic.clinicName}</h2>
        <p className="text-sm text-gray-500">
          {clinic.city}, {clinic.address}
        </p>
        {membership.status === 'pending' && (
          <p className="mt-1 text-sm text-amber-700">კლინიკას ჯერ არ დაუდასტურებია — პაციენტები ამ კლინიკაში ვერ დაჯავშნიან.</p>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {WEEKDAYS.map(({ day, label }) => {
          const row = form[day]
          return (
            <li key={day} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex w-32 items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    onChange={(event) => update(day, { enabled: event.currentTarget.checked })}
                    className="size-4 accent-primary"
                  />
                  {label}
                </label>
                <select
                  aria-label={`${label} — დაწყება`}
                  value={row.start}
                  disabled={!row.enabled}
                  onChange={(event) => update(day, { start: event.currentTarget.value })}
                  className={selectClass}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <span className="text-gray-400">–</span>
                <select
                  aria-label={`${label} — დასრულება`}
                  value={row.end}
                  disabled={!row.enabled}
                  onChange={(event) => update(day, { end: event.currentTarget.value })}
                  className={selectClass}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              {errors[day] && <p className="text-xs text-red-600">{errors[day]}</p>}
            </li>
          )
        })}
      </ul>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave}>შენახვა</Button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </section>
  )
}

export function DoctorSchedule() {
  const { user } = useAuth()
  const [clinics] = useState(getClinics)

  if (user?.role !== 'doctor') return null
  const doctorId = user.id

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">განრიგი</h1>
        <p className="mt-1 text-sm text-gray-500">
          მიუთითეთ სამუშაო დღეები და საათები თითოეულ კლინიკაში. ვიზიტი გრძელდება {SLOT_MINUTES} წუთი.
        </p>
      </div>

      {user.clinics.length === 0 && <p className="text-sm text-gray-500">თქვენ ჯერ არცერთ კლინიკას არ ეკუთვნით.</p>}

      {user.clinics.map((membership) => {
        const clinic = clinics.find((c) => c.id === membership.clinicId)
        return clinic ? (
          <ClinicScheduleForm key={clinic.id} doctorId={doctorId} clinic={clinic} membership={membership} />
        ) : null
      })}
    </div>
  )
}

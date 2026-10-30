import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import type { PublicClinic, PublicDoctor } from '../../interface/directory'
import { PATHS, bookingPath } from '../../router/paths'
import { BOOKING_DAYS_AHEAD, MONTHS_SHORT, WEEKDAYS } from '../../constants/schedule'
import { getDaySlots, getFreeSlots, getPatientAppointments, isUpcoming } from '../../services/appointmentService'
import { addDays, formatDateLong, formatDateShort, fromDateKey, toDateKey } from '../../utils/time'
import { Button } from '../ui/Button'

interface BookingPanelProps {
  doctor: PublicDoctor
  clinics: PublicClinic[] // verified clinics only
}

const chip = (active: boolean) =>
  `rounded-lg border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
    active ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary'
  }`

// Pick a clinic → date → time, then continue to the booking page to confirm.
// Guests are sent to sign in first and come back to the booking page.
export function BookingPanel({ doctor, clinics }: BookingPanelProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Coming from a clinic's page (?clinic=…) preselects that clinic
  const requested = searchParams.get('clinic')
  const [clinicId, setClinicId] = useState(
    clinics.some((c) => c.id === requested) ? requested! : (clinics[0]?.id ?? ''),
  )
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  // A patient who already has a visit with this doctor sees the booking form only after pressing a button
  const [showForm, setShowForm] = useState(false)

  // The next BOOKING_DAYS_AHEAD days; days without free times are shown but disabled
  const dates = Array.from({ length: BOOKING_DAYS_AHEAD }, (_, i) => toDateKey(addDays(new Date(), i)))
  const hasAnyTime = clinicId !== '' && dates.some((d) => getFreeSlots(doctor.id, clinicId, d).length > 0)
  // The patient's upcoming visits with this doctor
  const myVisits =
    user?.role === 'patient'
      ? getPatientAppointments(user.id)
          .filter((a) => a.doctorId === doctor.id && isUpcoming(a))
          .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
      : []

  // Every time of the chosen day; booked ones are shown greyed out
  const daySlots = clinicId && date ? getDaySlots(doctor.id, clinicId, date) : []

  function chooseClinic(id: string) {
    setClinicId(id)
    setDate('')
    setTime('')
  }

  function chooseDate(next: string) {
    setDate(next)
    setTime('')
  }

  if (clinics.length === 0) {
    return <p className="text-sm text-gray-500">ექიმი ჯერ არცერთ კლინიკაში არ არის დადასტურებული.</p>
  }

  const visitsBox = myVisits.length > 0 && (
    <div className="flex flex-col gap-2 rounded-xl bg-primary-soft p-4 text-sm">
      <p className="font-medium text-gray-900">თქვენი დაჯავშნილი ვიზიტები ამ ექიმთან</p>
      <ul className="flex flex-col gap-1 text-gray-700">
        {myVisits.map((visit) => {
          const clinic = clinics.find((c) => c.id === visit.clinicId)
          return (
            <li key={visit.id}>
              {formatDateLong(visit.date)}, {visit.time}
              {clinic && <span className="text-gray-500"> · {clinic.clinicName}</span>}
            </li>
          )
        })}
      </ul>
      <Link to={PATHS.profile} className="self-start font-medium text-primary hover:underline">
        ჩემი ვიზიტები →
      </Link>
    </div>
  )

  if (myVisits.length > 0 && !showForm) {
    return (
      <div className="flex flex-col gap-5">
        {visitsBox}
        <Button variant="secondary" onClick={() => setShowForm(true)} className="self-start">
          ახალი ვიზიტის დაჯავშნა
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {visitsBox}

      {clinics.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-700">კლინიკა</legend>
          <div className="flex flex-wrap gap-2">
            {clinics.map((clinic) => (
              <button
                key={clinic.id}
                type="button"
                aria-pressed={clinic.id === clinicId}
                onClick={() => chooseClinic(clinic.id)}
                className={chip(clinic.id === clinicId)}
              >
                {clinic.clinicName}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* min-w-0: a fieldset otherwise refuses to shrink, and the date strip would widen the page */}
      <fieldset className="min-w-0">
        <legend className="mb-2 text-sm font-medium text-gray-700">თარიღი</legend>
        {hasAnyTime ? (
          // Calendar-style strip: weekday / day / month, scrolls sideways on small screens
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
            {dates.map((d) => {
              const day = fromDateKey(d)
              const active = d === date
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={active}
                  aria-label={formatDateLong(d)}
                  onClick={() => chooseDate(d)}
                  disabled={getFreeSlots(doctor.id, clinicId, d).length === 0}
                  className={`flex w-14 shrink-0 flex-col items-center rounded-lg border py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                    active
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary'
                  }`}
                >
                  <span className="text-xs">{WEEKDAYS.find((w) => w.day === day.getDay())?.short}</span>
                  <span className="text-lg font-semibold leading-tight">{day.getDate()}</span>
                  <span className="text-xs">{MONTHS_SHORT[day.getMonth()]}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">ამ კლინიკაში უახლოეს {BOOKING_DAYS_AHEAD} დღეში თავისუფალი დრო არ არის.</p>
        )}
      </fieldset>

      {date && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-700">დრო</legend>
          {daySlots.some((slot) => slot.free) ? (
            <div className="flex flex-wrap gap-2">
              {daySlots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  aria-pressed={slot.time === time}
                  aria-label={slot.free ? slot.time : `${slot.time} — დაკავებულია`}
                  title={slot.free ? undefined : 'დაკავებულია'}
                  disabled={!slot.free}
                  onClick={() => setTime(slot.time)}
                  className={`${chip(slot.time === time)} disabled:bg-gray-100 disabled:line-through`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">ამ დღეს თავისუფალი დრო აღარ არის.</p>
          )}
        </fieldset>
      )}

      {user && user.role !== 'patient' ? (
        <p className="text-sm text-gray-500">ვიზიტის დაჯავშნა მხოლოდ პაციენტს შეუძლია.</p>
      ) : (
        <>
          <Button
            onClick={() => navigate(bookingPath(doctor.id, { clinic: clinicId, date, time }))}
            disabled={!time}
            className="self-start"
          >
            დაჯავშნა{time && ` — ${formatDateShort(date)}, ${time}`}
          </Button>
          {!user && <p className="text-sm text-gray-500">დასაჯავშნად საჭიროა ანგარიშზე შესვლა.</p>}
        </>
      )}
    </div>
  )
}

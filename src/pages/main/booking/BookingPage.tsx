import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { Button } from '../../../components/ui/Button'
import { BOOKING_DAYS_AHEAD, SLOT_MINUTES } from '../../../constants/schedule'
import { useAuth } from '../../../hooks/useAuth'
import type { Appointment, PaymentMethod } from '../../../interface/booking'
import type { PublicClinic, PublicDoctor } from '../../../interface/directory'
import { PATHS, doctorProfilePath } from '../../../router/paths'
import { CANCEL_HOURS_BEFORE, bookAppointment, getFreeSlots } from '../../../services/appointmentService'
import { getClinics, getDoctor, getVerifiedClinics } from '../../../services/directoryService'
import { addDays, formatDateLong, toDateKey } from '../../../utils/time'
import { validate } from '../../../validation/authValidation'
import { REASON_MAX, bookingSchema } from '../../../validation/bookingValidation'

const PAYMENT_OPTIONS: { value: PaymentMethod; title: string; hint: string }[] = [
  { value: 'online', title: 'ონლაინ', hint: 'ბარათით, დაჯავშნისას' },
  { value: 'clinic', title: 'კლინიკაში', hint: 'რეგისტრატურაში, ვიზიტის დღეს' },
]

function StepTitle({ number, children }: { number: number; children: ReactNode }) {
  return (
    <legend className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
      <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-white">{number}</span>
      {children}
    </legend>
  )
}

export function BookingPage() {
  const { id = '' } = useParams()
  const [searchParams] = useSearchParams()
  const clinicId = searchParams.get('clinic') ?? ''
  const date = searchParams.get('date') ?? ''
  const time = searchParams.get('time') ?? ''

  const [doctor] = useState(() => getDoctor(id))
  const [clinic] = useState(() =>
    doctor ? getVerifiedClinics(doctor, getClinics()).find((c) => c.id === clinicId) : undefined,
  )
  const [booked, setBooked] = useState<Appointment | null>(null)

  if (booked && doctor && clinic) return <BookedView appointment={booked} doctor={doctor} clinic={clinic} />

  const lastDay = toDateKey(addDays(new Date(), BOOKING_DAYS_AHEAD - 1))
  const available =
    doctor && clinic && date <= lastDay && getFreeSlots(doctor.id, clinic.id, date).includes(time)

  if (!doctor || !clinic || !available) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-start gap-3 px-4 py-16">
        <h1 className="text-xl font-semibold text-gray-900">ეს დრო აღარ არის ხელმისაწვდომი</h1>
        <p className="text-sm text-gray-900">შესაძლოა, ის უკვე დაჯავშნა სხვამ ან ბმული მოძველებულია.</p>
        <Link
          to={doctor ? doctorProfilePath(doctor.id) : PATHS.home}
          className="text-sm font-medium text-primary hover:underline"
        >
          {doctor ? 'სხვა დროის არჩევა' : 'მთავარ გვერდზე დაბრუნება'}
        </Link>
      </div>
    )
  }

  return <BookingForm doctor={doctor} clinic={clinic} date={date} time={time} onBooked={setBooked} />
}

interface BookingFormProps {
  doctor: PublicDoctor
  clinic: PublicClinic
  date: string
  time: string
  onBooked: (appointment: Appointment) => void
}

function BookingForm({ doctor, clinic, date, time, onBooked }: BookingFormProps) {
  const { user } = useAuth()
  const [serviceName, setServiceName] = useState(doctor.services[0]?.name ?? '')
  const [reason, setReason] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('online')
  const [error, setError] = useState('')

  const service = doctor.services.find((s) => s.name === serviceName)
  const backToDoctor = `${doctorProfilePath(doctor.id)}?clinic=${clinic.id}`

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (user?.role !== 'patient') return

    const validation = validate(bookingSchema, { clinicId: clinic.id, date, time, serviceName, reason, payment })
    if (!validation.success) {
      setError(Object.values(validation.errors)[0])
      return
    }
    const result = bookAppointment(user.id, doctor, validation.data)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onBooked(result.appointment)
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <div>
        <Link to={backToDoctor} className="text-sm text-gray-900 hover:text-primary">
          ← {doctor.fullName}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">ვიზიტის დადასტურება</h1>
        <p className="text-sm text-gray-900">აირჩიეთ ვიზიტის ტიპი და გადახდის მეთოდი</p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-8">
          <fieldset>
            <StepTitle number={1}>ვიზიტის ტიპი</StepTitle>
            {doctor.services.length === 0 && (
              <p className="text-sm text-gray-900">ექიმს სერვისები ჯერ არ აქვს დამატებული.</p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {doctor.services.map((s) => (
                <label
                  key={s.name}
                  className={`flex cursor-pointer flex-col gap-1 rounded-xl border bg-white p-4 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-primary/30 ${
                    s.name === serviceName ? 'border-primary ring-1 ring-primary' : 'border-gray-200 hover:border-primary'
                  }`}
                >
                  <input
                    type="radio"
                    name="service"
                    value={s.name}
                    checked={s.name === serviceName}
                    onChange={() => setServiceName(s.name)}
                    className="sr-only"
                  />
                  <span className="text-sm text-gray-900">{s.name}</span>
                  <span className="text-xl font-semibold text-gray-900">{s.price} ₾</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <StepTitle number={2}>ვიზიტის მიზეზი</StepTitle>
            <label className="flex flex-col gap-1">
              <span className="sr-only">ვიზიტის მიზეზი (არასავალდებულო)</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.currentTarget.value)}
                rows={3}
                maxLength={REASON_MAX}
                placeholder="არასავალდებულო. მაგ: წნევის მატება, ყოველწლიური გასინჯვა"
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <span className="self-end text-xs text-gray-900">
                {reason.length} / {REASON_MAX}
              </span>
            </label>
          </fieldset>

          <fieldset>
            <StepTitle number={3}>გადახდა</StepTitle>
            <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
              {PAYMENT_OPTIONS.map((p) => (
                <label
                  key={p.value}
                  className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors has-focus-visible:ring-2 has-focus-visible:ring-primary/30 ${
                    p.value === payment ? 'bg-primary text-white' : 'text-gray-900 hover:text-primary'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={p.value}
                    checked={p.value === payment}
                    onChange={() => setPayment(p.value)}
                    className="sr-only"
                  />
                  {p.title}
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-900">{PAYMENT_OPTIONS.find((p) => p.value === payment)?.hint}</p>
          </fieldset>
        </div>

        <aside className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 lg:sticky lg:top-6">
          <VisitDetails doctor={doctor} clinic={clinic} date={date} time={time} />
          <Link to={backToDoctor} className="self-start text-sm font-medium text-primary hover:underline">
            დროის ან კლინიკის შეცვლა
          </Link>

          <div className="flex flex-col gap-1 border-t border-dashed border-gray-200 pt-4 text-sm">
            {service && (
              <p className="flex justify-between text-gray-900">
                <span>{service.name}</span>
                <span>{service.price} ₾</span>
              </p>
            )}
            <p className="flex items-baseline justify-between">
              <span className="font-medium text-gray-900">სულ</span>
              <span className="text-2xl font-semibold text-gray-900">{service ? `${service.price} ₾` : '—'}</span>
            </p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" disabled={!service} fullWidth>
            {payment === 'online' ? 'დაჯავშნა და გადახდა' : 'დაჯავშნა'}
          </Button>
          <p className="text-xs text-gray-900">
            გაუქმება შესაძლებელია ვიზიტამდე {CANCEL_HOURS_BEFORE} საათით ადრე.
            {payment === 'online' && ' ონლაინ გადახდილი თანხა უბრუნდება.'}
          </p>
        </aside>
      </form>
    </div>
  )
}

function VisitDetails({ doctor, clinic, date, time }: { doctor: PublicDoctor; clinic: PublicClinic; date: string; time: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary"
        >
          {doctor.fullName.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-gray-900">{doctor.fullName}</p>
          <p className="text-sm text-primary">{doctor.specialty}</p>
        </div>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-gray-900">თარიღი</dt>
        <dd className="text-gray-900">{formatDateLong(date)}</dd>
        <dt className="text-gray-900">დრო</dt>
        <dd className="text-gray-900">
          {time} · {SLOT_MINUTES} წუთი
        </dd>
        <dt className="text-gray-900">კლინიკა</dt>
        <dd className="text-gray-900">
          {clinic.clinicName}
          <span className="block text-gray-900">
            {clinic.city}, {clinic.address}
          </span>
        </dd>
      </dl>
    </div>
  )
}

function BookedView({ appointment, doctor, clinic }: { appointment: Appointment; doctor: PublicDoctor; clinic: PublicClinic }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">ვიზიტი დაჯავშნილია ✓</h1>
        <p className="mt-1 text-sm text-gray-900">ვიზიტს ნახავთ და მართავთ თქვენს პროფილზე.</p>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5">
        <VisitDetails doctor={doctor} clinic={clinic} date={appointment.date} time={appointment.time} />
        {appointment.service && (
          <p className="border-t border-dashed border-gray-200 pt-4 text-sm text-gray-900">
            {appointment.service.name} · {appointment.service.price} ₾ ·{' '}
            {appointment.payment === 'online' ? 'გადახდა ონლაინ' : 'გადახდა კლინიკაში'}
          </p>
        )}
      </section>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link to={PATHS.profile} className="font-medium text-primary hover:underline">
          ჩემი ვიზიტები
        </Link>
        <Link to={PATHS.home} className="font-medium text-gray-900 hover:text-primary">
          მთავარი გვერდი
        </Link>
      </div>
    </div>
  )
}

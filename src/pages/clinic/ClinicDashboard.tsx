import { useState } from 'react'
import { Link } from 'react-router'
import { AddDoctorForm } from '../../components/clinic/AddDoctorForm'
import { ClinicInfoForm } from '../../components/clinic/ClinicInfoForm'
import { PasswordForm } from '../../components/profile/PasswordForm'
import { VisitList } from '../../components/clinic/VisitList'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { PATHS, clinicDoctorPath, clinicProfilePath } from '../../router/paths'
import { getClinicAppointments, isUpcoming } from '../../services/appointmentService'
import { getClinicDoctors, getPatientsById, verifyDoctor } from '../../services/clinicService'
import { getClinicStats } from '../../services/clinicStatsService'
import { formatDateShort, toDateKey } from '../../utils/time'

const byDateTime = (a: { date: string; time: string }, b: { date: string; time: string }) =>
  `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)

export function ClinicDashboard() {
  const { user } = useAuth()
  const clinicId = user?.id ?? ''

  const [doctors, setDoctors] = useState(() => getClinicDoctors(clinicId))
  const [appointments] = useState(() => getClinicAppointments(clinicId))
  const [patients] = useState(getPatientsById)
  const [panel, setPanel] = useState<'addDoctor' | 'editInfo' | null>(null)
  const [message, setMessage] = useState('')

  if (user?.role !== 'clinic') return null

  const today = toDateKey(new Date())
  const verified = doctors.filter((d) => d.status === 'verified')
  const pending = doctors.filter((d) => d.status === 'pending')
  const upcoming = appointments.filter(isUpcoming).sort(byDateTime)
  const todays = appointments.filter((a) => a.date === today && a.status === 'booked').sort(byDateTime)
  const weekIncome = getClinicStats(clinicId, 7).income
  const doctorsById = new Map(doctors.map(({ doctor }) => [doctor.id, doctor]))

  const stats = [
    { label: 'ექიმი', value: verified.length },
    { label: 'დღევანდელი ვიზიტი', value: todays.length },
    { label: 'დაგეგმილი ვიზიტი', value: upcoming.length },
    { label: 'შემოსავალი, 7 დღე', value: `${weekIncome} ₾` },
  ]

  function handleVerify(doctorId: string) {
    verifyDoctor(clinicId, doctorId)
    setDoctors(getClinicDoctors(clinicId))
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-gray-900">კლინიკის პანელი</p>
          <h1 className="text-2xl font-semibold text-gray-900">{user.clinicName}</h1>
          <p className="text-sm text-gray-900">
            {user.city}, {user.address} · {user.phone}
          </p>
          <Link to={clinicProfilePath(user.id)} className="text-sm font-medium text-primary hover:underline">
            საჯარო გვერდის ნახვა →
          </Link>
        </div>
        {panel === null && (
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setPanel('editInfo')
                setMessage('')
              }}
            >
              ინფორმაციის რედაქტირება
            </Button>
            <Button
              onClick={() => {
                setPanel('addDoctor')
                setMessage('')
              }}
            >
              + ექიმის დამატება
            </Button>
          </div>
        )}
      </section>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <dt className="text-sm text-gray-900">{stat.label}</dt>
            <dd className="text-2xl font-semibold text-gray-900">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <Link to={PATHS.clinicStats} className="-mt-5 self-end text-sm font-medium text-primary hover:underline">
        სრული სტატისტიკა →
      </Link>

      {panel === 'editInfo' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
          <ClinicInfoForm
            clinic={user}
            hasDoctors={doctors.length > 0}
            onCancel={() => setPanel(null)}
            onSaved={() => {
              setPanel(null)
              setMessage('კლინიკის ინფორმაცია შენახულია.')
            }}
          />
          <PasswordForm />
        </div>
      )}
      {panel === 'addDoctor' && (
        <AddDoctorForm
          clinic={user}
          onCancel={() => setPanel(null)}
          onAdded={(text) => {
            setPanel(null)
            setMessage(text)
            setDoctors(getClinicDoctors(clinicId))
          }}
        />
      )}
      {message && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          {message}
        </p>
      )}

      {pending.length > 0 && (
        <section aria-labelledby="pending-title" className="flex flex-col gap-3">
          <h2 id="pending-title" className="text-lg font-semibold text-gray-900">
            დადასტურების მოლოდინში
          </h2>
          <ul className="flex flex-col gap-2">
            {pending.map(({ doctor }) => (
              <li
                key={doctor.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">{doctor.fullName}</p>
                  <p className="text-sm text-gray-900">
                    {doctor.specialty} · {doctor.email}
                  </p>
                </div>
                <Button onClick={() => handleVerify(doctor.id)}>დადასტურება</Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="doctors-title" className="flex flex-col gap-3">
        <h2 id="doctors-title" className="text-lg font-semibold text-gray-900">
          ექიმები
        </h2>
        {verified.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {verified.map(({ doctor }) => {
              const next = upcoming.find((a) => a.doctorId === doctor.id)
              const count = upcoming.filter((a) => a.doctorId === doctor.id).length
              return (
                <article
                  key={doctor.id}
                  className="relative flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary"
                >
                  <div
                    aria-hidden="true"
                    className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary"
                  >
                    {doctor.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-medium text-gray-900">
                      <Link to={clinicDoctorPath(doctor.id)} className="after:absolute after:inset-0 after:rounded-xl">
                        {doctor.fullName}
                      </Link>
                    </h3>
                    <p className="text-sm text-primary">{doctor.specialty}</p>
                    <p className="text-sm text-gray-900">
                      {next ? `დაგეგმილი: ${count} · შემდეგი ${formatDateShort(next.date)}, ${next.time}` : 'დაგეგმილი ვიზიტი არ არის'}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-900">ექიმები ჯერ არ გყავთ. დაამატეთ პირველი ექიმი.</p>
        )}
      </section>

      <section aria-labelledby="today-title" className="flex flex-col gap-3">
        <h2 id="today-title" className="text-lg font-semibold text-gray-900">
          დღევანდელი ვიზიტები
        </h2>
        <VisitList visits={todays} patients={patients} doctors={doctorsById} empty="დღეს ვიზიტები არ არის." />
      </section>
    </div>
  )
}

import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { AccountForm } from '../../../components/profile/AccountForm'
import { PasswordForm } from '../../../components/profile/PasswordForm'
import { PatientVisits } from '../../../components/profile/PatientVisits'
import { useAuth } from '../../../hooks/useAuth'
import { getPatientAppointments, isUpcoming } from '../../../services/appointmentService'
import { getReviewForAppointment } from '../../../services/reviewService'

const TABS = [
  { id: 'visits', label: 'ვიზიტები' },
  { id: 'account', label: 'ანგარიში' },
] as const

// The patient's own page, opened from their name in the header.
// ?tab=account opens account settings; without it the visits are shown.
export function PatientProfile() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'account' ? 'account' : 'visits'

  const patientId = user?.id ?? ''
  const [appointments, setAppointments] = useState(() => getPatientAppointments(patientId))
  // Reading again gives a new array, so counts and reviews below are recalculated
  const refresh = () => setAppointments(getPatientAppointments(patientId))

  if (user?.role !== 'patient') return null // ProtectedRoute lets only patients in

  // Small counters next to the name
  const stats = [
    { label: 'მომავალი', value: appointments.filter(isUpcoming).length },
    { label: 'ჩატარებული', value: appointments.filter((a) => a.status === 'booked' && !isUpcoming(a)).length },
    { label: 'შეფასება', value: appointments.filter((a) => getReviewForAppointment(a.id)).length },
  ]

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
      {/* Who is signed in */}
      <section className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xl font-semibold text-primary"
          >
            {user.fullName.charAt(0)}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-gray-900">{user.fullName}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-sm text-gray-500">{user.phone}</p>
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-3 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg bg-gray-50 px-3 py-2">
              <dt className="text-xs text-gray-500">{stat.label}</dt>
              <dd className="text-lg font-semibold text-gray-900">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div role="tablist" aria-label="პროფილი" className="flex gap-2 border-b border-gray-200">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setSearchParams(new URLSearchParams(id === 'visits' ? '' : `tab=${id}`))}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              tab === id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'visits' ? (
        <PatientVisits patient={user} appointments={appointments} onChange={refresh} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <AccountForm patient={user} />
          <PasswordForm />
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { VisitList } from '../../components/clinic/VisitList'
import { DoctorProfileForm } from '../../components/doctor/DoctorProfileForm'
import { VisitNoteForm } from '../../components/doctor/VisitNoteForm'
import { WeekCalendar } from '../../components/doctor/WeekCalendar'
import { PasswordForm } from '../../components/profile/PasswordForm'
import { IncomeChart } from '../../components/stats/IncomeChart'
import { Pagination } from '../../components/ui/Pagination'
import { useAuth } from '../../hooks/useAuth'
import { usePagination } from '../../hooks/usePagination'
import type { Appointment } from '../../interface/booking'
import { doctorProfilePath } from '../../router/paths'
import { getDoctorAppointments, isUpcoming } from '../../services/appointmentService'
import { getPatientsById } from '../../services/clinicService'
import { getClinics } from '../../services/directoryService'
import { changeText, getPeriodStats, sumIncome } from '../../services/statsService'
import { canWriteNote, getVisitNote } from '../../services/visitNoteService'
import { toDateKey } from '../../utils/time'
import { DoctorSchedule } from './DoctorSchedule'

const TABS = [
  { id: 'visits', label: 'ვიზიტები' },
  { id: 'calendar', label: 'კალენდარი' },
  { id: 'hours', label: 'სამუშაო საათები' },
  { id: 'income', label: 'შემოსავალი' },
  { id: 'profile', label: 'პროფილი' },
] as const

type TabId = (typeof TABS)[number]['id']

const PAGE_SIZE = 6
const byDateTime = (a: Appointment, b: Appointment) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)

const tabButton = (active: boolean) =>
  `-mb-px shrink-0 border-b-2 px-3 py-2 text-sm font-medium ${
    active ? 'border-primary text-primary' : 'border-transparent text-gray-900 hover:text-primary'
  }`

export function DoctorDashboard() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: TabId = TABS.find((t) => t.id === searchParams.get('tab'))?.id ?? 'visits'

  const doctorId = user?.id ?? ''
  const [appointments] = useState(() => getDoctorAppointments(doctorId))
  const [patients] = useState(getPatientsById)
  const [allClinics] = useState(getClinics)
  const [writing, setWriting] = useState<string | null>(null)
  const [, setVersion] = useState(0)
  const [period, setPeriod] = useState(7)

  const upcoming = appointments.filter(isUpcoming).sort(byDateTime)
  const past = appointments.filter((a) => !isUpcoming(a)).sort((a, b) => byDateTime(b, a))
  const upcomingPages = usePagination(upcoming, PAGE_SIZE)
  const pastPages = usePagination(past, PAGE_SIZE)

  if (user?.role !== 'doctor') return null

  const clinics = allClinics.filter((c) => user.clinics.some((m) => m.clinicId === c.id))
  const clinicsById = new Map(clinics.map((c) => [c.id, c]))
  const today = toDateKey(new Date())
  const withoutNote = past.filter((a) => canWriteNote(a) && !getVisitNote(a.id))
  const month = getPeriodStats(appointments, 30)

  const cards = [
    { label: 'დღევანდელი ვიზიტი', value: appointments.filter((a) => a.date === today && a.status === 'booked').length },
    { label: 'დაგეგმილი ვიზიტი', value: upcoming.length },
    { label: 'ჩანაწერის მოლოდინში', value: withoutNote.length },
    { label: 'შემოსავალი, 30 დღე', value: `${month.income} ₾` },
  ]

  function renderNote(visit: Appointment) {
    if (!canWriteNote(visit)) return null
    const note = getVisitNote(visit.id)
    if (writing === visit.id) {
      return (
        <VisitNoteForm
          doctorId={doctorId}
          appointment={visit}
          note={note}
          onCancel={() => setWriting(null)}
          onSaved={() => {
            setWriting(null)
            setVersion((v) => v + 1)
          }}
        />
      )
    }
    return note ? (
      <div className="mt-1 flex flex-col gap-1 rounded-lg bg-gray-50 p-3 text-sm">
        <p>
          <span className="text-gray-900">დიაგნოზი: </span>
          <span className="text-gray-900">{note.diagnosis}</span>
        </p>
        {note.prescription && (
          <p className="whitespace-pre-line">
            <span className="text-gray-900">დანიშნულება: </span>
            <span className="text-gray-900">{note.prescription}</span>
          </p>
        )}
        <button type="button" onClick={() => setWriting(visit.id)} className="self-start font-medium text-primary hover:underline">
          რედაქტირება
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={() => setWriting(visit.id)}
        className="mt-1 rounded-lg border border-dashed border-primary px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary-soft"
      >
        + დიაგნოზი და დანიშნულება
      </button>
    )
  }

  const stats = getPeriodStats(appointments, period)
  const byClinic = clinics.map((clinic) => {
    const done = stats.done.filter((a) => a.clinicId === clinic.id)
    return { clinic, visits: done.length, income: sumIncome(done) }
  })

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <section className="flex flex-col gap-1">
        <p className="text-sm text-gray-900">ექიმის პანელი</p>
        <h1 className="text-2xl font-semibold text-gray-900">{user.fullName}</h1>
        <p className="text-sm text-primary">
          {user.specialty}
          <span className="text-gray-900"> · {clinics.map((c) => c.clinicName).join(', ') || 'კლინიკის გარეშე'}</span>
        </p>
        {clinics.length > 0 && (
          <Link to={doctorProfilePath(user.id)} className="text-sm font-medium text-primary hover:underline">
            საჯარო პროფილის ნახვა →
          </Link>
        )}
      </section>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <dt className="text-sm text-gray-900">{card.label}</dt>
            <dd className="text-2xl font-semibold text-gray-900">{card.value}</dd>
          </div>
        ))}
      </dl>

      <div role="tablist" aria-label="ექიმის პანელი" className="flex gap-1 overflow-x-auto border-b border-gray-200">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setSearchParams(new URLSearchParams(id === 'visits' ? '' : `tab=${id}`))}
            className={tabButton(tab === id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'visits' && (
        <>
          <section aria-labelledby="upcoming-title" className="flex flex-col gap-3">
            <h2 id="upcoming-title" className="text-lg font-semibold text-gray-900">
              დაგეგმილი ვიზიტები
            </h2>
            <VisitList visits={upcomingPages.pageItems} patients={patients} clinics={clinicsById} empty="დაგეგმილი ვიზიტი არ გაქვთ." />
            <Pagination page={upcomingPages.page} pageCount={upcomingPages.pageCount} onChange={upcomingPages.setPage} label="დაგეგმილი ვიზიტების გვერდები" />
          </section>
          <section aria-labelledby="past-title" className="flex flex-col gap-3">
            <h2 id="past-title" className="text-lg font-semibold text-gray-900">
              ჩატარებული და გაუქმებული ვიზიტები
            </h2>
            <p className="-mt-2 text-sm text-gray-900">დიაგნოზსა და დანიშნულებას პაციენტი ნახავს თავის პროფილზე.</p>
            <VisitList
              visits={pastPages.pageItems}
              patients={patients}
              clinics={clinicsById}
              renderExtra={renderNote}
              empty="ვიზიტების ისტორია ცარიელია."
            />
            <Pagination page={pastPages.page} pageCount={pastPages.pageCount} onChange={pastPages.setPage} label="წარსული ვიზიტების გვერდები" />
          </section>
        </>
      )}

      {tab === 'calendar' && <WeekCalendar doctorId={doctorId} clinics={clinics} appointments={appointments} patients={patients} />}

      {tab === 'hours' && <DoctorSchedule />}

      {tab === 'income' && (
        <div className="flex flex-col gap-6">
          <div role="radiogroup" aria-label="პერიოდი" className="inline-flex self-start rounded-lg border border-gray-200 bg-white p-1">
            {[7, 30].map((days) => (
              <button
                key={days}
                type="button"
                role="radio"
                aria-checked={period === days}
                onClick={() => setPeriod(days)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium ${period === days ? 'bg-primary text-white' : 'text-gray-900 hover:text-primary'}`}
              >
                {days} დღე
              </button>
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: 'შემოსავალი', value: `${stats.income} ₾`, note: changeText(stats.income, stats.previousIncome) },
              { label: 'ჩატარებული ვიზიტი', value: stats.visits, note: '' },
              { label: 'გაუქმებული', value: stats.cancelled, note: '' },
              { label: 'მოსალოდნელი', value: `${stats.expectedIncome} ₾`, note: 'დაჯავშნილი ვიზიტები' },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4">
                <dt className="text-sm text-gray-900">{card.label}</dt>
                <dd className="text-2xl font-semibold text-gray-900">{card.value}</dd>
                {card.note && <dd className="text-xs text-gray-900">{card.note}</dd>}
              </div>
            ))}
          </dl>
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">შემოსავალი დღეების მიხედვით</h2>
            <IncomeChart days={stats.days} />
          </section>
          <div className="grid gap-6 md:grid-cols-2">
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-gray-900">კლინიკების მიხედვით</h2>
              <ul className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white text-sm">
                {byClinic.map((row) => (
                  <li key={row.clinic.id} className="flex justify-between gap-3 p-4">
                    <span className="text-gray-900">
                      {row.clinic.clinicName}
                      <span className="block text-gray-900">{row.visits} ვიზიტი</span>
                    </span>
                    <span className="font-semibold text-gray-900">{row.income} ₾</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-gray-900">გადახდის მეთოდი</h2>
              <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 text-sm">
                <div className="flex h-3 overflow-hidden rounded-full bg-gray-200" aria-hidden="true">
                  <div className="bg-primary" style={{ width: `${stats.visits > 0 ? (stats.online / stats.visits) * 100 : 0}%` }} />
                </div>
                <p className="flex justify-between text-gray-900">
                  <span>ონლაინ: {stats.online}</span>
                  <span>კლინიკაში: {stats.visits - stats.online}</span>
                </p>
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === 'profile' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
          <DoctorProfileForm doctor={user} />
          <PasswordForm />
        </div>
      )}
    </div>
  )
}

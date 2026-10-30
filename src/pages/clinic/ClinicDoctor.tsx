import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { VisitList } from '../../components/clinic/VisitList'
import { RatingBadge } from '../../components/reviews/Stars'
import { Button } from '../../components/ui/Button'
import { Pagination } from '../../components/ui/Pagination'
import { useAuth } from '../../hooks/useAuth'
import { usePagination } from '../../hooks/usePagination'
import type { Appointment } from '../../interface/booking'
import { PATHS, doctorProfilePath } from '../../router/paths'
import { getClinicAppointments, isUpcoming } from '../../services/appointmentService'
import { getClinicDoctors, getPatientsById, removeDoctor, verifyDoctor } from '../../services/clinicService'
import { getDoctorSummary } from '../../services/doctorSummaryService'

const PAGE_SIZE = 6
const byDateTime = (a: Appointment, b: Appointment) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)

export function ClinicDoctor() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const clinicId = user?.id ?? ''
  const [confirmRemove, setConfirmRemove] = useState(false)

  const [entry, setEntry] = useState(() => getClinicDoctors(clinicId).find((d) => d.doctor.id === id))
  const [visits] = useState(() => getClinicAppointments(clinicId).filter((a) => a.doctorId === id))
  const [patients] = useState(getPatientsById)

  const upcoming = visits.filter(isUpcoming).sort(byDateTime)
  const past = visits.filter((a) => !isUpcoming(a)).sort((a, b) => byDateTime(b, a))
  const upcomingPages = usePagination(upcoming, PAGE_SIZE)
  const pastPages = usePagination(past, PAGE_SIZE)

  if (user?.role !== 'clinic') return null

  if (!entry) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">ექიმი ამ კლინიკაში ვერ მოიძებნა</h1>
        <Link to={PATHS.clinicDashboard} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
          პანელზე დაბრუნება
        </Link>
      </div>
    )
  }

  const { doctor, status } = entry
  const summary = getDoctorSummary(doctor, [user])
  const hours = summary.hours[0]?.lines ?? []
  const done = past.filter((a) => a.status === 'booked')
  const stats = [
    { label: 'დაგეგმილი', value: upcoming.length },
    { label: 'ჩატარებული', value: done.length },
    { label: 'გაუქმებული', value: past.length - done.length },
    { label: 'შემოსავალი', value: `${done.reduce((sum, a) => sum + (a.service?.price ?? 0), 0)} ₾` },
  ]

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <Link to={PATHS.clinicDashboard} className="text-sm text-gray-900 hover:text-primary">
        ← ექიმები
      </Link>

      {status === 'pending' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-gray-900">ექიმი ელოდება დადასტურებას. მანამდე ის საიტზე არ ჩანს ამ კლინიკაში.</p>
          <Button
            onClick={() => {
              verifyDoctor(clinicId, doctor.id)
              setEntry(getClinicDoctors(clinicId).find((d) => d.doctor.id === id))
            }}
          >
            დადასტურება
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-4">
            <div
              aria-hidden="true"
              className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-soft text-2xl font-semibold text-primary"
            >
              {doctor.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900">{doctor.fullName}</h1>
              <p className="text-primary">{doctor.specialty}</p>
              <p className="flex flex-wrap gap-x-3 text-sm text-gray-900">
                <RatingBadge rating={summary.rating} />
                <span>{doctor.experienceYears} წლის გამოცდილება</span>
              </p>
            </div>
          </div>

          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-900">ელ. ფოსტა (შესვლისთვის)</dt>
              <dd className="text-gray-900">{doctor.email}</dd>
            </div>
            <div>
              <dt className="text-gray-900">ტელეფონი</dt>
              <dd className="text-gray-900">{doctor.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-900">სამუშაო საათები ამ კლინიკაში</dt>
              <dd className="text-gray-900">{hours.length > 0 ? hours.join(' · ') : 'ექიმს განრიგი ჯერ არ შეუვსია'}</dd>
            </div>
            <div>
              <dt className="text-gray-900">სერვისები</dt>
              <dd className="text-gray-900">
                {doctor.services.length > 0
                  ? doctor.services.map((s) => `${s.name} — ${s.price} ₾`).join(', ')
                  : 'არ არის დამატებული'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-900">ენები</dt>
              <dd className="text-gray-900">{doctor.languages.length > 0 ? doctor.languages.join(', ') : '—'}</dd>
            </div>
          </dl>

          {status === 'verified' && (
            <Link to={doctorProfilePath(doctor.id)} className="self-start text-sm font-medium text-primary hover:underline">
              საჯარო პროფილის ნახვა →
            </Link>
          )}

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
            {confirmRemove ? (
              <>
                <p className="text-sm text-gray-900">
                  {status === 'pending' ? 'ექიმის მოთხოვნა უარყოფილი იქნება.' : 'ექიმი აღარ გამოჩნდება თქვენს კლინიკაში.'}
                  {upcoming.length > 0 && ` გაუქმდება ${upcoming.length} დაგეგმილი ვიზიტი; პაციენტები ამას თავიანთ პროფილზე ნახავენ.`}{' '}
                  ექიმის ანგარიში, წარსული ვიზიტები და შეფასებები შენარჩუნდება.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      removeDoctor(clinicId, doctor.id)
                      navigate(PATHS.clinicDashboard)
                    }}
                    className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                  >
                    {status === 'pending' ? 'უარყოფა' : 'წაშლა კლინიკიდან'}
                  </button>
                  <Button variant="secondary" onClick={() => setConfirmRemove(false)}>
                    არა
                  </Button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmRemove(true)}
                className="self-start text-sm font-medium text-gray-900 hover:text-red-600 hover:underline"
              >
                {status === 'pending' ? 'მოთხოვნის უარყოფა' : 'ექიმის წაშლა კლინიკიდან'}
              </button>
            )}
          </div>
        </section>

        <dl className="grid grid-cols-2 content-start gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4">
              <dt className="text-sm text-gray-900">{stat.label}</dt>
              <dd className="text-2xl font-semibold text-gray-900">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <section aria-labelledby="upcoming-title" className="flex flex-col gap-3">
        <h2 id="upcoming-title" className="text-lg font-semibold text-gray-900">
          დაგეგმილი ვიზიტები
        </h2>
        <VisitList visits={upcomingPages.pageItems} patients={patients} empty="დაგეგმილი ვიზიტი არ არის." />
        <Pagination
          page={upcomingPages.page}
          pageCount={upcomingPages.pageCount}
          onChange={upcomingPages.setPage}
          label="დაგეგმილი ვიზიტების გვერდები"
        />
      </section>

      <section aria-labelledby="past-title" className="flex flex-col gap-3">
        <h2 id="past-title" className="text-lg font-semibold text-gray-900">
          წარსული და გაუქმებული ვიზიტები
        </h2>
        <VisitList visits={pastPages.pageItems} patients={patients} empty="ვიზიტების ისტორია ცარიელია." />
        <Pagination
          page={pastPages.page}
          pageCount={pastPages.pageCount}
          onChange={pastPages.setPage}
          label="წარსული ვიზიტების გვერდები"
        />
      </section>
    </div>
  )
}

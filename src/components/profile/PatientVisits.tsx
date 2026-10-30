import { useState } from 'react'
import { Link } from 'react-router'
import { ReviewForm } from '../reviews/ReviewForm'
import { Stars } from '../reviews/Stars'
import { Pagination } from '../ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import type { Appointment } from '../../interface/booking'
import type { Patient } from '../../interface/user'
import { PATHS, clinicProfilePath, doctorProfilePath } from '../../router/paths'
import { CANCEL_HOURS_BEFORE, canCancel, cancelAppointment, isUpcoming } from '../../services/appointmentService'
import { getClinics, getDoctors } from '../../services/directoryService'
import { canReview, deleteReview, getReviewForAppointment } from '../../services/reviewService'
import { formatDateLong } from '../../utils/time'

const PAGE_SIZE = 6 // visits per page, in each list

const byDateTime = (a: Appointment, b: Appointment) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)

interface PatientVisitsProps {
  patient: Patient
  appointments: Appointment[]
  onChange: () => void // called after a cancel or a review, so the profile page re-reads its data
}

// Upcoming visits (can be cancelled) and visit history (can be reviewed)
export function PatientVisits({ patient, appointments, onChange }: PatientVisitsProps) {
  const [doctors] = useState(getDoctors)
  const [clinics] = useState(getClinics)
  const [reviewing, setReviewing] = useState<string | null>(null) // appointment id with the open review form
  const [confirming, setConfirming] = useState<string | null>(null) // appointment id waiting for "cancel?" confirmation
  const [deleting, setDeleting] = useState<string | null>(null) // review id waiting for "delete?" confirmation

  const upcoming = appointments.filter(isUpcoming).sort(byDateTime)
  const history = appointments.filter((a) => !isUpcoming(a)).sort((a, b) => byDateTime(b, a))
  const upcomingPages = usePagination(upcoming, PAGE_SIZE)
  const historyPages = usePagination(history, PAGE_SIZE)

  function handleCancel(appointment: Appointment) {
    setConfirming(null)
    cancelAppointment(appointment.id, patient.id)
    onChange()
  }

  function handleDeleteReview(reviewId: string) {
    setDeleting(null)
    deleteReview(patient, reviewId)
    onChange()
  }

  function renderAppointment(appointment: Appointment) {
    const cancellable = canCancel(appointment)
    const doctor = doctors.find((d) => d.id === appointment.doctorId)
    const clinic = clinics.find((c) => c.id === appointment.clinicId)
    const cancelled = appointment.status === 'cancelled'
    const review = getReviewForAppointment(appointment.id)
    const reviewable = canReview(appointment)

    return (
      <li key={appointment.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {formatDateLong(appointment.date)}, {appointment.time}
              {cancelled && <span className="ms-2 text-sm font-normal text-red-600">გაუქმებული</span>}
            </p>
            {doctor && (
              <p className="text-sm">
                <Link to={doctorProfilePath(doctor.id)} className="text-primary hover:underline">
                  {doctor.fullName}
                </Link>
                <span className="text-gray-500"> · {doctor.specialty}</span>
              </p>
            )}
            {clinic && (
              <p className="text-sm text-gray-500">
                <Link to={clinicProfilePath(clinic.id)} className="hover:text-primary hover:underline">
                  {clinic.clinicName}
                </Link>
                , {clinic.city}, {clinic.address}
              </p>
            )}
            {appointment.service && (
              <p className="text-sm text-gray-500">
                {appointment.service.name} · {appointment.service.price} ₾ ·{' '}
                {appointment.payment === 'online' ? 'გადახდა ონლაინ' : 'გადახდა კლინიკაში'}
              </p>
            )}
            {appointment.reason && <p className="text-sm text-gray-500">მიზეზი: {appointment.reason}</p>}
            {isUpcoming(appointment) && !cancellable && (
              <p className="text-xs text-gray-400">
                გაუქმება შეუძლებელია: ვიზიტამდე {CANCEL_HOURS_BEFORE} საათზე ნაკლებია დარჩენილი
              </p>
            )}
          </div>
          {/* First click asks "are you sure?", the second click cancels */}
          {cancellable && confirming !== appointment.id && (
            <button
              type="button"
              onClick={() => setConfirming(appointment.id)}
              className="self-start rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-red-300 hover:text-red-600 sm:self-auto"
            >
              გაუქმება
            </button>
          )}
          {cancellable && confirming === appointment.id && (
            <div className="flex gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleCancel(appointment)}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                გავაუქმო?
              </button>
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                არა
              </button>
            </div>
          )}
          {reviewable && reviewing !== appointment.id && (
            <button
              type="button"
              onClick={() => setReviewing(appointment.id)}
              className="self-start rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary sm:self-auto"
            >
              შეფასება
            </button>
          )}
        </div>

        {review && reviewing !== appointment.id && (
          <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-start sm:justify-between">
            <p>
              თქვენი შეფასება: <Stars value={review.rating} />
              {review.comment && <span className="block text-gray-500">„{review.comment}“</span>}
            </p>
            {/* Edit, or delete with a second click. Deleting keeps the visit in the history. */}
            <div className="flex shrink-0 gap-3">
              {deleting === review.id ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(review.id)}
                    className="font-medium text-red-600 hover:underline"
                  >
                    წავშალო?
                  </button>
                  <button type="button" onClick={() => setDeleting(null)} className="font-medium text-gray-500 hover:underline">
                    არა
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setReviewing(appointment.id)}
                    className="font-medium text-primary hover:underline"
                  >
                    რედაქტირება
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(review.id)}
                    className="font-medium text-gray-500 hover:text-red-600 hover:underline"
                  >
                    წაშლა
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {(reviewable || review) && reviewing === appointment.id && (
          <ReviewForm
            patient={patient}
            appointment={appointment}
            review={review}
            onDone={() => {
              setReviewing(null)
              onChange()
            }}
            onCancel={() => setReviewing(null)}
          />
        )}
      </li>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="upcoming-title" className="flex flex-col gap-3">
        <h2 id="upcoming-title" className="text-lg font-semibold text-gray-900">
          მომავალი ვიზიტები
        </h2>
        {upcoming.length > 0 ? (
          <>
            <ul className="flex flex-col gap-3">{upcomingPages.pageItems.map((a) => renderAppointment(a))}</ul>
            <Pagination
              page={upcomingPages.page}
              pageCount={upcomingPages.pageCount}
              onChange={upcomingPages.setPage}
              label="მომავალი ვიზიტების გვერდები"
            />
          </>
        ) : (
          <p className="text-sm text-gray-500">
            დაჯავშნილი ვიზიტი არ გაქვთ.{' '}
            <Link to={PATHS.home} className="font-medium text-primary hover:underline">
              იპოვეთ ექიმი
            </Link>
          </p>
        )}
      </section>

      {history.length > 0 && (
        <section aria-labelledby="history-title" className="flex flex-col gap-3">
          <h2 id="history-title" className="text-lg font-semibold text-gray-900">
            ვიზიტების ისტორია
          </h2>
          <ul className="flex flex-col gap-3">{historyPages.pageItems.map((a) => renderAppointment(a))}</ul>
          <Pagination
            page={historyPages.page}
            pageCount={historyPages.pageCount}
            onChange={historyPages.setPage}
            label="ვიზიტების ისტორიის გვერდები"
          />
        </section>
      )}
    </div>
  )
}

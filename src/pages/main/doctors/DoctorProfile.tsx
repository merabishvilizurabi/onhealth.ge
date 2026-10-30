import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { BookingPanel } from '../../../components/booking/BookingPanel'
import { RatingBadge, Stars } from '../../../components/reviews/Stars'
import { WEEKDAYS } from '../../../constants/schedule'
import { PATHS, clinicProfilePath } from '../../../router/paths'
import { getClinics, getDoctor, getVerifiedClinics } from '../../../services/directoryService'
import { getDoctorReviews, getRating } from '../../../services/reviewService'
import { getSchedule } from '../../../services/scheduleService'
import { formatDateLong } from '../../../utils/time'

export function DoctorProfile() {
  const { id = '' } = useParams()
  const [doctor] = useState(() => getDoctor(id))
  const [clinics] = useState(() => (doctor ? getVerifiedClinics(doctor, getClinics()) : []))
  const [reviews] = useState(() => getDoctorReviews(id))
  const [rating] = useState(() => getRating(id))

  if (!doctor) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">ექიმი ვერ მოიძებნა</h1>
        <Link to={PATHS.home} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
          მთავარ გვერდზე დაბრუნება
        </Link>
      </div>
    )
  }

  const priceFrom = doctor.services.length > 0 ? Math.min(...doctor.services.map((s) => s.price)) : null

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <Link to={PATHS.doctors} className="text-sm text-gray-900 hover:text-primary">
        ← ყველა ექიმი
      </Link>

      <section className="flex items-center gap-5">
        <div
          aria-hidden="true"
          className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary-soft text-3xl font-semibold text-primary"
        >
          {doctor.fullName.charAt(0)}
        </div>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">{doctor.fullName}</h1>
          <p className="text-primary">{doctor.specialty}</p>
          <p className="flex flex-wrap gap-x-3 text-sm text-gray-900">
            <RatingBadge rating={rating} />
            <span>{doctor.experienceYears} წლის გამოცდილება</span>
            {priceFrom !== null && <span>ვიზიტი {priceFrom} ₾-დან</span>}
          </p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-8">
          {(doctor.bio || doctor.education || doctor.languages.length > 0) && (
            <section aria-labelledby="about-title" className="flex flex-col gap-2">
              <h2 id="about-title" className="text-lg font-semibold text-gray-900">
                ექიმის შესახებ
              </h2>
              {doctor.bio && <p className="text-gray-900">{doctor.bio}</p>}
              <dl className="flex flex-col gap-1 text-sm">
                {doctor.education && (
                  <div>
                    <dt className="inline text-gray-900">განათლება: </dt>
                    <dd className="inline text-gray-900">{doctor.education}</dd>
                  </div>
                )}
                {doctor.languages.length > 0 && (
                  <div>
                    <dt className="inline text-gray-900">ენები: </dt>
                    <dd className="inline text-gray-900">{doctor.languages.join(', ')}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          <section aria-labelledby="clinics-title" className="flex flex-col gap-3">
            <h2 id="clinics-title" className="text-lg font-semibold text-gray-900">
              სად იღებს
            </h2>
            {clinics.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {clinics.map((clinic) => {
                  const days = getSchedule(doctor.id, clinic.id)?.days ?? []
                  return (
                    <article key={clinic.id} className="rounded-xl border border-gray-200 bg-white p-4">
                      <h3 className="font-medium text-gray-900">
                        <Link to={clinicProfilePath(clinic.id)} className="hover:text-primary hover:underline">
                          {clinic.clinicName}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-900">
                        {clinic.city}, {clinic.address}
                      </p>
                      <a href={`tel:${clinic.phone.replace(/\s/g, '')}`} className="text-sm text-gray-900 hover:text-primary">
                        {clinic.phone}
                      </a>
                      <ul className="mt-3 flex flex-col gap-0.5 text-sm text-gray-900">
                        {WEEKDAYS.filter((w) => days.some((d) => d.day === w.day)).map((w) => {
                          const day = days.find((d) => d.day === w.day)!
                          return (
                            <li key={w.day}>
                              {w.label}: {day.start}–{day.end}
                            </li>
                          )
                        })}
                        {days.length === 0 && <li className="text-gray-900">განრიგი ჯერ არ არის</li>}
                      </ul>
                    </article>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-900">ექიმი ჯერ არცერთ კლინიკაში არ არის დადასტურებული.</p>
            )}
          </section>

          {doctor.services.length > 0 && (
            <section aria-labelledby="services-title" className="flex flex-col gap-3">
              <h2 id="services-title" className="text-lg font-semibold text-gray-900">
                მომსახურება და ფასები
              </h2>
              <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
                {doctor.services.map((service) => (
                  <li key={service.name} className="flex justify-between gap-4 px-4 py-3 text-sm">
                    <span className="text-gray-900">{service.name}</span>
                    <span className="font-medium text-gray-900">{service.price} ₾</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="reviews-title" className="flex flex-col gap-3">
            <h2 id="reviews-title" className="text-lg font-semibold text-gray-900">
              პაციენტების შეფასებები
            </h2>
            {reviews.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {reviews.map((review) => (
                  <li key={review.id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex flex-wrap items-center gap-x-3 text-sm">
                      <Stars value={review.rating} />
                      <span className="font-medium text-gray-900">{review.patientName}</span>
                      <span className="text-gray-900">{formatDateLong(review.createdAt.slice(0, 10))}</span>
                    </div>
                    {review.comment && <p className="mt-1 text-sm text-gray-900">{review.comment}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-900">ამ ექიმს ჯერ შეფასებები არ აქვს.</p>
            )}
          </section>
        </div>

        <section
          aria-labelledby="booking-title"
          className="flex min-w-0 flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 lg:sticky lg:top-6"
        >
          <h2 id="booking-title" className="text-lg font-semibold text-gray-900">
            ვიზიტის დაჯავშნა
          </h2>
          <BookingPanel doctor={doctor} clinics={clinics} />
        </section>
      </div>
    </div>
  )
}

import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { PublicDoctor } from '../../interface/directory'
import { doctorProfilePath } from '../../router/paths'
import type { DoctorSummary } from '../../services/doctorSummaryService'
import { RatingBadge } from '../reviews/Stars'

interface DoctorCardProps {
  doctor: PublicDoctor
  summary: DoctorSummary // from getDoctorSummary()
  footer?: ReactNode // optional extra content at the bottom
}

export function DoctorCard({ doctor, summary, footer }: DoctorCardProps) {
  const city = summary.hours[0]?.clinic.city // a doctor works in one city

  return (
    // The whole card is clickable: the name link is stretched over it.
    // Links inside the footer sit above it with "relative z-10".
    <article className="relative flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary">
      <div
        aria-hidden="true"
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary"
      >
        {doctor.fullName.charAt(0)}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div>
          <h3 className="truncate font-medium text-gray-900">
            <Link
              to={doctorProfilePath(doctor.id)}
              className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-primary"
            >
              {doctor.fullName}
            </Link>
          </h3>
          <p className="text-sm text-primary">
            {doctor.specialty}
            {city && <span className="text-gray-500"> · {city}</span>}
          </p>
          <p className="flex flex-wrap gap-x-3 text-sm text-gray-500">
            <RatingBadge rating={summary.rating} />
            <span>{doctor.experienceYears} წლის გამოცდილება</span>
          </p>
        </div>

        {summary.hours.length > 0 && (
          <ul className="flex flex-col gap-1 text-sm">
            {summary.hours.map(({ clinic, lines }) => (
              <li key={clinic.id}>
                <span className="text-gray-700">{clinic.clinicName}</span>
                <span className="block text-gray-500">{lines.length > 0 ? lines.join(' · ') : 'განრიგი ჯერ არ არის'}</span>
              </li>
            ))}
          </ul>
        )}

        {summary.priceFrom !== null && <p className="text-sm text-gray-700">ვიზიტი {summary.priceFrom} ₾-დან</p>}

        {footer && <div className="relative z-10 text-sm">{footer}</div>}
      </div>
    </article>
  )
}

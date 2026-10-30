import { Link } from 'react-router'
import type { PublicDoctor } from '../../interface/directory'
import { doctorProfilePath } from '../../router/paths'
import type { DoctorSummary } from '../../services/doctorSummaryService'
import { RatingBadge } from '../reviews/Stars'

interface DoctorRowProps {
  doctor: PublicDoctor
  summary: DoctorSummary
}

export function DoctorRow({ doctor, summary }: DoctorRowProps) {
  const city = summary.hours[0]?.clinic.city

  return (
    <article className="group relative flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-primary sm:gap-4 sm:p-4">
      <div
        aria-hidden="true"
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary"
      >
        {doctor.fullName.charAt(0)}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-bold">
          <Link
            to={doctorProfilePath(doctor.id)}
            className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-primary"
          >
            {doctor.fullName}
          </Link>
        </h3>
        <p className="truncate text-sm">
          <span className="font-medium text-primary">{doctor.specialty}</span>
          {city && <span className="text-gray-900"> · {city}</span>}
        </p>
        <p className="flex flex-wrap gap-x-3 text-sm text-gray-900">
          <RatingBadge rating={summary.rating} />
          <span>{doctor.experienceYears} წ. გამოცდილება</span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {summary.priceFrom !== null && (
          <p className="text-right font-bold">
            {summary.priceFrom} ₾<span className="block text-xs font-medium">-დან</span>
          </p>
        )}
        <span aria-hidden="true" className="text-2xl text-primary transition-transform group-hover:translate-x-0.5">
          ›
        </span>
      </div>
    </article>
  )
}

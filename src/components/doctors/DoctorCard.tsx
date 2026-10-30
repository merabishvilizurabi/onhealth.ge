import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { PublicDoctor } from '../../interface/directory'
import { doctorProfilePath } from '../../router/paths'
import type { DoctorSummary } from '../../services/doctorSummaryService'
import { RatingBadge } from '../reviews/Stars'

interface DoctorCardProps {
  doctor: PublicDoctor
  summary: DoctorSummary
  footer?: ReactNode
}

export function DoctorCard({ doctor, summary, footer }: DoctorCardProps) {
  const city = summary.hours[0]?.clinic.city

  return (
    <article className="group relative flex flex-col gap-5 rounded-xl bg-surface p-6 transition-shadow hover:shadow-lg hover:shadow-primary/15">
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white text-xl font-semibold text-primary"
        >
          {doctor.fullName.charAt(0)}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-xl font-bold tracking-tight">
            <Link
              to={doctorProfilePath(doctor.id)}
              className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-primary"
            >
              {doctor.fullName}
            </Link>
          </h3>
          <p className="text-sm font-medium text-primary">
            {doctor.specialty}
            {city && <span className="text-gray-900"> · {city}</span>}
          </p>
        </div>
      </div>

      <p className="flex flex-wrap gap-x-3 text-sm text-gray-900">
        <RatingBadge rating={summary.rating} />
        <span>{doctor.experienceYears} წლის გამოცდილება</span>
      </p>

      {summary.hours.length > 0 && (
        <ul className="flex flex-col gap-2 rounded-lg bg-white/60 p-3 text-sm">
          {summary.hours.map(({ clinic, lines }) => (
            <li key={clinic.id}>
              <span className="font-medium text-gray-900">{clinic.clinicName}</span>
              <span className="block text-gray-900">{lines.length > 0 ? lines.join(' · ') : 'განრიგი ჯერ არ არის'}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-3">
        {summary.priceFrom !== null ? (
          <p className="font-bold">
            <span className="text-xl">{summary.priceFrom} ₾</span>
            <span className="text-sm font-medium text-gray-900">-დან</span>
          </p>
        ) : (
          <span />
        )}
        {footer ? (
          <div className="relative z-10 text-sm">{footer}</div>
        ) : (
          <span className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors group-hover:bg-primary group-hover:text-white">
            დაჯავშნა
          </span>
        )}
      </div>
    </article>
  )
}

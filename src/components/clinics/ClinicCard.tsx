import { Link } from 'react-router'
import type { PublicClinic } from '../../interface/directory'
import { clinicProfilePath } from '../../router/paths'

interface ClinicCardProps {
  clinic: PublicClinic
  doctorCount: number
}

export function ClinicCard({ clinic, doctorCount }: ClinicCardProps) {
  return (
    <article className="group relative flex flex-col gap-4 rounded-xl bg-surface p-6 transition-shadow hover:shadow-lg hover:shadow-primary/15">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl font-bold tracking-tight">
            <Link
              to={clinicProfilePath(clinic.id)}
              className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-primary"
            >
              {clinic.clinicName}
            </Link>
          </h3>
          <p className="text-sm font-medium text-primary">{clinic.specialty}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-semibold">{clinic.city}</span>
      </div>
      <p className="text-sm text-gray-900">{clinic.address}</p>
      <div className="mt-auto flex items-center justify-between gap-3 text-sm">
        <a href={`tel:${clinic.phone.replace(/\s/g, '')}`} className="relative z-10 font-medium text-gray-900 hover:text-primary">
          {clinic.phone}
        </a>
        <span className="rounded-lg bg-white px-4 py-2 font-semibold text-gray-900 transition-colors group-hover:bg-primary group-hover:text-white">
          ექიმები: {doctorCount}
        </span>
      </div>
    </article>
  )
}

import { Link } from 'react-router'
import type { PublicClinic } from '../../interface/directory'
import { clinicProfilePath } from '../../router/paths'

interface ClinicCardProps {
  clinic: PublicClinic
  doctorCount: number
}

export function ClinicCard({ clinic, doctorCount }: ClinicCardProps) {
  return (
    // The whole card is clickable: the name link is stretched over it
    <article className="relative rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary">
      <h3 className="font-medium text-gray-900">
        <Link to={clinicProfilePath(clinic.id)} className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-primary">
          {clinic.clinicName}
        </Link>
      </h3>
      <p className="text-sm text-primary">{clinic.specialty}</p>
      <p className="mt-2 text-sm text-gray-500">
        {clinic.city}, {clinic.address}
      </p>
      <a href={`tel:${clinic.phone.replace(/\s/g, '')}`} className="relative z-10 text-sm text-gray-500 hover:text-primary">
        {clinic.phone}
      </a>
      <p className="mt-2 text-sm text-gray-600">ექიმები: {doctorCount}</p>
    </article>
  )
}

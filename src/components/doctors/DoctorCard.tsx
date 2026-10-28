import type { PublicDoctor } from '../../interface/directory'

interface DoctorCardProps {
  doctor: PublicDoctor
  clinicNames: string[]
}

export function DoctorCard({ doctor, clinicNames }: DoctorCardProps) {
  return (
    <article className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
      <div
        aria-hidden="true"
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary"
      >
        {doctor.fullName.charAt(0)}
      </div>
      <div className="min-w-0">
        <h3 className="truncate font-medium text-gray-900">{doctor.fullName}</h3>
        <p className="text-sm text-primary">{doctor.specialty}</p>
        <p className="text-sm text-gray-500">გამოცდილება: {doctor.experienceYears} წელი</p>
        {clinicNames.length > 0 && <p className="text-sm text-gray-500">{clinicNames.join(', ')}</p>}
      </div>
    </article>
  )
}

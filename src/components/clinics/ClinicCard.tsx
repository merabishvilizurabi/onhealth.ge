import type { PublicClinic } from '../../interface/directory'

export function ClinicCard({ clinic }: { clinic: PublicClinic }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="font-medium text-gray-900">{clinic.clinicName}</h3>
      <p className="text-sm text-primary">{clinic.specialty}</p>
      <p className="mt-2 text-sm text-gray-500">
        {clinic.city}, {clinic.address}
      </p>
      <a href={`tel:${clinic.phone.replace(/\s/g, '')}`} className="text-sm text-gray-500 hover:text-primary">
        {clinic.phone}
      </a>
    </article>
  )
}

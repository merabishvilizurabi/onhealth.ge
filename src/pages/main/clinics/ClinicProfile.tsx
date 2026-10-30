import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { SpecialtyList } from '../../../components/home/SpecialtyList'
import { DoctorCard } from '../../../components/doctors/DoctorCard'
import { PATHS, doctorProfilePath } from '../../../router/paths'
import { getClinic, getDoctors, getSpecialties, getVerifiedDoctors } from '../../../services/directoryService'
import { getDoctorSummary } from '../../../services/doctorSummaryService'

export function ClinicProfile() {
  const { id = '' } = useParams()
  const [clinic] = useState(() => getClinic(id))
  const [doctors] = useState(() => getVerifiedDoctors(id, getDoctors()))
  const specialties = useMemo(() => getSpecialties(doctors), [doctors])
  const [specialty, setSpecialty] = useState<string | null>(null)

  if (!clinic) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">კლინიკა ვერ მოიძებნა</h1>
        <Link to={PATHS.home} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
          მთავარ გვერდზე დაბრუნება
        </Link>
      </div>
    )
  }

  const shownDoctors = doctors.filter((d) => specialty === null || d.specialty.trim() === specialty)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <Link to={PATHS.home} className="text-sm text-gray-900 hover:text-primary">
        ← მთავარი გვერდი
      </Link>

      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">{clinic.clinicName}</h1>
        <p className="text-primary">{clinic.specialty}</p>
        <p className="text-sm text-gray-900">
          {clinic.city}, {clinic.address}
        </p>
        <a href={`tel:${clinic.phone.replace(/\s/g, '')}`} className="self-start text-sm text-gray-900 hover:text-primary">
          {clinic.phone}
        </a>
      </section>

      <section aria-labelledby="clinic-doctors-title" className="flex flex-col gap-4">
        <h2 id="clinic-doctors-title" className="text-lg font-semibold text-gray-900">
          ექიმები <span className="font-normal text-gray-900">· {doctors.length}</span>
        </h2>

        {specialties.length > 1 && (
          <SpecialtyList specialties={specialties} selected={specialty} onSelect={setSpecialty} />
        )}

        {shownDoctors.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shownDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                summary={getDoctorSummary(doctor, [clinic])}
                footer={
                  <Link
                    to={`${doctorProfilePath(doctor.id)}?clinic=${clinic.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    დაჯავშნა ამ კლინიკაში →
                  </Link>
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-900">ამ კლინიკაში ჯერ დადასტურებული ექიმი არ არის.</p>
        )}
      </section>
    </div>
  )
}

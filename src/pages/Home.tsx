import { useMemo, useState } from 'react'
import { ClinicCard } from '../components/clinics/ClinicCard'
import { DoctorCard } from '../components/doctors/DoctorCard'
import { SpecialtyList } from '../components/home/SpecialtyList'
import { Input } from '../components/ui/Input'
import { getClinics, getDoctors, getSpecialties, getVerifiedClinicNames } from '../services/directoryService'
import { matchesQuery } from '../utils/search'

export function Home() {
  // Read once when the page opens
  const [doctors] = useState(getDoctors)
  const [clinics] = useState(getClinics)
  const specialties = useMemo(() => getSpecialties(doctors), [doctors])

  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState<string | null>(null)

  const filteredDoctors = doctors.filter(
    (doctor) =>
      (specialty === null || doctor.specialty.trim() === specialty) &&
      matchesQuery(query, doctor.fullName, doctor.specialty),
  )

  const filteredClinics = clinics.filter((clinic) =>
    matchesQuery(query, clinic.clinicName, clinic.city, clinic.address, clinic.specialty),
  )

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 md:py-16">
      {/* Hero + search */}
      <section className="flex flex-col gap-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">ექიმთან ვიზიტი — ონლაინ</h1>
          <p className="mt-3 text-gray-600">
            იპოვე ექიმი ან კლინიკა და დაჯავშნე ვიზიტი შენთვის სასურველ დროს.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {doctors.length} ექიმი · {clinics.length} კლინიკა
          </p>
        </div>
        <div className="max-w-xl">
          <Input
            label="ძებნა"
            type="search"
            placeholder="სახელი, სპეციალობა ან ქალაქი"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
        </div>
      </section>

      {/* Specialties */}
      <section aria-labelledby="specialties-title" className="flex flex-col gap-4">
        <h2 id="specialties-title" className="text-xl font-semibold text-gray-900">
          სპეციალობები
        </h2>
        <SpecialtyList specialties={specialties} selected={specialty} onSelect={setSpecialty} />
      </section>

      {/* Doctors */}
      <section id="doctors" aria-labelledby="doctors-title" className="flex flex-col gap-4">
        <h2 id="doctors-title" className="text-xl font-semibold text-gray-900">
          ექიმები {specialty && <span className="font-normal text-gray-500">· {specialty}</span>}
        </h2>
        {filteredDoctors.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} clinicNames={getVerifiedClinicNames(doctor, clinics)} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">ექიმი ვერ მოიძებნა.</p>
        )}
      </section>

      {/* Clinics */}
      <section id="clinics" aria-labelledby="clinics-title" className="flex flex-col gap-4">
        <h2 id="clinics-title" className="text-xl font-semibold text-gray-900">
          კლინიკები
        </h2>
        {filteredClinics.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClinics.map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">კლინიკა ვერ მოიძებნა.</p>
        )}
      </section>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ClinicCard } from '../../components/clinics/ClinicCard'
import { DoctorCard } from '../../components/doctors/DoctorCard'
import { SpecialtyList } from '../../components/home/SpecialtyList'
import { Input } from '../../components/ui/Input'
import { useCity } from '../../hooks/useCity'
import { PATHS } from '../../router/paths'
import { getClinics, getListedDoctors, getSpecialties, getVerifiedClinics, getVerifiedDoctors } from '../../services/directoryService'
import { getDoctorSummary } from '../../services/doctorSummaryService'
import { recommendationScore } from '../../services/recommendationService'
import { matchesQuery } from '../../utils/search'

const MAX_SHOWN = 6 // at most this many doctors and clinics on the main page

export function Home() {
  const { city } = useCity()

  // Read once when the page opens
  const [doctors] = useState(getListedDoctors)
  const [clinics] = useState(getClinics)
  const specialties = useMemo(() => getSpecialties(doctors), [doctors])
  // Each doctor's verified clinics, and the summary shown on the card
  const rows = useMemo(
    () =>
      doctors.map((doctor) => {
        const doctorClinics = getVerifiedClinics(doctor, clinics)
        return { doctor, clinics: doctorClinics, summary: getDoctorSummary(doctor, doctorClinics) }
      }),
    [doctors, clinics],
  )

  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState<string | null>(null)

  const isFiltering = query.trim() !== '' || specialty !== null

  // Only doctors in the chosen city (a doctor works in one city), best match first
  const rankedDoctors = rows
    .filter(
      ({ doctor, clinics: doctorClinics }) =>
        (!city || doctorClinics.some((c) => c.city === city)) &&
        (specialty === null || doctor.specialty.trim() === specialty) &&
        matchesQuery(query, doctor.fullName, doctor.specialty),
    )
    .map((row) => ({ ...row, score: recommendationScore(row.summary) }))
    .sort((a, b) => b.score - a.score)
  const shownDoctors = rankedDoctors.slice(0, MAX_SHOWN)

  // Clinics: the chosen city's clinics first
  const filteredClinics = clinics
    .filter((clinic) => matchesQuery(query, clinic.clinicName, clinic.city, clinic.address, clinic.specialty))
    .sort((a, b) => Number(b.city === city) - Number(a.city === city))
    .slice(0, MAX_SHOWN)

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
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 id="doctors-title" className="text-xl font-semibold text-gray-900">
              {isFiltering ? 'ექიმები' : 'რეკომენდებული ექიმები'}
              {city && <span className="font-normal text-gray-500"> · {city}</span>}
              {specialty && <span className="font-normal text-gray-500"> · {specialty}</span>}
            </h2>
            <p className="text-sm text-gray-500">
              რეიტინგისა და თავისუფალი დროის მიხედვით
            </p>
          </div>
          <Link to={PATHS.doctors} className="text-sm font-medium text-primary hover:underline">
            ყველა ექიმი და ფილტრები →
          </Link>
        </div>
        {shownDoctors.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shownDoctors.map(({ doctor, summary }) => (
              <DoctorCard key={doctor.id} doctor={doctor} summary={summary} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">{city ? 'ამ ქალაქში ექიმი ვერ მოიძებნა.' : 'ექიმი ვერ მოიძებნა.'}</p>
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
              <ClinicCard key={clinic.id} clinic={clinic} doctorCount={getVerifiedDoctors(clinic.id, doctors).length} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">კლინიკა ვერ მოიძებნა.</p>
        )}
      </section>
    </div>
  )
}

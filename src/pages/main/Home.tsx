import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ClinicCard } from '../../components/clinics/ClinicCard'
import { DoctorRow } from '../../components/doctors/DoctorRow'
import { SectionHeading } from '../../components/home/SectionHeading'
import { LogoMark } from '../../components/layout/LogoMark'
import { useAuth } from '../../hooks/useAuth'
import { useCity } from '../../hooks/useCity'
import { PATHS } from '../../router/paths'
import { getClinics, getListedDoctors, getSpecialties, getVerifiedClinics, getVerifiedDoctors } from '../../services/directoryService'
import { getDoctorSummary } from '../../services/doctorSummaryService'
import { recommendationScore } from '../../services/recommendationService'
import { matchesQuery } from '../../utils/search'

const MAX_SHOWN = 6

export function Home() {
  const { user } = useAuth()
  const { cities, city, setCity } = useCity()
  const usesCity = !user || user.role === 'patient'

  const [doctors] = useState(getListedDoctors)
  const [clinics] = useState(getClinics)
  const specialties = useMemo(() => getSpecialties(doctors), [doctors])
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

  const isSearching = query.trim() !== ''
  const isFiltering = isSearching || specialty !== null

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
  const topRating = Math.max(...rows.map((r) => r.summary.rating?.average ?? 0)) || null

  const filteredClinics = clinics
    .filter((clinic) => matchesQuery(query, clinic.clinicName, clinic.city, clinic.address, clinic.specialty))
    .sort((a, b) => Number(b.city === city) - Number(a.city === city))
    .slice(0, MAX_SHOWN)

  const nothingFound = isSearching && shownDoctors.length === 0 && filteredClinics.length === 0
  const showClinicsHeading = !isSearching || shownDoctors.length > 0

  const cityCount = new Set(rows.flatMap((r) => r.clinics.map((c) => c.city))).size

  return (
    <div className="flex flex-col">
      <section className="bg-surface-strong">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-14 pb-28 md:pt-20 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-6">
            <p className="text-sm font-medium text-gray-900">
              {doctors.length} ექიმი · {clinics.length} კლინიკა · {cityCount} ქალაქი
            </p>
            <h1 className="text-4xl leading-tight font-bold tracking-tight text-gray-900 md:text-5xl">
              ექიმთან ვიზიტი — ონლაინ, რამდენიმე წამში
            </h1>
            <p className="max-w-xl text-gray-900 md:text-lg">
              იპოვე ექიმი ან კლინიკა შენს ქალაქში, ნახე თავისუფალი დრო, ფასები და შეფასებები და დაჯავშნე ვიზიტი დარეკვის
              გარეშე.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <a href="#doctors" className="rounded-lg bg-white px-6 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                ექიმის მოძებნა
              </a>
              <Link to={PATHS.doctors} className="font-semibold text-gray-900 hover:text-primary">
                ყველა ექიმი →
              </Link>
            </div>
          </div>
          <div aria-hidden="true" className="relative hidden lg:block">
            <div className="flex aspect-[5/4] items-center justify-center rounded-[48px] rounded-br-none bg-gray-400/60">
              <div className="flex size-56 items-center justify-center rounded-[40px] bg-white">
                <LogoMark className="size-40 text-primary" />
              </div>
            </div>
            <p className="absolute top-8 -left-6 rounded-xl bg-white px-4 py-3 text-sm font-semibold shadow-md">
              ★ {topRating ?? '—'} <span className="font-normal text-gray-900">საუკეთესო შეფასება</span>
            </p>
            <p className="absolute -bottom-4 left-10 rounded-xl bg-white px-4 py-3 text-sm font-semibold shadow-md">
              მოძებნე შენთვის შესაფერისი ექიმი <span className="font-normal text-gray-900 pl-1"> 5 წუთში</span>
            </p>
          </div>
        </div>
      </section>

      <div className="bg-white px-4">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className={`mx-auto -mt-16 grid max-w-[70rem] gap-4 rounded-xl bg-white p-6 shadow-[0_4px_16px_rgba(26,32,44,0.12)] md:items-end md:gap-0 md:divide-x md:divide-gray-300 md:p-0 md:py-6 ${
            usesCity ? 'md:grid-cols-[1fr_1fr_1.4fr_auto]' : 'md:grid-cols-[1fr_1.4fr_auto]'
          }`}
        >
          {usesCity && (
            <label className="flex flex-col gap-1 md:px-6">
              <span className="font-bold">ქალაქი</span>
              <select
                value={city}
                onChange={(event) => setCity(event.currentTarget.value)}
                className="bg-transparent py-1 text-sm font-medium text-gray-900 outline-none"
              >
                <option value="">ყველა ქალაქი</option>
                {cities.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="flex flex-col gap-1 md:px-6">
            <span className="font-bold">სპეციალობა</span>
            <select
              value={specialty ?? ''}
              onChange={(event) => setSpecialty(event.currentTarget.value || null)}
              className="bg-transparent py-1 text-sm font-medium text-gray-900 outline-none"
            >
              <option value="">ყველა სპეციალობა</option>
              {specialties.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 md:px-6">
            <span className="font-bold">ძებნა</span>
            <input
              type="search"
              placeholder="ექიმის სახელი, სპეციალობა ან კლინიკა"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              className="bg-transparent py-1 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
            />
          </label>
          <div className="md:px-6">
            <button type="submit" className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover">
              ძებნა
            </button>
          </div>
        </form>
      </div>

      {(!isSearching || shownDoctors.length > 0 || nothingFound) && (
        <section
          id="doctors"
          aria-labelledby={isSearching ? undefined : 'doctors-title'}
          aria-label={isSearching ? 'ძებნის შედეგები' : undefined}
          className={`scroll-mt-24 bg-white ${isSearching ? 'py-6' : 'py-12'}`}
        >
          <div className={`mx-auto flex max-w-6xl flex-col pb-4 ${isSearching ? 'gap-6' : 'gap-10'}`}>
            {!isSearching && (
              <SectionHeading
                id="doctors-title"
                title={
                  <>
                    {isFiltering ? 'ექიმები' : 'რეკომენდებული ექიმები'}
                    {specialty && <span className="text-gray-900"> · {specialty}</span>}
                    {city && <span className="text-gray-900"> · {city}</span>}
                  </>
                }
              />
            )}
            {nothingFound ? (
              <p className="text-center text-lg text-gray-900">„{query.trim()}“ — ვერაფერი მოიძებნა.</p>
            ) : shownDoctors.length > 0 ? (
              <>
                <div className="grid gap-3 lg:grid-cols-2">
                  {shownDoctors.map(({ doctor, summary }) => (
                    <DoctorRow key={doctor.id} doctor={doctor} summary={summary} />
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Link to={PATHS.doctors} className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover">
                    ყველა ექიმი და ფილტრები
                  </Link>
                  <p className="text-sm font-medium text-gray-900">
                    ნაჩვენებია {shownDoctors.length} / {rankedDoctors.length} ექიმი
                  </p>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-900">{city ? 'ამ ქალაქში ექიმი ვერ მოიძებნა.' : 'ექიმი ვერ მოიძებნა.'}</p>
            )}
          </div>
        </section>
      )}

      {filteredClinics.length > 0 && (
        <section
          aria-labelledby={showClinicsHeading ? 'clinics-title' : undefined}
          aria-label={showClinicsHeading ? undefined : 'კლინიკები'}
          className={`mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 ${isSearching ? 'pb-12' : 'py-20'} ${
            isSearching && shownDoctors.length === 0 ? 'pt-12' : ''
          }`}
        >
          {showClinicsHeading && <SectionHeading id="clinics-title" title="კლინიკები" />}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClinics.map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} doctorCount={getVerifiedDoctors(clinic.id, doctors).length} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

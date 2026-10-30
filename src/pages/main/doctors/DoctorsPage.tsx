import { useMemo, useState } from 'react'
import { DoctorCard } from '../../../components/doctors/DoctorCard'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import type { SelectOption } from '../../../constants/authFields'
import { getClinics, getListedDoctors, getSpecialties, getVerifiedClinics } from '../../../services/directoryService'
import { getDoctorSummary } from '../../../services/doctorSummaryService'
import { matchesQuery } from '../../../utils/search'
import { addDays, toDateKey } from '../../../utils/time'

const FREE_TIME: SelectOption[] = [
  { value: 'today', label: 'დღეს' },
  { value: 'tomorrow', label: 'ხვალამდე' },
  { value: 'week', label: '7 დღეში' },
]
const MAX_PRICE: SelectOption[] = [
  { value: '30', label: '30 ₾-მდე' },
  { value: '50', label: '50 ₾-მდე' },
  { value: '70', label: '70 ₾-მდე' },
]
const MIN_RATING: SelectOption[] = [
  { value: '4.5', label: '4.5 და მეტი' },
  { value: '4.7', label: '4.7 და მეტი' },
  { value: '4.9', label: '4.9 და მეტი' },
]
const SORT: SelectOption[] = [
  { value: 'rating', label: 'რეიტინგით' },
  { value: 'nearest', label: 'უახლოესი თავისუფალი დროით' },
  { value: 'price', label: 'ფასით (იაფიდან)' },
  { value: 'experience', label: 'გამოცდილებით' },
  { value: 'name', label: 'სახელით' },
]

const EMPTY_FILTERS = { name: '', specialty: '', city: '', clinic: '', freeTime: '', maxPrice: '', minRating: '' }
type Filters = typeof EMPTY_FILTERS

export function DoctorsPage() {
  const [rows] = useState(() => {
    const clinics = getClinics()
    return getListedDoctors().map((doctor) => {
      const doctorClinics = getVerifiedClinics(doctor, clinics)
      return { doctor, clinics: doctorClinics, summary: getDoctorSummary(doctor, doctorClinics) }
    })
  })

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [sort, setSort] = useState('rating')
  const set = (key: keyof Filters, value: string) => setFilters((prev) => ({ ...prev, [key]: value }))

  const specialtyOptions = useMemo(
    () => getSpecialties(rows.map((r) => r.doctor)).map((s) => ({ value: s.name, label: s.name })),
    [rows],
  )
  const allClinics = useMemo(() => {
    const byId = new Map(rows.flatMap((r) => r.clinics).map((c) => [c.id, c]))
    return [...byId.values()]
  }, [rows])
  const cityOptions = [...new Set(allClinics.map((c) => c.city))].sort((a, b) => a.localeCompare(b, 'ka')).map((city) => ({ value: city, label: city }))
  const clinicOptions = allClinics
    .filter((c) => !filters.city || c.city === filters.city)
    .map((c) => ({ value: c.id, label: c.clinicName }))

  const freeTimeLimit =
    filters.freeTime === 'today' ? toDateKey(new Date())
    : filters.freeTime === 'tomorrow' ? toDateKey(addDays(new Date(), 1))
    : filters.freeTime === 'week' ? toDateKey(addDays(new Date(), 6))
    : null

  const results = rows
    .filter(({ doctor, clinics, summary }) => {
      if (!matchesQuery(filters.name, doctor.fullName)) return false
      if (filters.specialty && doctor.specialty.trim() !== filters.specialty) return false
      if (filters.city && !clinics.some((c) => c.city === filters.city)) return false
      if (filters.clinic && !clinics.some((c) => c.id === filters.clinic)) return false
      if (freeTimeLimit && (!summary.next || summary.next.date > freeTimeLimit)) return false
      if (filters.maxPrice && (summary.priceFrom === null || summary.priceFrom > Number(filters.maxPrice))) return false
      if (filters.minRating && (!summary.rating || summary.rating.average < Number(filters.minRating))) return false
      return true
    })
    .sort((a, b) => {
      switch (sort) {
        case 'nearest': {
          const key = (r: typeof a) => (r.summary.next ? `${r.summary.next.date} ${r.summary.next.time}` : '9999')
          return key(a).localeCompare(key(b))
        }
        case 'price':
          return (a.summary.priceFrom ?? Infinity) - (b.summary.priceFrom ?? Infinity)
        case 'experience':
          return b.doctor.experienceYears - a.doctor.experienceYears
        case 'name':
          return a.doctor.fullName.localeCompare(b.doctor.fullName, 'ka')
        default:
          return (
            (b.summary.rating?.average ?? 0) - (a.summary.rating?.average ?? 0) ||
            (b.summary.rating?.count ?? 0) - (a.summary.rating?.count ?? 0)
          )
      }
    })

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">ექიმები</h1>
        <p className="mt-1 text-gray-900">გაფილტრეთ სპეციალობით, კლინიკით ან რეიტინგით და აირჩიეთ ექიმი.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr] lg:items-start">
        <aside aria-label="ფილტრები" className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4">
          <Input
            label="ექიმის სახელი"
            type="search"
            value={filters.name}
            onChange={(e) => set('name', e.currentTarget.value)}
          />
          <Select
            label="სპეციალობა"
            options={specialtyOptions}
            emptyOption="ყველა სპეციალობა"
            value={filters.specialty}
            onChange={(e) => set('specialty', e.currentTarget.value)}
          />
          <Select
            label="ქალაქი"
            options={cityOptions}
            emptyOption="ყველა ქალაქი"
            value={filters.city}
            onChange={(e) => {
              const city = e.currentTarget.value
              setFilters((prev) => ({ ...prev, city, clinic: '' }))
            }}
          />
          <Select
            label="კლინიკა"
            options={clinicOptions}
            emptyOption="ყველა კლინიკა"
            value={filters.clinic}
            onChange={(e) => set('clinic', e.currentTarget.value)}
          />
          <Select
            label="თავისუფალი დრო"
            options={FREE_TIME}
            emptyOption="ნებისმიერ დროს"
            value={filters.freeTime}
            onChange={(e) => set('freeTime', e.currentTarget.value)}
          />
          <Select
            label="ფასი"
            options={MAX_PRICE}
            emptyOption="ნებისმიერი ფასი"
            value={filters.maxPrice}
            onChange={(e) => set('maxPrice', e.currentTarget.value)}
          />
          <Select
            label="მინიმალური რეიტინგი"
            options={MIN_RATING}
            emptyOption="ნებისმიერი რეიტინგი"
            value={filters.minRating}
            onChange={(e) => set('minRating', e.currentTarget.value)}
          />
          {hasFilters && (
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="self-start text-sm font-medium text-primary hover:underline"
            >
              ფილტრების გასუფთავება
            </button>
          )}
        </aside>

        <section aria-label="შედეგები" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="text-sm text-gray-900" aria-live="polite">
              ნაპოვნია {results.length} ექიმი
            </p>
            <div className="w-full sm:w-64">
              <Select label="დახარისხება" options={SORT} value={sort} onChange={(e) => setSort(e.currentTarget.value)} />
            </div>
          </div>

          {results.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {results.map(({ doctor, summary }) => (
                <DoctorCard key={doctor.id} doctor={doctor} summary={summary} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-900">ამ ფილტრებით ექიმი ვერ მოიძებნა.</p>
          )}
        </section>
      </div>
    </div>
  )
}

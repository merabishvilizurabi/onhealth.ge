import { useState } from 'react'
import { Link } from 'react-router'
import { IncomeChart } from '../../components/stats/IncomeChart'
import { useAuth } from '../../hooks/useAuth'
import { PATHS, clinicDoctorPath } from '../../router/paths'
import { getClinicStats } from '../../services/clinicStatsService'
import { changeText } from '../../services/statsService'

const PERIODS = [
  { days: 7, label: '7 დღე' },
  { days: 30, label: '30 დღე' },
]

export function ClinicStats() {
  const { user } = useAuth()
  const [period, setPeriod] = useState(7)

  if (user?.role !== 'clinic') return null

  const stats = getClinicStats(user.id, period)
  const average = stats.visits > 0 ? Math.round(stats.income / stats.visits) : 0
  const cancelRate = stats.visits + stats.cancelled > 0 ? Math.round((stats.cancelled / (stats.visits + stats.cancelled)) * 100) : 0
  const onlineShare = stats.visits > 0 ? Math.round((stats.online / stats.visits) * 100) : 0

  const cards = [
    { label: 'შემოსავალი', value: `${stats.income} ₾`, note: changeText(stats.income, stats.previousIncome) },
    { label: 'ჩატარებული ვიზიტი', value: stats.visits, note: '' },
    { label: 'საშუალო ვიზიტი', value: `${average} ₾`, note: '' },
    { label: 'გაუქმებული', value: stats.cancelled, note: `${cancelRate}% ყველა ვიზიტიდან` },
  ]

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to={PATHS.clinicDashboard} className="text-sm text-gray-900 hover:text-primary">
            ← პანელი
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900">სტატისტიკა</h1>
          <p className="text-sm text-gray-900">{user.clinicName}</p>
        </div>
        <div role="radiogroup" aria-label="პერიოდი" className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              role="radio"
              aria-checked={period === p.days}
              onClick={() => setPeriod(p.days)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium ${
                period === p.days ? 'bg-primary text-white' : 'text-gray-900 hover:text-primary'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <dt className="text-sm text-gray-900">{card.label}</dt>
            <dd className="text-2xl font-semibold text-gray-900">{card.value}</dd>
            {card.note && <dd className="text-xs text-gray-900">{card.note}</dd>}
          </div>
        ))}
      </dl>

      <section aria-labelledby="chart-title" className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="chart-title" className="text-lg font-semibold text-gray-900">
            შემოსავალი დღეების მიხედვით
          </h2>
          <p className="text-sm text-gray-900">
            მოსალოდნელი (დაჯავშნილი ვიზიტები): <span className="font-medium text-gray-900">{stats.expectedIncome} ₾</span>
          </p>
        </div>
        <IncomeChart days={stats.days} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section aria-labelledby="doctors-title" className="flex flex-col gap-3">
          <h2 id="doctors-title" className="text-lg font-semibold text-gray-900">
            ექიმები შემოსავლის მიხედვით
          </h2>
          {stats.doctors.length === 0 ? (
            <p className="text-sm text-gray-900">ექიმები ჯერ არ გყავთ.</p>
          ) : (
            <ol className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
              {stats.doctors.map((row, index) => (
                <li key={row.doctor.id} className="flex flex-col gap-1 p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="min-w-0 truncate">
                      <span className="me-2 text-sm text-gray-900">{index + 1}.</span>
                      <Link to={clinicDoctorPath(row.doctor.id)} className="font-medium text-gray-900 hover:text-primary">
                        {row.doctor.fullName}
                      </Link>
                      <span className="text-sm text-gray-900"> · {row.doctor.specialty}</span>
                    </p>
                    <span className="shrink-0 font-semibold text-gray-900">{row.income} ₾</span>
                  </div>
                  <p className="text-xs text-gray-900">
                    {row.visits} ვიზიტი · {row.cancelled} გაუქმებული
                    {row.rating !== null && ` · ★ ${row.rating}`}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <div className="flex flex-col gap-6">
          <section aria-labelledby="services-title" className="flex flex-col gap-3">
            <h2 id="services-title" className="text-lg font-semibold text-gray-900">
              პოპულარული სერვისები
            </h2>
            {stats.services.length === 0 ? (
              <p className="text-sm text-gray-900">ამ პერიოდში ვიზიტები არ ყოფილა.</p>
            ) : (
              <ul className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 text-sm">
                {stats.services.map((s) => (
                  <li key={s.name} className="flex justify-between gap-3">
                    <span className="text-gray-900">{s.name}</span>
                    <span className="shrink-0 text-gray-900">
                      {s.visits} · {s.income} ₾
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="payments-title" className="flex flex-col gap-3">
            <h2 id="payments-title" className="text-lg font-semibold text-gray-900">
              გადახდის მეთოდი
            </h2>
            <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 text-sm">
              <div className="flex h-3 overflow-hidden rounded-full bg-gray-200" aria-hidden="true">
                <div className="bg-primary" style={{ width: `${onlineShare}%` }} />
              </div>
              <p className="flex justify-between text-gray-900">
                <span>ონლაინ: {stats.online}</span>
                <span>კლინიკაში: {stats.visits - stats.online}</span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

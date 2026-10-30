import { useState } from 'react'
import { WEEKDAYS } from '../../constants/schedule'
import type { Appointment } from '../../interface/booking'
import type { PublicClinic } from '../../interface/directory'
import type { Patient } from '../../interface/user'
import { getSchedule } from '../../services/scheduleService'
import { addDays, formatDateShort, fromDateKey, toDateKey, weekdayOf } from '../../utils/time'

interface WeekCalendarProps {
  doctorId: string
  clinics: PublicClinic[]
  appointments: Appointment[]
  patients: Map<string, Patient>
}

function mondayOf(date: Date): Date {
  const day = date.getDay()
  return addDays(date, day === 0 ? -6 : 1 - day)
}

export function WeekCalendar({ doctorId, clinics, appointments, patients }: WeekCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0)
  const monday = addDays(mondayOf(new Date()), weekOffset * 7)
  const dates = Array.from({ length: 7 }, (_, i) => toDateKey(addDays(monday, i)))
  const today = toDateKey(new Date())

  const navButton = 'rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 hover:border-primary hover:text-primary'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-medium text-gray-900">
          {formatDateShort(dates[0])} – {formatDateShort(dates[6])}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setWeekOffset((w) => w - 1)} className={navButton} aria-label="წინა კვირა">
            ‹
          </button>
          <button type="button" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0} className={`${navButton} disabled:opacity-40`}>
            ეს კვირა
          </button>
          <button type="button" onClick={() => setWeekOffset((w) => w + 1)} className={navButton} aria-label="შემდეგი კვირა">
            ›
          </button>
        </div>
      </div>

      <ol className="grid gap-3 md:grid-cols-7">
        {dates.map((date) => {
          const weekday = weekdayOf(date)
          const hours = clinics.flatMap((clinic) => {
            const day = getSchedule(doctorId, clinic.id)?.days.find((d) => d.day === weekday)
            return day ? [{ clinic, start: day.start, end: day.end }] : []
          })
          const visits = appointments
            .filter((a) => a.date === date && a.status === 'booked')
            .sort((a, b) => a.time.localeCompare(b.time))
          const isToday = date === today

          return (
            <li
              key={date}
              className={`flex min-w-0 flex-col gap-2 rounded-xl border bg-white p-3 ${isToday ? 'border-primary' : 'border-gray-200'}`}
            >
              <p className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-gray-900'}`}>
                {WEEKDAYS.find((w) => w.day === weekday)?.short}, {fromDateKey(date).getDate()}
                {isToday && <span className="font-normal"> · დღეს</span>}
              </p>
              {hours.length === 0 ? (
                <p className="text-xs text-gray-900">დასვენება</p>
              ) : (
                hours.map((h) => (
                  <p key={h.clinic.id} className="rounded-md bg-primary-soft px-2 py-1 text-xs text-primary">
                    {h.start}–{h.end}
                    <span className="block">{h.clinic.clinicName}</span>
                  </p>
                ))
              )}
              {visits.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {visits.map((v) => (
                    <li key={v.id} className="rounded-md border border-gray-100 px-2 py-1 text-xs">
                      <span className="font-medium text-gray-900">{v.time}</span>{' '}
                      <span className="text-gray-900">{patients.get(v.patientId)?.fullName ?? 'პაციენტი'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

import type { Appointment } from '../interface/booking'
import { addDays, toDateKey } from '../utils/time'
import { isUpcoming } from './appointmentService'

export interface DayIncome {
  date: string
  income: number
  visits: number
}

export interface PeriodStats {
  days: DayIncome[]
  done: Appointment[]
  inPeriod: Appointment[]
  income: number
  previousIncome: number
  visits: number
  cancelled: number
  online: number
  expectedIncome: number
}

export const priceOf = (a: Appointment) => a.service?.price ?? 0
export const sumIncome = (list: Appointment[]) => list.reduce((total, a) => total + priceOf(a), 0)
const isDone = (a: Appointment) => a.status === 'booked' && !isUpcoming(a)

export function getPeriodStats(appointments: Appointment[], period: number): PeriodStats {
  const today = new Date()
  const dates = Array.from({ length: period }, (_, i) => toDateKey(addDays(today, i - period + 1)))
  const first = dates[0]
  const last = dates[dates.length - 1]
  const previousFirst = toDateKey(addDays(today, -2 * period + 1))

  const inPeriod = appointments.filter((a) => a.date >= first && a.date <= last)
  const done = inPeriod.filter(isDone)

  return {
    days: dates.map((date) => {
      const day = done.filter((a) => a.date === date)
      return { date, income: sumIncome(day), visits: day.length }
    }),
    done,
    inPeriod,
    income: sumIncome(done),
    previousIncome: sumIncome(appointments.filter((a) => isDone(a) && a.date >= previousFirst && a.date < first)),
    visits: done.length,
    cancelled: inPeriod.filter((a) => a.status === 'cancelled').length,
    online: done.filter((a) => a.payment === 'online').length,
    expectedIncome: sumIncome(appointments.filter(isUpcoming)),
  }
}

export function changeText(current: number, previous: number): string {
  if (previous === 0) return ''
  const percent = Math.round(((current - previous) / previous) * 100)
  return `${percent >= 0 ? '+' : ''}${percent}% წინა პერიოდთან`
}

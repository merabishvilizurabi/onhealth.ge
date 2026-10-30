import { BOOKING_DAYS_AHEAD, WEEKDAYS } from '../constants/schedule'
import type { PublicClinic, PublicDoctor } from '../interface/directory'
import type { RatingSummary } from '../interface/review'
import { addDays, toDateKey } from '../utils/time'
import { getFreeSlots } from './appointmentService'
import { getRating } from './reviewService'
import { getSchedule } from './scheduleService'

// Everything a doctor card and the doctors page need, computed in one place

interface ClinicHours {
  clinic: PublicClinic
  lines: string[] // e.g. ["ორშ, ოთხ, პარ 10:00–14:00", "შაბ 11:00–15:00"]
}

// Used by the doctors page (free-time filter, "nearest" sorting) and the recommendation score
interface NextFreeTime {
  date: string // "YYYY-MM-DD"
  time: string // "HH:MM"
}

export interface DoctorSummary {
  rating: RatingSummary | null
  priceFrom: number | null // cheapest service
  hours: ClinicHours[]
  next: NextFreeTime | null
}

// Groups days with the same hours: "ორშ, ოთხ 10:00–14:00"
function hoursLines(doctorId: string, clinicId: string): string[] {
  const days = getSchedule(doctorId, clinicId)?.days ?? []
  const groups = new Map<string, string[]>()
  for (const w of WEEKDAYS) {
    const day = days.find((d) => d.day === w.day)
    if (!day) continue
    const range = `${day.start}–${day.end}`
    groups.set(range, [...(groups.get(range) ?? []), w.short])
  }
  return [...groups].map(([range, names]) => `${names.join(', ')} ${range}`)
}

// The earliest free time (within the booking window) at any of these clinics
function getNextFreeTime(doctorId: string, clinics: PublicClinic[]): NextFreeTime | null {
  const today = new Date()
  for (let i = 0; i < BOOKING_DAYS_AHEAD; i++) {
    const date = toDateKey(addDays(today, i))
    const firstTimes = clinics.map((clinic) => getFreeSlots(doctorId, clinic.id, date)[0]).filter(Boolean)
    if (firstTimes.length > 0) return { date, time: firstTimes.sort()[0] }
  }
  return null
}

// clinics = the doctor's verified clinics (or just one, on a clinic's page)
export function getDoctorSummary(doctor: PublicDoctor, clinics: PublicClinic[]): DoctorSummary {
  const prices = doctor.services.map((s) => s.price)
  return {
    rating: getRating(doctor.id),
    priceFrom: prices.length > 0 ? Math.min(...prices) : null,
    hours: clinics.map((clinic) => ({ clinic, lines: hoursLines(doctor.id, clinic.id) })),
    next: getNextFreeTime(doctor.id, clinics),
  }
}

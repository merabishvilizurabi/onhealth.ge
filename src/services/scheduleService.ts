import { DEMO_SCHEDULES } from '../data/demoSchedules'
import type { DoctorSchedule, WorkingDay } from '../interface/booking'
import { toMinutes } from '../utils/time'
import { readJSON, writeJSON } from './storage'

const SCHEDULES_KEY = 'onhealth.schedules'

const sameSchedule = (a: DoctorSchedule, b: { doctorId: string; clinicId: string }) =>
  a.doctorId === b.doctorId && a.clinicId === b.clinicId

function getStoredSchedules(): DoctorSchedule[] {
  const stored = readJSON<unknown>(SCHEDULES_KEY, [])
  return Array.isArray(stored) ? (stored as DoctorSchedule[]) : []
}

// Saved schedules + demo schedules. A saved schedule replaces the demo one for the same doctor and clinic.
function getSchedules(): DoctorSchedule[] {
  const stored = getStoredSchedules()
  const demo = DEMO_SCHEDULES.filter((d) => !stored.some((s) => sameSchedule(s, d)))
  return [...demo, ...stored]
}

function getDoctorSchedules(doctorId: string): DoctorSchedule[] {
  return getSchedules().filter((s) => s.doctorId === doctorId)
}

export function getSchedule(doctorId: string, clinicId: string): DoctorSchedule | undefined {
  return getSchedules().find((s) => sameSchedule(s, { doctorId, clinicId }))
}

// The weekday a new schedule overlaps with the doctor's hours at another clinic, or null
export function findOverlap(doctorId: string, clinicId: string, days: WorkingDay[]): WorkingDay | null {
  const others = getDoctorSchedules(doctorId).filter((s) => s.clinicId !== clinicId)
  for (const day of days) {
    for (const other of others) {
      const clash = other.days.find(
        (o) => o.day === day.day && toMinutes(day.start) < toMinutes(o.end) && toMinutes(o.start) < toMinutes(day.end),
      )
      if (clash) return day
    }
  }
  return null
}

export function saveSchedule(schedule: DoctorSchedule): void {
  const others = getStoredSchedules().filter((s) => !sameSchedule(s, schedule))
  writeJSON(SCHEDULES_KEY, [...others, schedule])
}

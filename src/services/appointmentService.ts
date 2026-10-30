import { SLOT_MINUTES } from '../constants/schedule'
import { DEMO_APPOINTMENTS } from '../data/demoAppointments'
import type { Appointment } from '../interface/booking'
import type { PublicDoctor } from '../interface/directory'
import type { BookingData } from '../validation/bookingValidation'
import { currentTime, fromDateKey, timeSlots, toDateKey, toMinutes, weekdayOf } from '../utils/time'
import { readJSON, writeJSON } from './storage'
import { getSchedule } from './scheduleService'

const APPOINTMENTS_KEY = 'onhealth.appointments'
export const CANCEL_HOURS_BEFORE = 2 // a visit can be cancelled until this many hours before it starts

type BookingResult = { ok: true; appointment: Appointment } | { ok: false; error: string }

// Appointments booked in this browser
function getStoredAppointments(): Appointment[] {
  const stored = readJSON<unknown>(APPOINTMENTS_KEY, [])
  return Array.isArray(stored) ? (stored as Appointment[]) : []
}

// Demo visits + booked appointments. Demo visits are never written to localStorage.
function getAppointments(): Appointment[] {
  return [...DEMO_APPOINTMENTS, ...getStoredAppointments()]
}

export function getPatientAppointments(patientId: string): Appointment[] {
  return getAppointments().filter((a) => a.patientId === patientId)
}

// Times the doctor is already taken on that date, at any clinic (a doctor can't be in two places)
function takenTimes(doctorId: string, date: string): Set<string> {
  return new Set(
    getAppointments()
      .filter((a) => a.doctorId === doctorId && a.date === date && a.status === 'booked')
      .map((a) => a.time),
  )
}

interface DaySlot {
  time: string
  free: boolean // false = someone already booked it
}

// All visit times for one doctor, clinic and date, booked ones marked. Today's past times are left out.
export function getDaySlots(doctorId: string, clinicId: string, date: string): DaySlot[] {
  const workingDay = getSchedule(doctorId, clinicId)?.days.find((d) => d.day === weekdayOf(date))
  if (!workingDay) return []

  const taken = takenTimes(doctorId, date)
  const isToday = date === toDateKey(new Date())
  const now = currentTime()

  return timeSlots(workingDay.start, workingDay.end, SLOT_MINUTES)
    .filter((time) => !(isToday && time <= now))
    .map((time) => ({ time, free: !taken.has(time) }))
}

// Only the times that can still be booked
export function getFreeSlots(doctorId: string, clinicId: string, date: string): string[] {
  return getDaySlots(doctorId, clinicId, date)
    .filter((slot) => slot.free)
    .map((slot) => slot.time)
}

// Expects data already validated by bookingSchema. Checks the time is still free right before saving.
export function bookAppointment(patientId: string, doctor: PublicDoctor, data: BookingData): BookingResult {
  if (!getFreeSlots(doctor.id, data.clinicId, data.date).includes(data.time)) {
    return { ok: false, error: 'ეს დრო უკვე დაკავებულია. აირჩიეთ სხვა დრო.' }
  }
  const service = doctor.services.find((s) => s.name === data.serviceName)
  if (!service) return { ok: false, error: 'აირჩიეთ ვიზიტის ტიპი' }

  const appointment: Appointment = {
    id: crypto.randomUUID(),
    patientId,
    doctorId: doctor.id,
    clinicId: data.clinicId,
    date: data.date,
    time: data.time,
    status: 'booked',
    createdAt: new Date().toISOString(),
    service,
    reason: data.reason,
    payment: data.payment,
  }
  writeJSON(APPOINTMENTS_KEY, [...getStoredAppointments(), appointment])
  return { ok: true, appointment }
}

// Upcoming and more than CANCEL_HOURS_BEFORE hours away
export function canCancel(appointment: Appointment): boolean {
  const start = fromDateKey(appointment.date).getTime() + toMinutes(appointment.time) * 60_000
  return isUpcoming(appointment) && start - Date.now() > CANCEL_HOURS_BEFORE * 3_600_000
}

// Only the patient who booked can cancel
export function cancelAppointment(appointmentId: string, patientId: string): void {
  writeJSON(
    APPOINTMENTS_KEY,
    getStoredAppointments().map((a) =>
      a.id === appointmentId && a.patientId === patientId && canCancel(a) ? { ...a, status: 'cancelled' } : a,
    ),
  )
}

// Upcoming = booked and not yet past
export function isUpcoming(appointment: Appointment): boolean {
  const today = toDateKey(new Date())
  return (
    appointment.status === 'booked' &&
    (appointment.date > today || (appointment.date === today && appointment.time > currentTime()))
  )
}

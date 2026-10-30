import { MONTHS_SHORT, WEEKDAYS } from '../constants/schedule'
import type { Weekday } from '../interface/booking'

// "09:30" → 570
export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// 570 → "09:30"
export function fromMinutes(total: number): string {
  const hours = String(Math.floor(total / 60)).padStart(2, '0')
  const minutes = String(total % 60).padStart(2, '0')
  return `${hours}:${minutes}`
}

// Every slot start from start (included) to end (excluded): "10:00", "10:30", …
export function timeSlots(start: string, end: string, step: number): string[] {
  const slots: string[] = []
  for (let t = toMinutes(start); t + step <= toMinutes(end); t += step) slots.push(fromMinutes(t))
  return slots
}

// Local date as "YYYY-MM-DD" (not toISOString, which would use UTC and can shift the day)
export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// "YYYY-MM-DD" → Date at local midnight
export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

export function weekdayOf(key: string): Weekday {
  return fromDateKey(key).getDay() as Weekday
}

// "2026-10-30" → "პარ, 30 ოქტ"
export function formatDateShort(key: string): string {
  const date = fromDateKey(key)
  const weekday = WEEKDAYS.find((w) => w.day === date.getDay())?.short ?? ''
  return `${weekday}, ${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`
}

// "2026-10-30" → "პარასკევი, 30 ოქტ 2026"
export function formatDateLong(key: string): string {
  const date = fromDateKey(key)
  const weekday = WEEKDAYS.find((w) => w.day === date.getDay())?.label ?? ''
  return `${weekday}, ${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`
}

// "HH:MM" of right now, for hiding today's past slots
export function currentTime(): string {
  const now = new Date()
  return fromMinutes(now.getHours() * 60 + now.getMinutes())
}

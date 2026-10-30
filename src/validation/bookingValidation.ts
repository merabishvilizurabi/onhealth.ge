import * as z from 'zod'
import { toMinutes } from '../utils/time'

const MESSAGES = {
  time: 'აირჩიეთ დრო',
  endAfterStart: 'დასრულება უნდა იყოს დაწყების შემდეგ',
  clinic: 'აირჩიეთ კლინიკა',
  date: 'აირჩიეთ თარიღი',
  service: 'აირჩიეთ ვიზიტის ტიპი',
  reason: 'მიზეზი უნდა იყოს 300 სიმბოლომდე',
  payment: 'აირჩიეთ გადახდის მეთოდი',
}

const time = z.string({ error: MESSAGES.time }).regex(/^([01]\d|2[0-3]):[0-5]\d$/, MESSAGES.time)

// One working day on the schedule page
export const workingDaySchema = z
  .object({
    day: z.number().int().min(0).max(6),
    start: time,
    end: time,
  })
  .refine((d) => toMinutes(d.end) > toMinutes(d.start), { error: MESSAGES.endAfterStart, path: ['end'] })

export const REASON_MAX = 300

// Clinic, date and time come from the doctor's profile; the rest from the booking page
export const bookingSchema = z.object({
  clinicId: z.string({ error: MESSAGES.clinic }).min(1, MESSAGES.clinic),
  date: z.string({ error: MESSAGES.date }).regex(/^\d{4}-\d{2}-\d{2}$/, MESSAGES.date),
  time,
  serviceName: z.string({ error: MESSAGES.service }).min(1, MESSAGES.service),
  reason: z.string().trim().max(REASON_MAX, MESSAGES.reason),
  payment: z.enum(['online', 'clinic'], { error: MESSAGES.payment }),
})

export type BookingData = z.infer<typeof bookingSchema>

import { DEMO_REVIEWS } from '../data/demoReviews'
import type { Appointment } from '../interface/booking'
import type { RatingSummary, Review } from '../interface/review'
import type { Patient } from '../interface/user'
import type { ReviewData } from '../validation/reviewValidation'
import { isUpcoming } from './appointmentService'
import { readJSON, writeJSON } from './storage'

const REVIEWS_KEY = 'onhealth.reviews'
const REMOVED_KEY = 'onhealth.removedReviews' // ids of demo reviews a demo patient deleted

type ReviewResult = { ok: true; review: Review } | { ok: false; error: string }

function getStoredReviews(): Review[] {
  const stored = readJSON<unknown>(REVIEWS_KEY, [])
  return Array.isArray(stored) ? (stored as Review[]) : []
}

function getRemovedIds(): string[] {
  const stored = readJSON<unknown>(REMOVED_KEY, [])
  return Array.isArray(stored) ? (stored as string[]) : []
}

// Demo reviews + reviews written in this browser. An edited demo review is saved as a
// stored copy with the same id and replaces the demo one; a deleted one is left out.
function getReviews(): Review[] {
  const stored = getStoredReviews()
  const hidden = new Set([...stored.map((r) => r.id), ...getRemovedIds()])
  return [...DEMO_REVIEWS.filter((r) => !hidden.has(r.id)), ...stored]
}

// The patient's own review, or undefined if it isn't theirs
function findOwnReview(patient: Patient, reviewId: string): Review | undefined {
  return getReviews().find((r) => r.id === reviewId && r.patientId === patient.id)
}

// Newest first
export function getDoctorReviews(doctorId: string): Review[] {
  return getReviews()
    .filter((r) => r.doctorId === doctorId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getRating(doctorId: string): RatingSummary | null {
  const reviews = getReviews().filter((r) => r.doctorId === doctorId)
  if (reviews.length === 0) return null
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  return { average: Math.round(average * 10) / 10, count: reviews.length }
}

export function getReviewForAppointment(appointmentId: string): Review | undefined {
  return getReviews().find((r) => r.appointmentId === appointmentId)
}

// A patient can review a visit once, after its time has passed
export function canReview(appointment: Appointment): boolean {
  return appointment.status === 'booked' && !isUpcoming(appointment) && !getReviewForAppointment(appointment.id)
}

// Expects data already validated by reviewSchema
export function addReview(patient: Patient, appointment: Appointment, data: ReviewData): ReviewResult {
  if (appointment.patientId !== patient.id || !canReview(appointment)) {
    return { ok: false, error: 'ამ ვიზიტის შეფასება შეუძლებელია' }
  }

  const review: Review = {
    id: crypto.randomUUID(),
    doctorId: appointment.doctorId,
    patientId: patient.id,
    patientName: patient.fullName.split(' ')[0],
    appointmentId: appointment.id,
    rating: data.rating,
    comment: data.comment,
    createdAt: new Date().toISOString(),
  }
  writeJSON(REVIEWS_KEY, [...getStoredReviews(), review])
  return { ok: true, review }
}

// Expects data already validated by reviewSchema. Keeps the date of the original review.
export function updateReview(patient: Patient, reviewId: string, data: ReviewData): ReviewResult {
  const review = findOwnReview(patient, reviewId)
  if (!review) return { ok: false, error: 'შეფასება ვერ მოიძებნა' }

  const updated: Review = { ...review, rating: data.rating, comment: data.comment }
  const stored = getStoredReviews()
  const exists = stored.some((r) => r.id === reviewId)
  writeJSON(REVIEWS_KEY, exists ? stored.map((r) => (r.id === reviewId ? updated : r)) : [...stored, updated])
  return { ok: true, review: updated }
}

// Removes only the review; the visit stays in the history and can be reviewed again
export function deleteReview(patient: Patient, reviewId: string): void {
  if (!findOwnReview(patient, reviewId)) return
  writeJSON(REVIEWS_KEY, getStoredReviews().filter((r) => r.id !== reviewId))
  if (DEMO_REVIEWS.some((r) => r.id === reviewId)) writeJSON(REMOVED_KEY, [...getRemovedIds(), reviewId])
}

export interface Review {
  id: string
  doctorId: string
  patientId: string
  patientName: string // shown publicly as the first name only
  appointmentId: string // the visit this review is about
  rating: 1 | 2 | 3 | 4 | 5
  comment: string
  createdAt: string
}

export interface RatingSummary {
  average: number // rounded to 1 decimal
  count: number
}

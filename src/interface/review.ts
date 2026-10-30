export interface Review {
  id: string
  doctorId: string
  patientId: string
  patientName: string
  appointmentId: string
  rating: 1 | 2 | 3 | 4 | 5
  comment: string
  createdAt: string
}

export interface RatingSummary {
  average: number
  count: number
}

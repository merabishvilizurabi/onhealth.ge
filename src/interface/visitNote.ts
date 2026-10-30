// What the doctor writes after a completed visit. The patient sees it in their visit history.
export interface VisitNote {
  appointmentId: string
  doctorId: string
  diagnosis: string
  prescription: string // medicines and instructions, '' when none
  updatedAt: string
}

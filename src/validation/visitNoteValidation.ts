import * as z from 'zod'

export const DIAGNOSIS_MAX = 300
export const PRESCRIPTION_MAX = 1000

export const visitNoteSchema = z.object({
  diagnosis: z.string().trim().min(1, 'შეიყვანეთ დიაგნოზი').max(DIAGNOSIS_MAX, 'დიაგნოზი ძალიან გრძელია'),
  prescription: z.string().trim().max(PRESCRIPTION_MAX, 'დანიშნულება ძალიან გრძელია'),
})

export type VisitNoteData = z.infer<typeof visitNoteSchema>

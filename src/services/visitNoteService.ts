import { DEMO_VISIT_NOTES } from '../data/demoVisitNotes'
import type { Appointment } from '../interface/booking'
import type { VisitNote } from '../interface/visitNote'
import type { VisitNoteData } from '../validation/visitNoteValidation'
import { isUpcoming } from './appointmentService'
import { readJSON, writeJSON } from './storage'

const NOTES_KEY = 'onhealth.visitNotes'

type NoteResult = { ok: true; note: VisitNote } | { ok: false; error: string }

function getStoredNotes(): VisitNote[] {
  const stored = readJSON<unknown>(NOTES_KEY, [])
  return Array.isArray(stored) ? (stored as VisitNote[]) : []
}

function getNotes(): VisitNote[] {
  const stored = getStoredNotes()
  return [...DEMO_VISIT_NOTES.filter((n) => !stored.some((s) => s.appointmentId === n.appointmentId)), ...stored]
}

export function getVisitNote(appointmentId: string): VisitNote | undefined {
  return getNotes().find((n) => n.appointmentId === appointmentId)
}

export function canWriteNote(appointment: Appointment): boolean {
  return appointment.status === 'booked' && !isUpcoming(appointment)
}

export function saveVisitNote(doctorId: string, appointment: Appointment, data: VisitNoteData): NoteResult {
  if (appointment.doctorId !== doctorId || !canWriteNote(appointment)) {
    return { ok: false, error: 'ამ ვიზიტისთვის ჩანაწერის გაკეთება შეუძლებელია' }
  }
  const note: VisitNote = { appointmentId: appointment.id, doctorId, ...data, updatedAt: new Date().toISOString() }
  writeJSON(NOTES_KEY, [...getStoredNotes().filter((n) => n.appointmentId !== appointment.id), note])
  return { ok: true, note }
}

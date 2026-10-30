import { ROLES, type Role } from '../constants/roles'
import { DEMO_USERS } from '../data/demoUsers'
import type { Patient, User } from '../interface/user'
import type { PasswordData, ProfileData, SignUpData } from '../validation/authValidation'
import { readJSON, removeKey, writeJSON } from './storage'

const USERS_KEY = 'onhealth.users'
const SESSION_KEY = 'onhealth.session'

export type AuthResult = { ok: true; user: User } | { ok: false; error: string }

// Text fields the public pages read for each role. A stored account missing one would crash them.
const REQUIRED_TEXT: Record<Role, string[]> = {
  patient: ['id', 'email', 'fullName'],
  doctor: ['id', 'email', 'fullName', 'specialty'],
  clinic: ['id', 'email', 'clinicName', 'city', 'address', 'specialty'],
}

// localStorage can hold anything (old app versions, manual edits), so check each account before using it
function isStoredUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  const role = record.role as Role
  return ROLES.includes(role) && REQUIRED_TEXT[role].every((field) => typeof record[field] === 'string')
}

// Accounts registered in this browser. Malformed entries are skipped.
// Doctors registered before clinics existed have no "clinics" list, so we give them an empty one.
function getStoredUsers(): User[] {
  const stored = readJSON<unknown>(USERS_KEY, [])
  if (!Array.isArray(stored)) return []
  return stored
    .filter(isStoredUser)
    .map((user) =>
      user.role === 'doctor'
        ? {
            ...user,
            clinics: user.clinics ?? [],
            // fields added later: older doctor accounts don't have them
            bio: user.bio ?? '',
            education: user.education ?? '',
            languages: user.languages ?? [],
            services: user.services ?? [],
          }
        : user,
    )
}

// Demo accounts + registered accounts. A demo account edited on the profile page
// is saved as a stored copy with the same id, and that copy replaces the demo one.
export function getUsers(): User[] {
  const stored = getStoredUsers()
  const storedIds = new Set(stored.map((user) => user.id))
  return [...DEMO_USERS.filter((user) => !storedIds.has(user.id)), ...stored]
}

// Saves a changed account: replaces the stored copy, or adds one (first edit of a demo account)
function saveUser(user: User): void {
  const stored = getStoredUsers()
  const exists = stored.some((u) => u.id === user.id)
  writeJSON(USERS_KEY, exists ? stored.map((u) => (u.id === user.id ? user : u)) : [...stored, user])
}

function findPatient(patientId: string): Patient | undefined {
  return getUsers().find((user): user is Patient => user.role === 'patient' && user.id === patientId)
}

function buildUser(data: SignUpData): User {
  const now = new Date().toISOString()
  const base = {
    id: crypto.randomUUID(),
    email: data.email,
    password: data.password,
    createdAt: now,
  }

  switch (data.role) {
    case 'patient':
      return { ...base, role: 'patient', fullName: data.fullName, phone: data.phone }
    case 'doctor':
      return {
        ...base,
        role: 'doctor',
        fullName: data.fullName,
        specialty: data.specialty,
        experienceYears: data.experienceYears,
        // The chosen clinic still has to verify the doctor
        clinics: [{ clinicId: data.clinicId, status: 'pending', joinedAt: now }],
        bio: data.bio,
        education: data.education,
        languages: data.languages,
        services: [{ name: 'კონსულტაცია', price: data.price }],
      }
    case 'clinic':
      return {
        ...base,
        role: 'clinic',
        clinicName: data.clinicName,
        city: data.city,
        address: data.address,
        phone: data.phone,
        specialty: data.specialty,
      }
  }
}

export function signUp(data: SignUpData): AuthResult {
  const users = getUsers()

  if (users.some((user) => user.email === data.email)) {
    return { ok: false, error: 'ამ ელ. ფოსტით ანგარიში უკვე არსებობს' }
  }

  if (data.role === 'doctor' && !users.some((user) => user.role === 'clinic' && user.id === data.clinicId)) {
    return { ok: false, error: 'არჩეული კლინიკა ვერ მოიძებნა' }
  }

  const user = buildUser(data)
  writeJSON(USERS_KEY, [...getStoredUsers(), user])
  writeJSON(SESSION_KEY, user.id)
  return { ok: true, user }
}

export function signIn(email: string, password: string): AuthResult {
  const user = getUsers().find((u) => u.email === email.trim().toLowerCase())

  if (!user || user.password !== password) {
    return { ok: false, error: 'ელ. ფოსტა ან პაროლი არასწორია' }
  }

  writeJSON(SESSION_KEY, user.id)
  return { ok: true, user }
}

// Expects data already validated by profileSchema
export function updateProfile(patientId: string, data: ProfileData): AuthResult {
  const patient = findPatient(patientId)
  if (!patient) return { ok: false, error: 'ანგარიში ვერ მოიძებნა' }

  const user: Patient = { ...patient, fullName: data.fullName, phone: data.phone }
  saveUser(user)
  return { ok: true, user }
}

// Expects data already validated by passwordSchema
export function changePassword(patientId: string, data: PasswordData): AuthResult {
  const patient = findPatient(patientId)
  if (!patient) return { ok: false, error: 'ანგარიში ვერ მოიძებნა' }
  if (patient.password !== data.currentPassword) return { ok: false, error: 'მიმდინარე პაროლი არასწორია' }

  const user: Patient = { ...patient, password: data.password }
  saveUser(user)
  return { ok: true, user }
}

export function signOut(): void {
  removeKey(SESSION_KEY)
}

export function getCurrentUser(): User | null {
  const id = readJSON<string | null>(SESSION_KEY, null)
  return getUsers().find((user) => user.id === id) ?? null
}

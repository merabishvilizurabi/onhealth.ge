import { DEMO_USERS } from '../data/demoUsers'
import type { User } from '../interface/user'
import type { SignUpData } from '../validation/authValidation'
import { readJSON, removeKey, writeJSON } from './storage'

const USERS_KEY = 'onhealth.users'
const SESSION_KEY = 'onhealth.session'

export type AuthResult = { ok: true; user: User } | { ok: false; error: string }

// Accounts registered in this browser.
// Doctors registered before clinics existed have no "clinics" list, so we give them an empty one.
function getStoredUsers(): User[] {
  return readJSON<User[]>(USERS_KEY, []).map((user) =>
    user.role === 'doctor' ? { ...user, clinics: user.clinics ?? [] } : user,
  )
}

// Demo accounts + registered accounts. Demo accounts are never written to localStorage.
export function getUsers(): User[] {
  return [...DEMO_USERS, ...getStoredUsers()]
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

export function signOut(): void {
  removeKey(SESSION_KEY)
}

export function getCurrentUser(): User | null {
  const id = readJSON<string | null>(SESSION_KEY, null)
  return getUsers().find((user) => user.id === id) ?? null
}

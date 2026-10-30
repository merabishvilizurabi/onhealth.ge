import { ROLES, type Role } from '../constants/roles'
import { DEMO_USERS } from '../data/demoUsers'
import type { Clinic, Doctor, Patient, User } from '../interface/user'
import type {
  ClinicInfoData,
  DoctorData,
  DoctorProfileData,
  PasswordData,
  ProfileData,
  SignUpData,
} from '../validation/authValidation'
import { readJSON, removeKey, writeJSON } from './storage'

const USERS_KEY = 'onhealth.users'
const SESSION_KEY = 'onhealth.session'

export type AuthResult = { ok: true; user: User } | { ok: false; error: string }

const REQUIRED_TEXT: Record<Role, string[]> = {
  patient: ['id', 'email', 'fullName'],
  doctor: ['id', 'email', 'fullName', 'specialty'],
  clinic: ['id', 'email', 'clinicName', 'city', 'address', 'specialty'],
}

function isStoredUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  const role = record.role as Role
  return ROLES.includes(role) && REQUIRED_TEXT[role].every((field) => typeof record[field] === 'string')
}

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
            phone: user.phone ?? '',
            bio: user.bio ?? '',
            education: user.education ?? '',
            languages: user.languages ?? [],
            services: user.services ?? [],
          }
        : user,
    )
}

export function getUsers(): User[] {
  const stored = getStoredUsers()
  const storedIds = new Set(stored.map((user) => user.id))
  return [...DEMO_USERS.filter((user) => !storedIds.has(user.id)), ...stored]
}

export function saveUser(user: User): void {
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

  const user = buildUser(data)
  writeJSON(USERS_KEY, [...getStoredUsers(), user])
  writeJSON(SESSION_KEY, user.id)
  return { ok: true, user }
}

export function addDoctor(clinicId: string, data: DoctorData): AuthResult {
  const existing = getUsers().find((user) => user.email === data.email)
  if (existing) {
    return {
      ok: false,
      error:
        existing.role === 'doctor'
          ? 'ეს ექიმი უკვე რეგისტრირებულია. აირჩიეთ „უკვე რეგისტრირებული ექიმი“ და დაამატეთ ელ. ფოსტით.'
          : 'ამ ელ. ფოსტით ანგარიში უკვე არსებობს',
    }
  }

  const now = new Date().toISOString()
  const doctor: Doctor = {
    id: crypto.randomUUID(),
    role: 'doctor',
    email: data.email,
    password: data.password,
    createdAt: now,
    fullName: data.fullName,
    phone: data.phone,
    specialty: data.specialty,
    experienceYears: data.experienceYears,
    clinics: [{ clinicId, status: 'verified', joinedAt: now }],
    bio: data.bio,
    education: data.education,
    languages: data.languages,
    services: [{ name: 'კონსულტაცია', price: data.price }],
  }
  writeJSON(USERS_KEY, [...getStoredUsers(), doctor])
  return { ok: true, user: doctor }
}

export function signIn(email: string, password: string): AuthResult {
  const user = getUsers().find((u) => u.email === email.trim().toLowerCase())

  if (!user || user.password !== password) {
    return { ok: false, error: 'ელ. ფოსტა ან პაროლი არასწორია' }
  }

  writeJSON(SESSION_KEY, user.id)
  return { ok: true, user }
}

export function updateProfile(patientId: string, data: ProfileData): AuthResult {
  const patient = findPatient(patientId)
  if (!patient) return { ok: false, error: 'ანგარიში ვერ მოიძებნა' }

  const user: Patient = { ...patient, fullName: data.fullName, phone: data.phone }
  saveUser(user)
  return { ok: true, user }
}

export function updateClinic(clinicId: string, data: ClinicInfoData): AuthResult {
  const clinic = getUsers().find((user): user is Clinic => user.role === 'clinic' && user.id === clinicId)
  if (!clinic) return { ok: false, error: 'ანგარიში ვერ მოიძებნა' }

  const user: Clinic = { ...clinic, ...data }
  saveUser(user)
  return { ok: true, user }
}

export function updateDoctor(doctorId: string, data: DoctorProfileData): AuthResult {
  const doctor = getUsers().find((user): user is Doctor => user.role === 'doctor' && user.id === doctorId)
  if (!doctor) return { ok: false, error: 'ანგარიში ვერ მოიძებნა' }

  const user: Doctor = { ...doctor, ...data }
  saveUser(user)
  return { ok: true, user }
}

export function changePassword(userId: string, data: PasswordData): AuthResult {
  const current = getUsers().find((user) => user.id === userId)
  if (!current) return { ok: false, error: 'ანგარიში ვერ მოიძებნა' }
  if (current.password !== data.currentPassword) return { ok: false, error: 'მიმდინარე პაროლი არასწორია' }

  const user: User = { ...current, password: data.password }
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

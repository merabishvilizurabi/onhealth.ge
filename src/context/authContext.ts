import { createContext } from 'react'
import type { User } from '../interface/user'
import type { AuthResult } from '../services/authService'
import type { PasswordData, ProfileData, SignUpData } from '../validation/authValidation'

export interface AuthContextValue {
  user: User | null
  signIn: (email: string, password: string) => AuthResult
  signUp: (data: SignUpData) => AuthResult
  signOut: () => void
  updateProfile: (data: ProfileData) => AuthResult
  changePassword: (data: PasswordData) => AuthResult
}

export const AuthContext = createContext<AuthContextValue | null>(null)

import { createContext } from 'react'
import type { User } from '../interface/user'
import type { AuthResult } from '../services/authService'
import type { SignUpData } from '../validation/authValidation'

export interface AuthContextValue {
  user: User | null
  signIn: (email: string, password: string) => AuthResult
  signUp: (data: SignUpData) => AuthResult
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

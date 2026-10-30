import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from '../interface/user'
import * as authService from '../services/authService'
import { AuthContext, type AuthContextValue } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser())

  useEffect(() => {
    const root = document.documentElement
    if (user) root.dataset.role = user.role
    else delete root.dataset.role
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn: (email, password) => {
        const result = authService.signIn(email, password)
        if (result.ok) setUser(result.user)
        return result
      },
      signUp: (data) => {
        const result = authService.signUp(data)
        if (result.ok) setUser(result.user)
        return result
      },
      signOut: () => {
        authService.signOut()
        setUser(null)
      },
      // Profile page (patients). The header name updates right away.
      updateProfile: (data) => {
        if (!user) return { ok: false, error: 'შედით ანგარიშზე' }
        const result = authService.updateProfile(user.id, data)
        if (result.ok) setUser(result.user)
        return result
      },
      changePassword: (data) => {
        if (!user) return { ok: false, error: 'შედით ანგარიშზე' }
        const result = authService.changePassword(user.id, data)
        if (result.ok) setUser(result.user)
        return result
      },
      // Clinic dashboard. The header name updates right away.
      updateClinic: (data) => {
        if (!user) return { ok: false, error: 'შედით ანგარიშზე' }
        const result = authService.updateClinic(user.id, data)
        if (result.ok) setUser(result.user)
        return result
      },
      // Doctor dashboard. The header name updates right away.
      updateDoctor: (data) => {
        if (!user) return { ok: false, error: 'შედით ანგარიშზე' }
        const result = authService.updateDoctor(user.id, data)
        if (result.ok) setUser(result.user)
        return result
      },
    }),
    [user],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

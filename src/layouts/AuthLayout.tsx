import { Suspense, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import type { SignUpRole } from '../constants/roles'
import { LogoMark } from '../components/layout/LogoMark'
import { PATHS } from '../router/paths'

export interface AuthLayoutContext {
  role: SignUpRole
  setRole: (role: SignUpRole) => void
}
export function AuthLayout() {
  const [role, setRole] = useState<SignUpRole>('patient')
  const { pathname } = useLocation()
  const width = pathname === PATHS.signUp ? 'max-w-md md:max-w-3xl lg:max-w-4xl' : 'max-w-md'

  return (
    <main data-role={role} className="flex min-h-dvh flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <div className='flex flex-1 items-center justify-center px-4 py-10 md:ps-9'>
          <div className={`w-full ${width}`}>
            <h1></h1>
            <p className="md:hidden mb-12 text-center text-4xl font-semibold text-primary transition-colors">OnHealth.ge</p>
            <div className="min-h-110 w-full overflow-hidden">
              <Suspense fallback={null}>
                <Outlet context={{ role, setRole } satisfies AuthLayoutContext} />
              </Suspense>
            </div>
          </div>
        </div>
        <div className="hidden md:flex md:min-h-[45vh] md:flex-1 md:items-center md:justify-center md:overflow-hidden">
          <div className='flex flex-col'>
            <LogoMark className="h-auto w-100 text-primary transition-colors" />
            <p className="hidden md:block mt-4 text-center text-4xl font-semibold text-primary transition-colors">OnHealth.ge</p>
          </div>
        </div>
      </div>
    </main>
  )
}

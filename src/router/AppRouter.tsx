import { Route, Routes } from 'react-router'
import { AuthLayout } from '../layouts/AuthLayout'
import { MainLayout } from '../layouts/MainLayout'
import { SignIn } from '../pages/auth/SignIn'
import { SignUp } from '../pages/auth/SignUp'
import { ClinicDashboard } from '../pages/clinic/ClinicDashboard'
import { DoctorDashboard } from '../pages/doctor/DoctorDashboard'
import { Home } from '../pages/Home'
import { NotFound } from '../pages/NotFound'
import { GuestRoute } from './GuestRoute'
import { PATHS } from './paths'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={PATHS.home} element={<Home />} />
      </Route>
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={PATHS.signIn} element={<SignIn />} />
          <Route path={PATHS.signUp} element={<SignUp />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allow={['doctor']} />}>
        <Route path={PATHS.doctorDashboard} element={<DoctorDashboard />} />
      </Route>
      <Route element={<ProtectedRoute allow={['clinic']} />}>
        <Route path={PATHS.clinicDashboard} element={<ClinicDashboard />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

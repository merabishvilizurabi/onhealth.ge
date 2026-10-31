import { lazy } from 'react'
import { Route, Routes } from 'react-router'
import { AuthLayout } from '../layouts/AuthLayout'
import { MainLayout } from '../layouts/MainLayout'
import { Home } from '../pages/main/Home'
import { NotFound } from '../pages/NotFound'
import { GuestRoute } from './GuestRoute'
import { PATHS } from './paths'
import { ProtectedRoute } from './ProtectedRoute'

const SignIn = lazy(() => import('../pages/auth/SignIn').then((m) => ({ default: m.SignIn })))
const SignUp = lazy(() => import('../pages/auth/SignUp').then((m) => ({ default: m.SignUp })))
const ClinicDashboard = lazy(() => import('../pages/clinic/ClinicDashboard').then((m) => ({ default: m.ClinicDashboard })))
const ClinicDoctor = lazy(() => import('../pages/clinic/ClinicDoctor').then((m) => ({ default: m.ClinicDoctor })))
const ClinicStats = lazy(() => import('../pages/clinic/ClinicStats').then((m) => ({ default: m.ClinicStats })))
const DoctorDashboard = lazy(() => import('../pages/doctor/DoctorDashboard').then((m) => ({ default: m.DoctorDashboard })))
const DoctorProfile = lazy(() => import('../pages/main/doctors/DoctorProfile').then((m) => ({ default: m.DoctorProfile })))
const DoctorsPage = lazy(() => import('../pages/main/doctors/DoctorsPage').then((m) => ({ default: m.DoctorsPage })))
const ClinicProfile = lazy(() => import('../pages/main/clinics/ClinicProfile').then((m) => ({ default: m.ClinicProfile })))
const PatientProfile = lazy(() => import('../pages/main/profile/PatientProfile').then((m) => ({ default: m.PatientProfile })))
const BookingPage = lazy(() => import('../pages/main/booking/BookingPage').then((m) => ({ default: m.BookingPage })))

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={PATHS.home} element={<Home />} />
        <Route path={PATHS.doctors} element={<DoctorsPage />} />
        <Route path={PATHS.doctorProfile} element={<DoctorProfile />} />
        <Route path={PATHS.clinicProfile} element={<ClinicProfile />} />
        <Route element={<ProtectedRoute allow={['patient']} />}>
          <Route path={PATHS.profile} element={<PatientProfile />} />
          <Route path={PATHS.book} element={<BookingPage />} />
        </Route>
        <Route element={<ProtectedRoute allow={['doctor']} />}>
          <Route path={PATHS.doctorDashboard} element={<DoctorDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allow={['clinic']} />}>
          <Route path={PATHS.clinicDashboard} element={<ClinicDashboard />} />
          <Route path={PATHS.clinicDoctor} element={<ClinicDoctor />} />
          <Route path={PATHS.clinicStats} element={<ClinicStats />} />
        </Route>
      </Route>
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={PATHS.signIn} element={<SignIn />} />
          <Route path={PATHS.signUp} element={<SignUp />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

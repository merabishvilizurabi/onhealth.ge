import { Route, Routes } from 'react-router'
import { AuthLayout } from '../layouts/AuthLayout'
import { MainLayout } from '../layouts/MainLayout'
import { SignIn } from '../pages/auth/SignIn'
import { SignUp } from '../pages/auth/SignUp'
import { ClinicDashboard } from '../pages/clinic/ClinicDashboard'
import { DoctorDashboard } from '../pages/doctor/DoctorDashboard'
import { DoctorSchedule } from '../pages/doctor/DoctorSchedule'
import { DoctorProfile } from '../pages/main/doctors/DoctorProfile'
import { DoctorsPage } from '../pages/main/doctors/DoctorsPage'
import { ClinicProfile } from '../pages/main/clinics/ClinicProfile'
import { Home } from '../pages/main/Home'
import { NotFound } from '../pages/NotFound'
import { PatientProfile } from '../pages/main/profile/PatientProfile'
import { BookingPage } from '../pages/main/booking/BookingPage'
import { GuestRoute } from './GuestRoute'
import { PATHS } from './paths'
import { ProtectedRoute } from './ProtectedRoute'

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
          <Route path={PATHS.doctorSchedule} element={<DoctorSchedule />} />
        </Route>
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

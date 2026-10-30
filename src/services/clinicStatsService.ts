import type { Doctor } from '../interface/user'
import { getClinicAppointments } from './appointmentService'
import { getClinicDoctors } from './clinicService'
import { getRating } from './reviewService'
import { getPeriodStats, priceOf, sumIncome, type PeriodStats } from './statsService'

// Numbers for the clinic's statistics page

interface DoctorStats {
  doctor: Doctor
  visits: number
  income: number
  cancelled: number
  rating: number | null
}

interface ServiceStats {
  name: string
  visits: number
  income: number
}

export interface ClinicStats extends PeriodStats {
  doctors: DoctorStats[] // highest income first
  services: ServiceStats[] // most visits first
}

// `period` days ending today
export function getClinicStats(clinicId: string, period: number): ClinicStats {
  const stats = getPeriodStats(getClinicAppointments(clinicId), period)

  const services = new Map<string, ServiceStats>()
  for (const a of stats.done) {
    const name = a.service?.name ?? 'კონსულტაცია'
    const entry = services.get(name) ?? { name, visits: 0, income: 0 }
    services.set(name, { name, visits: entry.visits + 1, income: entry.income + priceOf(a) })
  }

  return {
    ...stats,
    doctors: getClinicDoctors(clinicId)
      .filter((d) => d.status === 'verified')
      .map(({ doctor }) => {
        const own = stats.done.filter((a) => a.doctorId === doctor.id)
        return {
          doctor,
          visits: own.length,
          income: sumIncome(own),
          cancelled: stats.inPeriod.filter((a) => a.doctorId === doctor.id && a.status === 'cancelled').length,
          rating: getRating(doctor.id)?.average ?? null,
        }
      })
      .sort((a, b) => b.income - a.income || b.visits - a.visits),
    services: [...services.values()].sort((a, b) => b.visits - a.visits),
  }
}

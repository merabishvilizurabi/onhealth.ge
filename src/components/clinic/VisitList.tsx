import type { ReactNode } from 'react'
import type { Appointment } from '../../interface/booking'
import type { PublicClinic } from '../../interface/directory'
import type { Doctor, Patient } from '../../interface/user'
import { isUpcoming } from '../../services/appointmentService'
import { formatDateLong } from '../../utils/time'

interface VisitListProps {
  visits: Appointment[]
  patients: Map<string, Patient>
  doctors?: Map<string, Doctor>
  clinics?: Map<string, PublicClinic>
  renderExtra?: (visit: Appointment) => ReactNode
  empty: string
}

function statusOf(visit: Appointment) {
  if (visit.status === 'cancelled') {
    return {
      label: visit.cancelledBy === 'clinic' ? 'გაუქმებული კლინიკის მიერ' : 'გაუქმებული',
      className: 'bg-red-50 text-red-700',
    }
  }
  if (isUpcoming(visit)) return { label: 'დაგეგმილი', className: 'bg-primary-soft text-primary' }
  return { label: 'ჩატარებული', className: 'bg-gray-100 text-gray-900' }
}

export function VisitList({ visits, patients, doctors, clinics, renderExtra, empty }: VisitListProps) {
  if (visits.length === 0) return <p className="text-sm text-gray-900">{empty}</p>

  return (
    <ul className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
      {visits.map((visit) => {
        const patient = patients.get(visit.patientId)
        const doctor = doctors?.get(visit.doctorId)
        const clinic = clinics?.get(visit.clinicId)
        const status = statusOf(visit)
        return (
          <li key={visit.id} className="grid gap-2 p-4 text-sm sm:grid-cols-[10rem_1fr_auto] sm:gap-x-4">
            <div>
              <p className="font-medium text-gray-900">{visit.time}</p>
              <p className="text-gray-900">{formatDateLong(visit.date)}</p>
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="text-gray-900">
                {patient?.fullName ?? 'პაციენტი'}
                {patient && <span className="text-gray-900"> · {patient.phone}</span>}
              </p>
              {doctor && <p className="text-gray-900">ექიმი: {doctor.fullName}</p>}
              {clinic && <p className="text-gray-900">{clinic.clinicName}</p>}
              {visit.service && (
                <p className="text-gray-900">
                  {visit.service.name} · {visit.service.price} ₾ ·{' '}
                  {visit.payment === 'online' ? 'გადახდილია ონლაინ' : 'გადახდა კლინიკაში'}
                </p>
              )}
              {visit.reason && <p className="text-gray-900">მიზეზი: {visit.reason}</p>}
            </div>
            <span className={`self-start rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
              {status.label}
            </span>
            {renderExtra && <div className="sm:col-span-3">{renderExtra(visit)}</div>}
          </li>
        )
      })}
    </ul>
  )
}

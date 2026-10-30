import { fromDateKey, toDateKey } from '../utils/time'
import type { DoctorSummary } from './doctorSummaryService'

const WEIGHTS = { rating: 0.6, availability: 0.4 }
const UNRATED = 4

export function recommendationScore(summary: DoctorSummary): number {
  const rating = ((summary.rating?.average ?? UNRATED) - 1) / 4

  let availability = 0
  if (summary.next) {
    const days = Math.round((fromDateKey(summary.next.date).getTime() - fromDateKey(toDateKey(new Date())).getTime()) / 86_400_000)
    availability = Math.max(0, 1 - days / 14)
  }

  return WEIGHTS.rating * rating + WEIGHTS.availability * availability
}

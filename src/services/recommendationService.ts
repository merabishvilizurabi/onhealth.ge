import { fromDateKey, toDateKey } from '../utils/time'
import type { DoctorSummary } from './doctorSummaryService'

// "Recommended doctors" are ranked by a score from rating and availability.
// Each part is 0–1, then weighted. Change the weights to change what matters most.
const WEIGHTS = { rating: 0.6, availability: 0.4 }
const UNRATED = 4 // rating used for doctors without reviews, so new doctors aren't buried

export function recommendationScore(summary: DoctorSummary): number {
  // Rating: 1★ → 0, 5★ → 1
  const rating = ((summary.rating?.average ?? UNRATED) - 1) / 4

  // Availability: free today → 1, in 14 days → ~0, no free time → 0
  let availability = 0
  if (summary.next) {
    const days = Math.round((fromDateKey(summary.next.date).getTime() - fromDateKey(toDateKey(new Date())).getTime()) / 86_400_000)
    availability = Math.max(0, 1 - days / 14)
  }

  return WEIGHTS.rating * rating + WEIGHTS.availability * availability
}

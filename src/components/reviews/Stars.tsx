import type { RatingSummary } from '../../interface/review'

export function Stars({ value }: { value: number }) {
  return (
    <span aria-label={`${value} ვარსკვლავი 5-დან`} className="tracking-tight text-amber-500">
      {'★'.repeat(value)}
      <span className="text-gray-300">{'★'.repeat(5 - value)}</span>
    </span>
  )
}

export function RatingBadge({ rating }: { rating: RatingSummary | null }) {
  if (!rating) return <span className="text-sm text-gray-900">შეფასებები ჯერ არ არის</span>
  return (
    <span className="text-sm text-gray-900">
      <span className="text-amber-500">★</span> {rating.average.toFixed(1)}{' '}
      <span className="text-gray-900">({rating.count})</span>
    </span>
  )
}

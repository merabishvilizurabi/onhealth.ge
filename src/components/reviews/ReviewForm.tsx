import { useState } from 'react'
import type { Appointment } from '../../interface/booking'
import type { Review } from '../../interface/review'
import type { Patient } from '../../interface/user'
import { addReview, updateReview } from '../../services/reviewService'
import { validate } from '../../validation/authValidation'
import { reviewSchema } from '../../validation/reviewValidation'
import { Button } from '../ui/Button'

interface ReviewFormProps {
  patient: Patient
  appointment: Appointment
  review?: Review // given when editing an existing review
  onDone: () => void
  onCancel: () => void
}

// 1–5 stars + an optional comment for one past visit. Also used to edit a review.
export function ReviewForm({ patient, appointment, review, onDone, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(review?.rating ?? 0)
  const [comment, setComment] = useState(review?.comment ?? '')
  const [error, setError] = useState('')

  function handleSubmit() {
    const validation = validate(reviewSchema, { rating, comment })
    if (!validation.success) {
      setError(Object.values(validation.errors)[0])
      return
    }
    const result = review
      ? updateReview(patient, review.id, validation.data)
      : addReview(patient, appointment, validation.data)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onDone()
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-gray-50 p-3">
      <div role="radiogroup" aria-label="შეფასება" className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star} ვარსკვლავი`}
            onClick={() => {
              setRating(star)
              setError('')
            }}
            className={`text-2xl leading-none ${star <= rating ? 'text-amber-500' : 'text-gray-300'} hover:text-amber-400`}
          >
            ★
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-1 text-sm text-gray-700">
        კომენტარი (არასავალდებულო)
        <textarea
          value={comment}
          onChange={(e) => setComment(e.currentTarget.value)}
          rows={3}
          maxLength={500}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button onClick={handleSubmit}>{review ? 'შენახვა' : 'შეფასების გაგზავნა'}</Button>
        <Button variant="secondary" onClick={onCancel}>
          გაუქმება
        </Button>
      </div>
    </div>
  )
}

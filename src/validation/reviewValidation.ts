import * as z from 'zod'

const MESSAGES = {
  rating: 'აირჩიეთ შეფასება (1–5 ვარსკვლავი)',
  comment: 'კომენტარი უნდა იყოს 500 სიმბოლომდე',
}

export const reviewSchema = z.object({
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)], { error: MESSAGES.rating }),
  comment: z.string().trim().max(500, MESSAGES.comment),
})

export type ReviewData = z.infer<typeof reviewSchema>

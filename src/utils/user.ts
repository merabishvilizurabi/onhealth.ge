import type { User } from '../interface/user'

export function getDisplayName(user: User): string {
  return user.role === 'clinic' ? user.clinicName : user.fullName
}

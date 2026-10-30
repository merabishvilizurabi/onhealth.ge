import type { Weekday } from '../interface/booking'

export const SLOT_MINUTES = 30
export const BOOKING_DAYS_AHEAD = 14

export const DAY_START = '07:00'
export const DAY_END = '21:00'

export const WEEKDAYS: { day: Weekday; label: string; short: string }[] = [
  { day: 1, label: 'ორშაბათი', short: 'ორშ' },
  { day: 2, label: 'სამშაბათი', short: 'სამ' },
  { day: 3, label: 'ოთხშაბათი', short: 'ოთხ' },
  { day: 4, label: 'ხუთშაბათი', short: 'ხუთ' },
  { day: 5, label: 'პარასკევი', short: 'პარ' },
  { day: 6, label: 'შაბათი', short: 'შაბ' },
  { day: 0, label: 'კვირა', short: 'კვი' },
]

export const MONTHS_SHORT = ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ']

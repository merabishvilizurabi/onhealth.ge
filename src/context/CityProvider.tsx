import { useMemo, useState, type ReactNode } from 'react'
import { getDoctorCities } from '../services/directoryService'
import { readJSON, writeJSON } from '../services/storage'
import { CityContext, type CityContextValue } from './cityContext'

const CITY_KEY = 'onhealth.city'

// The city chosen in the header, remembered in this browser.
// Only cities that have doctors can be chosen; a remembered city without doctors is ignored.
export function CityProvider({ children }: { children: ReactNode }) {
  const [cities] = useState(getDoctorCities)
  const [city, setCityState] = useState(() => {
    const saved = readJSON<string>(CITY_KEY, '')
    return cities.includes(saved) ? saved : ''
  })

  const value = useMemo<CityContextValue>(
    () => ({
      cities,
      city,
      setCity: (next) => {
        writeJSON(CITY_KEY, next)
        setCityState(next)
      },
    }),
    [cities, city],
  )

  return <CityContext value={value}>{children}</CityContext>
}

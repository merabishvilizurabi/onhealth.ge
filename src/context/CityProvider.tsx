import { useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getDoctorCities } from '../services/directoryService'
import { readJSON, writeJSON } from '../services/storage'
import { CityContext, type CityContextValue } from './cityContext'

const CITY_KEY = 'onhealth.city'

export function CityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const usesCity = !user || user.role === 'patient'
  const [cities] = useState(getDoctorCities)
  const [city, setCityState] = useState(() => {
    const saved = readJSON<string>(CITY_KEY, '')
    return cities.includes(saved) ? saved : ''
  })

  const value = useMemo<CityContextValue>(
    () => ({
      cities,
      city: usesCity ? city : '',
      setCity: (next) => {
        writeJSON(CITY_KEY, next)
        setCityState(next)
      },
    }),
    [cities, city, usesCity],
  )

  return <CityContext value={value}>{children}</CityContext>
}

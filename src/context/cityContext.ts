import { createContext } from 'react'

export interface CityContextValue {
  cities: string[] // cities that have doctors
  city: string // '' = all cities
  setCity: (city: string) => void
}

export const CityContext = createContext<CityContextValue | null>(null)

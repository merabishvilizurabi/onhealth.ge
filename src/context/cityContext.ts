import { createContext } from 'react'

export interface CityContextValue {
  cities: string[]
  city: string
  setCity: (city: string) => void
}

export const CityContext = createContext<CityContextValue | null>(null)

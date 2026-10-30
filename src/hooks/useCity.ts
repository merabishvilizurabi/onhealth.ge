import { useContext } from 'react'
import { CityContext } from '../context/cityContext'

export function useCity() {
  const context = useContext(CityContext)
  if (!context) throw new Error('useCity must be used inside <CityProvider>')
  return context
}

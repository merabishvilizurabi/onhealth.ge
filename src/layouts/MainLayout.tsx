import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { Footer } from '../components/layout/Footer'
import { Header } from '../components/layout/Header'
import { CityProvider } from '../context/CityProvider'

export function MainLayout() {
  return (
    <CityProvider>
      <div className="flex min-h-dvh flex-col bg-white">
        <Header />
        <main className="flex-1">
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
      </div>
    </CityProvider>
  )
}

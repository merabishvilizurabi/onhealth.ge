import { Outlet } from 'react-router'
import { Footer } from '../components/layout/Footer'
import { Header } from '../components/layout/Header'
import { CityProvider } from '../context/CityProvider'

// Frame for the public pages: header, page, footer. The chosen city is shared by all of them.
export function MainLayout() {
  return (
    <CityProvider>
      <div className="flex min-h-dvh flex-col bg-gray-50">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </CityProvider>
  )
}

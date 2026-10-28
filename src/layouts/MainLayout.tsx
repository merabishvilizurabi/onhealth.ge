import { Outlet } from 'react-router'
import { Footer } from '../components/layout/Footer'
import { Header } from '../components/layout/Header'

// Frame for the public pages: header, page, footer
export function MainLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

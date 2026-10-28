import { BrowserRouter } from 'react-router'
import { AuthProvider } from './context/AuthProvider'
import { AppRouter } from './router/AppRouter'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

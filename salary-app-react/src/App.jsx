import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { useAppData } from './hooks/useAppData'
import LP from './pages/LP'
import Today from './pages/Today'
import Settings from './pages/Settings'
import Dashboard from './pages/Dashboard'
import Theme from './pages/Theme'

function AuthGuard({ children }) {
  const user = useAuth()
  if (user === undefined) return null
  if (user === null) return <Navigate to="/lp" replace />
  return children
}

function LPGuard({ children }) {
  const user = useAuth()
  if (user === undefined) return null
  if (user !== null) return <Navigate to="/" replace />
  return children
}

function ThemeApplier() {
  const user = useAuth()
  const { data } = useAppData(user)
  useEffect(() => {
    const theme = data?.settings?.theme
    if (theme && theme !== 'default') {
      document.documentElement.setAttribute('data-theme', theme)
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [data?.settings?.theme])
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ThemeApplier />
        <Routes>
          <Route path="/lp" element={<LPGuard><LP /></LPGuard>} />
          <Route path="/" element={<AuthGuard><Today /></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/theme" element={<AuthGuard><Theme /></AuthGuard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

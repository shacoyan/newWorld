import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { useAppData } from './hooks/useAppData'
import { calcMonthlyTotal, getTodayKey, formatMoney } from './lib/calc'
import LP from './pages/LP'
import Today from './pages/Today'
import Settings from './pages/Settings'
import Dashboard from './pages/Dashboard'
import Theme from './pages/Theme'
import Report from './pages/Report'

// テーマをReactレンダリング前に同期設定（ロゴ初期表示バグ対策）
;(function initThemeEarly() {
  try {
    const raw = localStorage.getItem('salary-app-v3')
    if (raw) {
      const theme = JSON.parse(raw)?.settings?.theme
      if (theme && theme !== 'default') {
        document.documentElement.setAttribute('data-theme', theme)
      }
    }
  } catch (e) {}
})()

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

function PremiumGuard({ children }) {
  const user = useAuth()
  const { data } = useAppData(user)
  if (user === undefined || data === null) return null
  if (user === null) return <Navigate to="/lp" replace />
  if (!data.settings?.isPremium) return <Navigate to="/settings" replace />
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

function GoalModal({ data, onClose }) {
  const todayKey = getTodayKey()
  const [year, month] = todayKey.split('-').map(Number)
  const monthly = calcMonthlyTotal(year, month, data)
  const goal = data.settings?.monthlyGoal || 0
  const achieved = monthly.total >= goal
  const remaining = goal - monthly.total
  return (
    <div className='goal-modal-overlay' onClick={onClose}>
      <div className='goal-modal' onClick={e => e.stopPropagation()}>
        <button className='goal-modal-close' onClick={onClose}>×</button>
        {achieved ? (
          <div className='goal-modal-celebrate'>
            <div className='goal-modal-emoji'>🎉</div>
            <div className='goal-modal-title'>今月の目標達成！</div>
            <div className='goal-modal-amount'>{formatMoney(monthly.total)}</div>
            <div className='goal-modal-message'>今月もよく頑張りました！<br/>お疲れ様でした✨</div>
          </div>
        ) : (
          <div className='goal-modal-progress'>
            <div className='goal-modal-title'>今月の進捗</div>
            <div className='goal-modal-amount'>{formatMoney(monthly.total)}</div>
            <div className='goal-modal-bar-wrap'>
              <div className='goal-modal-bar' style={{ width: Math.min(100, (monthly.total / goal) * 100) + '%' }} />
            </div>
            <div className='goal-modal-remaining'>あと <strong>{formatMoney(remaining)}</strong> で目標達成！</div>
            <div className='goal-modal-sub'>目標: {formatMoney(goal)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

function GoalModalWrapper() {
  const user = useAuth()
  const { data } = useAppData(user)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!data) return
    if (!data.settings?.isPremium) return
    if (!(data.settings?.monthlyGoal > 0)) return
    if (sessionStorage.getItem('goal-modal-shown')) return
    sessionStorage.setItem('goal-modal-shown', '1')
    setVisible(true)
  }, [data])
  if (!visible) return null
  return <GoalModal data={data} onClose={() => setVisible(false)} />
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ThemeApplier />
        <GoalModalWrapper />
        <Routes>
          <Route path="/lp" element={<LPGuard><LP /></LPGuard>} />
          <Route path="/" element={<AuthGuard><Today /></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/theme" element={<AuthGuard><Theme /></AuthGuard>} />
          <Route path="/report" element={<PremiumGuard><Report /></PremiumGuard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function Header({ type, title, onBack }) {
  const user = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    setMenuOpen(false)
    await signOut(auth)
    navigate('/lp')
  }

  const closeMenu = () => setMenuOpen(false)

  if (type === 'sub') {
    return (
      <header className="header">
        <button className="back-btn" onClick={() => (onBack ? onBack() : navigate(-1))}>
          ←
        </button>
        <h1 className="header-title">{title}</h1>
        <div style={{ width: 32 }}></div>
      </header>
    )
  }

  return (
    <>
      <header className="header">
        <div style={{ width: 32 }}></div>
        <Link to="/" className="header-logo">こんまに</Link>
        <button className="hamburger-btn" onClick={() => setMenuOpen(prev => !prev)}>
          ☰
        </button>
      </header>

      {menuOpen && (
        <>
          <div className="hamburger-overlay" onClick={closeMenu}></div>
          <div className="hamburger-menu">
            {user && (
              <div className="menu-user">
                {user.displayName || user.email}
              </div>
            )}
            <button onClick={() => { navigate('/dashboard'); closeMenu(); }}>統計</button>
            <button onClick={() => { navigate('/settings'); closeMenu(); }}>設定</button>
            <button className="btn-logout" onClick={handleLogout}>ログアウト</button>
          </div>
        </>
      )}
    </>
  )
}

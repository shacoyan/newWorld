import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function Header() {
  const user = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    setMenuOpen(false)
    await signOut(auth)
    navigate('/lp')
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header className="header">
        <div style={{ width: 44 }}></div>
        <Link to="/" className="header-logo"><img src="./logo.png" alt="こんまに" className="header-logo-img" /></Link>
        <button
        className={`hamburger-btn${menuOpen ? ' is-open' : ''}`}
        onClick={() => setMenuOpen(prev => !prev)}
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>

    <div className={`hamburger-overlay${menuOpen ? ' is-open' : ''}`} onClick={closeMenu}></div>
    <div className={`hamburger-menu${menuOpen ? ' is-open' : ''}`}>
      <div className="menu-header">
        <div className="menu-avatar">
          {user?.displayName ? user.displayName[0].toUpperCase() : '?'}
        </div>
        <div className="menu-username">
          {user?.displayName || 'ゲスト'}
        </div>
      </div>

      <nav className="menu-nav">
        <button className="menu-nav-item" onClick={() => { navigate('/'); closeMenu(); }}>
          <span className="menu-nav-icon">🏠</span>
          <span className="menu-nav-label">ホーム</span>
        </button>
        <button className="menu-nav-item" onClick={() => { navigate('/dashboard'); closeMenu(); }}>
          <span className="menu-nav-icon">📊</span>
          <span className="menu-nav-label">統計</span>
        </button>
        <button className="menu-nav-item" onClick={() => { navigate('/settings'); closeMenu(); }}>
          <span className="menu-nav-icon">⚙️</span>
          <span className="menu-nav-label">設定</span>
        </button>
      </nav>

      <div className="menu-separator"></div>

      <button className="menu-nav-item menu-logout" onClick={handleLogout}>
        <span className="menu-nav-icon">🚪</span>
        <span className="menu-nav-label">ログアウト</span>
      </button>
    </div>
  </>
  )
}

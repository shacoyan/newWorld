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
            <button onClick={() => { navigate('/'); closeMenu(); }}>ホーム</button>
            <button onClick={() => { navigate('/dashboard'); closeMenu(); }}>統計</button>
            <button onClick={() => { navigate('/settings'); closeMenu(); }}>設定</button>
            <button className="btn-logout" onClick={handleLogout}>ログアウト</button>
          </div>
        </>
      )}
    </>
  )
}

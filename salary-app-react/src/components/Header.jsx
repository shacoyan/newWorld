import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../hooks/useAppData'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function Header() {
  const user = useAuth()
  const { data } = useAppData(user)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const isPremium = data?.settings?.isPremium ?? false
  const [logoTheme, setLogoTheme] = useState(() => {
    const attrTheme = document.documentElement.getAttribute('data-theme')
    if (attrTheme) return attrTheme
    try {
      const raw = localStorage.getItem('salary-app-v3')
      if (raw) {
        const theme = JSON.parse(raw)?.settings?.theme
        if (theme && theme !== 'default') return theme
      }
    } catch (e) {}
    return 'default'
  })
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setLogoTheme(document.documentElement.getAttribute('data-theme') || 'default')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  const logoSrc = logoTheme === 'gothic'
    ? './logo-gothic.png'
    : logoTheme === 'magical'
      ? './logo-magical.png'
      : logoTheme === 'graffiti'
        ? './logo-graffiti.png'
        : './logo.png'

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
        <Link to="/" className="header-logo"><img src={logoSrc} alt="こんまに" className="header-logo-img" /></Link>
        <button
        className={`hamburger-btn${menuOpen ? ' is-open' : ''}`}
        onClick={() => setMenuOpen(prev => !prev)}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
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
          <span className="menu-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
                <path d="M9 21V12h6v9"/>
              </svg>
            </span>
          <span className="menu-nav-label">ホーム</span>
        </button>
        <button className="menu-nav-item" onClick={() => { navigate('/dashboard'); closeMenu(); }}>
          <span className="menu-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="12" width="4" height="9" rx="1"/>
                <rect x="10" y="7" width="4" height="14" rx="1"/>
                <rect x="17" y="3" width="4" height="18" rx="1"/>
              </svg>
            </span>
          <span className="menu-nav-label">統計</span>
        </button>
        <button className="menu-nav-item" onClick={() => { navigate(isPremium ? '/theme' : '/settings'); closeMenu(); }}>
          <span className="menu-nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a10 10 0 0 1 0 20"/>
              <path d="M2 12h20"/>
              <path d="M12 2c2.76 4.44 2.76 15.56 0 20"/>
            </svg>
          </span>
          <span className="menu-nav-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            着せ替え
            {!isPremium && <span className="premium-nav-badge">PREMIUM</span>}
          </span>
        </button>
        <button className="menu-nav-item" onClick={() => { navigate('/report'); closeMenu(); }}>
          <span className="menu-nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </span>
          <span className="menu-nav-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            レポート
            {!isPremium && <span className="premium-nav-badge">PREMIUM</span>}
          </span>
        </button>
        <button className="menu-nav-item" onClick={() => { navigate('/settings'); closeMenu(); }}>
          <span className="menu-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0-4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </span>
          <span className="menu-nav-label">設定</span>
        </button>
      </nav>

      <div className="menu-separator"></div>

      <button className="menu-nav-item menu-logout" onClick={handleLogout}>
        <span className="menu-nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
        <span className="menu-nav-label">ログアウト</span>
      </button>
    </div>
  </>
  )
}

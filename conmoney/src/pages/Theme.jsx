import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../hooks/useAppData'
import Header from '../components/Header'

const THEMES = [
  {
    id: 'default',
    name: 'ノーマル',
    desc: 'ピンク×パープルのキュートなデザイン',
    logo: './logo.png',
    colors: ['#e879a0', '#a78bfa', '#67e8f9', '#fdf2f8'],
    bg: 'linear-gradient(135deg, #fdf2f8 0%, #faf5ff 50%, #ecfeff 100%)',
    textColor: '#3b0764',
  },
  {
    id: 'gothic',
    name: 'ゴシック',
    desc: '深紅×漆黒のダークゴシックデザイン',
    logo: './logo-gothic.png',
    colors: ['#c0392b', '#d4a017', '#f5f0eb', '#1a1a1a'],
    bg: 'linear-gradient(135deg, #0d0d0d 0%, #120808 50%, #0d0a05 100%)',
    textColor: '#f5f0eb',
  },
  {
    id: 'magical',
    name: 'マジカル',
    desc: '魔法少女カラーのレインボーポップデザイン',
    logo: './logo-magical.png',
    colors: ['#ff4da6', '#b088f5', '#00d4e8', '#ffd700'],
    bg: 'linear-gradient(135deg, #fff0f7 0%, #f5f0ff 40%, #e0faff 70%, #fffde7 100%)',
    textColor: '#4a0072',
  },
  {
    id: 'graffiti',
    name: 'グラフィティ',
    desc: 'ストリートアート×ネオンのアーバンデザイン',
    logo: './logo-graffiti.png',
    colors: ['#ff0080', '#aaff00', '#ffee00', '#0a0a0a'],
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #120010 50%, #0a0a0a 100%)',
    textColor: '#f0f0f0',
  },
]

export default function Theme() {
  const user = useAuth()
  const { data, persistData } = useAppData(user)
  const navigate = useNavigate()

  if (!data) return null
  const s = data.settings

  if (!s.isPremium) {
    return (
      <div>
        <Header />
        <main className="main-content">
          <div className="premium-wall">
            <div className="premium-wall-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 className="premium-wall-title">プレミアム限定機能</h1>
            <p className="premium-wall-desc">着せ替えはプレミアムモードでのみ利用できます</p>
            <button className="btn-premium" onClick={() => navigate('/settings')}>
              プレミアムを有効にする
            </button>
          </div>
        </main>
      </div>
    )
  }

  const currentTheme = s.theme || 'default'

  const handleSelect = (themeId) => {
    const newSettings = { ...s, theme: themeId, usePremiumLogo: themeId !== 'default' }
    persistData({ ...data, settings: newSettings })
    if (themeId === 'default') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', themeId)
    }
  }

  return (
    <div>
      <Header />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">着せ替え</h1>
        </div>

        <div className="theme-grid">
          {THEMES.map(theme => {
            const isActive = currentTheme === theme.id
            return (
              <div
                key={theme.id}
                className="theme-card"
                style={{
                  background: theme.bg,
                  border: isActive ? `2px solid ${theme.colors[0]}` : '2px solid transparent',
                  boxShadow: isActive ? `0 4px 20px ${theme.colors[0]}40` : '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {isActive && (
                  <div className="theme-card-badge" style={{ background: theme.colors[0] }}>
                    使用中
                  </div>
                )}

                <div className="theme-card-logo">
                  <img src={theme.logo} alt={theme.name} />
                </div>

                <div className="theme-card-info">
                  <div className="theme-card-name" style={{ color: theme.textColor }}>{theme.name}</div>
                  <div className="theme-card-desc" style={{ color: theme.textColor }}>{theme.desc}</div>
                </div>

                <div className="theme-card-colors">
                  {theme.colors.map((color, i) => (
                    <div key={i} className="theme-color-dot" style={{ background: color }} />
                  ))}
                </div>

                <button
                  className="theme-card-btn"
                  onClick={() => handleSelect(theme.id)}
                  disabled={isActive}
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.2)' : theme.colors[0],
                    color: isActive ? theme.textColor : '#fff',
                    border: isActive ? `1px solid ${theme.colors[0]}60` : 'none',
                    cursor: isActive ? 'default' : 'pointer',
                    opacity: isActive ? 0.7 : 1,
                  }}
                >
                  {isActive ? '適用中' : 'このテーマを適用'}
                </button>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

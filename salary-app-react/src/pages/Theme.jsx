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
        <main style={{ paddingTop: '56px' }}>
          <div style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>プレミアム限定機能</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>着せ替えはプレミアムモードでのみ利用できます</p>
            <button
              onClick={() => navigate('/settings')}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
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
      <main style={{ paddingTop: '56px' }}>
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>着せ替え</h1>
        </div>

        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {THEMES.map(theme => {
            const isActive = currentTheme === theme.id
            return (
              <div
                key={theme.id}
                style={{
                  background: theme.bg,
                  borderRadius: '20px',
                  padding: '16px',
                  border: isActive ? `2px solid ${theme.colors[0]}` : '2px solid transparent',
                  boxShadow: isActive ? `0 4px 20px ${theme.colors[0]}40` : '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: theme.colors[0],
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '20px',
                  }}>
                    使用中
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <img
                    src={theme.logo}
                    alt={theme.name}
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: theme.textColor, marginBottom: '4px' }}>{theme.name}</div>
                  <div style={{ fontSize: '10px', color: theme.textColor, opacity: 0.7, lineHeight: 1.4 }}>{theme.desc}</div>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', justifyContent: 'center' }}>
                  {theme.colors.map((color, i) => (
                    <div key={i} style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: color,
                      border: '2px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }} />
                  ))}
                </div>

                <button
                  onClick={() => handleSelect(theme.id)}
                  disabled={isActive}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: isActive ? 'rgba(255,255,255,0.2)' : theme.colors[0],
                    color: isActive ? theme.textColor : '#fff',
                    border: isActive ? `1px solid ${theme.colors[0]}60` : 'none',
                    borderRadius: '14px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: isActive ? 'default' : 'pointer',
                    transition: 'all 0.2s',
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

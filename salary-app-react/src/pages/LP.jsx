import { useState } from 'react'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function LP() {
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') alert('ログインに失敗しました: ' + e.message)
      setLoading(false)
    }
  }

  return (
    <div className="lp-body">
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <h1 className="lp-logo-heading"><img src="/logo.png" alt="こんまに" className="lp-logo" /></h1>
          <p className="lp-subtitle">バック・時給・出勤を記録して<br />今月いくら稼いだか一目でわかる</p>
          <button className="lp-login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? 'ログイン中…' : 'Googleでログイン'}
          </button>
          <p className="lp-note">無料・登録不要・Googleアカウントだけ</p>
        </div>
      </section>
      <section className="lp-features">
        <div className="lp-feature-card">
          <div className="lp-feature-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs><linearGradient id="lp-cal-grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#f472b6"/><stop offset="100%" stopColor="#a78bfa"/></linearGradient></defs>
              <rect x="4" y="10" width="40" height="34" rx="6" fill="white" stroke="#f4a8d4" strokeWidth="1.5"/>
              <rect x="4" y="10" width="40" height="12" rx="6" fill="url(#lp-cal-grad)"/>
              <rect x="4" y="16" width="40" height="6" fill="url(#lp-cal-grad)"/>
              <rect x="14" y="6" width="4" height="8" rx="2" fill="#a78bfa"/>
              <rect x="30" y="6" width="4" height="8" rx="2" fill="#f472b6"/>
              <rect x="9" y="28" width="6" height="5" rx="1.5" fill="#fce7f3"/>
              <rect x="21" y="28" width="6" height="5" rx="1.5" fill="#fce7f3"/>
              <rect x="33" y="28" width="6" height="5" rx="1.5" fill="#fce7f3"/>
              <rect x="9" y="36" width="6" height="5" rx="1.5" fill="#f5f3ff"/>
              <rect x="21" y="36" width="6" height="5" rx="1.5" fill="#f5f3ff"/>
              <rect x="33" y="36" width="6" height="5" rx="1.5" fill="#f5f3ff"/>
            </svg>
          </div>
          <div className="lp-feature-title">カレンダーで管理</div>
          <div className="lp-feature-desc">出勤日・時刻・バック数をカレンダーに記録。月をまたいだ集計も自動。</div>
        </div>
        <div className="lp-feature-card">
          <div className="lp-feature-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs><linearGradient id="lp-coin-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#f472b6"/></linearGradient></defs>
              <circle cx="24" cy="24" r="20" fill="url(#lp-coin-grad)"/>
              <circle cx="24" cy="24" r="16" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
              <text x="24" y="31" textAnchor="middle" fontSize="20" fontWeight="800" fill="white" fontFamily="sans-serif">¥</text>
            </svg>
          </div>
          <div className="lp-feature-title">給料を自動計算</div>
          <div className="lp-feature-desc">固定給＋バック、時給＋バック、どちらのタイプも対応。</div>
        </div>
        <div className="lp-feature-card">
          <div className="lp-feature-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="lp-bar1-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f472b6"/><stop offset="100%" stopColor="#e879a0"/></linearGradient>
                <linearGradient id="lp-bar2-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#818cf8"/></linearGradient>
                <linearGradient id="lp-bar3-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#bae6fd"/><stop offset="100%" stopColor="#67e8f9"/></linearGradient>
              </defs>
              <line x1="6" y1="40" x2="42" y2="40" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
              <rect x="9" y="20" width="8" height="20" rx="3" fill="url(#lp-bar1-grad)"/>
              <rect x="20" y="12" width="8" height="28" rx="3" fill="url(#lp-bar2-grad)"/>
              <rect x="31" y="26" width="8" height="14" rx="3" fill="url(#lp-bar3-grad)"/>
            </svg>
          </div>
          <div className="lp-feature-title">統計ダッシュボード</div>
          <div className="lp-feature-desc">バック比率・平均日給・最高収入日など月の成績を振り返れる。</div>
        </div>
        <div className="lp-feature-card">
          <div className="lp-feature-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="lp-cloud-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#e0f2fe"/><stop offset="100%" stopColor="#bae6fd"/></linearGradient>
                <linearGradient id="lp-cloud-stroke-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7dd3fc"/><stop offset="100%" stopColor="#38bdf8"/></linearGradient>
              </defs>
              <ellipse cx="24" cy="30" rx="16" ry="9" fill="url(#lp-cloud-grad)"/>
              <ellipse cx="18" cy="27" rx="9" ry="8" fill="url(#lp-cloud-grad)"/>
              <ellipse cx="30" cy="26" rx="10" ry="9" fill="url(#lp-cloud-grad)"/>
              <ellipse cx="22" cy="21" rx="9" ry="8" fill="url(#lp-cloud-grad)"/>
              <ellipse cx="24" cy="30" rx="16" ry="9" fill="none" stroke="url(#lp-cloud-stroke-grad)" strokeWidth="1.2"/>
              <ellipse cx="22" cy="21" rx="9" ry="8" fill="none" stroke="url(#lp-cloud-stroke-grad)" strokeWidth="1.2"/>
              <ellipse cx="30" cy="26" rx="10" ry="9" fill="none" stroke="url(#lp-cloud-stroke-grad)" strokeWidth="1.2"/>
            </svg>
          </div>
          <div className="lp-feature-title">どこからでもアクセス</div>
          <div className="lp-feature-desc">Googleログインでデータをクラウド保存。スマホ・PCどちらでも。</div>
        </div>
      </section>
    </div>
  )
}

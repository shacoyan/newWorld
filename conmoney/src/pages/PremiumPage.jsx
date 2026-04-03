import { useNavigate } from 'react-router-dom'
import { useAppDataContext } from '../hooks/useAppData'
import { Navigate } from 'react-router-dom'
import Header from '../components/Header'

const FREE_FEATURES = [
  { label: '出退勤記録（1店舗）', available: true },
  { label: 'バック・品目カウント', available: true },
  { label: '月次統計', available: true },
  { label: '深夜割増計算', available: true },
  { label: '締め日設定', available: true },
  { label: '複数店舗管理', available: false },
  { label: '着せ替えテーマ', available: false },
  { label: '年間統計・月別推移', available: false },
  { label: '月収目標達成モーダル', available: false },
  { label: '詳細レポート', available: false },
]

const PREMIUM_FEATURES = [
  { label: '出退勤記録（1店舗）', available: true },
  { label: 'バック・品目カウント', available: true },
  { label: '月次統計', available: true },
  { label: '深夜割増計算', available: true },
  { label: '締め日設定', available: true },
  { label: '複数店舗管理', available: true },
  { label: '着せ替えテーマ', available: true },
  { label: '年間統計・月別推移', available: true },
  { label: '月収目標達成モーダル', available: true },
  { label: '詳細レポート', available: true },
]

export default function PremiumPage() {
  const { data } = useAppDataContext()
  const navigate = useNavigate()
  if (!data) return null
  if (data.settings?.isPremium) return <Navigate to="/" replace />

  return (
    <div>
      <Header />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">プレミアム</h1>
        </div>

        <div className="section">
          <div className="premium-upsell-hero">
            <div className="premium-upsell-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 20h20M4 20l2-8 6 4 6-4 2 8" />
              </svg>
            </div>
            <h2 className="premium-upsell-title">
              プレミアムプランで<br />もっと便利に
            </h2>
            <p className="premium-upsell-desc">
              複数店舗の管理・着せ替えテーマ・年間統計など、<br />上位機能を全て解放できます
            </p>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">プランの違い</h2>
          <div className="plan-compare">
            <div className="plan-col">
              <div className="plan-col-title">無料プラン</div>
              <ul className="plan-feature-list">
                {FREE_FEATURES.map((f, i) => (
                  <li key={i} className="plan-feature-item">
                    <span className={f.available ? 'plan-feature-check' : 'plan-feature-cross'}>
                      {f.available ? '✓' : '✗'}
                    </span>
                    {f.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="plan-col plan-col-premium">
              <div className="plan-col-title">プレミアム</div>
              <ul className="plan-feature-list">
                {PREMIUM_FEATURES.map((f, i) => (
                  <li key={i} className="plan-feature-item">
                    <span className="plan-feature-check">✓</span>
                    {f.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="section">
          <button className="btn-premium-cta" onClick={() => navigate('/settings')}>
            プレミアムを有効にする
          </button>
          <p className="premium-code-hint">設定画面でプレミアムコードを入力してください</p>
        </div>
      </main>
    </div>
  )
}

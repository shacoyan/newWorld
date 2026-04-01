# 設計書: プレミアムUX改善 4件

## 概要

1. 店舗設定済み時にデフォルト出勤系UIを隠す（Today.jsx）
2. JobSelectorをテーマカラーに対応（JobSelector.jsx + style.css）
3. プレミアム限定・年単位統計ビュー（Dashboard.jsx）

## 変更ファイル一覧

| ファイル | 種別 | 内容 |
|---|---|---|
| `src/pages/Today.jsx` | 変更 | isPremium && jobs.length > 0 のとき警告バナー・デフォルト出勤ボタン・時給input を非表示 |
| `src/components/JobSelector.jsx` | 変更 | ハードコードカラーをCSS変数に置換、hover管理をclassNameベースに変更 |
| `src/style.css` | 変更 | .job-selector-card 系クラス追加 |
| `src/pages/Dashboard.jsx` | 変更 | プレミアム限定の月/年ビュー切り替え + 年間統計表示 |

## 実装方針

### 1. Today.jsx

`isPremium && jobs.length > 0` を `hasJobs` 変数として定義し、以下を条件分岐:

```jsx
const hasJobs = isPremium && jobs.length > 0

// 隠す対象:
// - デフォルト出勤時刻未設定の警告バナー（!defaultStartTime && ...のdiv）
// - btn-checkin-today ボタン
// - 時給inputラベル（salaryType === 'hourly' のときのみ表示していた箇所）
```

JobSelector の onChange prop も `handleJobSelect` → `handleJobSelect`（そのまま）だが、
Today.jsx内では `onChange={handleJobSelect}` として渡す（既に正しい）。

### 2. JobSelector.jsx + style.css

**style.cssに追加:**
```css
.job-selector-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-xs);
  border: 2px solid var(--border);
  background: var(--card-bg);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  box-shadow: var(--shadow-sm);
  margin-bottom: 8px;
}
.job-selector-card:last-child { margin-bottom: 0; }
.job-selector-card:hover {
  background: var(--item-row-bg);
  border-color: var(--primary);
}
.job-selector-card.is-selected {
  border: 2px solid var(--primary);
  background: var(--primary-bg);
  box-shadow: 0 2px 8px var(--today-glow);
}
.job-selector-name { font-size: 15px; font-weight: 600; color: var(--text); }
.job-selector-rate { font-size: 14px; color: var(--text-muted); }
.job-selector-badge { font-size: 12px; font-weight: 700; color: var(--primary); margin-left: 8px; }
```

**JobSelector.jsx の変更:**
- インラインスタイルのハードコードカラーをすべて削除
- div の style をシンプルな構造のみ残し、色・hover は className で管理
- `onMouseEnter/onMouseLeave` ハンドラ削除

```jsx
<div
  key={job.id ?? 'default'}
  className={`job-selector-card${selectedJobId === job.id ? ' is-selected' : ''}`}
  onClick={() => onChange(job.id)}
>
  <div style={{ width: 24, height: 24, borderRadius: '50%', background: job.color, flexShrink: 0 }} />
  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span className="job-selector-name">
      {job.name}
      {selectedJobId === job.id && <span className="job-selector-badge">選択中</span>}
    </span>
    {job.hourlyRate !== null && (
      <span className="job-selector-rate">¥{job.hourlyRate.toLocaleString()}/h</span>
    )}
  </div>
</div>
```

### 3. Dashboard.jsx: 年単位統計

**状態追加:**
```javascript
const [viewMode, setViewMode] = useState('month') // 'month' | 'year'
```

**月/年切り替えタブ（プレミアム時のみ表示）:**
```jsx
{isPremium && (
  <div style={{ display: 'flex', gap: '8px', padding: '0 16px 8px', justifyContent: 'center' }}>
    <button
      className={viewMode === 'month' ? 'tab-btn tab-btn-active' : 'tab-btn'}
      onClick={() => setViewMode('month')}
    >月</button>
    <button
      className={viewMode === 'year' ? 'tab-btn tab-btn-active' : 'tab-btn'}
      onClick={() => setViewMode('year')}
    >年</button>
  </div>
)}
```

**年間集計ロジック（viewMode === 'year' のとき）:**
```javascript
// 年ナビ用ハンドラ
const prevYear = () => setYear(y => y - 1)
const nextYear = () => setYear(y => y + 1)

// 全12ヶ月を集計
const yearBreakdown = Array.from({ length: 12 }, (_, i) => {
  const m = i + 1
  const mo = calcMonthlyTotal(year, m, data)
  return { month: m, ...mo }
})
const yearTotal = yearBreakdown.reduce((s, m) => s + m.total, 0)
const yearWageTotal = yearBreakdown.reduce((s, m) => s + m.wageTotal, 0)
const yearBackTotal = yearBreakdown.reduce((s, m) => s + m.backTotal, 0)
const bestMonth = yearBreakdown.reduce((best, m) => m.total > best.total ? m : best, { month: 0, total: 0 })
const workMonths = yearBreakdown.filter(m => m.total > 0).length
const avgMonthly = workMonths > 0 ? Math.round(yearTotal / workMonths) : 0
const maxMonthTotal = Math.max(...yearBreakdown.map(m => m.total), 1)
```

**年ビューのUI:**
```
[← ][2026年][→]
[年間合計: ¥XXX,XXX]
[時給計 / バック計]
[月別収入バーグラフ（1月〜12月）]
[稼働月数 / 平均月収 / 最高収入月]
```

月別バーグラフ:
```jsx
{yearBreakdown.map(({ month, total }) => (
  <div className="dash-item-row" key={month}>
    <div className="dash-item-header">
      <span className="dash-item-name">{month}月</span>
      <span className="dash-item-stats">{formatMoney(total)}</span>
    </div>
    <div className="dash-bar-bg">
      <div className="dash-bar-fill" style={{ width: (total / maxMonthTotal * 100) + '%' }} />
    </div>
  </div>
))}
```

**style.cssに追加するタブCSS:**
```css
.tab-btn { padding: 6px 20px; border-radius: var(--radius-xs); border: 1.5px solid var(--border); background: var(--card-bg); color: var(--text-muted); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.tab-btn-active { border-color: var(--primary); background: var(--primary-bg); color: var(--primary); }
```

## 分担

| エンジニア | 担当 |
|---|---|
| Engineer 1 | Today.jsx 変更（hasJobs 条件で隠す） |
| Engineer 2 | JobSelector.jsx CSS変数化 |
| Engineer 3 | Dashboard.jsx 年ビュー追加 + style.css CSS追加 |
| Reviewer 1 | 全ファイルレビュー |
| Engineer 10 | ビルド確認 |

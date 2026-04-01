# 設計書: 機能D — 月次レポート & CSV エクスポート

## 概要

`/report` ルートに新ページを追加。月別サマリー（勤務日数・総時間・総収入・平均時給）と日別テーブルを表示し、CSV ダウンロードも提供。プレミアム限定。

## データ構造の変更

**変更なし。** 既存 records / settings を読み取るのみ。

## 変更ファイル一覧

| ファイル | 種別 | 内容 |
|---|---|---|
| `src/pages/Report.jsx` | 新規 | レポートページ本体 |
| `src/lib/calc.js` | 変更 | `buildMonthlyReport(year, month, data)` 関数追加 |
| `src/App.jsx` | 変更 | PremiumGuard 追加 + `/report` ルート登録 |
| `src/components/Header.jsx` | 変更 | ハンバーガーメニューに「レポート」追加 |
| `src/style.css` | 変更 | テーブル用 CSS 追加 |

## 実装方針

### calc.js への追加

`buildMonthlyReport(year, month, data)` を新規追加:

```javascript
// 返却値
{
  summary: {
    workDays: number,      // 記録のある日数
    totalHours: number,    // 総稼働時間
    totalWage: number,     // 総給与
    totalBack: number,     // 総バック
    totalIncome: number,   // 合計
    avgHourlyRate: number  // 平均時給
  },
  rows: [
    {
      dateKey: "2026-04-01",
      label: "4/1(水)",
      startTime: "18:00",
      endTime: "23:00",
      hours: 5.0,
      wage: 7500,
      back: 2000,
      total: 9500
    }
  ]
}
```

内部では `calcPeriodRange` と `calcDailyWage` を再利用する。rows は記録がある日付のみ含める。

### App.jsx の変更

`PremiumGuard` を追加:

```jsx
function PremiumGuard({ children }) {
  const user = useAuth()
  const { data } = useAppData(user)
  if (user === undefined || data === null) return null
  if (user === null) return <Navigate to="/lp" replace />
  if (!data.settings?.isPremium) return <Navigate to="/settings" replace />
  return children
}
```

ルート追加:
```jsx
<Route path="/report" element={<PremiumGuard><Report /></PremiumGuard>} />
```

### Report.jsx 構造

```
<Header />
<main paddingTop: 56px>
  <h1>レポート</h1>

  <!-- 月ナビ（Dashboard.jsx と同パターン） -->
  <div className="dash-month-nav">
    <button> ← </button>
    <div>2026年4月</div>
    <button> → </button>
  </div>

  <!-- サマリーカード -->
  <section className="section">
    稼働日数 / 総稼働時間 / 総収入 / 平均時給
  </section>

  <!-- 日別テーブル -->
  <section className="section">
    <table className="report-table">
      <thead>日付 / 出勤 / 退勤 / 時間 / 給与 / バック / 合計</thead>
      <tbody> rows.map(...) </tbody>
    </table>
  </section>

  <!-- CSVダウンロード -->
  <button className="btn-csv-download" onClick={handleCsvDownload}>
    CSVダウンロード
  </button>
</main>
```

### CSV ダウンロードのロジック

外部ライブラリ不要。BOM 付き UTF-8 で Excel 文字化け防止:

```javascript
function handleCsvDownload() {
  const { rows } = buildMonthlyReport(year, month, data)
  const header = '日付,出勤,退勤,稼働時間,給与,バック,合計\n'
  const body = rows.map(r =>
    `${r.dateKey},${r.startTime},${r.endTime},${r.hours.toFixed(1)},${r.wage},${r.back},${r.total}`
  ).join('\n')
  const blob = new Blob(['\uFEFF' + header + body], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `konmani-${year}-${String(month).padStart(2,'0')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
```

### Header.jsx の変更

既存の「着せ替え」メニュー項目と同パターンで「レポート」を追加:
- 非プレミアムでも表示（PREMIUM バッジ付き）
- クリック → navigate('/report') → PremiumGuard が /settings にリダイレクト

### style.css に追加するクラス

```css
.report-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.report-table th { color: var(--text-muted); font-size: 11px; padding: 6px 4px; border-bottom: 1px solid var(--border); text-align: left; }
.report-table td { padding: 8px 4px; border-bottom: 1px solid var(--border); color: var(--text); }
.report-table tr:last-child td { border-bottom: none; }
.btn-csv-download { width: calc(100% - 32px); margin: 0 16px 24px; padding: 14px; background: var(--gradient-primary); color: #fff; border: none; border-radius: var(--radius); font-size: 14px; font-weight: 700; cursor: pointer; }
```

## 分担

| エンジニア | 担当 |
|---|---|
| Engineer 1 | calc.js buildMonthlyReport 追加 + App.jsx PremiumGuard + ルート追加 |
| Engineer 2 | Report.jsx 新規作成 + Header.jsx レポートメニュー追加 + style.css CSS追加 |
| Reviewer 1 | 全ファイルレビュー |
| Engineer 10 | ビルド確認 |

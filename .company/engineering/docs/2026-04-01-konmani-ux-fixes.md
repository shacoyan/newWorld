# 設計書: こんまに UX修正・機能追加

作成: 2026-04-01

---

## 概要

8件の修正・機能追加を実施する。バグ修正2件、UI改善5件、機能追加1件。

対象ディレクトリ: `salary-app-react/src/`

---

## 修正一覧

| # | 種別 | 対象ファイル | 内容 |
|---|------|------------|------|
| 1 | バグ | ItemRows.jsx | item.price → item.back * count |
| 2 | バグ | calc.js | ensureRecord items を deep copy |
| 3 | 機能 | calc.js / Settings.jsx / Today.jsx | カレンダー週始まり設定 |
| 4 | UI | style.css | 出勤登録セクション余白 |
| 5 | UI | style.css / Today.jsx | 選択日付・月表示を中央揃え |
| 6 | UI | style.css | ヘッダーロゴを大きく |
| 7 | UI | Header.jsx | 常時ロゴ中央＋ハンバーガー |
| 8 | UI | Dashboard.jsx / Settings.jsx | mainヘッダーに統一 |

---

## Aチーム担当

### A1: Engineer 1 — style.css

ファイル: `salary-app-react/src/style.css`

**① ヘッダーロゴを大きく**
`.header-logo-img` の height を 36px → 48px に変更:
```css
.header-logo-img {
  height: 48px;
  width: auto;
  object-fit: contain;
}
```

**② 出勤登録セクションの余白**
`.work-section` クラスを新規追加（ファイル末尾に追加）:
```css
.work-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.work-section label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.time-input-group {
  display: flex;
  gap: 12px;
}

.time-input-group label {
  flex: 1;
}
```

また、既存の `.btn-checkin-today` の `margin-top: 8px` を削除する（gapで管理するため）:
```css
.btn-checkin-today {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #f472b6, #a78bfa);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
```
（margin-top を除いて上書き）

**③ 選択日付の中央揃え**
`.date-display-section` を新規追加:
```css
.date-display-section {
  text-align: center;
}

.date-display-section h2 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}
```

**④ カレンダー月表示を中央揃え**
`.calendar-nav` を以下に変更:
```css
.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.calendar-nav span {
  flex: 1;
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}
```

---

### A2: Engineer 2 — calc.js

ファイル: `salary-app-react/src/lib/calc.js`

**① ensureRecord の items を deep copy**

`ensureRecord` 関数の else ブランチを修正:
```js
export function ensureRecord(data, dateKey) {
  const records = { ...data.records };
  if (!records[dateKey]) {
    records[dateKey] = {
      startTime: '',
      endTime: '',
      hourlyRate: (data.settings && data.settings.defaultHourlyRate) || 0,
      items: {}
    };
  } else {
    records[dateKey] = {
      ...records[dateKey],
      items: { ...(records[dateKey].items || {}) }
    };
  }
  return { ...data, records };
}
```

**② getDefaultSettings に weekStartDay を追加**

`getDefaultSettings` 関数に `weekStartDay: 0` を追加:
```js
export function getDefaultSettings() {
  return {
    salaryType: 'hourly',
    baseSalary: 200000,
    defaultHourlyRate: 1500,
    defaultStartTime: '',
    defaultEndTime: '',
    timeStep: 1,
    payPeriodStart: 1,
    weekStartDay: 0,   // 0 = 日曜始まり, 1 = 月曜始まり
    items: [
      { id: 'default-drink', name: 'ドリンク', back: 0, category: 'cast' },
      { id: 'default-shot',  name: 'ショット',  back: 0, category: 'cast' },
      { id: 'default-cheki', name: 'チェキ',    back: 0, category: 'cast' },
      { id: 'default-orishan', name: 'オリシャン', back: 0, category: 'champagne' }
    ]
  };
}
```

---

### A3: Engineer 3 — ItemRows.jsx

ファイル: `salary-app-react/src/components/ItemRows.jsx`

**バグ修正: item.price → item.back * count**

`makeRow` 関数内の `item-back-label` の表示を修正する。
現在 `formatMoney(item.price || 0)` となっているが、
`item.price` は存在しないプロパティ。正しくは `(item.back || 0) * count`。

修正後の `makeRow` 関数:
```jsx
function makeRow(item) {
  const count = record.items?.[item.id] || 0;
  const backAmount = (item.back || 0) * count;
  return (
    <div className="item-count-row" key={item.id}>
      <span className="item-back-label">{backAmount > 0 ? formatMoney(backAmount) : '-'}</span>
      <span className="item-name">{item.name}</span>
      <button className="item-dec" onClick={() => onCountChange(item.id, count - 1)}>-</button>
      <span className="item-count-val">{count}</span>
      <button className="item-inc" onClick={() => onCountChange(item.id, count + 1)}>+</button>
    </div>
  );
}
```

---

## Bチーム担当

### B1: Engineer 4 — Today.jsx

ファイル: `salary-app-react/src/pages/Today.jsx`

**① weekStartDay 対応カレンダーロジック**

現在の固定的なカレンダー生成ロジック（firstDayOfWeek, calendarCells）を weekStartDay に対応させる。

`settings` から `weekStartDay` を取得（デフォルト 0）:
```js
const weekStartDay = settings.weekStartDay ?? 0
```

カレンダー生成ロジックを修正:
```js
const daysInMonth = getDaysInMonth(calYear, calMonth)
const rawFirstDay = new Date(calYear, calMonth - 1, 1).getDay() // 0=日〜6=土
// weekStartDay=1(月曜始まり)の場合、日曜は6番目のカラムに
const firstDayOffset = (rawFirstDay - weekStartDay + 7) % 7
const calendarCells = []
for (let i = 0; i < firstDayOffset; i++) {
  calendarCells.push(null)
}
for (let d = 1; d <= daysInMonth; d++) {
  calendarCells.push(d)
}
```

WEEKDAYS の表示順を weekStartDay に合わせる:
```jsx
// 現在: {WEEKDAYS.map((wd, i) => ...)}
// 変更後: weekStartDay から始まる順で表示
const orderedWeekdays = [
  ...WEEKDAYS.slice(weekStartDay),
  ...WEEKDAYS.slice(0, weekStartDay)
]
// JSX内:
<div className="calendar-weekdays">
  {orderedWeekdays.map((wd, i) => {
    const dayIndex = (i + weekStartDay) % 7
    const cls = dayIndex === 0 ? 'sunday' : dayIndex === 6 ? 'saturday' : ''
    return <span key={i} className={cls}>{wd}</span>
  })}
</div>
```

**② 出勤登録セクションの JSX を work-section クラスで整理**

現在の `work-section` div 内の構造を確認し、`time-input-group` クラスを適切に設定する。

現在:
```jsx
<div className="section work-section">
  {!defaultStartTime && (
    <div className="warning-banner">...</div>
  )}
  <button className="btn-checkin-today" onClick={handleCheckin}>出勤登録</button>
  <div className="time-input-group">
    <label>出勤<input .../></label>
    <label>退勤<input .../></label>
  </div>
  {salaryType === 'hourly' && (
    <label>時給<input .../></label>
  )}
</div>
```

この構造はそのまま維持する（CSS の gap で余白が入るため変更不要）。
ただし `warning-banner` クラスがまだ CSS に定義されていない場合は style を追加:
```jsx
<div style={{ padding: '10px 14px', background: '#fff3cd', borderRadius: '10px', fontSize: '13px', color: '#856404', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  ⚠ デフォルト出勤時刻が未設定です
  <button className="btn-link" onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>設定する →</button>
</div>
```

---

### B2: Engineer 5 — Header.jsx

ファイル: `salary-app-react/src/components/Header.jsx`

**常時ロゴ中央＋ハンバーガーメニューに統一**

現在は `type === 'sub'` の場合に戻るボタン＋タイトルを表示しているが、
これを廃止し、常にロゴ中央＋ハンバーガーの統一ヘッダーにする。

修正後の Header.jsx:
```jsx
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
        <Link to="/" className="header-logo">
          <img src="./logo.png" alt="こんまに" className="header-logo-img" />
        </Link>
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
```

---

### B3: Engineer 6 — Settings.jsx

ファイル: `salary-app-react/src/pages/Settings.jsx`

**① Header の type を main に変更**

```jsx
<Header type="main" />
```
→
```jsx
<Header />
```
（type props を削除。Header が props を受け取らなくなるため）

また `main` タグに `paddingTop: '56px'` を追加（固定ヘッダー対応）:
```jsx
<main style={{ paddingTop: '56px' }}>
```

**② ページ内タイトルを追加**

最初の `<section>` の前にタイトルを追加:
```jsx
<main style={{ paddingTop: '56px' }}>
  <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
    <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>設定</h2>
  </div>
  <section className="section">
    ...
```

**③ カレンダー週始まり設定を追加**

「出勤設定」セクションの後（締め期間設定セクションの前）に新しいセクションを追加:

```jsx
<section className="section">
  <h2 className="section-title">カレンダー設定</h2>
  <div className="form-group">
    <label>週の始まり</label>
    <div className="radio-group">
      <label>
        <input
          type="radio"
          name="weekStartDay"
          value="0"
          checked={(s.weekStartDay ?? 0) === 0}
          onChange={() => updateSettings({ weekStartDay: 0 })}
        />
        日曜始まり
      </label>
      <label>
        <input
          type="radio"
          name="weekStartDay"
          value="1"
          checked={(s.weekStartDay ?? 0) === 1}
          onChange={() => updateSettings({ weekStartDay: 1 })}
        />
        月曜始まり
      </label>
    </div>
  </div>
</section>
```

**④ useNavigate と Link のインポートが不要になった場合は整理**

現在 `import { useNavigate, Link } from 'react-router-dom'` があるが、
`onBack={() => navigate('/')}` の参照がなくなるため `useNavigate` の使用箇所を確認。
`handleLogout` で `navigate('/lp')` を使用しているので `useNavigate` は残す。
`Link` は使用していないので削除する。

---

## Cチーム担当

### C1: Engineer 7 — Dashboard.jsx

ファイル: `salary-app-react/src/pages/Dashboard.jsx`

**① Header の type を main に変更**

```jsx
<Header type="sub" title="統計" onBack={() => navigate('/')} />
```
→
```jsx
<Header />
```

また `main` タグの paddingTop を確認（既に `paddingTop: '56px'` があるのでそのまま）。

**② ページ内タイトルを追加**

`dash-month-nav` の前にタイトルを追加:
```jsx
<main style={{ paddingTop: '56px' }}>
  <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
    <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>統計</h2>
  </div>
  <div className="dash-month-nav">
    ...
```

**③ useNavigate が不要になった場合の整理**

`navigate('/')` の参照がなくなるため、`useNavigate` と `const navigate = useNavigate()` を削除する。

---

## 分担まとめ

| チーム | Engineer | ファイル |
|--------|---------|---------|
| A | 1 | style.css |
| A | 2 | src/lib/calc.js |
| A | 3 | src/components/ItemRows.jsx |
| B | 4 | src/pages/Today.jsx |
| B | 5 | src/components/Header.jsx |
| B | 6 | src/pages/Settings.jsx |
| C | 7 | src/pages/Dashboard.jsx |

*作成: 2026-04-01*

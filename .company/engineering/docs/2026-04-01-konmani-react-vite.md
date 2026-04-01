# 設計書: こんまに React + Vite 移行

作成: 2026-04-01

---

## 概要

`salary-app/`（Vanilla JS）を `salary-app-react/`（React + Vite + Firebase v9）として再実装する。
既存の vanilla 版はそのまま残し、react 版を並行ディレクトリで開発する。

---

## 技術スタック

| 項目 | 採用 |
|------|------|
| フレームワーク | React 18 |
| ビルドツール | Vite 5 |
| ルーター | React Router v6 |
| 状態管理 | React Context |
| Firebase | firebase v10 (modular SDK) |
| スタイル | 既存 style.css をそのまま流用 |

---

## ディレクトリ構成

```
salary-app-react/
├── package.json
├── vite.config.js
├── index.html
├── public/
│   └── logo.png          ← salary-app/logo.png をコピー
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── style.css          ← salary-app/style.css をコピー
    ├── lib/
    │   ├── firebase.js    ← Firebase初期化
    │   └── calc.js        ← common.js から計算ロジックを移植
    ├── contexts/
    │   └── AuthContext.jsx
    ├── hooks/
    │   └── useAppData.js
    ├── components/
    │   ├── Header.jsx
    │   └── ItemRows.jsx
    └── pages/
        ├── LP.jsx
        ├── Today.jsx
        ├── Day.jsx
        ├── Settings.jsx
        └── Dashboard.jsx
```

---

## 共通データ構造（全チーム共有知識）

```js
// data オブジェクト
{
  settings: {
    salaryType: 'hourly' | 'fixed',
    baseSalary: number,
    defaultHourlyRate: number,
    defaultStartTime: string,  // "HH:MM"
    defaultEndTime: string,    // "HH:MM"
    timeStep: 1 | 15,
    payPeriodStart: number,    // 1-28
    items: [
      { id: string, name: string, back: number, category: 'cast' | 'champagne' }
    ]
  },
  records: {
    [dateKey: string]: {       // dateKey = "YYYY-MM-DD"
      startTime: string,
      endTime: string,
      hourlyRate: number,
      items: { [itemId: string]: number }
    }
  }
}
```

---

## Firebase 設定値（全チーム共有）

```js
const firebaseConfig = {
  apiKey: "AIzaSyDp02UQu-M4oSyHZRfODx45fzk864AeS-U",
  authDomain: "concafemakemoney.firebaseapp.com",
  projectId: "concafemakemoney",
  storageBucket: "concafemakemoney.firebasestorage.app",
  messagingSenderId: "769214084360",
  appId: "1:769214084360:web:ece3f603125eec1e20e8bd",
};
// Firestoreパス: users/{uid}/data/salary-app-v3
```

---

## Aチーム担当

### A1: Engineer 1 — プロジェクト基盤ファイル

#### `package.json`
```json
{
  "name": "konmani",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "firebase": "^10.12.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.23.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.3.0"
  }
}
```

#### `vite.config.js`
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
})
```

#### `index.html`
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>こんまに</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

#### `src/main.jsx`
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

#### `src/App.jsx`
```jsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LP from './pages/LP'
import Today from './pages/Today'
import Day from './pages/Day'
import Settings from './pages/Settings'
import Dashboard from './pages/Dashboard'

function AuthGuard({ children }) {
  const user = useAuth()
  if (user === undefined) return null
  if (user === null) return <Navigate to="/lp" replace />
  return children
}

function LPGuard({ children }) {
  const user = useAuth()
  if (user === undefined) return null
  if (user !== null) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/lp" element={<LPGuard><LP /></LPGuard>} />
          <Route path="/" element={<AuthGuard><Today /></AuthGuard>} />
          <Route path="/day" element={<AuthGuard><Day /></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
```

---

### A2: Engineer 2 — Firebase・認証・データフック

#### `src/lib/firebase.js`
```js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = { /* 上記の値 */ }

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
```

#### `src/contexts/AuthContext.jsx`
- `createContext` + `useContext`
- `onAuthStateChanged` で user を管理
- `user = undefined` → ローディング中
- `user = null` → 未ログイン
- `user = User` → ログイン済み

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)
  useEffect(() => onAuthStateChanged(auth, u => setUser(u ?? null)), [])
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
```

#### `src/hooks/useAppData.js`
- Firebase Firestore パス: `users/{uid}/data/salary-app-v3`
- ユーザーログイン時に Firestore からロード（失敗時はlocalStorageにフォールバック）
- localStorage にデータがあり Firestore に未同期の場合はマイグレーション
- `persistData(newData)` → state更新 + localStorage保存 + Firestore保存

```js
import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getDefaultSettings } from '../lib/calc'

const STORAGE_KEY = 'salary-app-v3'

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const d = JSON.parse(raw)
      if (!d.settings) d.settings = getDefaultSettings()
      if (!d.records) d.records = {}
      return d
    }
  } catch (e) {}
  return { settings: getDefaultSettings(), records: {} }
}

function saveLocal(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch (e) {}
}

async function loadFirestore(uid) {
  try {
    const ref = doc(db, 'users', uid, 'data', 'salary-app-v3')
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const d = snap.data()
      return { settings: d.settings || getDefaultSettings(), records: d.records || {} }
    }
  } catch (e) { console.warn('Firestore load failed:', e) }
  return null
}

async function saveFirestore(uid, data) {
  try {
    await setDoc(doc(db, 'users', uid, 'data', 'salary-app-v3'), data, { merge: true })
  } catch (e) { console.warn('Firestore save failed:', e) }
}

export function useAppData(user) {
  const [data, setData] = useState(null)
  useEffect(() => {
    if (!user) { setData(null); return }
    loadFirestore(user.uid).then(fsData => {
      const local = loadLocal()
      if (!fsData && Object.keys(local.records || {}).length > 0) {
        saveFirestore(user.uid, local)
        setData(local)
      } else {
        setData(fsData || local)
      }
    })
  }, [user])

  function persistData(newData) {
    setData(newData)
    saveLocal(newData)
    if (user) saveFirestore(user.uid, newData)
  }

  return { data, persistData }
}
```

---

### A3: Engineer 3 — 計算ロジック・共通ユーティリティ

#### `src/lib/calc.js`

common.js から以下の関数をすべて移植（ES module export 形式で）:

```js
export const STORAGE_KEY = 'salary-app-v3'
export const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export function generateId() { ... }
export function getDefaultSettings() {
  return {
    salaryType: 'hourly',
    baseSalary: 200000,
    defaultHourlyRate: 1500,
    defaultStartTime: '',
    defaultEndTime: '',
    timeStep: 1,
    payPeriodStart: 1,
    items: [
      { id: 'default-drink', name: 'ドリンク', back: 0, category: 'cast' },
      { id: 'default-shot',  name: 'ショット',  back: 0, category: 'cast' },
      { id: 'default-cheki', name: 'チェキ',    back: 0, category: 'cast' },
    ]
  }
}
export function getTodayKey() { ... }
export function getDaysInMonth(year, month) { ... }
export function formatDateLabel(dateKey) { ... }
export function formatDateFull(dateKey) { ... }
export function formatMoney(n) { ... }
export function escapeHtml(s) { ... }
export function calcHours(startTime, endTime) { ... }
export function calcDailyWage(record, settings) { ... }
export function calcPeriodRange(year, month, startDay) { ... }
export function calcMonthlyTotal(year, month, data) { ... }
export function ensureRecord(data, dateKey) {
  // data を直接変更せず新しいオブジェクトを返すように実装
  // Reactのstate更新のためイミュータブルに
  const newData = { ...data, records: { ...data.records } }
  if (!newData.records[dateKey]) {
    newData.records[dateKey] = {
      startTime: '', endTime: '',
      hourlyRate: data.settings.defaultHourlyRate || 0,
      items: {}
    }
  }
  if (!newData.records[dateKey].items) {
    newData.records[dateKey] = { ...newData.records[dateKey], items: {} }
  }
  return newData
}
```

**注意**: `ensureRecord` は vanilla 版と異なり、data を直接変更せずイミュータブルに新しい data オブジェクトを返すこと（React state の更新のため）。

---

## Bチーム担当

### B1: Engineer 4 — LP ページ

#### `src/pages/LP.jsx`

- lp.html + lp.js の移植
- Google ログインボタン（`signInWithPopup` + `GoogleAuthProvider`）
- ログイン中はボタンを disabled にして「ログイン中…」表示
- ログイン成功後は AuthContext が user を更新 → App.jsx の LPGuard が `/` にリダイレクト
- SVGアイコン・デザインは lp.html をそのまま JSX に変換

```jsx
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
    <body className="lp-body">
      {/* lp.html の中身をそのままJSXに変換 */}
      {/* SVGのid属性は lp- プレフィックス付き（既存のまま） */}
    </body>
  )
}
```

---

### B2: Engineer 5 — Today ページ + ItemRows コンポーネント

#### `src/components/ItemRows.jsx`

- props: `{ items, record, onCountChange }`
- キャストアイテム（category !== 'champagne'）は常時表示
- シャンパン（category === 'champagne'）は折りたたみトグル
- `onCountChange(itemId, newCount)` を呼ぶ

#### `src/pages/Today.jsx`

- index.html + index.js の移植
- `useAuth()` でユーザー取得
- `useAppData(user)` でデータ取得
- todayKey = getTodayKey()
- ヘッダー: logo link + user-chip + 統計ボタン + 設定ボタン
- 時刻入力 + 時給入力 + 出勤登録ボタン
- ItemRows コンポーネントを使用
- カレンダー（月ナビ付き）
- カレンダーセルクリック → `navigate('/day?date=YYYY-MM-DD')`

---

### B3: Engineer 6 — Day ページ

#### `src/pages/Day.jsx`

- day.html + day.js の移植
- `useSearchParams()` で dateKey 取得
- `useAuth()` + `useAppData(user)` でデータ
- ヘッダー: 戻るボタン + 日付ラベル + user-chip-small
- 時刻入力 + 時給入力 + 出勤登録ボタン
- ItemRows コンポーネントを使用
- 合計表示

---

## Cチーム担当

### C1: Engineer 7 — Settings ページ

#### `src/pages/Settings.jsx`

- settings.html + settings.js の移植
- 給与タイプ（時給/固定給）切り替え
- デフォルト時給・固定給入力
- デフォルト出勤時刻・退勤時刻
- 時刻単位（1分/15分）
- 締め期間設定
- 品目一覧（キャストメニュー/シャンパン類 別）
- ログアウトボタン（`signOut(auth)` → navigate('/lp')）

---

### C2: Engineer 8 — Dashboard ページ

#### `src/pages/Dashboard.jsx`

- dashboard.html + dashboard.js の移植
- `useAuth()` + `useAppData(user)` でデータ
- 月ナビ（SVG矢印ボタン）
- サマリーカード（合計・時給計・バック計・バック比率）
- 稼働情報（稼働日数・平均日給・最高収入日・稼働時間・平均時給）
- 品目別バック内訳（バーグラフ）
- 内訳比率バー（時給 vs バック）

---

### C3: Engineer 9 — Header コンポーネント + style.css コピー

#### `src/components/Header.jsx`

- props: `{ type: 'main' | 'sub', title?: string }`
- `type='main'`: logo link + user-chip + 統計ボタン + 設定ボタン
- `type='sub'`: 戻るボタン + タイトル + user-chip-small
- `useAuth()` でユーザー名・イニシャル表示
- `useNavigate()` でページ遷移

#### style.css・logo.png コピー作業
- `salary-app/style.css` → `salary-app-react/src/style.css`
- `salary-app/logo.png` → `salary-app-react/public/logo.png`

---

## 分担まとめ

| チーム | Engineer | ファイル |
|--------|---------|---------|
| A | 1 | package.json, vite.config.js, index.html, src/main.jsx, src/App.jsx |
| A | 2 | src/lib/firebase.js, src/contexts/AuthContext.jsx, src/hooks/useAppData.js |
| A | 3 | src/lib/calc.js |
| B | 4 | src/pages/LP.jsx |
| B | 5 | src/pages/Today.jsx, src/components/ItemRows.jsx |
| B | 6 | src/pages/Day.jsx |
| C | 7 | src/pages/Settings.jsx |
| C | 8 | src/pages/Dashboard.jsx |
| C | 9 | src/components/Header.jsx, style.css/logo.pngコピー |

---

## 注意事項

- React の state 更新はイミュータブルに行うこと（直接変更しない）
- `ensureRecord` は新しい data オブジェクトを返すように実装
- HashRouter を使用（静的ファイルホスティングでのSPAルーティング対応）
- Firebase は v10 modular SDK（import文ベース）
- style.css はそのまま使う（クラス名変更なし）
- logo は `public/logo.png` に配置し、JSX では `/logo.png` で参照

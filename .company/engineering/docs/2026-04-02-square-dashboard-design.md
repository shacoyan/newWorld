---
date: "2026-04-02"
type: design
author: Tech Lead
project: square-dashboard
---

# Square売上ダッシュボード 設計書

## 概要

店舗SABABAのSquare決済情報をリアルタイムで閲覧できるWebアプリ。
パスワード保護付き、複数店舗対応。

## 設計・方針

- **フロントエンド**: React + Vite + TypeScript + TailwindCSS
- **バックエンド**: Vercel Serverless Functions（`/api`）
- **Square APIキー**: サーバーサイドのみで使用。フロントには渡さない
- **認証**: シンプルなパスワード認証 → sessionStorageにトークン保持
- **更新**: 60秒ごとポーリング + 手動更新ボタン
- **多店舗**: `/v2/locations` で店舗一覧取得 → セレクターで切り替え

## 詳細

### ディレクトリ構成

```
square-dashboard/
├── api/                    ← Vercel Serverless Functions
│   ├── auth.js
│   ├── locations.js
│   ├── sales.js
│   └── transactions.js
└── src/
    ├── main.tsx
    ├── index.css
    ├── App.tsx
    ├── components/
    │   ├── LoginPage.tsx
    │   ├── Dashboard.tsx
    │   ├── StoreSwitcher.tsx
    │   ├── SalesSummary.tsx
    │   └── TransactionList.tsx
    └── hooks/
        └── useSquareData.ts
```

### 環境変数
```
SQUARE_ACCESS_TOKEN=<本番用トークン>
APP_PASSWORD=sababa_buchi_daiki
```

### APIエンドポイント

| エンドポイント | メソッド | 説明 |
|---|---|---|
| `/api/auth` | POST | `{ password }` → `{ token }` or 401 |
| `/api/locations` | GET | 店舗一覧。ヘッダー: `Authorization: Bearer <token>` |
| `/api/sales` | GET | クエリ: `?date=YYYY-MM-DD&location_id=xxx` |
| `/api/transactions` | GET | クエリ: `?date=YYYY-MM-DD&location_id=xxx` |

### Square API利用

- **店舗一覧**: `GET https://connect.squareup.com/v2/locations`
- **支払い一覧**: `GET https://connect.squareup.com/v2/payments`
  - パラメータ: `begin_time`, `end_time`（ISO8601 UTC）, `location_id`
  - ページネーション: `cursor` で全件取得
- **日本時間**: JST(UTC+9)で入力された日付をUTCに変換してSquare APIに渡す
  - 例: `2026-04-02 00:00 JST` → `2026-04-01T15:00:00Z`

### 認証フロー

```
1. ユーザーがパスワードを入力 → POST /api/auth
2. サーバーが process.env.APP_PASSWORD と比較
3. 一致 → base64トークンを返す
4. フロントがsessionStorageに保存
5. 以降のAPIリクエストはヘッダーに Bearer トークンを付与
6. ログアウト → sessionStorage削除
```

### UI仕様

- 日本語表示
- モバイルファースト（スマホでも快適に見られる）
- 金額は `¥1,000` 形式（カンマ区切り）
- TailwindCSSでシンプルなデザイン（白背景・グレー系・アクセントカラーはインディゴ）
- 伝票のステータス色分け: COMPLETED=緑, FAILED=赤, CANCELED=グレー

---

## 分担

### Aチーム: Vercel Serverless Functions（api/）

**担当ファイル:**
- `api/auth.js`
- `api/locations.js`
- `api/sales.js`
- `api/transactions.js`

**実装要件:**
```javascript
// api/auth.js
// POST { password } → 一致すれば { token: base64文字列 } を返す
// 不一致なら 401

// api/locations.js
// GET → Square /v2/locations を呼んで店舗一覧を返す
// ヘッダー検証: Authorization: Bearer <token>
// token の検証: atob(token) が APP_PASSWORD を含むか確認

// api/sales.js
// GET ?date=YYYY-MM-DD&location_id=xxx
// Square /v2/payments を呼んでその日の支払いを全件取得（ページネーション）
// 集計: total_money(円), transaction_count を返す
// JST日付 → UTC変換必須

// api/transactions.js
// GET ?date=YYYY-MM-DD&location_id=xxx
// Square /v2/payments 一覧を返す
// 各トランザクション: id, created_at(JST), amount_money, status, source_type
// 新しい順にソート
```

**注意事項:**
- `Content-Type: application/json` を必ずセット
- `CORS`対応: `Access-Control-Allow-Origin: *` を追加
- エラーレスポンスは `{ error: "メッセージ" }` 形式
- Square APIのベースURL: `https://connect.squareup.com`

---

### Bチーム: フロントエンドコンポーネント

**担当ファイル:**
- `src/components/LoginPage.tsx`
- `src/components/StoreSwitcher.tsx`
- `src/components/SalesSummary.tsx`
- `src/components/TransactionList.tsx`

**実装要件:**

```typescript
// LoginPage.tsx
// Props: { onLogin: (token: string) => void }
// パスワード入力 → POST /api/auth → トークンをonLoginに渡す
// ローディング・エラー表示あり
// シンプルなセンタリングレイアウト

// StoreSwitcher.tsx
// Props: { locations: Location[], selectedId: string, onChange: (id: string) => void }
// type Location = { id: string; name: string; }
// selectドロップダウンで切り替え

// SalesSummary.tsx
// Props: { total: number; count: number; loading: boolean }
// カード形式で表示: 合計金額（¥形式）、件数
// ローディング中はスケルトン表示

// TransactionList.tsx
// Props: { transactions: Transaction[]; loading: boolean }
// type Transaction = { id: string; created_at: string; amount: number; status: string; source: string; }
// テーブルまたはカードリスト
// ステータス色分け: COMPLETED=緑, FAILED=赤, その他=グレー
// 金額は¥形式
```

---

### Cチーム: アプリ基盤

**担当ファイル:**
- `src/main.tsx`
- `src/index.css`
- `src/App.tsx`
- `src/components/Dashboard.tsx`
- `src/hooks/useSquareData.ts`

**実装要件:**

```typescript
// main.tsx
// ReactDOM.createRoot + StrictMode、通常のViteエントリポイント

// index.css
// @tailwind base; @tailwind components; @tailwind utilities; のみ

// App.tsx
// sessionStorageからtokenを取得
// token未設定 → LoginPage表示
// token設定済み → Dashboard表示
// onLogin: tokenをsessionStorageに保存してstateを更新
// onLogout: sessionStorageを削除してstateをリセット

// Dashboard.tsx
// Props: { token: string; onLogout: () => void }
// 店舗一覧を取得してStoreSwitcherに渡す
// 日付セレクター（デフォルト: 今日 YYYY-MM-DD形式）
// useSquareDataフックを使ってSalesSummary・TransactionListに渡す
// ヘッダー: "SABABA 売上ダッシュボード" + ログアウトボタン + 最終更新時刻
// 手動更新ボタン

// useSquareData.ts
// 引数: { token, date, locationId }
// /api/sales と /api/transactions をfetch
// 60秒ごとに自動更新（setInterval）
// 戻り値: { sales, transactions, loading, error, refresh }
```

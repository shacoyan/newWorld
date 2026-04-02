---
date: "2026-04-02"
type: engineering-doc
status: in-progress
project: square-dashboard
---

# Square売上ダッシュボード 実装仕様

## プロジェクト構成

```
square-dashboard/
├── index.html
├── vite.config.ts
├── package.json
├── .env               ← ローカル用（gitignore）
├── .env.example       ← サンプル（gitに含める）
├── vercel.json
├── api/
│   ├── auth.js        ← パスワード認証
│   ├── sales.js       ← 今日の売上サマリー
│   └── transactions.js ← 伝票一覧
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── components/
    │   ├── LoginPage.tsx      ← パスワード入力
    │   ├── Dashboard.tsx      ← メイン画面
    │   ├── SalesSummary.tsx   ← 売上サマリー
    │   └── TransactionList.tsx ← 伝票一覧
    └── hooks/
        └── useSquareData.ts   ← データ取得フック（ポーリング）
```

## 環境変数

```env
# .env.example
SQUARE_ACCESS_TOKEN=your_square_access_token_here
APP_PASSWORD=sababa_buchi_daiki
```

## APIエンドポイント設計

### POST /api/auth
- リクエスト: `{ password: string }`
- レスポンス: `{ token: string }` or 401

### GET /api/sales?date=YYYY-MM-DD
- 認証: Authorizationヘッダー
- レスポンス: `{ total_amount: number, transaction_count: number, currency: string }`

### GET /api/transactions?date=YYYY-MM-DD
- 認証: Authorizationヘッダー
- レスポンス: `{ transactions: [...] }`

## Square API利用箇所
- 伝票一覧: `GET /v2/orders/search` or `GET /v2/payments`
- 売上サマリー: `GET /v2/labor/shift-wages` → 集計
- 店舗ID: `GET /v2/locations` で取得

## 複数店舗対応
- Square APIの `/v2/locations` で店舗一覧を取得
- ダッシュボードに店舗セレクターを設置
- 選択した店舗のデータを表示

## 認証フロー
1. ローカルsessionStorageにトークン保存
2. リロード時も認証状態を維持
3. ログアウトボタンでsessionStorage削除

## 更新間隔
- 自動更新: 60秒ごとにポーリング
- 手動更新ボタンも設置

## デプロイ
1. GitHubリポジトリ作成（privateを推奨）
2. Vercelにリポジトリ連携
3. 環境変数を設定:
   - `SQUARE_ACCESS_TOKEN`
   - `APP_PASSWORD=sababa_buchi_daiki`

## セキュリティ注意事項
- APIキーはVercel環境変数のみで管理
- ソースコード・GitHubには含めない
- 本番はHTTPS必須（Vercelは自動）

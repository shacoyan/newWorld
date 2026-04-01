# チケット: 肉棒家 Supabase → Firebase 移行

## ステータス
`in-progress`

## 優先度
`high`

## 概要
バックエンドをSupabaseからFirebaseに切り替える。
認証はFirebase Auth、DBはFirestoreを使用。

## 変更対象ファイル

### Aチーム
- `src/lib/firebase.ts`（新規: supabase.ts差し替え）
- `src/contexts/AuthContext.tsx`（Firebase Auth対応）
- `src/pages/LoginPage.tsx`（Firebase Auth呼び出し）
- `src/pages/SignupPage.tsx`（Firebase Auth呼び出し）

### Bチーム
- `src/components/Record/RecordForm.tsx`（Firestore CRUD）
- `src/pages/DashboardPage.tsx`（Firestore query）
- `src/pages/RecordDetailPage.tsx`（Firestore fetch/delete）

### 確定ファイル（直接書き換え）
- `package.json`（supabase削除 → firebase追加）
- `.env.example`（Firebase設定変数）

## 作成日
2026-04-02

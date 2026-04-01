# 設計書: 肉棒家 初期リリース

## 概要
肉棒家（にくぼうや）— 性体験記録Webアプリの初期実装。
React + Vite + TypeScript + Supabase + TailwindCSS。

## アーキテクチャ

```
nikubouy/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── Record/
│   │   │   ├── RecordList.tsx
│   │   │   ├── RecordCard.tsx
│   │   │   └── RecordForm.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       └── PrivateRoute.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── NewRecordPage.tsx
│   │   └── RecordDetailPage.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── lib/
│   │   └── supabase.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   └── schema.sql
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## DBスキーマ（Supabase）

```sql
-- records テーブル
CREATE TABLE records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nickname TEXT NOT NULL,
  date DATE NOT NULL,
  length_cm DECIMAL(4,1),
  girth_cm DECIMAL(4,1),
  curvature TEXT CHECK (curvature IN ('上反り','まっすぐ','下反り','左反り','右反り')),
  glans_size TEXT CHECK (glans_size IN ('小','普通','大')),
  foreskin TEXT CHECK (foreskin IN ('なし','仮性','真性')),
  color TEXT,
  hair_care TEXT CHECK (hair_care IN ('なし','少し','普通','濃い')),
  texture_notes TEXT,
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  memory_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_records_only" ON records
  FOR ALL USING (auth.uid() = user_id);
```

## 型定義（types/index.ts）

```typescript
export interface Record {
  id: string;
  user_id: string;
  nickname: string;
  date: string;
  length_cm?: number;
  girth_cm?: number;
  curvature?: '上反り' | 'まっすぐ' | '下反り' | '左反り' | '右反り';
  glans_size?: '小' | '普通' | '大';
  foreskin?: 'なし' | '仮性' | '真性';
  color?: string;
  hair_care?: 'なし' | '少し' | '普通' | '濃い';
  texture_notes?: string;
  overall_rating?: 1 | 2 | 3 | 4 | 5;
  memory_notes?: string;
  created_at: string;
  updated_at: string;
}

export type RecordInput = Omit<Record, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
```

## Tailwindカラー設定（tailwind.config.js）

```js
theme: {
  extend: {
    colors: {
      'ie-red': '#C41E3A',
      'ie-black': '#1A1A1A',
      'ie-surface': '#2A2A2A',
      'ie-cream': '#F5E6C8',
      'ie-gold': '#D4A017',
      'ie-border': '#E05050',
    },
    fontFamily: {
      serif: ['Noto Serif JP', 'serif'],
      sans: ['Noto Sans JP', 'sans-serif'],
    }
  }
}
```

---

## チーム分担と実装指示

### Aチーム担当: プロジェクト基盤 + 認証
**ファイル担当:** package.json, vite.config.ts, tsconfig.json, tailwind.config.js, index.html, src/main.tsx, src/App.tsx, src/lib/supabase.ts, src/contexts/AuthContext.tsx, src/hooks/useAuth.ts, src/pages/LoginPage.tsx, src/pages/SignupPage.tsx, src/pages/LandingPage.tsx, src/components/Auth/LoginForm.tsx, src/components/Auth/SignupForm.tsx, src/components/Layout/PrivateRoute.tsx

**実装内容:**
1. `npm create vite@latest nikubouy -- --template react-ts` 相当のファイル群
2. 依存: `@supabase/supabase-js react-router-dom tailwindcss @tailwindcss/forms`
3. Supabaseクライアント: 環境変数 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` から初期化
4. AuthContext: `user`, `session`, `signIn`, `signUp`, `signOut` を提供
5. PrivateRoute: 未ログインは `/login` へリダイレクト
6. LandingPage: 暖簾イメージ＋「肉棒家」屋号＋ログイン/新規登録ボタン
7. LoginForm/SignupForm: Supabase Auth連携

### Bチーム担当: 記録CRUD機能
**ファイル担当:** src/pages/DashboardPage.tsx, src/pages/NewRecordPage.tsx, src/pages/RecordDetailPage.tsx, src/components/Record/RecordList.tsx, src/components/Record/RecordCard.tsx, src/components/Record/RecordForm.tsx

**実装内容:**
1. DashboardPage: RecordListを表示。ユーザーの全記録をSupabaseから取得
2. RecordList: records配列を受け取りRecordCardを並べる
3. RecordCard: 品書き一品風。ニックネーム・日付・評価（★）・サイズをカード表示。クリックで詳細へ
4. RecordForm: 全フィールドの入力フォーム。新規作成・編集兼用（`id`の有無で判断）
5. RecordDetailPage: 詳細表示。編集・削除ボタン付き
6. Supabase CRUD: `supabase.from('records').select/insert/update/delete`

### Cチーム担当: デザイン・スタイリング
**ファイル担当:** tailwind.config.js（カラー/フォント設定）, src/index.css, src/components/Layout/Header.tsx

**実装内容:**
1. index.css: Google Fonts（Noto Serif JP, Noto Sans JP）読み込み、ベーススタイル（背景黒、テキスト生成り）
2. tailwind.config.js: 上記カラー・フォント設定を全実装
3. Header: 「肉棒家」ロゴ＋暖簾風デザイン。ログアウトボタン付き
4. 各ページ・コンポーネントに家系ラーメンスタイルを適用するためのTailwindクラス仕様書を作成

**Cチームはスタイル仕様書を出力し、AチームとBチームのコンポーネントに適用する**

---

## 出力先
プロジェクトは `/Users/usr0103301/Documents/個人仕事/newWorld/nikubouy/` に作成する。

## 注意事項
- Supabase環境変数は `.env` ファイルに記述（`.env.example` も作成）
- supabase/schema.sql も必ず出力すること
- TypeScript strict mode
- React Router v6のloader/actionは使わず、useEffectベースで実装

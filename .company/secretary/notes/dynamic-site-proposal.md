# こんまに — 動的サイト（React + Vite）移行提案

作成日: 2026-04-01

---

## 現状

| 項目 | 内容 |
|------|------|
| スタック | Vanilla HTML / CSS / JS |
| 認証 | Firebase Auth |
| DB | Firestore + localStorage |
| ページ | index.html / day.html / settings.html / dashboard.html / lp.html |
| デプロイ | 静的ファイルホスティング |

---

## 課題

- ページ間で共通ロジック（`common.js`）を `<script>` で読み込む設計のため、型安全性がなくバグが追いにくい
- `renderItemRows()` のような関数がindex.jsとday.jsに重複しており、変更のたびに複数ファイルを同期する必要がある
- コンポーネントの概念がないため、UIの再利用・テストが困難
- 状態管理がグローバル変数（`data`）に依存しており、スケールしにくい

---

## 提案: React + Vite への移行

### なぜReact + Viteか

- **SSR不要**: アプリはFirebase Auth認証後にのみ表示されるため、SEOは不要。CSRで十分。
- **Vite**: 高速な開発サーバー・ビルド。vanilla JSからの移行コストが低い。
- **React**: コンポーネントベースで`renderItemRows`等の重複を解消できる。
- **既存のFirebase/Firestoreはそのまま流用可能**。

### 移行後のイメージ

```
salary-app-react/
├── src/
│   ├── main.jsx
│   ├── App.jsx               ← Firebase Auth ガード
│   ├── pages/
│   │   ├── Today.jsx         ← index.html相当
│   │   ├── Day.jsx           ← day.html相当
│   │   ├── Settings.jsx
│   │   └── Dashboard.jsx
│   ├── components/
│   │   ├── ItemRows.jsx      ← 重複していたrenderItemRowsを1箇所に
│   │   ├── TimeInput.jsx
│   │   └── Header.jsx
│   ├── hooks/
│   │   └── useAppData.js     ← データ取得・保存ロジック
│   └── lib/
│       ├── calc.js           ← common.jsの計算ロジック流用
│       └── firebase.js
├── index.html
└── vite.config.js
```

---

## メリット・デメリット

| | メリット | デメリット |
|-|---------|-----------|
| 開発体験 | HMR・型推論・ESLint連携 | 初期セットアップコスト |
| 保守性 | コンポーネント再利用・重複解消 | Reactの学習コスト（低め） |
| 拡張性 | 新機能追加が容易 | バンドルサイズが増加（軽微） |
| Firebase連携 | react-firebase-hooks等で簡潔に書ける | 依存パッケージが増える |

---

## 移行コスト見積もり

| フェーズ | 内容 | 規模 |
|---------|------|------|
| 1 | Vite + React セットアップ・Firebase連携 | 小 |
| 2 | common.js → lib/calc.js に移植 | 小 |
| 3 | 各ページをJSXコンポーネントに変換 | 中 |
| 4 | スタイルをCSS Modulesまたはそのまま移植 | 小 |
| 5 | テスト・動作確認・デプロイ設定更新 | 小〜中 |

現在のコードは比較的シンプルなため、**段階的な移行（既存vanillaを残しながら新しいReact版を並行開発）** が現実的。

---

## 結論・推奨

**移行を推奨する。** 特に品目カテゴリ対応・シャンパントグルなど「UIの複雑度が上がっている」今がちょうど移行のタイミング。

ただし優先度は現機能の安定稼働の後。まずv4.2をリリースして運用しながら、移行タイミングを判断するのがよい。

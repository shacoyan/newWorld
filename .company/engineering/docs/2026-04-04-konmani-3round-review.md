---
date: "2026-04-04"
project: konmani (conmoney)
type: review-improvement
status: in-progress
---

# こんまに 3ラウンドレビュー＆改善

## 概要
こんまにのソースコード全体を精査し、3ラウンドに分けて改善を実施する。

## Round 1: バグ・機能的な問題（高優先）

### 1-1. Dashboard.jsx: calcDailyWage に dateKey 未渡し
- **行**: 43, 86
- **問題**: `calcDailyWage(rec, data.settings)` で第3引数 `dateKey` が欠落
- **影響**: 固定給モードで過去/未来の月を表示した時、日割り計算が現在の月の日数で行われる
- **修正**: `calcDailyWage(rec, data.settings, key)` に変更

### 1-2. PremiumPage.jsx: 重複import
- **行**: 1, 3
- **修正**: `import { useNavigate, Navigate } from 'react-router-dom'` に統合

### 1-3. LP.jsx: main タグ欠落
- **問題**: 他の全ページは `<main className="main-content">` を使用、LP のみなし
- **修正**: `<main>` で wrap

### 1-4. index.html: メタ情報不足
- meta description 追加
- favicon link 追加
- noscript フォールバック追加

### 1-5. Dashboard.jsx: 日付レンジ2重ループ
- **行**: 36-63 と 79-94 で同一レンジを2回ループ
- **修正**: 1回のループに統合し、jobStats も同時に集計

## Round 2: 構造・コード品質（中優先）

### 2-1. Dashboard.jsx: id属性をclassNameに変更
### 2-2. Today.jsx:168 インラインstyle → CSSクラス化
### 2-3. Settings.jsx:310,318,320 インラインstyle → CSSクラス化
### 2-4. Header.jsx:52 空divスペーサー → CSSクラス化

## Round 3: 細かい改善（低優先）

### 3-1. ItemRows.jsx: count=0 時に - ボタンを disabled に
### 3-2. Report.jsx: CSV出力のカンマエスケープ
### 3-3. Settings.jsx:258 深夜割増 label インラインstyle削除
### 3-4. useCalendarState.js: 開発時コメント番号の削除
### 3-5. Header.jsx: 着せ替えアイコンをパレットアイコンに変更

## 分担

全修正を Aチーム（Engineer 1）→ Reviewer 1 → Dチーム → Tech Lead のフローで実施。
修正量が限定的なため、1チームで順次対応。

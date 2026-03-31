# フルスクリーンメニュー + ヒーローキャッチコピー可読性改善

## 概要
- Engineer 1: ハンバーガーメニューをフルスクリーンオーバーレイ化
- Engineer 2: メインビジュアルのキャッチコピー可読性改善

---

## Engineer 1: フルスクリーンメニュー

### 現状
- `position: fixed; top: var(--header-height); bottom: 0`（ヘッダー下から下端）
- `transform: translateX(100%)` → `translateX(0)` でスライドイン

### 変更後
- `position: fixed; top: 0; left: 0; width: 100%; height: 100%`（画面全体）
- フェードイン（`opacity: 0 → 1` + `visibility: hidden → visible`）
- メニュー項目を画面中央に配置（`justify-content: center; align-items: center`）
- 閉じるボタン（×）を右上に固定表示
- フォントサイズ拡大（`var(--font-size-2xl)` 程度）
- `z-index` をヘッダーより上に設定

### 変更ファイル
- `css/layout.css`: `.global-nav`（モバイル用スタイル）、`.hamburger.active`
- `css/base.css`: `.no-scroll { overflow: hidden; }` が未定義なら追加
- `main.js`: 既存のclass付与ロジックはそのまま流用可（変更不要の可能性あり）

---

## Engineer 2: ヒーローキャッチコピー可読性改善

### 現状
- `.hero` に `background-image: url('images/hero-bg.jpg')` （インラインスタイル）
- `::before` の overlay が `rgba(201,168,76,0.12)` と薄め
- `h1` は `color: white`、`hero-sub` は `rgba(255,255,255,0.75)`

### 変更方針（デザインはエンジニアに委任）
以下のいずれか、または組み合わせで可読性を改善すること:
- `h1` / `hero-sub` に `text-shadow` を追加
- `::before` の overlay を暗くする（背景画像を読みにくくしてテキストを際立たせる）
- `.hero-content` に半透明の暗い背景を追加
- `hero-sub` の `opacity` を `0.75 → 0.9` に上げる

### 変更ファイル
- `css/pages/home.css`: `.hero::before`、`.hero h1`、`.hero-sub`、`.hero-content`

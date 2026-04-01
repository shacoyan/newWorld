# 💻 Tech Lead 設計書 — Rica Makeup Artist ポートフォリオ

## 0. 現状分析と方針

ドラフトの `index.html`、`css/style.css`、`js/main.js` を確認。構造・配色・JS機能の骨格は既に出来ている。
今回は**作り直し（リファクタリング＋品質向上）** として、ドラフトの良い部分を活かしつつ以下の問題点を修正する。

### ドラフトの問題点
1. **HTML**: Google Fonts の `<link>` がない（CSSの `@import` のみ）。モバイルナビのハンバーガーメニューが未実装。gallery にプレースホルダーアイテムがインラインスタイルで直書き。`<sup style="...">` のインラインスタイルが散在。
2. **CSS**: レスポンシブで `.nav-links { display: none }` だがハンバーガートグルがない。ライトボックスのトランジションアニメーションがない。
3. **JS**: ライトボックスのフェードイン/アウト未実装。スワイプ対応なし。ギャラリーフィルター切替時のアニメーションなし。

---

## 1. アーキテクチャ概要

```
rika-portfolio/
├── index.html          ← Aチーム担当
├── css/
│   └── style.css       ← Bチーム担当
├── js/
│   └── main.js         ← Cチーム担当
└── images/
    ├── hero.jpg
    ├── profile.jpg
    └── gallery/
```

**技術スタック**: 純粋 HTML5 / CSS3 / Vanilla JS（フレームワーク不使用）

**フォント読込**: `<link>` タグで統一（CSS の `@import` は削除）
- `Cormorant Garamond` (300, 400, 600, italic) — 見出し・装飾数字
- `Noto Sans JP` (300, 400, 500) — 本文
- `Jost` (200, 300, 400, 600) — UIラベル・ボタン・ナビ

---

## 2. カラーパレット定義（CSS変数）

```css
:root {
  --pink:       #FF2D78;
  --pink-dk:    #E0005F;
  --pink-lt:    #FF80AB;
  --pink-pale:  #FFF0F5;
  --green:      #00C96E;
  --green-dk:   #00A358;
  --green-lt:   #B2FFD6;
  --green-pale: #F0FFF7;
  --black:      #1A1A1A;
  --gray:       #666666;
  --gray-lt:    #AAAAAA;
  --white:      #FFFFFF;
  --grad-pink-green: linear-gradient(135deg, var(--pink), var(--green));
  --section-gap: 120px;
  --z-nav: 100;
  --z-lightbox: 200;
  --z-mobile-menu: 150;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
}
```

---

## 3. 各チームへの実装指示

### Aチーム: HTML構造 (`index.html`)

**修正点:**
1. `<head>`: Google Fonts を `<link>` タグで読み込む（CSS側の `@import` は削除）
2. Navigation に `<button class="nav-hamburger">` + `<span class="hamburger-line">` x3 を追加
3. `<sup style="...">` → `<sup class="sup">` に統一
4. Gallery プレースホルダー: インラインスタイルを削除し、各カテゴリ2枚ずつ(計10個)の `.gallery-item` を `.gallery-placeholder` div で配置
5. Copyright 年を `2025` に更新

**Gallery プレースホルダーのテンプレート:**
```html
<div class="gallery-item" data-category="bridal" data-label="Bridal — ウェディング">
  <div class="gallery-placeholder" data-text="Bridal 01"></div>
  <div class="gallery-item-overlay">
    <span class="gallery-item-label">Bridal</span>
  </div>
</div>
```

カテゴリ配分: bridal x2, studio x2, fashion x2, party x2, natural x2

---

### Bチーム: CSS (`css/style.css`)

**修正・追加点:**
1. `@import` 行を削除（HTML の `<link>` に統一済み）
2. CSS変数に `--pink-dk`, `--grad-pink-green`, `--z-mobile-menu`, `--ease-out` を追加
3. モバイルハンバーガーメニュー CSS 追加:
   - `.nav-hamburger`: デフォルト `display: none`、768px以下で `display: flex`
   - 3本線アニメーション: `.nav-hamburger.open` で X形に変形
   - `.nav-links` モバイル: `transform: translateX(100%)` → `.open` で `translateX(0)`
   - ドロワー: `position: fixed`, `width: 75vw`, `height: 100vh`, 暗い背景
4. Gallery プレースホルダー CSS:
   - `.gallery-placeholder`: グラデーション背景、`::after` で `data-text` を表示
   - `nth-child` で aspect-ratio を 3:4 / 4:3 / 1:1 交互に
5. ライトボックスのトランジション:
   - `#lightbox`: `opacity: 0 + visibility: hidden` → `.open` で `opacity: 1 + visible`
   - `#lightbox-img`: `transform: scale(.92)` → `.open` で `scale(1)`
6. `.sup` クラス追加: `font-size: 1rem`
7. `.gallery-grid.filtering`: `opacity: 0` のスタイルを追加

---

### Cチーム: JavaScript (`js/main.js`)

**追加・改善機能:**
1. **ハンバーガーメニュー（新規）:**
   - `.nav-hamburger` クリック → `.open` トグル、`aria-expanded` トグル、`body overflow` トグル
   - ナビリンククリック・ESCキーでメニューを閉じる

2. **ギャラリーフィルター（改善）:**
   - 切替時: `.gallery-grid` に `.filtering` 付与(opacity 0) → 300ms後に hidden 切替 → `.filtering` 除去(opacity 1)

3. **ライトボックス（改善）:**
   - 画像切替時: `opacity: 0` → src変更 → `opacity: 1` のフェード
   - タッチスワイプ対応: touchstart/touchend で50px閾値、左→next、右→prev

4. **年号自動更新（新規）:**
   - `new Date().getFullYear()` で footer の年号を動的に更新

---

## 4. 画像プレースホルダー方針

**Gallery**: `.gallery-placeholder` div → 差し替え時に `<img>` に置き換え
**Hero**: `.hero-bg-fallback` div → 差し替え時にコメントの `<img>` を有効化
**Profile**: `.about-img-placeholder` div → 差し替え時に同様

**ファイル命名規則:**
```
images/hero.jpg, images/profile.jpg
images/gallery/bridal_01.jpg, studio_01.jpg, fashion_01.jpg, party_01.jpg, natural_01.jpg
```

---

## 5. チーム間依存関係

3チーム並行着手可能（クラス名・IDは本設計書で確定）

## 6. レビュー観点

- インラインスタイルが残っていないか
- `@import` が残っていないか
- モバイルでハンバーガーメニューが正常動作するか
- ギャラリーフィルター切替がスムーズか
- ライトボックスのキーボード操作が動作するか
- プレースホルダー状態で見た目が崩れていないか

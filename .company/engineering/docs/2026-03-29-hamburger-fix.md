# ハンバーガーメニュー修正（直感的操作対応）

## 概要
メニューオープン時に × ボタンがオーバーレイの裏に隠れる問題を修正。
直感的に閉じられるUXに改善する。

## 設計・方針
- Engineer 1: layout.css 修正（ボタン固定化・サイズアップ・スタイル改善）
- Engineer 2: main.js 修正（オーバーレイクリック閉じ・ESCキー対応）

## 詳細

### Engineer 1: layout.css

#### 問題
`.hamburger` が `position: relative` のままヘッダー（z-index: 1000）の stacking context 内にあるため、
グローバルな z-index: 1002 が機能せずメニューオーバーレイ（z-index: 1001）の裏に隠れる。

#### 修正
モバイル時（`@media (max-width: 768px)`）の `.hamburger` を以下に変更:
- `position: fixed`
- `top` / `right` をヘッダーと同じ位置に合わせる（`top: calc((var(--header-height) - 44px) / 2); right: var(--container-padding);`）
- `z-index: 1002`
- タップしやすいサイズに: `width: 44px; height: 44px; justify-content: center; align-items: center;`

また、メニューオープン時の × をより視認しやすくする:
- `.hamburger.active span` の色を `var(--color-primary)` に変更（ゴールド色）してオーバーレイ上で目立たせる

### Engineer 2: main.js

以下の機能を追加:
1. **オーバーレイクリックで閉じる** — `#globalNav` 自体をクリックした際（リンク以外の部分）にメニューを閉じる
   ```js
   globalNav.addEventListener('click', (e) => {
     if (e.target === globalNav || e.target === globalNav.querySelector('ul') === false && !e.target.closest('a')) {
       closeMenu();
     }
   });
   ```
   ※ シンプルに `e.target === globalNav` のみで実装してOK（ulやliではなくnavの背景部分をタップした場合）

2. **ESCキーで閉じる**
   ```js
   document.addEventListener('keydown', (e) => {
     if (e.key === 'Escape' && globalNav.classList.contains('open')) {
       closeMenu();
     }
   });
   ```

3. **closeMenu() 関数を共通化** — 既存の閉じる処理（classList.remove等）を関数化して使い回す

## 分担
| 役割 | 担当 |
|------|------|
| Engineer 1 | layout.css |
| Engineer 2 | main.js |

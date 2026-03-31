# スマホ版レイアウト修正

## 概要
メニューページ（ドリンク・フード）と料金ページ（チャージ）のモバイルレイアウトを縦並びに修正。

## 設計・方針
グリッドがインラインstyleで書かれているためモバイル用CSSが効いていない。
HTMLにクラスを追加しCSSのメディアクエリを有効化する。

- Engineer 1: menu/index.html + menu.css
- Engineer 2: price/index.html + price.css

## 詳細

### Engineer 1: メニューページ

**menu/index.html**
1. ドリンクgridの `<div style="display:grid; grid-template-columns:1fr 1fr;...">` に `class="menu-drink-grid"` を追加（インラインstyleは残してよい）
2. フードgridの同様の div に `class="menu-food-grid"` を追加

**menu.css**
- `@media (max-width: 768px)` 内の `.menu-drink-grid, .menu-food-grid` に `grid-template-columns: 1fr !important` が既にあるか確認し、なければ追加
- フードセクションはデスクトップが「左:テキスト / 右:画像」のため、モバイルで画像を上に出す:
  `.menu-food-grid img { order: -1; }`
- 画像の高さをモバイルで適切に調整: `.menu-drink-grid img, .menu-food-grid img { height: 240px; width: 100%; object-fit: cover; }`

### Engineer 2: 料金ページ

**price/index.html**
- チャージgridの `<div style="display:grid; grid-template-columns:repeat(3,1fr);...">` に `class="charge-grid"` を追加

**price.css**
- `@media (max-width: 768px)` 内に以下を追加:
  `.charge-grid { grid-template-columns: 1fr !important; }`

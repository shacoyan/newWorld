# 設計書: こんまに LP ロゴ拡大・アイコンSVG化

## 概要
- `lp.html`: 機能カードの絵文字をインラインSVGに置換
- `style.css`: .lp-logo のサイズを 120px → 160px に変更

## 設計・方針
- 外部ライブラリなし。インラインSVGで完結
- アイコンサイズ: 48×48px（viewBox="0 0 48 48"）
- ブランドカラー使用: #f472b6（ピンク）, #a78bfa（パープル）, #60c0f8（ブルー）

## 詳細

### lp.html — 各 .lp-feature-icon の中身を置換
各カードの `<div class="lp-feature-icon">` 内の絵文字をSVGに差し替える。

### style.css — サイズ変更箇所
```
.lp-logo: width/height 120px → 160px
@media (max-width: 400px) .lp-logo: 96px → 130px
.lp-feature-icon: font-size 削除、SVG向けに display:flex; justify-content:center; を追加
```

## 分担
- Engineer 1: lp.html のSVG差し替え
- Engineer 2: style.css のロゴサイズ・アイコンスタイル修正

*作成: 2026-03-31*

# 低優先度修正・ページ別対応

## 概要
レビュー指摘の残り修正を2フェーズで対応する。

## Phase 1（並列）
- Engineer 1: news / privacy / contact の修正
- Engineer 2: index / menu / price / about / access / faq の低優先度修正

## Phase 2（Phase 1完了後）
- Engineer 3 & 4: 全ページのパンくず構造変更（HTML + CSS）

---

## Engineer 1 担当: news / privacy / contact

### news/index.html
- og:description 追加: 「シーシャカフェ吸暮からのお知らせ・最新情報をお届けします。」
- twitter:card 追加: `summary_large_image`
- twitter:image 追加: `https://shisha-souq.com/images/og-image.jpg`
- og:site_name 追加: `シーシャカフェ吸暮`
- ヘッダーロゴalt: `シーシャカフェ吸暮` に統一
- フッターロゴalt: `シーシャカフェ吸暮` に統一
- フッター住所: `大阪市中央区 天満橋駅徒歩3分` → `〒540-0036 大阪府大阪市中央区船越町１丁目５−８ STBLD 601` に変更

### privacy/index.html
- ヘッダーロゴ: テキスト → `<a href="./" class="site-logo"><img src="images/logo.png" alt="シーシャカフェ吸暮" style="height:40px;width:auto;vertical-align:middle;"></a>` に差し替え
- フッターロゴalt: `シーシャカフェ吸暮` に統一
- フッター住所: 完全住所に統一
- og:site_name 追加
- twitter:image 追加
- 8条（問い合わせ窓口）の住所を `〒540-0036 大阪府大阪市中央区船越町１丁目５−８ STBLD 601` に修正

### contact/index.html
- meta description: 「お電話またはSNSのDMよりお気軽にご連絡ください。お電話でのお問い合わせもお待ちしております。」に変更
- og:site_name 追加
- twitter:image 追加
- ヘッダー/フッターロゴalt: `シーシャカフェ吸暮` に統一
- フッター住所: 完全住所に統一
- aria-expanded="false" をハンバーガーボタンに追加

---

## Engineer 2 担当: index / menu / price / about / access / faq

各ページで以下を対応（既に設定済みの項目はスキップ）:
- og:site_name 未設定ページに追加: `シーシャカフェ吸暮`
- twitter:image 未設定ページに追加: `https://shisha-souq.com/images/og-image.jpg`
- ハンバーガーボタンに `aria-expanded="false"` 追加（index は設定済みのためスキップ）
- ヘッダーロゴalt: `シーシャカフェ吸暮` に統一（全ページ）
- フッターロゴalt: `シーシャカフェ吸暮` に統一（全ページ）
- フッター住所が省略されているページ: `〒540-0036 大阪府大阪市中央区船越町１丁目５−８ STBLD 601` に統一

---

## Phase 2: パンくず修正（Engineer 3 & 4）

### CSS対応
- `shisha-souq/css/` 配下のパンくず関連スタイルを確認
- `<ol><li>` 構造に合わせてCSSを調整
- 既存の見た目（区切り文字 `/`、リンクスタイル）を維持すること

### HTML対応（全ページ）
現在の構造:
```html
<nav class="breadcrumb" aria-label="パンくずリスト">
  <a href="./">HOME</a><span>/</span><span>ページ名</span>
</nav>
```

変更後の構造:
```html
<nav class="breadcrumb" aria-label="パンくずリスト">
  <ol>
    <li><a href="./">HOME</a></li>
    <li><span>ページ名</span></li>
  </ol>
</nav>
```
- privacy ページにはパンくずが存在しないため新規追加すること
- 区切り文字（`/`）はCSSで `::before` または `::after` を使って表現すること

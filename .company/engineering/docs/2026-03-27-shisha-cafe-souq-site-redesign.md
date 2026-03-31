# Shisha Cafe Souq ウェブサイトリニューアル設計書

- **プロジェクト名**: Shisha Cafe Souq 公式サイトリニューアル
- **作成者**: Tech Lead (claude-opus-4-6)
- **作成日**: 2026-03-27
- **ステータス**: 設計完了 → 実装待ち

---

## 概要

大阪・天満橋のシーシャカフェ「Shisha Cafe Souq」の公式サイトをフルリニューアルする。現サイトはナビゲーションが貧弱（HOMEとSHISHA SHOPの2項目のみ）でSEO最適化が不十分。本リニューアルでは、SEO対策を徹底し、ユーザー導線を改善した多ページ構成のモダンなサイトを構築する。

### 技術制約
- HTMLのみで実装（純粋なHTML/CSS/JavaScript）
- 外部CSSライブラリ不使用（Bootstrap、Tailwind等なし）
- フレームワーク不使用

---

## 1. サイト構造（全ページ一覧）

### 1.1 サイトマップ

```
/
├── index.html                 ... トップページ
├── menu/
│   └── index.html             ... メニュー（シーシャ・ドリンク・フード）
├── price/
│   └── index.html             ... 料金システム
├── about/
│   └── index.html             ... 店舗紹介・コンセプト
├── access/
│   └── index.html             ... アクセス・地図
├── news/
│   └── index.html             ... お知らせ・新着情報
├── faq/
│   └── index.html             ... よくある質問
├── contact/
│   └── index.html             ... お問い合わせ
├── privacy/
│   └── index.html             ... プライバシーポリシー
├── css/
│   ├── reset.css              ... リセットCSS
│   ├── variables.css           ... カスタムプロパティ定義
│   ├── base.css               ... ベーススタイル
│   ├── layout.css             ... レイアウト（ヘッダー、フッター、グリッド）
│   ├── components.css          ... コンポーネント（ボタン、カード等）
│   └── pages/
│       ├── home.css           ... トップページ固有
│       ├── menu.css           ... メニューページ固有
│       ├── price.css          ... 料金ページ固有
│       ├── about.css          ... 店舗紹介ページ固有
│       ├── access.css         ... アクセスページ固有
│       ├── news.css           ... お知らせページ固有
│       ├── faq.css            ... FAQページ固有
│       └── contact.css        ... お問い合わせページ固有
├── js/
│   ├── main.js                ... 共通JS（ナビ、スムーズスクロール等）
│   ├── menu-filter.js         ... メニューフィルタリング
│   └── faq-accordion.js       ... FAQアコーディオン
├── images/                     ... 画像ディレクトリ（後述）
├── sitemap.xml                ... XMLサイトマップ
└── robots.txt                 ... robots.txt
```

### 1.2 ページ一覧

| # | ページ | URL | title属性 | 役割 |
|---|--------|-----|-----------|------|
| 1 | トップ | `/` | Shisha Cafe Souq（スーク） - 大阪天満橋のシーシャカフェ | ファーストビュー、店舗概要、導線 |
| 2 | メニュー | `/menu/` | メニュー - シーシャ100種以上・ドリンク・フード｜Shisha Cafe Souq | 全メニュー一覧（フレーバー、ドリンク、フード） |
| 3 | 料金 | `/price/` | 料金システム - シーシャカフェの利用料金｜Shisha Cafe Souq | 入場料、シーシャ料金、セット料金 |
| 4 | 店舗紹介 | `/about/` | 店舗紹介・コンセプト｜Shisha Cafe Souq 大阪天満橋 | コンセプト、店内写真、設備紹介 |
| 5 | アクセス | `/access/` | アクセス・地図 - 天満橋駅徒歩3分｜Shisha Cafe Souq | 地図、交通案内、駐車場情報 |
| 6 | お知らせ | `/news/` | お知らせ・新着情報｜Shisha Cafe Souq | イベント、新フレーバー、営業情報 |
| 7 | FAQ | `/faq/` | よくある質問（FAQ）｜Shisha Cafe Souq | 初心者向け説明、利用ルール |
| 8 | お問い合わせ | `/contact/` | お問い合わせ｜Shisha Cafe Souq 大阪天満橋 | 電話、メール、予約導線 |
| 9 | プライバシーポリシー | `/privacy/` | プライバシーポリシー｜Shisha Cafe Souq | 個人情報取り扱い |

### 1.3 グローバルナビゲーション構成

```
HOME | メニュー | 料金 | 店舗紹介 | アクセス | お知らせ | FAQ | お問い合わせ
```

モバイルではハンバーガーメニューに格納。

---

## 2. SEO戦略

### 2.1 ターゲットキーワード一覧

#### メインキーワード（検索ボリューム順）
| 優先度 | キーワード | 想定月間検索数 | ターゲットページ |
|--------|-----------|---------------|----------------|
| ★★★ | シーシャ 大阪 | 高 | トップ、メニュー |
| ★★★ | シーシャカフェ 大阪 | 高 | トップ |
| ★★★ | 水たばこ 大阪 | 中 | トップ、FAQ |
| ★★★ | シーシャ 天満橋 | 中 | トップ、アクセス |
| ★★☆ | シーシャ 料金 大阪 | 中 | 料金 |
| ★★☆ | シーシャ 初心者 | 中 | FAQ、メニュー |
| ★★☆ | シーシャ フレーバー おすすめ | 中 | メニュー |
| ★★☆ | シーシャラウンジ 大阪 | 中 | トップ、店舗紹介 |
| ★☆☆ | シーシャ リモートワーク | 低 | 店舗紹介 |
| ★☆☆ | シーシャ デート 大阪 | 低 | 店舗紹介 |
| ★☆☆ | 天満橋 カフェ 夜 | 低 | トップ |
| ★☆☆ | シーシャ Wi-Fi 大阪 | 低 | 店舗紹介 |

#### ロングテールキーワード
- シーシャ 大阪 天満橋 おすすめ
- シーシャカフェ 大阪 安い
- シーシャ 一人 大阪
- 水たばこ カフェ 天満橋
- シーシャ 深夜営業 大阪
- シーシャ フレーバー 種類

### 2.2 各ページの meta title / meta description

#### トップページ（index.html）
```html
<title>Shisha Cafe Souq（スーク）| 大阪・天満橋のシーシャカフェ｜フレーバー100種以上</title>
<meta name="description" content="大阪・天満橋駅徒歩3分のシーシャカフェSouq（スーク）。100種類以上のフレーバーをご用意。13時〜深夜29時営業。Wi-Fi完備でリモートワークにも。一人でもグループでもくつろげる空間。">
```

#### メニューページ（menu/index.html）
```html
<title>メニュー｜シーシャ100種以上・ドリンク・フード｜Shisha Cafe Souq 大阪天満橋</title>
<meta name="description" content="Shisha Cafe Souqのメニュー一覧。100種類以上のシーシャフレーバー、クラフトドリンク、軽食をご用意。シーシャ¥1,870〜。フルーツ系・ミント系・スパイス系など多彩なラインナップ。">
```

#### 料金ページ（price/index.html）
```html
<title>料金システム｜シーシャカフェの利用料金｜Shisha Cafe Souq 大阪天満橋</title>
<meta name="description" content="Shisha Cafe Souqの料金案内。入場料¥550、シーシャ¥1,870〜¥3,520。ドリンク¥550〜、フード¥660〜。明朗会計で初めてでも安心。お得なセットメニューもご用意。">
```

#### 店舗紹介ページ（about/index.html）
```html
<title>店舗紹介・コンセプト｜Shisha Cafe Souq 大阪天満橋のシーシャラウンジ</title>
<meta name="description" content="Shisha Cafe Souqの店舗紹介。大阪天満橋の落ち着いた空間でシーシャを楽しめるカフェ＆ラウンジ。Wi-Fi完備、電源あり。リモートワークやデート、一人利用にも最適。">
```

#### アクセスページ（access/index.html）
```html
<title>アクセス・地図｜天満橋駅徒歩3分｜Shisha Cafe Souq 大阪</title>
<meta name="description" content="Shisha Cafe Souqへのアクセス方法。大阪メトロ谷町線・京阪本線 天満橋駅から徒歩3分。大阪市中央区。地図・最寄り駅からの道順をご案内。営業時間13:00〜29:00。">
```

#### お知らせページ（news/index.html）
```html
<title>お知らせ・新着情報｜Shisha Cafe Souq 大阪天満橋</title>
<meta name="description" content="Shisha Cafe Souqの最新情報。新フレーバー入荷、イベント情報、営業時間の変更など。大阪天満橋のシーシャカフェからのお知らせ一覧。">
```

#### FAQページ（faq/index.html）
```html
<title>よくある質問（FAQ）｜シーシャ初心者も安心｜Shisha Cafe Souq 大阪</title>
<meta name="description" content="Shisha Cafe Souqのよくある質問。シーシャ（水たばこ）とは？初めてでも大丈夫？料金は？予約は必要？年齢制限は？などの疑問にお答えします。">
```

#### お問い合わせページ（contact/index.html）
```html
<title>お問い合わせ｜Shisha Cafe Souq 大阪天満橋</title>
<meta name="description" content="Shisha Cafe Souqへのお問い合わせ。ご予約・ご質問はお電話（050-1563-5961）またはフォームから。大阪天満橋のシーシャカフェ。">
```

#### プライバシーポリシーページ（privacy/index.html）
```html
<title>プライバシーポリシー｜Shisha Cafe Souq</title>
<meta name="description" content="Shisha Cafe Souqのプライバシーポリシー。個人情報の取り扱いについて。">
```

### 2.3 構造化データ（JSON-LD）設計

#### 全ページ共通 - Organization
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Shisha Cafe Souq",
  "url": "https://shisha-cafe-souq.com",
  "logo": "https://shisha-cafe-souq.com/images/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+81-50-1563-5961",
    "contactType": "reservations",
    "availableLanguage": "Japanese"
  },
  "sameAs": [
    "https://www.instagram.com/shisha_cafe_souq/",
    "https://twitter.com/shisha_cafe_souq"
  ]
}
```

#### トップページ - LocalBusiness（ローカルSEO最重要）
```json
{
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  "name": "Shisha Cafe Souq（スーク）",
  "image": "https://shisha-cafe-souq.com/images/storefront.jpg",
  "url": "https://shisha-cafe-souq.com",
  "telephone": "+81-50-1563-5961",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "（番地をここに記載）",
    "addressLocality": "大阪市中央区",
    "addressRegion": "大阪府",
    "postalCode": "（郵便番号をここに記載）",
    "addressCountry": "JP"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "（緯度）",
    "longitude": "（経度）"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday", "Tuesday", "Wednesday", "Thursday",
      "Friday", "Saturday", "Sunday"
    ],
    "opens": "13:00",
    "closes": "05:00"
  },
  "priceRange": "¥1,000〜¥5,000",
  "servesCuisine": "カフェ・シーシャ",
  "menu": "https://shisha-cafe-souq.com/menu/",
  "acceptsReservations": "True",
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Wi-Fi", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "電源", "value": true }
  ]
}
```

#### メニューページ - Menu
```json
{
  "@context": "https://schema.org",
  "@type": "Menu",
  "name": "Shisha Cafe Souq メニュー",
  "hasMenuSection": [
    {
      "@type": "MenuSection",
      "name": "シーシャ",
      "hasMenuItem": [
        {
          "@type": "MenuItem",
          "name": "レギュラーシーシャ",
          "description": "定番フレーバーのシーシャ",
          "offers": {
            "@type": "Offer",
            "price": "1870",
            "priceCurrency": "JPY"
          }
        }
      ]
    },
    {
      "@type": "MenuSection",
      "name": "ドリンク",
      "hasMenuItem": [
        {
          "@type": "MenuItem",
          "name": "ソフトドリンク",
          "offers": {
            "@type": "Offer",
            "price": "550",
            "priceCurrency": "JPY"
          }
        }
      ]
    }
  ]
}
```

#### FAQページ - FAQPage
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "シーシャ（水たばこ）とは何ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "シーシャは水たばことも呼ばれ、フレーバーの付いたタバコの煙を水に通して吸うスタイルです。紙巻きたばこと比べて刺激が少なく、フルーティーな香りを楽しめます。"
      }
    },
    {
      "@type": "Question",
      "name": "初めてでも大丈夫ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "はい、初めての方も大歓迎です。スタッフが吸い方やフレーバー選びを丁寧にサポートいたします。初心者向けのマイルドなフレーバーもご用意しています。"
      }
    },
    {
      "@type": "Question",
      "name": "予約は必要ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "予約なしでもご来店いただけますが、週末や祝日は混み合うことがあるため、事前のご予約をおすすめします。お電話（050-1563-5961）にて承ります。"
      }
    },
    {
      "@type": "Question",
      "name": "年齢制限はありますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "シーシャ（水たばこ）はたばこ製品のため、20歳未満の方はご利用いただけません。ご入店時に年齢確認をさせていただく場合がございます。"
      }
    }
  ]
}
```

#### パンくずリスト - BreadcrumbList（全下層ページ共通パターン）
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "ホーム",
      "item": "https://shisha-cafe-souq.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "（ページ名）",
      "item": "https://shisha-cafe-souq.com/（ページURL）/"
    }
  ]
}
```

### 2.4 OGP設定

#### 全ページ共通テンプレート
```html
<meta property="og:site_name" content="Shisha Cafe Souq">
<meta property="og:locale" content="ja_JP">
<meta property="og:type" content="website">
<!-- ページ固有 -->
<meta property="og:title" content="（各ページのtitleと同じ）">
<meta property="og:description" content="（各ページのmeta descriptionと同じ）">
<meta property="og:url" content="（各ページの正規URL）">
<meta property="og:image" content="https://shisha-cafe-souq.com/images/ogp.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@shisha_cafe_souq">
```

### 2.5 その他SEO対策

#### canonical設定
全ページに `<link rel="canonical">` を設置。

#### 言語・地域指定
```html
<html lang="ja">
<meta name="geo.region" content="JP-27">
<meta name="geo.placename" content="大阪市中央区">
```

#### sitemap.xml
全ページのURLを記載。`lastmod`、`changefreq`、`priority`を適切に設定。

#### robots.txt
```
User-agent: *
Allow: /
Sitemap: https://shisha-cafe-souq.com/sitemap.xml
```

---

## 3. HTML/CSSアーキテクチャ

### 3.1 ファイル構成（再掲・詳細）

```
project-root/
├── index.html
├── menu/index.html
├── price/index.html
├── about/index.html
├── access/index.html
├── news/index.html
├── faq/index.html
├── contact/index.html
├── privacy/index.html
├── css/
│   ├── reset.css           ... Normalize/リセット
│   ├── variables.css        ... CSSカスタムプロパティ
│   ├── base.css            ... タイポグラフィ、ベーススタイル
│   ├── layout.css          ... ヘッダー、フッター、グリッドシステム
│   ├── components.css       ... ボタン、カード、バッジ等
│   └── pages/
│       ├── home.css
│       ├── menu.css
│       ├── price.css
│       ├── about.css
│       ├── access.css
│       ├── news.css
│       ├── faq.css
│       └── contact.css
├── js/
│   ├── main.js             ... ハンバーガーメニュー、スムーズスクロール、ヘッダー固定
│   ├── menu-filter.js       ... メニューカテゴリフィルタ
│   └── faq-accordion.js     ... FAQアコーディオン開閉
├── images/
│   ├── logo.svg
│   ├── logo-white.svg
│   ├── ogp.jpg             ... OGP画像(1200x630)
│   ├── favicon.ico
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   ├── hero/               ... ヒーロー画像
│   ├── menu/               ... メニュー関連画像
│   ├── about/              ... 店内写真
│   └── icons/              ... アイコンSVG
├── sitemap.xml
└── robots.txt
```

### 3.2 CSS設計方針

#### カスタムプロパティ（variables.css）
```css
:root {
  /* === カラーパレット === */
  /* メイン: ゴールド系（シーシャの温かみ・中東の雰囲気） */
  --color-primary: #C8963E;
  --color-primary-light: #D4AD6A;
  --color-primary-dark: #A67A2E;

  /* サブ: ダークネイビー（高級感・落ち着き） */
  --color-secondary: #1A1A2E;
  --color-secondary-light: #2D2D44;

  /* 背景 */
  --color-bg: #0F0F1A;
  --color-bg-light: #1A1A2E;
  --color-bg-card: #222238;

  /* テキスト */
  --color-text: #E8E8F0;
  --color-text-muted: #9999AA;
  --color-text-heading: #FFFFFF;

  /* アクセント */
  --color-accent: #E85D3A;

  /* === タイポグラフィ === */
  --font-primary: "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif;
  --font-heading: "Noto Serif JP", "Hiragino Mincho ProN", serif;
  --font-accent: "Cormorant Garamond", serif;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;

  --line-height-tight: 1.25;
  --line-height-normal: 1.6;
  --line-height-loose: 1.8;

  /* === スペーシング === */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;
  --space-4xl: 6rem;
  --space-section: 5rem;

  /* === レイアウト === */
  --container-max: 1200px;
  --container-narrow: 800px;
  --header-height: 72px;

  /* === ボーダー === */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  --border-color: rgba(200, 150, 62, 0.2);

  /* === シャドウ === */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px rgba(200, 150, 62, 0.15);

  /* === トランジション === */
  --transition-fast: 150ms ease;
  --transition-base: 300ms ease;
  --transition-slow: 500ms ease;

  /* === Z-index === */
  --z-header: 1000;
  --z-overlay: 900;
  --z-modal: 1100;
}
```

#### CSS設計ルール
1. **BEM風命名規則**: `.block__element--modifier` 形式を採用
2. **ユーティリティクラス禁止**: 各コンポーネントに専用スタイルを書く
3. **ネスト不使用**: CSS Nestingは互換性を考慮して不使用（ただしメディアクエリのネストは可）
4. **単位**: `rem` を基本とする。`px` は border と box-shadow のみ
5. **カラー**: 直接のカラーコード記述禁止。必ずカスタムプロパティ経由

#### CSS読み込み順序（全ページ共通）
```html
<link rel="stylesheet" href="/css/reset.css">
<link rel="stylesheet" href="/css/variables.css">
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/css/layout.css">
<link rel="stylesheet" href="/css/components.css">
<link rel="stylesheet" href="/css/pages/（ページ名）.css">
```

### 3.3 レスポンシブ対応方針

#### ブレークポイント
```css
/* モバイルファースト */
/* デフォルト: 〜767px（モバイル） */
@media (min-width: 768px)  { /* タブレット */ }
@media (min-width: 1024px) { /* デスクトップ */ }
@media (min-width: 1280px) { /* ワイド */ }
```

#### レスポンシブ方針
- **モバイルファースト**: ベーススタイルはモバイル用。上位に拡張
- **画像**: `<picture>` + `srcset` でレスポンシブ画像。WebP対応
- **ナビゲーション**: 768px未満でハンバーガーメニュー
- **グリッド**: CSS Gridベース。モバイルは1列、タブレットは2列、デスクトップは3〜4列
- **フォントサイズ**: `clamp()` を活用して滑らかにスケーリング
- **タッチ対応**: ボタン最小サイズ44x44px

### 3.4 HTMLテンプレート構造

#### 全ページ共通 `<head>` テンプレート
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>（ページタイトル）</title>
  <meta name="description" content="（ページ説明）">
  <meta name="keywords" content="シーシャ,大阪,天満橋,水たばこ,シーシャカフェ,Souq">
  <meta name="geo.region" content="JP-27">
  <meta name="geo.placename" content="大阪市中央区">
  <link rel="canonical" href="（正規URL）">

  <!-- OGP -->
  <meta property="og:site_name" content="Shisha Cafe Souq">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:type" content="website">
  <meta property="og:title" content="（ページタイトル）">
  <meta property="og:description" content="（ページ説明）">
  <meta property="og:url" content="（正規URL）">
  <meta property="og:image" content="https://shisha-cafe-souq.com/images/ogp.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">

  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="/images/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">
  <link rel="apple-touch-icon" href="/images/apple-touch-icon.png">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;700&display=swap" rel="stylesheet">

  <!-- CSS -->
  <link rel="stylesheet" href="/css/reset.css">
  <link rel="stylesheet" href="/css/variables.css">
  <link rel="stylesheet" href="/css/base.css">
  <link rel="stylesheet" href="/css/layout.css">
  <link rel="stylesheet" href="/css/components.css">
  <link rel="stylesheet" href="/css/pages/（ページ名）.css">

  <!-- 構造化データ -->
  <script type="application/ld+json">
  （JSON-LDをここに記載）
  </script>
</head>
```

#### 全ページ共通 ヘッダー
```html
<header class="header" id="header">
  <div class="header__inner">
    <a href="/" class="header__logo">
      <img src="/images/logo.svg" alt="Shisha Cafe Souq" width="180" height="40">
    </a>
    <nav class="header__nav" id="global-nav" aria-label="メインナビゲーション">
      <ul class="header__nav-list">
        <li><a href="/" class="header__nav-link">HOME</a></li>
        <li><a href="/menu/" class="header__nav-link">メニュー</a></li>
        <li><a href="/price/" class="header__nav-link">料金</a></li>
        <li><a href="/about/" class="header__nav-link">店舗紹介</a></li>
        <li><a href="/access/" class="header__nav-link">アクセス</a></li>
        <li><a href="/news/" class="header__nav-link">お知らせ</a></li>
        <li><a href="/faq/" class="header__nav-link">FAQ</a></li>
        <li><a href="/contact/" class="header__nav-link header__nav-link--cta">お問い合わせ</a></li>
      </ul>
    </nav>
    <button class="header__hamburger" id="hamburger-btn" aria-label="メニューを開く" aria-expanded="false">
      <span class="header__hamburger-line"></span>
      <span class="header__hamburger-line"></span>
      <span class="header__hamburger-line"></span>
    </button>
  </div>
</header>
```

#### 全ページ共通 フッター
```html
<footer class="footer">
  <div class="footer__inner">
    <div class="footer__grid">
      <!-- ブランド情報 -->
      <div class="footer__brand">
        <img src="/images/logo-white.svg" alt="Shisha Cafe Souq" width="160" height="36" class="footer__logo">
        <p class="footer__tagline">大阪・天満橋のシーシャカフェ</p>
        <div class="footer__sns">
          <a href="#" aria-label="Instagram">（Instagramアイコン）</a>
          <a href="#" aria-label="X（Twitter）">（Xアイコン）</a>
        </div>
      </div>

      <!-- ナビゲーション -->
      <div class="footer__nav">
        <h3 class="footer__heading">ページ</h3>
        <ul class="footer__nav-list">
          <li><a href="/">HOME</a></li>
          <li><a href="/menu/">メニュー</a></li>
          <li><a href="/price/">料金</a></li>
          <li><a href="/about/">店舗紹介</a></li>
          <li><a href="/access/">アクセス</a></li>
          <li><a href="/news/">お知らせ</a></li>
          <li><a href="/faq/">FAQ</a></li>
          <li><a href="/contact/">お問い合わせ</a></li>
        </ul>
      </div>

      <!-- 店舗情報 -->
      <div class="footer__info">
        <h3 class="footer__heading">店舗情報</h3>
        <address class="footer__address">
          <p>〒（郵便番号） 大阪市中央区（住所）</p>
          <p>天満橋駅 徒歩3分</p>
          <p><a href="tel:05015635961">050-1563-5961</a></p>
          <p>営業時間: 13:00〜29:00（毎日）</p>
        </address>
      </div>
    </div>

    <div class="footer__bottom">
      <a href="/privacy/" class="footer__privacy">プライバシーポリシー</a>
      <p class="footer__copyright">&copy; 2026 Shisha Cafe Souq. All Rights Reserved.</p>
    </div>
  </div>
</footer>
```

---

## 4. 各ページの詳細設計

---

### 4.1 トップページ（index.html）

#### セクション構成

| # | セクション | 要素 | 備考 |
|---|-----------|------|------|
| 1 | ヒーロー | フルスクリーン背景画像 + キャッチコピー + CTAボタン | 視差効果あり |
| 2 | コンセプト | 短い紹介文 + 写真 | 2カラム |
| 3 | 特徴 | 3つのアイコン付き特徴カード | フレーバー100種/深夜営業/Wi-Fi完備 |
| 4 | メニューピックアップ | おすすめシーシャ3〜4種 + ドリンク | メニューページへの導線 |
| 5 | 料金案内 | 料金概要テーブル | 料金ページへの導線 |
| 6 | お知らせ | 最新3件のニュース | お知らせページへの導線 |
| 7 | Instagram埋め込み | SNS連携エリア | 省略も可 |
| 8 | アクセス概要 | Google Maps埋め込み + 住所 | アクセスページへの導線 |
| 9 | CTA | 予約・問い合わせ促進バナー | 電話番号 + お問い合わせリンク |

#### ヒーローセクション詳細
```html
<section class="hero">
  <div class="hero__bg">
    <picture>
      <source srcset="/images/hero/hero-desktop.webp" media="(min-width: 1024px)" type="image/webp">
      <source srcset="/images/hero/hero-tablet.webp" media="(min-width: 768px)" type="image/webp">
      <source srcset="/images/hero/hero-mobile.webp" type="image/webp">
      <img src="/images/hero/hero-mobile.jpg" alt="Shisha Cafe Souqの店内" width="1920" height="1080" loading="eager">
    </picture>
  </div>
  <div class="hero__content">
    <p class="hero__sub">Shisha Cafe</p>
    <h1 class="hero__title">Souq</h1>
    <p class="hero__tagline">100種以上のフレーバーと、くつろぎの空間。<br>大阪・天満橋のシーシャカフェ。</p>
    <div class="hero__actions">
      <a href="/menu/" class="btn btn--primary">メニューを見る</a>
      <a href="/contact/" class="btn btn--outline">お問い合わせ</a>
    </div>
    <div class="hero__info">
      <span>13:00〜29:00</span>
      <span>天満橋駅 徒歩3分</span>
    </div>
  </div>
</section>
```

#### SEOポイント
- h1にブランド名を含める
- ヒーロー画像はWebP + fallback jpg、`loading="eager"`
- LocalBusiness構造化データをこのページに配置
- 主要キーワードをh1、h2、本文に自然に含める

---

### 4.2 メニューページ（menu/index.html）

#### セクション構成

| # | セクション | 内容 |
|---|-----------|------|
| 1 | パンくず | HOME > メニュー |
| 2 | ページヘッダー | タイトル + リード文 |
| 3 | カテゴリフィルター | ボタン: すべて / シーシャ / ドリンク / フード |
| 4 | シーシャメニュー | カテゴリ別カード（フルーツ系、ミント系、スパイス系、ミックス系、プレミアム） |
| 5 | ドリンクメニュー | ソフトドリンク、アルコール |
| 6 | フードメニュー | 軽食一覧 |
| 7 | CTA | 料金ページへの導線 |

#### メニューカード構造
```html
<article class="menu-card">
  <div class="menu-card__image">
    <img src="/images/menu/flavor-name.webp" alt="ダブルアップル" width="300" height="200" loading="lazy">
  </div>
  <div class="menu-card__body">
    <h3 class="menu-card__name">ダブルアップル</h3>
    <span class="menu-card__badge">人気No.1</span>
    <p class="menu-card__desc">伝統的なアニス風味のシーシャ。初心者にもおすすめ。</p>
    <p class="menu-card__price">¥1,870</p>
  </div>
</article>
```

#### JSフィルタリング（menu-filter.js）
- `data-category` 属性によるフィルタリング
- CSS `display` の切り替えとフェードアニメーション
- URLハッシュ対応（`/menu/#drink` で直接カテゴリ表示）

#### SEOポイント
- Menu構造化データ配置
- 各フレーバーの説明文にキーワードを含める
- 画像altを正確に記述
- h2でカテゴリ名（「シーシャメニュー」「ドリンクメニュー」等）

---

### 4.3 料金ページ（price/index.html）

#### セクション構成

| # | セクション | 内容 |
|---|-----------|------|
| 1 | パンくず | HOME > 料金 |
| 2 | ページヘッダー | タイトル + 「明朗会計で安心」のリード文 |
| 3 | 入場料 | 入場料¥550の説明 |
| 4 | シーシャ料金 | ランク別料金テーブル（¥1,870〜¥3,520） |
| 5 | ドリンク料金 | 料金一覧 |
| 6 | フード料金 | 料金一覧 |
| 7 | セット・お得情報 | セット割引など（あれば） |
| 8 | 注意事項 | 支払い方法、税込表記等 |
| 9 | CTA | お問い合わせへの導線 |

#### 料金テーブル構造
```html
<div class="price-table">
  <table>
    <caption class="sr-only">シーシャ料金一覧</caption>
    <thead>
      <tr>
        <th scope="col">カテゴリ</th>
        <th scope="col">料金（税込）</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>入場料</td>
        <td>¥550</td>
      </tr>
      <tr>
        <td>レギュラーシーシャ</td>
        <td>¥1,870</td>
      </tr>
      <tr>
        <td>プレミアムシーシャ</td>
        <td>¥2,750</td>
      </tr>
      <tr>
        <td>スペシャルシーシャ</td>
        <td>¥3,520</td>
      </tr>
    </tbody>
  </table>
</div>
```

#### SEOポイント
- 料金を明確にテーブルで構造化
- 「シーシャ 料金 大阪」等のキーワードを見出しに含める
- 初心者向けの「まず何を頼めばいい？」的な案内を追加

---

### 4.4 店舗紹介ページ（about/index.html）

#### セクション構成

| # | セクション | 内容 |
|---|-----------|------|
| 1 | パンくず | HOME > 店舗紹介 |
| 2 | ページヘッダー | タイトル + コンセプトコピー |
| 3 | コンセプト | 店のストーリー・理念 |
| 4 | 店内ギャラリー | 店内写真（CSS Grid 3〜4枚） |
| 5 | 設備・サービス | Wi-Fi / 電源 / リモートワーク対応 / BGM等 |
| 6 | シーン提案 | 「こんな方におすすめ」（一人/デート/友人/仕事） |
| 7 | スタッフ紹介 | （任意）簡単な紹介 |
| 8 | CTA | アクセス・お問い合わせへの導線 |

#### SEOポイント
- 「シーシャラウンジ 大阪」「シーシャ リモートワーク」キーワード対応
- 店内写真altに「大阪天満橋シーシャカフェSouqの店内」等を記述
- 設備情報を明確にリスト化

---

### 4.5 アクセスページ（access/index.html）

#### セクション構成

| # | セクション | 内容 |
|---|-----------|------|
| 1 | パンくず | HOME > アクセス |
| 2 | ページヘッダー | タイトル |
| 3 | 地図 | Google Maps iframe埋め込み |
| 4 | 住所・基本情報 | 住所、電話番号、営業時間 |
| 5 | 交通案内 | 最寄り駅からの道順（テキスト + 写真） |
| 6 | 周辺情報 | 駐車場情報、ランドマーク |
| 7 | CTA | 電話・お問い合わせボタン |

#### 地図埋め込み
```html
<div class="access-map">
  <iframe
    src="https://www.google.com/maps/embed?pb=（埋め込みコード）"
    width="100%"
    height="450"
    style="border:0;"
    allowfullscreen=""
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"
    title="Shisha Cafe Souqの所在地"
  ></iframe>
</div>
```

#### SEOポイント
- ローカルSEO最重要ページ
- 住所を`<address>`タグで明示
- 「天満橋駅徒歩3分」を本文に複数回自然に含める
- 構造化データのgeo座標を正確に記載

---

### 4.6 お知らせページ（news/index.html）

#### セクション構成

| # | セクション | 内容 |
|---|-----------|------|
| 1 | パンくず | HOME > お知らせ |
| 2 | ページヘッダー | タイトル |
| 3 | ニュース一覧 | 日付 + カテゴリタグ + タイトル + 概要 |

#### ニュースアイテム構造
```html
<article class="news-item">
  <time class="news-item__date" datetime="2026-03-27">2026.03.27</time>
  <span class="news-item__tag news-item__tag--info">お知らせ</span>
  <h2 class="news-item__title">新フレーバー入荷のお知らせ</h2>
  <p class="news-item__excerpt">春限定のフレーバー3種が新たに仲間入り...</p>
</article>
```

#### カテゴリタグ種類
- お知らせ（info）
- イベント（event）
- 新メニュー（menu）
- 営業情報（hours）

#### SEOポイント
- `<time datetime="">` で日付を正しくマークアップ
- 定期的な更新がSEOに有効（月2回以上の更新推奨）

---

### 4.7 FAQページ（faq/index.html）

#### セクション構成

| # | セクション | 内容 |
|---|-----------|------|
| 1 | パンくず | HOME > FAQ |
| 2 | ページヘッダー | タイトル + 「初めての方もお気軽に」リード文 |
| 3 | FAQ一覧 | アコーディオン形式のQ&A |

#### FAQカテゴリと質問

**シーシャについて**
1. シーシャ（水たばこ）とは何ですか？
2. 初めてでも大丈夫ですか？
3. シーシャは体に悪いですか？紙巻きたばことの違いは？
4. フレーバーはどう選べばいいですか？
5. 1回のシーシャはどのくらい楽しめますか？

**ご利用について**
6. 年齢制限はありますか？
7. 予約は必要ですか？
8. 一人でも入れますか？
9. 営業時間を教えてください。
10. 支払い方法は？

**設備・サービスについて**
11. Wi-Fiはありますか？
12. 電源（コンセント）はありますか？
13. リモートワークはできますか？
14. 席の種類を教えてください。

**料金について**
15. 料金システムを教えてください。
16. 入場料だけで入ることはできますか？

#### アコーディオン構造
```html
<div class="faq-list">
  <details class="faq-item">
    <summary class="faq-item__question">
      <span class="faq-item__icon">Q</span>
      シーシャ（水たばこ）とは何ですか？
    </summary>
    <div class="faq-item__answer">
      <p>シーシャは水たばことも呼ばれ、フレーバーの付いたタバコの煙を水に通して吸うスタイルです。紙巻きたばこと比べて刺激が少なく、フルーティーな香りを楽しめます。中東発祥の文化で、リラックスしたひとときを過ごすのに最適です。</p>
    </div>
  </details>
</div>
```

#### JSアコーディオン（faq-accordion.js）
- `<details>` + `<summary>` をベースに使用（JSなしでも動作）
- JSでアニメーション（スムーズな開閉）とアクセシビリティ強化を追加
- 複数同時展開を許可（排他制御なし）

#### SEOポイント
- FAQPage構造化データ（Google検索結果にリッチリザルト表示）
- 「シーシャ 初心者」「シーシャとは」等のキーワードを回答に含める
- `<details>/<summary>` でHTMLセマンティクス確保

---

### 4.8 お問い合わせページ（contact/index.html）

#### セクション構成

| # | セクション | 内容 |
|---|-----------|------|
| 1 | パンくず | HOME > お問い合わせ |
| 2 | ページヘッダー | タイトル |
| 3 | 電話問い合わせ | 電話番号（タップで発信） + 受付時間 |
| 4 | コンタクトフォーム | 名前 / メール / 電話 / 種別 / メッセージ |
| 5 | SNS | Instagram、X(Twitter)リンク |
| 6 | 店舗情報 | 住所・営業時間（サマリー） |

#### フォーム構造
```html
<form class="contact-form" action="#" method="post">
  <div class="contact-form__group">
    <label for="name" class="contact-form__label">お名前 <span class="required">必須</span></label>
    <input type="text" id="name" name="name" required class="contact-form__input" autocomplete="name">
  </div>
  <div class="contact-form__group">
    <label for="email" class="contact-form__label">メールアドレス <span class="required">必須</span></label>
    <input type="email" id="email" name="email" required class="contact-form__input" autocomplete="email">
  </div>
  <div class="contact-form__group">
    <label for="tel" class="contact-form__label">電話番号</label>
    <input type="tel" id="tel" name="tel" class="contact-form__input" autocomplete="tel">
  </div>
  <div class="contact-form__group">
    <label for="subject" class="contact-form__label">お問い合わせ種別 <span class="required">必須</span></label>
    <select id="subject" name="subject" required class="contact-form__select">
      <option value="">選択してください</option>
      <option value="reservation">ご予約</option>
      <option value="question">ご質問</option>
      <option value="event">イベント・貸切</option>
      <option value="other">その他</option>
    </select>
  </div>
  <div class="contact-form__group">
    <label for="message" class="contact-form__label">メッセージ <span class="required">必須</span></label>
    <textarea id="message" name="message" rows="6" required class="contact-form__textarea"></textarea>
  </div>
  <div class="contact-form__submit">
    <button type="submit" class="btn btn--primary btn--large">送信する</button>
  </div>
</form>
```

注意: 静的サイトのため、フォーム送信はFormspree等の外部サービスまたは`mailto:`での対応を検討。

#### SEOポイント
- 電話番号を`<a href="tel:">`でマークアップ
- アクセシビリティ対応（label、required、autocomplete）

---

### 4.9 プライバシーポリシーページ（privacy/index.html）

#### セクション構成

| # | セクション | 内容 |
|---|-----------|------|
| 1 | パンくず | HOME > プライバシーポリシー |
| 2 | ページヘッダー | タイトル |
| 3 | ポリシー本文 | 個人情報取り扱い方針（標準的な項目） |

#### 必須項目
1. 個人情報の定義
2. 個人情報の収集方法
3. 収集する個人情報の種類
4. 個人情報の利用目的
5. 個人情報の第三者提供
6. 個人情報の管理
7. Cookie（クッキー）について
8. アクセス解析ツールについて（Google Analytics使用の場合）
9. お問い合わせ窓口
10. ポリシーの変更

---

## 5. コンポーネント設計

### 5.1 共通コンポーネント一覧

| コンポーネント | クラス名 | 用途 |
|--------------|---------|------|
| ボタン | `.btn` `.btn--primary` `.btn--outline` `.btn--large` | 各種CTA |
| カード | `.card` | メニュー、お知らせ等 |
| セクションタイトル | `.section-title` | 各セクションの見出し |
| パンくずリスト | `.breadcrumb` | 下層ページ共通 |
| ページヘッダー | `.page-header` | 下層ページ共通 |
| バッジ | `.badge` `.badge--popular` `.badge--new` | 人気・新着等 |
| テーブル | `.price-table` | 料金ページ |
| スクリーンリーダー専用 | `.sr-only` | アクセシビリティ |

### 5.2 ボタンデザイン仕様

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm) var(--space-xl);
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: 500;
  text-decoration: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 44px;
  min-width: 44px;
}

.btn--primary {
  background: var(--color-primary);
  color: var(--color-secondary);
  border: 2px solid var(--color-primary);
}

.btn--primary:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-glow);
}

.btn--outline {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.btn--outline:hover {
  background: var(--color-primary);
  color: var(--color-secondary);
}
```

---

## 6. JavaScript仕様

### 6.1 main.js
| 機能 | 詳細 |
|------|------|
| ハンバーガーメニュー | 768px未満でトグル表示。`aria-expanded`切り替え。オーバーレイ付き。ESCキーで閉じる。 |
| ヘッダースクロール制御 | スクロール時に背景色変更（透明→不透明）。スクロール方向で表示/非表示切り替え。 |
| スムーズスクロール | `scroll-behavior: smooth` + JS fallback |
| 現在ページハイライト | ナビのcurrent pageにactiveクラス付与 |

### 6.2 menu-filter.js
| 機能 | 詳細 |
|------|------|
| カテゴリフィルタ | ボタンクリックで`data-category`属性を基にフィルタリング |
| アニメーション | フェードイン/アウト（opacity + transform） |
| URLハッシュ連動 | `#shisha`, `#drink`, `#food` でダイレクトリンク対応 |

### 6.3 faq-accordion.js
| 機能 | 詳細 |
|------|------|
| スムーズ開閉 | `<details>` のアニメーション（max-height transition） |
| アクセシビリティ | キーボード操作対応 |

---

## 7. パフォーマンス方針

| 項目 | 対策 |
|------|------|
| 画像 | WebP形式優先。`<picture>`で fallback。`loading="lazy"`（ファーストビュー以外）。適切なwidth/height属性 |
| フォント | `font-display: swap`。preconnect。必要なウェイトのみ読み込み |
| CSS | ページ固有CSSの分離で不要な読み込み削減 |
| JS | `defer` 属性。DOM操作は `DOMContentLoaded` 後 |
| CLS対策 | 画像にwidth/height指定。フォントのFOUT対策 |

---

## 8. アクセシビリティ方針

| 項目 | 対策 |
|------|------|
| セマンティクス | `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` 適切に使用 |
| 見出し階層 | h1→h2→h3 の順で厳密に管理 |
| aria属性 | `aria-label`, `aria-expanded`, `aria-hidden` 適切に使用 |
| カラーコントラスト | WCAG 2.1 AA基準（4.5:1以上）を満たす |
| キーボード操作 | 全インタラクティブ要素がキーボードでアクセス可能 |
| フォーカス表示 | `:focus-visible` でフォーカスリングを明示 |
| alt属性 | 全画像に適切なalt属性 |
| フォーム | label紐付け、required属性、autocomplete属性 |

---

## 9. エンジニア分担

### 分担方針
- **Engineer 1**: 共通基盤 + 情報ページ系
- **Engineer 2**: ビジュアル重視ページ + インタラクティブ系
- 共通CSSとJSの結合は最終段階でTech Leadが調整

---

### Engineer 1 の担当

#### CSSファイル
| ファイル | 内容 |
|---------|------|
| `css/reset.css` | リセットCSS |
| `css/variables.css` | カスタムプロパティ定義 |
| `css/base.css` | タイポグラフィ、ベーススタイル |
| `css/layout.css` | ヘッダー、フッター、グリッドシステム、コンテナ |
| `css/components.css` | ボタン、カード、バッジ、パンくず、テーブル等の全共通コンポーネント |

#### JSファイル
| ファイル | 内容 |
|---------|------|
| `js/main.js` | ハンバーガーメニュー、ヘッダースクロール制御、スムーズスクロール、現在ページハイライト |

#### HTMLページ
| ページ | ページ固有CSS | 備考 |
|--------|-------------|------|
| `price/index.html` | `css/pages/price.css` | 料金テーブルの設計 |
| `access/index.html` | `css/pages/access.css` | Google Maps埋め込み、道順 |
| `news/index.html` | `css/pages/news.css` | ニュース一覧 |
| `contact/index.html` | `css/pages/contact.css` | フォーム設計 |
| `privacy/index.html` | （共通CSSで対応） | テキストページ |

#### その他
| ファイル | 内容 |
|---------|------|
| `sitemap.xml` | XMLサイトマップ作成 |
| `robots.txt` | robots.txt作成 |

#### Engineer 1 合計: CSS 5ファイル + JS 1ファイル + HTML 5ページ + sitemap.xml + robots.txt

---

### Engineer 2 の担当

#### HTMLページ
| ページ | ページ固有CSS | 備考 |
|--------|-------------|------|
| `index.html` | `css/pages/home.css` | ヒーロー、視差効果、セクション多数 |
| `menu/index.html` | `css/pages/menu.css` | メニューカード、フィルタリングUI |
| `about/index.html` | `css/pages/about.css` | ギャラリー、シーン提案カード |
| `faq/index.html` | `css/pages/faq.css` | アコーディオンUI |

#### JSファイル
| ファイル | 内容 |
|---------|------|
| `js/menu-filter.js` | メニューカテゴリフィルタリング |
| `js/faq-accordion.js` | FAQアコーディオン動作 |

#### Engineer 2 合計: CSS 4ファイル（pages/配下） + JS 2ファイル + HTML 4ページ

---

### 分担サマリー

```
Engineer 1（共通基盤 + 情報ページ系）
├── css/reset.css
├── css/variables.css
├── css/base.css
├── css/layout.css
├── css/components.css
├── css/pages/price.css
├── css/pages/access.css
├── css/pages/news.css
├── css/pages/contact.css
├── js/main.js
├── price/index.html
├── access/index.html
├── news/index.html
├── contact/index.html
├── privacy/index.html
├── sitemap.xml
└── robots.txt

Engineer 2（ビジュアル + インタラクティブ系）
├── css/pages/home.css
├── css/pages/menu.css
├── css/pages/about.css
├── css/pages/faq.css
├── js/menu-filter.js
├── js/faq-accordion.js
├── index.html
├── menu/index.html
├── about/index.html
└── faq/index.html
```

---

### 実装順序

#### Phase 1（並列開始）
- **Engineer 1**: `reset.css` → `variables.css` → `base.css` → `layout.css` → `components.css` → `main.js`
- **Engineer 2**: Phase 1 完了待ち（共通CSSに依存するため）

#### Phase 2（Engineer 1 の共通CSS完成後、並列実装）
- **Engineer 1**: `price/index.html` + `access/index.html` + `news/index.html` + `contact/index.html` + `privacy/index.html` + `sitemap.xml` + `robots.txt`
- **Engineer 2**: `index.html` + `menu/index.html` + `about/index.html` + `faq/index.html` + ページ固有CSS + JS

#### Phase 3（レビュー）
- **Engineer 3**: 全ファイルのコードレビュー
- **Tech Lead**: 最終承認

---

## 10. 画像アセット一覧（デザイナーへの依頼用）

| ファイル | サイズ | 用途 |
|---------|-------|------|
| `logo.svg` | - | ヘッダーロゴ（ダーク背景用） |
| `logo-white.svg` | - | フッターロゴ（白色版） |
| `ogp.jpg` | 1200x630 | OGP/SNSシェア画像 |
| `favicon.ico` | 16x16, 32x32 | ファビコン |
| `favicon-32x32.png` | 32x32 | PNG版ファビコン |
| `apple-touch-icon.png` | 180x180 | Apple Touch Icon |
| `hero/hero-desktop.webp` | 1920x1080 | ヒーロー画像（デスクトップ） |
| `hero/hero-tablet.webp` | 1024x768 | ヒーロー画像（タブレット） |
| `hero/hero-mobile.webp` | 768x1024 | ヒーロー画像（モバイル） |
| `hero/*.jpg` | 各サイズ | WebP非対応ブラウザ用fallback |
| `about/interior-*.webp` | 800x600 | 店内写真（3〜4枚） |
| `menu/*.webp` | 400x300 | メニュー写真（各フレーバー） |

---

## 付録: ドメインについて

本設計書ではドメインを `shisha-cafe-souq.com` と仮定している。実際のドメインが異なる場合は、以下の箇所を一括置換すること:
- 全HTMLの canonical URL
- 全HTMLの OGP URL
- 構造化データ内の全URL
- sitemap.xml 内の全URL

---

**設計書ここまで。**

**次のステップ**: Engineer 1 および Engineer 2 は本設計書に基づき、Phase 1 から実装を開始すること。不明点はTech Leadに確認。

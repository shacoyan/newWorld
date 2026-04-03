# shisha-souq Round 1: インラインスタイルのCSS化

## 概要
HTMLファイル内の大量のインラインスタイル（style属性）をCSSクラスに抽出し、保守性・可読性を向上させる。

## 設計・方針
- 既存CSSファイルの構造を維持（ページ固有CSSにクラスを追加）
- CSS変数を活用（既存のvariables.cssの値を参照）
- HTMLからstyle属性を除去し、セマンティックなクラス名に置換

## 詳細

### A チーム: index.html のインラインスタイル除去

**対象ファイル**: `shisha-souq/index.html` + `shisha-souq/css/pages/home.css`

以下のインラインスタイルをクラス化:

1. **L78** `style="height:40px;width:auto;vertical-align:middle;"` → `.header-logo-img` クラス
2. **L99** `style="background-image:url('images/hero-bg.jpg');background-size:cover;background-position:center;"` → `.hero` に直接CSSで指定（home.cssに追記）
3. **L117** `style="color:#fff;"` → `.section-title` は `.features-section` 内なので `.features-section .section-title { color: #fff; }` で対応
4. **L122,127,132** `style="width:120px;height:120px;object-fit:cover;border-radius:50%;display:block;margin:0 auto;"` → `.feature-icon-img` クラス
5. **L148,156,164** カード画像の `style="width:100%;height:200px;object-fit:cover;border-radius:..."` → `.card-img-top` クラス
6. **L198** `style="text-align:center;"` → `.text-center` ユーティリティクラス
7. **L230** 電話番号の `style="display:flex;align-items:center;gap:..."` → `.access-phone-actions` クラス
8. **L232** ボタンの `style="padding:...;font-size:..."` → `.btn-sm` クラス
9. **L236** `style="margin-top:1rem;"` → `.mt-md` ユーティリティクラス
10. **L244** `style="background:var(--color-bg-2);"` → 既存の `.section-alt` パターンで対応、もしくは `.section-bg-2` クラス
11. **L255** `style="text-align:center;"` → `.text-center` 再利用
12. **L264** フッターロゴ画像 `style="height:44px;..."` → `.footer-logo-img` クラス

**css/pages/home.css に追加すべきクラス:**
```css
/* hero背景をCSSに移動 */
.hero {
  background-image: url('../images/hero-bg.jpg');
  background-size: cover;
  background-position: center;
}

.features-section .section-title { color: var(--color-white); }

.feature-icon-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  margin: 0 auto;
}
```

**css/base.css に追加すべきユーティリティクラス:**
```css
.text-center { text-align: center; }
.mt-md { margin-top: var(--space-md); }
```

**css/components.css に追加:**
```css
.btn-sm {
  padding: var(--space-xs) var(--space-lg);
  font-size: var(--font-size-sm);
}

.card-img-top {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}
```

**css/layout.css に追加:**
```css
.header-logo-img {
  height: 40px;
  width: auto;
  vertical-align: middle;
}

.footer-logo-img {
  height: 44px;
  width: auto;
  display: block;
  margin-bottom: 8px;
}

.section-bg-2 { background: var(--color-bg-2); }
```

### B チーム: menu/index.html のインラインスタイル除去

**対象ファイル**: `shisha-souq/menu/index.html` + `shisha-souq/css/pages/menu.css`

1. **L40** ヘッダーロゴ → `.header-logo-img`（Aチームと共通）
2. **L113** ドリンクグリッド `style="display:grid;grid-template-columns:1fr 1fr;..."` → `.menu-content-grid` クラス
3. **L114** ドリンク画像 `style="width:100%;height:360px;..."` → `.menu-section-img` クラス
4. **L116** テキスト色 `style="color:var(--color-text-light);..."` → `.menu-section-desc` クラス
5. **L161** フードグリッド → `.menu-content-grid` 再利用
6. **L162** フード画像 → `.menu-section-img` 再利用
7. **L164** テキスト → `.menu-section-desc` 再利用
8. **L165-167** 駄菓子バナー → `.menu-highlight-banner` クラス
9. **L186** notice の margin → `.mt-3xl` ユーティリティ
10. **L197** フッターロゴ → `.footer-logo-img`（共通）

**css/pages/menu.css に追加:**
```css
.menu-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3xl);
  align-items: start;
  margin-bottom: var(--space-4xl);
}

.menu-section-img {
  width: 100%;
  height: 360px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.menu-section-desc {
  color: var(--color-text-light);
  margin-bottom: var(--space-2xl);
}

.menu-highlight-banner {
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  margin-bottom: var(--space-xl);
  font-weight: bold;
  text-align: center;
}

@media (max-width: 768px) {
  .menu-content-grid { grid-template-columns: 1fr; }
}
```

### C チーム: 残り全ページ（about, access, contact, faq, price, news, privacy）のインラインスタイル除去

同様のパターンで、各ページのheader/footerのロゴ画像スタイルを共通クラスに統一。
各ページ固有のインラインスタイルも確認して除去。

## 分担
- **Aチーム**: index.html + home.css + base.css + components.css + layout.css
- **Bチーム**: menu/index.html + menu.css
- **Cチーム**: 残り7ページのheader/footerインラインスタイル統一

# shisha-souq Round 2: JavaScript改善 + アクセシビリティ強化

## 概要
JS の効率化、アクセシビリティの向上、fade-in アニメーションのインラインCSS除去。

## 詳細

### A チーム: main.js 改善

1. **閉じるボタン動的生成の改善**: openMenu()で毎回createElement→removeするのは非効率。HTMLに静的に配置してdisplay切り替え、もしくはイベント委譲にする。
2. **ヘッダーシャドウの直接style操作をクラスに変更**: `header.style.boxShadow` → `header.classList.toggle('scrolled')` + CSS `.site-header.scrolled { box-shadow: ... }`
3. **fade-in の <style> タグをCSS化**: index.html の `<style>` 内にある `.fade-in` / `.fade-in.visible` を `css/base.css` に移動

### B チーム: menu-filter.js / faq-accordion.js 改善

1. **menu-filter.js**: filterBtnsの初期ボタンに `aria-pressed="true"` が設定されていない（HTMLでは`active`クラスのみ）→ HTMLに`aria-pressed`初期値を追加
2. **faq-accordion.js**: FAQの回答にid属性を付けて `aria-controls` で関連付け
3. **filter-btn にキーボードナビゲーション追加**: ボタングループ内のキーボード操作

## 分担
- **Aチーム**: main.js + base.css + layout.css + index.html（<style>除去）
- **Bチーム**: menu-filter.js + faq-accordion.js + menu/index.html + faq/index.html

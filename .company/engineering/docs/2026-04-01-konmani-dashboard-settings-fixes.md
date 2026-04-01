# 設計書: ダッシュボード・設定・ヘッダー改善

作成: 2026-04-01

## 変更一覧

| # | ファイル | 内容 |
|---|---------|------|
| 1 | Dashboard.jsx | 合計カードをヒーロー表示＋3サブカードに再構成 |
| 2 | Dashboard.jsx | 稼働情報の数値を四捨五入 |
| 3 | Dashboard.jsx | 品目別バックを新デザインに |
| 4 | Dashboard.jsx | 内訳比率バーの文字をバー上に移動 |
| 5 | Settings.jsx | 時刻単位設定を削除 |
| 6 | Settings.jsx | カレンダー設定デザイン改善 |
| 7 | Settings.jsx | 品目並び替え（↑↓ボタン）追加 |
| 8 | style.css | ダッシュボード用新CSSクラス |
| 9 | style.css | 品目並び替えボタンCSS |
| 10 | style.css | ロゴ上下2px余白 |

## Aチーム: style.css 新クラス追加

### 追加CSS（ファイル末尾）

```css
/* ===== ダッシュボード合計ヒーロー ===== */
.dash-total-hero {
  text-align: center;
  padding: 8px 0 16px;
}
.dash-total-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.dash-total-value {
  font-size: 40px;
  font-weight: 900;
  background: linear-gradient(135deg, #e879a0, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1.5px;
}
.dash-sub-cards {
  display: flex;
  gap: 8px;
}
.dash-sub-card {
  flex: 1;
  background: rgba(255,255,255,0.7);
  border: 1.5px solid rgba(236,131,192,0.2);
  border-radius: var(--radius-sm);
  padding: 10px 10px;
  text-align: center;
}
.dash-sub-label {
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 4px;
}
.dash-sub-value {
  font-size: 15px;
  font-weight: 800;
  color: var(--primary);
}

/* ===== 品目別バック ===== */
.dash-item-row {
  margin-bottom: 14px;
}
.dash-item-row:last-child { margin-bottom: 0; }
.dash-item-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 5px;
}
.dash-item-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}
.dash-item-stats {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
}
.dash-bar-bg {
  height: 8px;
  background: rgba(236,131,192,0.15);
  border-radius: 4px;
  overflow: hidden;
}
.dash-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #f472b6, #a78bfa);
  border-radius: 4px;
  transition: width 0.3s;
}
.dash-empty {
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
  padding: 12px 0;
}

/* ===== 内訳比率（バー上ラベル） ===== */
.ratio-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.ratio-label-wage {
  font-size: 12px;
  font-weight: 700;
  color: #e879a0;
}
.ratio-label-back {
  font-size: 12px;
  font-weight: 700;
  color: #a78bfa;
}
.ratio-bar-wrap-new {
  display: flex;
  border-radius: var(--radius-sm);
  overflow: hidden;
  height: 20px;
}
.ratio-bar-wage-new {
  background: linear-gradient(90deg, #f472b6, #e879a0);
  transition: width 0.3s;
}
.ratio-bar-back-new {
  background: linear-gradient(90deg, #a78bfa, #818cf8);
  transition: width 0.3s;
}

/* ===== 品目並び替えボタン ===== */
.btn-move {
  width: 28px;
  height: 28px;
  border: 1.5px solid rgba(236,131,192,0.3);
  border-radius: 8px;
  background: rgba(255,255,255,0.8);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
  font-family: inherit;
}
.btn-move:hover { background: var(--primary-bg); border-color: var(--primary); }
.btn-move:disabled { opacity: 0.3; cursor: default; }
```

### 既存変更

`.header-logo-img` に `padding: 2px 0` を追加:
```css
.header-logo-img {
  height: 52px;
  width: auto;
  object-fit: contain;
  padding: 2px 0;
}
```

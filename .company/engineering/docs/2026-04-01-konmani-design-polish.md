# 設計書: こんまに デザイン改善

作成: 2026-04-01

---

## 概要

3件のデザイン改善を実施する。

| # | 対象ファイル | 内容 |
|---|------------|------|
| 1 | style.css | 合計セクション新デザイン用CSS追加 |
| 2 | style.css | 選択日付エリアに余白追加 |
| 3 | style.css | ヘッダーロゴ最大化（52px） |
| 4 | Today.jsx | 合計セクションのJSX構造変更 |

---

## Aチーム担当

### A1: Engineer 1 — style.css

ファイル: `salary-app-react/src/style.css`

**変更1: ヘッダーロゴを最大化**

`.header-logo-img` の height を 48px → 52px に変更:
```css
.header-logo-img {
  height: 52px;
  width: auto;
  object-fit: contain;
}
```

**変更2: 選択日付エリアに余白を追加**

`.date-display-section` を以下に変更:
```css
.date-display-section {
  text-align: center;
  padding: 20px 16px 8px;
}

.date-display-section h2 {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
}
```

**変更3: 合計セクション新デザイン用CSSをファイル末尾に追加**

```css
/* ===== 合計セクション（リデザイン） ===== */
.summary-section {
  text-align: center;
}

.summary-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.summary-total {
  font-size: 44px;
  font-weight: 900;
  background: linear-gradient(135deg, #e879a0, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1.5px;
  line-height: 1;
  margin-bottom: 18px;
}

.summary-breakdown {
  display: flex;
  gap: 10px;
}

.summary-card {
  flex: 1;
  background: rgba(255,255,255,0.7);
  border: 1.5px solid rgba(236,131,192,0.2);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-card-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
}

.summary-card-value {
  font-size: 18px;
  font-weight: 800;
  color: var(--primary);
}

.summary-sub {
  margin-top: 14px;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
}
```

---

## Bチーム担当

### B1: Engineer 4 — Today.jsx

ファイル: `salary-app-react/src/pages/Today.jsx`

**合計セクションのJSX構造を変更**

現在の `<div className="section summary-section">` 内を以下に置き換える:

現在:
```jsx
<div className="section summary-section">
  <h3>{selectedDate === todayKey ? '本日の合計' : 'この日の合計'}</h3>
  <div className="summary-row">
    <span>時給分</span>
    <span>{formatMoney(daily.wage)}</span>
  </div>
  <div className="summary-row">
    <span>バック</span>
    <span>{formatMoney(daily.back)}</span>
  </div>
  <div className="summary-row">
    <span>合計</span>
    <span>{formatMoney(daily.total)}</span>
  </div>
  {daily.hours > 0 && (
    <div className="summary-row">
      <span>平均時給</span>
      <span>{formatMoney(daily.avgHourlyRate)}/h</span>
    </div>
  )}
</div>
```

変更後:
```jsx
<div className="section summary-section">
  <p className="summary-label">{selectedDate === todayKey ? '本日の合計' : 'この日の合計'}</p>
  <div className="summary-total">{formatMoney(daily.total)}</div>
  <div className="summary-breakdown">
    <div className="summary-card">
      <span className="summary-card-label">時給分</span>
      <span className="summary-card-value">{formatMoney(daily.wage)}</span>
    </div>
    <div className="summary-card">
      <span className="summary-card-label">バック</span>
      <span className="summary-card-value">{formatMoney(daily.back)}</span>
    </div>
  </div>
  {daily.hours > 0 && (
    <div className="summary-sub">
      平均時給 {formatMoney(daily.avgHourlyRate)}/h · {daily.hours.toFixed(1)}h稼働
    </div>
  )}
</div>
```

---

## 分担まとめ

| チーム | Engineer | ファイル |
|--------|---------|---------|
| A | 1 | style.css |
| B | 4 | Today.jsx |

*作成: 2026-04-01*

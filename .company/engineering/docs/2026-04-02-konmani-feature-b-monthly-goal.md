# 設計書: 機能B — 月収目標 & 達成率

## 概要

settings に `monthlyGoal` フィールドを追加し、ダッシュボードに「目標 ¥XX / 達成 ¥YY（ZZ%）」のプログレスバーを表示する。100% 達成時に視覚的フィードバック付与。

## データ構造の変更

**settings に `monthlyGoal` を追加（デフォルト 0 = 未設定）**

```json
{
  "settings": {
    "monthlyGoal": 300000
  }
}
```

`getDefaultSettings()` に `monthlyGoal: 0` を追加するのみ。既存データは `|| 0` で吸収。

## 変更ファイル一覧

| ファイル | 種別 | 内容 |
|---|---|---|
| `src/lib/calc.js` | 変更 | `getDefaultSettings` に `monthlyGoal: 0` 追加のみ |
| `src/pages/Settings.jsx` | 変更 | 「月収目標」入力セクション追加 |
| `src/pages/Dashboard.jsx` | 変更 | プログレスバーセクション追加 |
| `src/style.css` | 変更 | プログレスバー用 CSS 追加（4〜6クラス） |

## 実装方針

### Settings.jsx の変更

既存の締め期間セクションの下に「月収目標」セクション追加:

```jsx
<section className="section">
  <h2 className="section-title">月収目標</h2>
  <div className="form-group">
    <label>目標月収</label>
    <input
      type="number"
      value={s.monthlyGoal || ''}
      placeholder="0（未設定）"
      onChange={(e) => updateSettings({ monthlyGoal: Number(e.target.value) })}
      onBlur={() => persistData(data)}
    />
  </div>
</section>
```

既存の `updateSettings` 関数をそのまま利用。

### Dashboard.jsx の変更

月次合計 `total` と `settings.monthlyGoal` を比較してプログレスを計算する。
「今月の合計」セクションの直下に挿入。`goal === 0` の場合は非表示。

```javascript
const goal = data.settings?.monthlyGoal || 0
const progressPercent = goal > 0 ? Math.min((total / goal) * 100, 100) : 0
const isGoalAchieved = goal > 0 && total >= goal
```

**UI:**
```
[目標達成！ or "目標まであと¥XX,XXX"]
目標 ¥300,000  /  達成 ¥180,000（60%）
[██████████░░░░░░░░░░]
```

100% 達成時: バーを var(--accent) 色に変え「目標達成！」バッジ表示。

### style.css に追加するクラス

```css
.goal-progress-section { ... }
.goal-progress-bar-wrap { border-radius: var(--radius-sm); overflow: hidden; height: 12px; background: var(--card-bg); }
.goal-progress-bar { background: var(--gradient-primary); height: 100%; transition: width 0.5s ease; }
.goal-progress-bar.achieved { background: var(--accent); }
.goal-label-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
.goal-achieved-badge { font-size: 11px; font-weight: 700; color: var(--accent); }
```

## 分担

| エンジニア | 担当 |
|---|---|
| Engineer 1 | calc.js（monthlyGoal: 0 追加）+ Settings.jsx 入力セクション |
| Engineer 2 | Dashboard.jsx プログレスバーセクション + style.css CSS追加 |
| Reviewer 1 | 全ファイルレビュー |
| Engineer 10 | ビルド確認 |

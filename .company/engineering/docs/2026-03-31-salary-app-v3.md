# 設計書: 給料計算アプリ v3

## データ構造

```json
{
  "settings": {
    "salaryType": "fixed",
    "baseSalary": 200000,
    "defaultHourlyRate": 1500,
    "items": [
      { "id": "abc123", "name": "セット数", "back": 500 }
    ]
  },
  "records": {
    "2026-03-01": {
      "startTime": "10:00",
      "endTime":   "18:00",
      "hourlyRate": 1800,
      "items": { "abc123": 3 }
    }
  }
}
```

## 計算式

```
日給 = (endTime - startTime)h × hourlyRate(その日) + Σ(item.back × count)
月合計(時給) = Σ 日給
月合計(固定) = baseSalary + Σ(全日 item.back × count)
```

## 画面設計

### index.html（トップ）
```
[ヘッダー] 月間給料 ¥XXX,XXX  [設定]ボタン
─────────────────────────────
[今日のセクション] 今日: 3月31日(火)
  出勤 [10:00] 〜 退勤 [18:00]  時給 [1,800]円
  [品目1] - 3 +   バック: ¥1,500
  [品目2] - 1 +   バック: ¥1,000
  今日の合計: ¥XXX,XXX（時給分 ¥X,XXX + バック ¥X,XXX）
─────────────────────────────
[カレンダー]  < 2026年3月 >
  各セル: 日付 + 合計金額（タップで day.html?date=へ）
```

### day.html（日毎詳細）
```
[← 戻る]  2026年3月15日(土)
  出勤 [10:00] 〜 退勤 [18:00]  時給 [1,800]円
  [品目1] - 3 +
  [品目2] - 1 +
  ─────────────
  時給分: ¥12,000
  バック: ¥2,500
  合計:   ¥14,500
```

### settings.html（品目設定）
```
[← 戻る]  品目設定
  給与タイプ: [固定給] [時給]
  固定給: [200,000]  or  デフォルト時給: [1,500]
  ─────────────
  品目一覧:
  [セット数]  バック [500円]  [削除]
  [+ 品目を追加]
```

## ID/クラス定義（共通）

| 要素 | id / class | ページ |
|------|-----------|------|
| 月間給料 | `#total-salary` | index |
| 今日セクション | `#today-section` | index |
| 今日の日付ラベル | `#today-label` | index |
| 出勤入力 | `.time-start` | index/day |
| 退勤入力 | `.time-end` | index/day |
| 時給入力（日毎） | `.daily-hourly-rate` | index/day |
| 品目カウント行 | `.item-count-row` | index/day |
| 件数表示 | `.item-count` | index/day |
| 今日の合計 | `#today-total` | index |
| 時給分 | `#today-wage` | index |
| バック合計 | `#today-back` | index |
| カレンダーグリッド | `#calendar-grid` | index |
| 各日セル | `.day-cell[data-key]` | index |
| 日給表示（セル内）| `.cell-total` | index |
| 設定ページへ | `#goto-settings` | index |

## 分担

| 担当 | ファイル | 作業 |
|------|---------|------|
| Engineer 1 | index.html / day.html / settings.html | 3ページのHTML構造 |
| Engineer 2 | style.css | 全ページ共通スタイル（再設計） |
| Engineer 3 | common.js / index.js / day.js / settings.js | データ管理・各ページロジック |

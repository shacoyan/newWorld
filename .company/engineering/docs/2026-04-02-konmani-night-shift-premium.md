# 設計書: 深夜割増給与機能

## 概要

22:00〜5:00の時間帯を深夜帯とし、その時間の給与を1.25倍にする機能。
ON/OFFは設定から切り替え可能。プレミアムユーザーは店舗（job）ごとに個別設定できる。

## データ構造の変更

### settings に `nightShiftEnabled` を追加（デフォルト false）

```json
{
  "settings": {
    "nightShiftEnabled": false
  }
}
```

### jobs[] の各エントリに `nightShiftEnabled` を追加（デフォルト false）

```json
{
  "settings": {
    "jobs": [
      {
        "id": "job-abc123",
        "name": "クラブ〇〇",
        "nightShiftEnabled": false
      }
    ]
  }
}
```

後方互換: `nightShiftEnabled` が undefined の場合は false として扱う。

## 変更ファイル一覧

| ファイル | 種別 | 内容 |
|---|---|---|
| `src/lib/calc.js` | 変更 | `getDefaultSettings` に `nightShiftEnabled: false` 追加、`calcNightShiftHours` 関数追加、`calcDailyWage` に深夜割増ロジック追加 |
| `src/pages/Settings.jsx` | 変更 | 出勤設定セクションに「深夜割増」トグル追加（非プレミアム用） |
| `src/pages/Settings.jsx` | 変更 | 仕事先管理セクションの各jobフォームに `nightShiftEnabled` トグル追加（プレミアム用） |

## 実装方針

### calc.js: calcNightShiftHours(startTime, endTime) 関数を新規追加

深夜帯（22:00〜5:00翌日）と勤務時間の重複分（時間）を計算して返す。

```javascript
export function calcNightShiftHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let startMins = sh * 60 + sm;
  let endMins = eh * 60 + em;
  if (endMins <= startMins) endMins += 24 * 60;

  // 深夜帯を分で定義（22:00〜翌5:00 = 1320〜1740分、または0〜300分）
  // 24時間軸で統一して重複を計算する
  // 深夜帯1: 22:00〜24:00 = 1320〜1440
  // 深夜帯2: 24:00〜29:00（翌5:00） = 1440〜1740
  // → まとめると 1320〜1740 の範囲

  const nightStart = 22 * 60;       // 1320
  const nightEnd = (24 + 5) * 60;   // 1740

  // 勤務時間を1320〜1740の範囲に正規化して重複を取る
  // 勤務が0時をまたぐ場合、endMinsは1440以上になっている

  // 正規化: 22時以前の開始を22:00以降の軸で再計算
  // → ここでは素直に2区間で計算する

  // 区間1: 22:00〜24:00（当日深夜）
  const seg1Start = nightStart;          // 1320
  const seg1End = 24 * 60;              // 1440
  const overlap1Start = Math.max(startMins, seg1Start);
  const overlap1End = Math.min(endMins, seg1End);
  const overlap1 = Math.max(0, overlap1End - overlap1Start);

  // 区間2: 24:00〜29:00（翌0:00〜5:00）
  const seg2Start = 24 * 60;            // 1440
  const seg2End = nightEnd;             // 1740
  const overlap2Start = Math.max(startMins, seg2Start);
  const overlap2End = Math.min(endMins, seg2End);
  const overlap2 = Math.max(0, overlap2End - overlap2Start);

  return (overlap1 + overlap2) / 60;
}
```

### calc.js: calcDailyWage の変更

深夜割増が有効かどうかを判定して計算を分岐する:

```javascript
export function calcDailyWage(record, settings) {
  const hours = calcHours(record.startTime, record.endTime);
  let wage = 0;

  if (settings.salaryType === 'hourly') {
    // jobId解決（既存ロジック）
    const job = record.jobId && (settings.jobs || []).find(j => j.id === record.jobId);
    const hourlyRate = job ? job.hourlyRate : (record.hourlyRate || settings.defaultHourlyRate || 0);

    // 深夜割増の適用判定
    const nightEnabled = job
      ? (job.nightShiftEnabled ?? false)
      : (settings.nightShiftEnabled ?? false);

    if (nightEnabled) {
      const nightHours = calcNightShiftHours(record.startTime, record.endTime);
      const regularHours = hours - nightHours;
      wage = Math.round(regularHours * hourlyRate + nightHours * hourlyRate * 1.25);
    } else {
      wage = Math.round(hours * hourlyRate);
    }
  } else {
    const daysInMonth = getDaysInMonth(new Date().getFullYear(), new Date().getMonth() + 1);
    wage = Math.round((settings.baseSalary || 0) / daysInMonth);
  }

  // バック計算（既存ロジック）
  let back = 0;
  if (record.items) {
    for (const itemId in record.items) {
      const count = record.items[itemId] || 0;
      const item = (settings.items || []).find(i => i.id === itemId);
      if (item && item.back) back += item.back * count;
    }
  }

  const avgHourlyRate = hours > 0 ? Math.round((wage + back) / hours) : 0;
  return { wage, back, total: wage + back, hours, avgHourlyRate };
}
```

### Settings.jsx: 出勤設定セクションに深夜割増トグルを追加

既存の「デフォルト退勤時刻」入力の下に追加:

```jsx
<div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <label style={{ marginBottom: 0 }}>深夜割増（22:00〜5:00 × 1.25倍）</label>
  <input
    type="checkbox"
    checked={s.nightShiftEnabled ?? false}
    onChange={(e) => {
      updateSettings({ nightShiftEnabled: e.target.checked });
    }}
    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
  />
</div>
```

### Settings.jsx: 仕事先管理の各jobフォームに nightShiftEnabled トグルを追加

各jobの編集フォームの末尾に追加（退勤時刻inputの後）:

```jsx
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
  <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 0 }}>深夜割増</label>
  <input
    type="checkbox"
    checked={job.nightShiftEnabled ?? false}
    onChange={(e) => handleJobChange(job.id, 'nightShiftEnabled', e.target.checked)}
    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
  />
</div>
```

## 分担

| エンジニア | 担当 |
|---|---|
| Engineer 1 | calc.js: calcNightShiftHours 追加 + calcDailyWage 変更 + getDefaultSettings に nightShiftEnabled: false 追加 |
| Engineer 2 | Settings.jsx: 出勤設定トグル + 仕事先管理トグル |
| Reviewer 1 | 全ファイルレビュー（特にcalcNightShiftHoursの境界値ケース） |
| Engineer 10 | ビルド確認 |

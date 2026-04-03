---
date: 2026-04-03
type: feature
status: in-progress
author: Tech Lead
---

# 設計書: こんまに 3機能追加

## 概要

1. 店舗ごとに出勤を記録できる（1日に複数店舗の時間帯を管理）
2. 選択中の店舗の記録をリセットするボタン
3. プレミアムユーザー向け: アプリ起動時に目標達成モーダル表示

---

## 機能1・2: 店舗別出勤記録 + リセットボタン

### データ構造変更

#### 旧フォーマット（後方互換のため保持）
```js
records[dateKey] = {
  startTime: '18:00',
  endTime: '23:00',
  hourlyRate: 1500,
  jobId: 'job-123',   // ← 削除しない（後方互換）
  items: {}
}
```

#### 新フォーマット（jobs サブオブジェクト追加）
```js
records[dateKey] = {
  // per-job 出退勤（新規追加）
  jobs: {
    'job-123': { startTime: '18:00', endTime: '23:00' },
    'job-456': { startTime: '12:00', endTime: '17:00' },
  },
  // バック等はそのまま日単位で管理
  items: {},
  // legacy フィールドは残す（旧データ読み込み用）
  startTime: '',
  endTime: '',
  hourlyRate: 0,
}
```

### Aチーム担当: `conmoney/src/lib/calc.js`

`calcDailyWage(record, settings)` を修正:

```js
export function calcDailyWage(record, settings) {
  let wage = 0;
  let totalHours = 0;

  // 新フォーマット: record.jobs が存在する場合は各店舗を集計
  if (record.jobs && Object.keys(record.jobs).length > 0) {
    for (const [jobId, jobRec] of Object.entries(record.jobs)) {
      if (!jobRec.startTime || !jobRec.endTime) continue;
      const job = (settings.jobs || []).find(j => j.id === jobId);
      if (!job) continue;
      const hours = calcHours(jobRec.startTime, jobRec.endTime);
      totalHours += hours;
      const nightEnabled = job.nightShiftEnabled ?? false;
      if (nightEnabled) {
        const nightHours = calcNightShiftHours(jobRec.startTime, jobRec.endTime);
        wage += Math.round((hours - nightHours) * job.hourlyRate + nightHours * job.hourlyRate * 1.25);
      } else {
        wage += Math.round(hours * job.hourlyRate);
      }
    }
  } else {
    // 旧フォーマット: legacy の単一 startTime/endTime を使用
    totalHours = calcHours(record.startTime, record.endTime);
    if (settings.salaryType === 'hourly') {
      const job = record.jobId && (settings.jobs || []).find(j => j.id === record.jobId);
      const hourlyRate = job ? job.hourlyRate : (record.hourlyRate || settings.defaultHourlyRate || 0);
      const nightEnabled = job ? (job.nightShiftEnabled ?? false) : (settings.nightShiftEnabled ?? false);
      if (nightEnabled) {
        const nightHours = calcNightShiftHours(record.startTime, record.endTime);
        wage = Math.round((totalHours - nightHours) * hourlyRate + nightHours * hourlyRate * 1.25);
      } else {
        wage = Math.round(totalHours * hourlyRate);
      }
    } else {
      const daysInMonth = getDaysInMonth(new Date().getFullYear(), new Date().getMonth() + 1);
      wage = Math.round((settings.baseSalary || 0) / daysInMonth);
    }
  }

  // バック計算（常に items から）
  let back = 0;
  if (record.items) {
    for (const itemId in record.items) {
      const count = record.items[itemId] || 0;
      const item = (settings.items || []).find(i => i.id === itemId);
      if (item && item.back) back += item.back * count;
    }
  }

  const avgHourlyRate = totalHours > 0 ? Math.round((wage + back) / totalHours) : 0;
  return { wage, back, total: wage + back, hours: totalHours, avgHourlyRate };
}
```

`ensureRecord` に jobs フィールドも追加:

```js
export function ensureRecord(data, dateKey) {
  const records = { ...data.records };
  if (!records[dateKey]) {
    records[dateKey] = {
      startTime: '',
      endTime: '',
      hourlyRate: (data.settings && data.settings.defaultHourlyRate) || 0,
      jobId: null,
      items: {},
      jobs: {}          // ← 追加
    };
  } else {
    records[dateKey] = {
      ...records[dateKey],
      items: { ...(records[dateKey].items || {}) },
      jobs: { ...(records[dateKey].jobs || {}) }  // ← 追加
    };
  }
  return { ...data, records };
}
```

---

### Bチーム担当: `conmoney/src/pages/Today.jsx` + `conmoney/src/components/JobSelector.jsx`

#### Today.jsx の変更

**1. selectedJobId を state に戻す（UI選択状態の管理）**

```js
// 23行目の導出値を削除し、useStateに戻す
const [selectedJobId, setSelectedJobId] = useState(null)
```

※ 今回は「どの店舗を編集中か」という UI 状態なので state が正しい

**2. 選択中の店舗の記録を取得**

`if (!data) return null` の後に追加:
```js
// 選択中の店舗の記録（新フォーマット）
const selectedJobRec = selectedJobId
  ? (data.records[selectedDate]?.jobs?.[selectedJobId] || { startTime: '', endTime: '' })
  : null

// 表示用の時刻（店舗選択中なら店舗記録、そうでなければ旧フォーマット）
const displayRec = selectedJobRec || selectedRec
```

**3. handleJobSelect をシンプルなトグルに変更**

```js
const handleJobSelect = (jobId) => {
  setSelectedJobId(prev => prev === jobId ? null : jobId)
}
```

**4. handleTimeChange: 店舗選択中は jobs サブオブジェクトに書き込む**

```js
const handleTimeChange = (field, value) => {
  const newData = ensureRecord(data, selectedDate)
  if (selectedJobId) {
    if (!newData.records[selectedDate].jobs) newData.records[selectedDate].jobs = {}
    newData.records[selectedDate].jobs[selectedJobId] = {
      ...(newData.records[selectedDate].jobs[selectedJobId] || {}),
      [field]: value
    }
  } else {
    newData.records[selectedDate][field] = value
  }
  persistData(newData)
}
```

**5. handleCheckin: 店舗選択中は jobs に書き込む**

```js
const handleCheckin = () => {
  const job = jobs.find(j => j.id === selectedJobId)
  const fillStart = job?.defaultStartTime || defaultStartTime
  const fillEnd = job?.defaultEndTime || defaultEndTime
  if (!fillStart || !fillEnd) return
  const newData = ensureRecord(data, selectedDate)
  if (selectedJobId) {
    if (!newData.records[selectedDate].jobs) newData.records[selectedDate].jobs = {}
    newData.records[selectedDate].jobs[selectedJobId] = { startTime: fillStart, endTime: fillEnd }
  } else {
    newData.records[selectedDate].startTime = fillStart
    newData.records[selectedDate].endTime = fillEnd
  }
  persistData(newData)
}
```

**6. handleJobReset を追加**

```js
const handleJobReset = () => {
  if (!selectedJobId) return
  const newData = ensureRecord(data, selectedDate)
  if (newData.records[selectedDate].jobs) {
    delete newData.records[selectedDate].jobs[selectedJobId]
  }
  persistData(newData)
}
```

**7. handleDateClick で selectedJobId をリセット**

```js
const handleDateClick = (dateKey) => {
  setSelectedDate(dateKey)
  setSelectedJobId(null)   // ← 追加
  const [y, m] = dateKey.split('-').map(Number)
  setCalYear(y)
  setCalMonth(m)
}
```

**8. JSX: time-input-group を displayRec から読む**

```jsx
// 旧: selectedRec.startTime → 新: displayRec.startTime
<input type="time" value={displayRec.startTime} ... />
<input type="time" value={displayRec.endTime} ... />
```

**9. JSX: リセットボタンを work-section に追加**

```jsx
{selectedJobId && selectedJobRec?.startTime && (
  <button className="btn-job-reset" onClick={handleJobReset}>
    この店舗の記録を消す
  </button>
)}
```

**10. JSX: checkin ボタンは店舗選択中も表示**

```jsx
// hasJobs の場合も選択中なら checkin ボタンを表示
{selectedJobId && (
  <button className="btn-checkin-today" onClick={handleCheckin}>
    {jobs.find(j => j.id === selectedJobId)?.name || ''}のデフォルト出勤を登録
  </button>
)}
```

**11. JobSelector に recordedJobIds を渡す**

```jsx
const recordedJobIds = Object.keys(data.records[selectedDate]?.jobs || {})
  .filter(jid => data.records[selectedDate].jobs[jid]?.startTime)

<JobSelector
  jobs={jobs}
  selectedJobId={selectedJobId}
  recordedJobIds={recordedJobIds}
  onChange={handleJobSelect}
/>
```

#### JobSelector.jsx の変更

`recordedJobIds` prop を追加し、記録済み店舗にインジケーターを表示:

```jsx
const JobSelector = ({ jobs, selectedJobId, recordedJobIds = [], onChange }) => {
  // ...
  // job-selector-card に is-recorded クラスを追加
  className={`job-selector-card${selectedJobId === job.id ? ' is-selected' : ''}${recordedJobIds.includes(job.id) ? ' is-recorded' : ''}`}

  // バッジを変更
  {recordedJobIds.includes(job.id) && <span className="job-selector-check">✓</span>}
  {selectedJobId === job.id && <span className="job-selector-badge">編集中</span>}
}
```

---

### Cチーム担当: `conmoney/src/App.jsx` + `conmoney/src/style.css`

#### App.jsx への追加

`calcMonthlyTotal` を import し、`GoalModalWrapper` コンポーネントを追加:

```jsx
import { calcMonthlyTotal, getTodayKey, formatMoney } from './lib/calc'

function GoalModal({ data, onClose }) {
  const todayKey = getTodayKey()
  const [year, month] = todayKey.split('-').map(Number)
  const monthly = calcMonthlyTotal(year, month, data)
  const goal = data.settings?.monthlyGoal || 0
  const achieved = monthly.total >= goal
  const remaining = goal - monthly.total

  return (
    <div className="goal-modal-overlay" onClick={onClose}>
      <div className="goal-modal" onClick={e => e.stopPropagation()}>
        <button className="goal-modal-close" onClick={onClose}>×</button>
        {achieved ? (
          <div className="goal-modal-celebrate">
            <div className="goal-modal-emoji">🎉</div>
            <div className="goal-modal-title">今月の目標達成！</div>
            <div className="goal-modal-amount">{formatMoney(monthly.total)}</div>
            <div className="goal-modal-message">今月もよく頑張りました！<br/>お疲れ様でした✨</div>
          </div>
        ) : (
          <div className="goal-modal-progress">
            <div className="goal-modal-title">今月の進捗</div>
            <div className="goal-modal-amount">{formatMoney(monthly.total)}</div>
            <div className="goal-modal-bar-wrap">
              <div
                className="goal-modal-bar"
                style={{ width: Math.min(100, (monthly.total / goal) * 100) + '%' }}
              />
            </div>
            <div className="goal-modal-remaining">
              あと <strong>{formatMoney(remaining)}</strong> で目標達成！
            </div>
            <div className="goal-modal-sub">目標: {formatMoney(goal)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

function GoalModalWrapper() {
  const user = useAuth()
  const { data } = useAppData(user)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!data) return
    if (!data.settings?.isPremium) return
    if (!(data.settings?.monthlyGoal > 0)) return
    if (sessionStorage.getItem('goal-modal-shown')) return
    sessionStorage.setItem('goal-modal-shown', '1')
    setVisible(true)
  }, [data])

  if (!visible) return null
  return <GoalModal data={data} onClose={() => setVisible(false)} />
}
```

App コンポーネント内に `<GoalModalWrapper />` を追加:
```jsx
export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ThemeApplier />
        <GoalModalWrapper />   {/* ← 追加 */}
        <Routes>
          ...
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
```

#### style.css への追加（ファイル末尾に追記）

```css
/* ===== Goal Modal ===== */
.goal-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; animation: fadeIn 0.2s ease;
}
.goal-modal {
  background: var(--card-bg); border-radius: var(--radius-md);
  padding: 32px 28px; max-width: 320px; width: 90%;
  position: relative; box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  animation: slideUp 0.25s ease;
  text-align: center;
}
.goal-modal-close {
  position: absolute; top: 12px; right: 14px;
  background: none; border: none; font-size: 20px;
  color: var(--text-muted); cursor: pointer; line-height: 1;
}
.goal-modal-emoji { font-size: 48px; margin-bottom: 8px; }
.goal-modal-title { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 12px; }
.goal-modal-amount { font-size: 28px; font-weight: 800; color: var(--primary); margin-bottom: 16px; }
.goal-modal-message { font-size: 15px; color: var(--text-muted); line-height: 1.6; }
.goal-modal-bar-wrap {
  height: 10px; border-radius: 9999px;
  background: var(--border); overflow: hidden; margin: 12px 0;
}
.goal-modal-bar {
  height: 100%; background: var(--gradient-primary);
  border-radius: 9999px; transition: width 0.5s ease;
}
.goal-modal-remaining { font-size: 15px; color: var(--text); margin-bottom: 4px; }
.goal-modal-sub { font-size: 13px; color: var(--text-muted); }

@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

/* ===== JobSelector: 記録済みインジケーター ===== */
.job-selector-card.is-recorded {
  border-color: var(--accent, #22c55e);
}
.job-selector-check { font-size: 13px; font-weight: 700; color: var(--accent, #22c55e); margin-left: 6px; }

/* ===== リセットボタン ===== */
.btn-job-reset {
  width: 100%; padding: 10px; border-radius: var(--radius-xs);
  border: 1.5px solid var(--danger, #ef4444); background: transparent;
  color: var(--danger, #ef4444); font-size: 13px; font-weight: 600;
  cursor: pointer; margin-top: 8px; transition: background 0.15s;
}
.btn-job-reset:hover { background: rgba(239,68,68,0.08); }
```

---

## 分担まとめ

| チーム | 担当ファイル |
|--------|-------------|
| Aチーム | `conmoney/src/lib/calc.js` |
| Bチーム | `conmoney/src/pages/Today.jsx` + `conmoney/src/components/JobSelector.jsx` |
| Cチーム | `conmoney/src/App.jsx` + `conmoney/src/style.css`（末尾追記のみ） |

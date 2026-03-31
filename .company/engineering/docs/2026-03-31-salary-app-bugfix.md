# 設計書: 給料計算アプリ バグ修正

## 概要

動作確認で発見した2件のバグを修正する。

---

## Bug 1: `syncFromLocalStorage` が常に実行されるデータ上書き問題

### 対象ファイル
`salary-app/firestore-sync.js`

### 問題
```js
// 現在（33〜43行目）
window.syncFromLocalStorage = async function(uid) {
  try {
    var localData = loadData();
    if (localData && (localData.settings || Object.keys(localData.records || {}).length > 0)) {
      await window.saveDataAsync(uid, localData);
```

`localData.settings` は `getDefaultSettings()` が常に返るため**常にtruthy**。
新デバイスで初ログインすると、空のデフォルト設定（`salaryType: 'fixed'`, `baseSalary: 200000` 等）がFirestoreに書き込まれ、既存設定を上書きする。

### 修正内容
条件を「recordsが1件以上ある場合のみ同期」に変更する。

```js
// 修正後
if (localData && Object.keys(localData.records || {}).length > 0) {
```

### 変更箇所
`firestore-sync.js` 36行目: 条件式を変更

---

## Bug 2: 時刻・時給変更時にカレンダーセルの金額が更新されない

### 対象ファイル
`salary-app/index.js`

### 問題
`+/-` ボタン押下時はカレンダーセル更新あり（153〜157行目）だが、出勤/退勤/時給の `change` イベントにはない。

```js
// 現在（121〜135行目）
timeStartEl.addEventListener('change', function () {
  ensureRecord(data, todayKey).startTime = this.value;
  persistData(data); updateTodayTotals(); renderHeader();
  // ← カレンダーセル更新なし
});
timeEndEl.addEventListener('change', function () {
  ensureRecord(data, todayKey).endTime = this.value;
  persistData(data); updateTodayTotals(); renderHeader();
  // ← カレンダーセル更新なし
});
hourlyRateEl.addEventListener('change', function () {
  var v = parseInt(this.value, 10);
  if (!isNaN(v) && v >= 0) {
    ensureRecord(data, todayKey).hourlyRate = v;
    persistData(data); updateTodayTotals(); renderHeader();
    // ← カレンダーセル更新なし
  }
});
```

### 修正内容
各 `change` イベントの末尾に、今日のカレンダーセル更新処理を追加する。

```js
// 追加する処理（+/-ボタンの既存コードと同じパターン）
var cell = calendarGridEl.querySelector('[data-key="' + todayKey + '"] .cell-total');
if (cell) {
  var d2 = calcDailyWage(data.records[todayKey], data.settings);
  cell.textContent = d2.total > 0 ? formatMoney(d2.total) : '';
}
```

### 変更箇所
`index.js` の `bindEvents()` 内:
- `timeStartEl` の `change` ハンドラ末尾に追加（123行目の後）
- `timeEndEl` の `change` ハンドラ末尾に追加（127行目の後）
- `hourlyRateEl` の `change` ハンドラ内の `if` ブロック末尾に追加（134行目の後）

---

## 分担

| 担当 | ファイル | 作業 |
|------|---------|------|
| Engineer 1 | `salary-app/firestore-sync.js` | Bug 1修正: 36行目の条件式変更 |
| Engineer 2 | `salary-app/index.js` | Bug 2修正: 3箇所にカレンダーセル更新処理を追加 |

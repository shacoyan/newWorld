---
date: 2026-04-03
type: bugfix
status: in-progress
author: Tech Lead
---

# バグ修正設計書: こんまに 店舗選択トグル解除が動作しない

## 概要

`Today.jsx` の店舗選択（JobSelector）で「同じ店舗をタップすると解除」が機能しない。
コードには解除ロジックが存在するが、state の初期値がレコードのデータと同期されていないため、常に「選択」動作になる。

## バグ再現

1. 日付Aで店舗Xを選択して保存する
2. 別の日付に移動し、また日付Aに戻る
3. 店舗Xをタップ → 解除されるはずが、選択し直しになる

（または）

1. ページをリロードして今日を開く
2. 今日のレコードに jobId が保存済みでも selectedJobId = null のまま
3. 店舗をタップ → null !== jobId なので解除されない

## 根本原因

```js
// Today.jsx:20
const [selectedJobId, setSelectedJobId] = useState(null)  // ← 常に null で初期化
```

`selectedJobId` は独立した state で、ページロード時に `null` になる。
`handleDateClick` で日付を変更したときだけ `setSelectedJobId(rec?.jobId || null)` が呼ばれるが、
初期ロード時（今日の日付）には呼ばれない。

そのため `handleJobSelect` の以下の解除判定が機能しない:
```js
if (selectedJobId === jobId) {  // null === 'abc' → false → 解除されない
```

## 修正方針

`selectedJobId` を **state から導出値（derived value）に変更する**。

`data.records[selectedDate]?.jobId` が常に真実の源泉なので、そこから直接読む。

## 詳細（対象ファイル・変更内容）

### 対象ファイル
`conmoney/src/pages/Today.jsx`

### 変更1: state 削除

```js
// 削除
const [selectedJobId, setSelectedJobId] = useState(null)
```

### 変更2: 導出値に変更（if (!data) return null の直後に追加）

```js
// 追加（data が確定した後）
const selectedJobId = data.records[selectedDate]?.jobId ?? null
```

### 変更3: handleJobSelect 内の setSelectedJobId(null) を削除

```js
const handleJobSelect = (jobId) => {
  if (selectedJobId === jobId) {
    // setSelectedJobId(null)  ← 削除
    const newData = ensureRecord(data, selectedDate)
    delete newData.records[selectedDate].jobId
    persistData(newData)
    return
  }
  ...
}
```

### 変更4: handleDateClick 内の setSelectedJobId を削除

```js
const handleDateClick = (dateKey) => {
  setSelectedDate(dateKey)
  const [y, m] = dateKey.split('-').map(Number)
  setCalYear(y)
  setCalMonth(m)
  const rec = data.records[dateKey]
  // setSelectedJobId(rec?.jobId || null)  ← 削除（導出値になるので不要）
}
```

## 期待する動作

- ページロード時、今日のレコードに jobId があれば即座に「選択中」表示
- 選択中の店舗をタップ → 解除
- 別の店舗をタップ → 切り替え

## 再発防止

- UI の選択状態と保存済みデータを別々の state で管理しない
- 「真実の源泉」は常に record データ。UI state は derived value として扱う

## 分担

Aチーム（Engineer 1,4,7）: 上記変更を `conmoney/src/pages/Today.jsx` に実装
Reviewer 1: レビュー後 Dチームへ提出

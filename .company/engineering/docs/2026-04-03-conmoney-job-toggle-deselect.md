# 設計: こんまに 店舗選択トグル解除

- **日付**: 2026-04-03
- **対象**: conmoney/src/pages/Today.jsx

## 変更内容

`handleJobSelect` にトグルロジックを追加する。

### Before
```js
const handleJobSelect = (jobId) => {
  setSelectedJobId(jobId)
  // ...常に選択
}
```

### After
```js
const handleJobSelect = (jobId) => {
  if (selectedJobId === jobId) {
    setSelectedJobId(null)
    const newData = ensureRecord(data, selectedDate)
    delete newData.records[selectedDate].jobId
    persistData(newData)
    return
  }
  // 以降は既存ロジック
  ...
}
```

## 影響範囲
- JobSelector.jsx: 変更なし
- record.jobId: 解除時に delete で削除（undefined ではなく key ごと消す）

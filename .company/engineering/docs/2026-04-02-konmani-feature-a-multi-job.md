# 設計書: 機能A — 複数バイト・仕事管理

## 概要

プレミアムユーザーが複数の勤務先（job）を登録し、打刻時に切り替えられる機能。records の各日付エントリに `jobId` を追加し、ダッシュボードで仕事別の収入内訳を表示する。

## データ構造の変更

**settings に `jobs` 配列を追加（後方互換: デフォルトは空配列）**

```json
{
  "settings": {
    "jobs": [
      {
        "id": "job-abc123",
        "name": "クラブ〇〇",
        "hourlyRate": 2000,
        "defaultStartTime": "20:00",
        "defaultEndTime": "01:00",
        "color": "#FF6B9D"
      }
    ]
  }
}
```

**records に `jobId` を追加（オプショナル、既存レコードは jobId: null）**

```json
{
  "records": {
    "2026-04-01": {
      "startTime": "18:00",
      "endTime": "23:00",
      "hourlyRate": 1500,
      "jobId": "job-abc123",
      "items": {}
    }
  }
}
```

後方互換:
- `jobs` が未定義 or 空 → 従来の settings.defaultHourlyRate 動作を維持
- `jobId` が null or 未定義 → settings.defaultHourlyRate で計算

## 変更ファイル一覧

| ファイル | 種別 | 内容 |
|---|---|---|
| `src/lib/calc.js` | 変更 | `getDefaultSettings` に jobs: [] 追加、`calcDailyWage` に jobId 参照ロジック追加、`ensureRecord` に jobId: null 追加 |
| `src/components/JobSelector.jsx` | 新規 | 仕事選択UIコンポーネント |
| `src/pages/Today.jsx` | 変更 | JobSelector 組み込み + jobId ハンドラ追加（isPremium && jobs.length > 0 の場合のみ表示） |
| `src/pages/Settings.jsx` | 変更 | 「仕事先管理」セクション追加（isPremium 条件付き） |
| `src/pages/Dashboard.jsx` | 変更 | 仕事別収入内訳セクション追加（isPremium && jobs.length > 0 の場合のみ） |

## 実装方針

### calc.js の変更

`calcDailyWage(record, settings)` の時給解決順序:
```
record.jobId → settings.jobs[id].hourlyRate → record.hourlyRate → settings.defaultHourlyRate
```
`calcMonthlyTotal` は `calcDailyWage` に委譲しているため自動的に対応。

### JobSelector.jsx（新規）

- props: `jobs`, `selectedJobId`, `onChange`
- 各 job をカード形式（識別カラー + 名前 + 時給）で表示、タップで選択
- 「未指定（デフォルト）」を先頭に常時表示

### Today.jsx の変更

- `selectedJobId` を useState で管理（初期値: null）
- JobSelector を打刻セクション上部に配置
- 選択した job の defaultStartTime/defaultEndTime を time フィールドに自動入力

### Settings.jsx の変更

isPremium === true の場合のみ表示する「仕事先管理」セクション:
- job の追加・編集・削除（品目管理と同パターン）
- 各 job フォーム: 名前・時給・デフォルト出勤・退勤・`<input type="color">` でカラー選択
- `generateId()` で ID 生成

### Dashboard.jsx の変更

isPremium && jobs.length > 0 の場合のみ、月次統計後に仕事別内訳セクションを追加:
- 対象月の records を jobId でグループ化し、日数・収入を集計
- job.color でカラーバーを着色（既存 dash-bar-fill スタイルを流用）

## 分担

| エンジニア | 担当 |
|---|---|
| Engineer 1 | calc.js（getDefaultSettings / calcDailyWage / ensureRecord 変更） |
| Engineer 2 | JobSelector.jsx 新規作成 + Today.jsx / Settings.jsx / Dashboard.jsx UI変更 |
| Reviewer 1 | 全ファイルレビュー |
| Engineer 10 | ビルド確認 |

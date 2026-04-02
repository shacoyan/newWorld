# チケット: こんまに 店舗選択トグル解除

- **起票日**: 2026-04-03
- **優先度**: 通常
- **担当**: エンジニアリング

## 概要
プレミアムユーザーが JobSelector で仕事を選択中の状態で、同じ仕事をもう一度タップすると選択が解除されるようにする。

## 現状
- `handleJobSelect(jobId)` は常に jobId をセットする
- 一度選択すると、別の仕事を選ぶしか解除手段がない

## 期待動作
- 選択済みの仕事をタップ → 選択解除（selectedJobId = null、record.jobId を削除）
- 未選択の仕事をタップ → 従来通り選択

## 対象ファイル
- `conmoney/src/pages/Today.jsx` — handleJobSelect にトグルロジック追加
- `conmoney/src/components/JobSelector.jsx` — 変更なし（onChange に渡すだけ）

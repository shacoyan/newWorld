# 設計書: こんまに LP レビュー指摘修正

## 概要
Reviewer 1 のレビュー指摘を受けて lp.html の SVG を修正する。

## 調査結果
- **問題2（lp-login-btn-2）**: lp.js にて `getElementById` で両ボタンを明示的に処理済み。修正不要。

## 修正対象（lp.html のみ）

### 修正1: SVG id をより安全な名前に変更（重大度: 中）
将来的な id 衝突を防ぐため、すべての linearGradient id に `lp-` プレフィックスを追加する。

| 現在 | 修正後 |
|------|--------|
| `cal-header-grad` | `lp-cal-grad` |
| `coin-grad` | `lp-coin-grad` |
| `bar1-grad` | `lp-bar1-grad` |
| `bar2-grad` | `lp-bar2-grad` |
| `bar3-grad` | `lp-bar3-grad` |
| `cloud-grad` | `lp-cloud-grad` |
| `cloud-stroke-grad` | `lp-cloud-stroke-grad` |

`url(#...)` の参照箇所も同時に変更すること。

### 修正2: ¥テキストの縦位置調整（重大度: 低）
コインSVGの `<text y="30">` を `y="31"` に変更し、より中央に見えるよう微調整する。

### 修正3: クラウドSVGの描画順修正（重大度: 低）
現在: fill楕円 → stroke楕円 が混在して一部重なりが発生
修正: fill楕円4つをすべて先に描画 → stroke楕円3つを後に描画

## 分担
- Engineer 1: 修正1（SVG id リネーム）
- Engineer 2: 修正2（¥テキスト y値調整）+ 修正3（クラウド描画順）

## レビュー
- Reviewer 1 が Engineer 1, 2 の成果物を確認
- 今回は小規模のためDチーム統合は省略

*作成: 2026-03-31*

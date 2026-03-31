# レビュー指摘対応

## 概要
レビューで発見した問題のうち、修正が確定した3点を対応する。

## 設計・方針
- Engineer 1: faq / menu の og:description 修正
- Engineer 2: menu のミント系フレーバー追加
- 修正後は git commit & push まで行う

## 詳細

### [1] faq/index.html — JSON-LD 予約回答の修正
- 問題: HTML本文は「予約可能」、JSON-LD は「予約不可」で矛盾
- 対応: JSON-LD の FAQPage acceptedAnswer text を「予約可能」の内容に統一する
- 正解: 予約可能（電話またはInstagram・XのDMから受付）

### [2] menu/index.html — og:description 重複削除
- 問題: og:description が2行定義されている
- 対応: 2つ目（より詳細な方）を残して1つ目を削除する

### [3] menu/index.html — ミント系フレーバー追加
- 問題: ミント系フィルタに対応するカード（data-category="mint"）が0件
- 対応: 以下の2カードを追加する
  - フレーバー名「ミント」: data-category="mint"
  - フレーバー名「アイス」: data-category="mint"
  - カード形式は既存のフレーバーカードに合わせること

## 分担
| 役割 | 担当 | 作業 |
|------|------|------|
| Engineer 1 | faq修正 + menu og:description修正 | |
| Engineer 2 | menu ミント系フレーバー追加 | |

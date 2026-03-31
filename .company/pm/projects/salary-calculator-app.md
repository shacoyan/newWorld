# 給料計算アプリ（カレンダー型）

## 概要

カレンダー形式で日々の成果数を記録し、月間給料をリアルタイムで計算・表示するWebアプリ。

## ゴール

- 成果数に基づいた月間給料が一目でわかる
- 過去の月も振り返れる
- 設定（基本給・成果単価）をカスタマイズできる

## ステータス

`planning`

## マイルストーン

| # | マイルストーン | 担当 | ステータス |
|---|--------------|------|---------|
| 1 | 要件定義・設計（Tech Lead） | エンジニアリング | open |
| 2 | HTML/CSS/JS 実装（Engineer 1〜3） | エンジニアリング | open |
| 3 | コードレビュー（Engineer 4〜5） | エンジニアリング | open |
| 4 | 動作確認・修正 | エンジニアリング | open |
| 5 | 完成・納品 | — | open |

## 開発フロー

```
[PM] プロジェクト立ち上げ・フロー設計
    ↓
[Tech Lead] 技術設計・ファイル構成・分担決定
    ↓
[Engineer 1] index.html 実装（GLM-5.1）
[Engineer 2] style.css 実装（GLM-5.1）    ← 並列
[Engineer 3] app.js 実装（GLM-5.1）
    ↓
[Engineer 4] コードレビュー（GLM-5.1）
[Engineer 5] コードレビュー（GLM-5.1）    ← 並列
    ↓
[Tech Lead] レビュー結果を踏まえた最終確認・修正指示
    ↓
[秘書] 完了報告・TODOに記録
```

## チケット

- `2026-03-31-salary-app-design.md` - Tech Lead 設計
- `2026-03-31-salary-app-impl.md` - Engineer 1〜3 実装
- `2026-03-31-salary-app-review.md` - Engineer 4〜5 レビュー

## 備考

- 出力先: `salary-app/` ディレクトリ
- 依存ライブラリなし（HTML/CSS/JS のみ）
- データ永続化: localStorage

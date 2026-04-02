---
date: "2026-04-02"
type: ticket
status: in-progress
project: square-dashboard
---

# Square売上ダッシュボード

## 概要
店舗SABABAのSquare決済情報を閲覧できるWebアプリ。
リアルタイムで伝票情報・日の売上を確認できる。パスワード保護付き。

## 要件

### 機能
- [ ] パスワードログイン画面
- [ ] 今日の売上サマリー（合計金額・件数）
- [ ] 伝票一覧（時刻・金額・支払い方法）
- [ ] リアルタイム更新（一定間隔でAPI取得）
- [ ] **複数店舗対応**（店舗セレクターで切り替え）

### 技術スタック
- フロントエンド: React + Vite
- ホスティング: Vercel
- バックエンド: Vercel Serverless Functions（/api）
- 外部API: Square API

### 認証
- パスワード: `sababa_buchi_daiki`
- ※Vercel環境変数 `APP_PASSWORD` に設定すること
- ※GitHubには含めないこと（.envで管理）

### 店舗情報
- 店舗名: SABABA
- Square APIキー: 取得予定（開発者ダッシュボードから取得）

## Square APIキー取得手順
1. https://developer.squareup.com にアクセス
2. アカウント作成 or ログイン
3. 「New Application」でアプリ作成（名前: SABABA Dashboard等）
4. 「Credentials」タブから Access Token をコピー
5. Vercelの環境変数 `SQUARE_ACCESS_TOKEN` に設定

## 納期
未定（Square APIキー取得後に着手可能）

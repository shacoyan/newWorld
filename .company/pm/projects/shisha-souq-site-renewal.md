---
created: "2026-03-27"
project: "Shisha Cafe Souq 公式サイトリニューアル"
status: in-progress
tags: [web, client, shisha-souq]
---

# Shisha Cafe Souq 公式サイトリニューアル

## 概要
大阪・天満橋のシーシャカフェ「Shisha Cafe Souq」の公式サイトをフルリニューアル。
SEO強化・多ページ構成・モダンデザインへの移行。

- **リポジトリ**: https://github.com/shacoyan/shisha-souq.git
- **技術スタック**: HTML / CSS / JavaScript（フレームワークなし）
- **設計書**: `engineering/docs/2026-03-27-shisha-cafe-souq-site-redesign.md`

---

## ゴール

- [ ] 全ページ実装完了・公開
- [ ] 実画像をすべてサイトに差し込み（絵文字プレースホルダー解消）
- [ ] Google Business Profile 最適化
- [ ] SNSアカウント情報整理・連携

---

## マイルストーン

| # | マイルストーン | 期限 | 状態 | 担当 |
|---|--------------|------|------|------|
| 1 | 設計書作成 | 2026-03-27 | ✅ 完了 | engineering（Tech Lead） |
| 2 | 住所・座標情報更新 | 2026-03-27 | ✅ 完了 | engineering（E1・E2） |
| 3 | 共通CSS・JS実装（Phase 1） | 2026-03-27 | ✅ 完了 | engineering（E1） |
| 4 | 各ページHTML実装（Phase 2） | 2026-03-27 | ✅ 完了 | engineering（E2） |
| 5 | 画像アセット収集・差し込み | 2026-03-27 | ✅ 完了 | creative + engineering |
| 6 | Google Business Profile最適化 | 2026-03-27 | ✅ 完了 | オーナー |
| 7 | SNSアカウント整理 | - | 🔲 未着手 | - |
| 8 | 最終確認・公開 | - | 🔲 未着手 | - |

---

## ページ実装状況

| ページ | URL | 状態 |
|--------|-----|------|
| トップ | `/` | ✅ 実装済み |
| メニュー | `/menu/` | ✅ 実装済み |
| 料金 | `/price/` | ✅ 実装済み |
| 店舗紹介 | `/about/` | ✅ 実装済み |
| アクセス | `/access/` | ✅ 実装済み |
| お知らせ | `/news/` | ✅ 実装済み |
| FAQ | `/faq/` | ✅ 実装済み |
| お問い合わせ | `/contact/` | ✅ 実装済み |
| プライバシーポリシー | `/privacy/` | ✅ 実装済み |

---

## 関連部署

| 部署 | 役割 |
|------|------|
| engineering | 実装・コーディング |
| creative | 画像アセット管理・ブリーフ |
| pm | 進捗管理（このファイル） |

---

## メモ・決定事項

- **2026-03-27**: 住所を〒540-0036 大阪府大阪市中央区船越町１丁目５−８ STBLD 601に更新。Google Maps（Playwright）で取得。
- **2026-03-27**: 画像ブリーフ作成済み → `creative/briefs/shisha-souq-photo-brief.md`
- **2026-03-27**: アセット管理台帳作成済み → `creative/assets/asset-list.md`（12点・全未作成）
- 画像が揃い次第、engineeringがHTMLへの差し込みを実施

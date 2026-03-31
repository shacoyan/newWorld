# 画像重複解消・フード画像更新

## 概要

Shisha Cafe Souqサイトの2箇所の画像修正。

## 設計・方針

使用可能な画像ファイル（`shisha-souq/images/`）の中から、各セクションの内容に合った画像を選定して差し替える。gallery系画像はギャラリーセクション専用とする。

## 詳細

### タスク1: topページ menuセクション「フード」カード

- **ファイル**: `shisha-souq/index.html`
- **対象**: menuセクションのフードカード（line 162付近）
- **現在**: `images/gallery-flavor-shelf.jpg`
- **変更**: フードにふさわしい画像に差し替え（`menu-food.jpg` または `snack.jpg` を選定）

### タスク2: aboutページ Featuresセクション 画像重複解消

- **ファイル**: `shisha-souq/about/index.html`
- **問題**: Featuresカード3枚がギャラリー（Gallery セクション）と同じ画像を使用しており、ページ内で重複して見える

| カード | 現在（ギャラリーと被り） | 変更案 |
|--------|--------------------------|--------|
| 100種類以上のフレーバー | `gallery-flavor-shelf.jpg` | `flavor.jpg` |
| 全席Wi-Fi・電源完備 | `gallery-shisha-set.jpg` | `wifi.jpg` |
| ゆったりソファ空間 | `gallery-main-floor.jpg` | `floor_center.jpg` |

※ ギャラリーセクション（6枚）はそのまま変更しない。

## 分担

- Engineer 1: タスク1（index.html フード画像）
- Engineer 2: タスク2（about/index.html Featuresカード3枚）
- Engineer 3: レビュー（画像の見た目・内容の一致確認）

## 注意事項

- 実装前にオーナーへの確認を取ること
- 使用する画像は `shisha-souq/images/` 内の既存ファイルのみ

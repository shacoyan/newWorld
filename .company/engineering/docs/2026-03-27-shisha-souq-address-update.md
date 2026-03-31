# shisha-souq サイト 住所情報更新

## 概要
Google Maps（share.google/f2qb0j3TCj8ql8zju）から取得した正確な住所情報をサイト全体に反映する。
Playwright でGoogle Mapsを自動取得して確認済み。

## 設計・方針

| 項目 | 旧 | 新 |
|------|----|----|
| 住所 | 大阪市中央区（天満橋エリア）等の曖昧表記 | 〒540-0036 大阪府大阪市中央区船越町１丁目５−８ STBLD 601 |
| 座標 | 34.6879, 135.5157 | 34.6877967, 135.5146708 |
| Place ID | 0x0:0x0（ダミー） | 0x6000e73224f2a567:0xe76bcfad99c19d66 |
| 営業時間 | 変更なし（毎日13:00〜翌5:00） | 変更なし |
| 電話 | 変更なし（050-1563-5961） | 変更なし |

## 詳細

### 更新対象ファイル

**Engineer 1 担当:**
1. `shisha-souq/index.html`
   - JSON-LD: `postalCode: "540-0036"`, `streetAddress: "船越町１丁目５−８ STBLD 601"` 追加、geo座標更新
   - Access section l.212: `大阪市中央区（天満橋駅徒歩3分）` → `〒540-0036 大阪府大阪市中央区船越町１丁目５−８ STBLD 601`
   - フッター l.279: `大阪市中央区 天満橋駅徒歩3分` → `〒540-0036 大阪府大阪市中央区船越町１丁目５−８ STBLD 601`

2. `shisha-souq/access/index.html`
   - JSON-LD l.22: 住所に `postalCode`, `streetAddress` 追加
   - iframe src l.77: 座標・Place ID更新
   - 住所ブロック l.90: テキスト更新＋Googleマップリンク更新
   - フッター l.147: `大阪市中央区 天満橋駅徒歩3分` → 新住所

**Engineer 2 担当:**
3. `shisha-souq/about/index.html`
   - 店舗概要テーブル l.131: 住所行 `大阪市中央区（天満橋駅徒歩3分）` → 新住所
   - フッター l.156: 住所更新

4. `shisha-souq/price/index.html`
   - フッター: `大阪市中央区 天満橋駅徒歩3分` → 新住所

5. `shisha-souq/menu/index.html`
   - フッター: `大阪市中央区 天満橋駅徒歩3分` → 新住所

### Google Maps iframe 更新後URL
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3280.6!2d135.5146708!3d34.6877967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000e73224f2a567%3A0xe76bcfad99c19d66!2z44K344O844K344A3JUE3!5e0!3m2!1sja!2sjp!4v1743040000000!5m2!1sja!2sjp
```

## 分担

| 担当 | ファイル | 変更数 |
|------|---------|-------|
| Engineer 1 | index.html, access/index.html | 複雑（JSON-LD + iframe + テキスト） |
| Engineer 2 | about/index.html, price/index.html, menu/index.html | シンプル（テーブル + フッター） |

## 完了条件
- 全5ファイルで住所表記が統一されていること
- JSON-LDにpostalCode・streetAddressが含まれていること
- Google Maps iframeが正しい場所を指していること

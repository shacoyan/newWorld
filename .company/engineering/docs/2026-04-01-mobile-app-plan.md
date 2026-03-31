# こんまに — モバイルアプリ化計画

作成日: 2026-04-01

---

## 現状スタック

| 項目 | 内容 |
|------|------|
| フロントエンド | React 18 + Vite 5 |
| 認証 | Firebase Auth (Google) |
| DB | Firestore + localStorage |
| ルーティング | HashRouter（静的ホスティング対応） |
| デプロイ | 静的ファイルホスティング |

---

## 移行戦略（3フェーズ）

### Phase 0: PWA化（即実施可能 · 工数: 小）

**概要:** 既存のReact+Vite webアプリをホーム画面に追加できるようにする。

**作業内容:**
- `manifest.json` を追加（アプリ名・アイコン・テーマカラー）
- `vite-plugin-pwa` でサービスワーカー自動生成（オフライン対応）
- `vite.config.js` に PWA プラグイン設定追加
- iOS向け `apple-touch-icon` 設定

**メリット:**
- App Store 不要、現行コード無変更
- iOSでは「ホーム画面に追加」でアプリ風に使える
- Androidでは「アプリをインストール」プロンプトが出る

**制限:**
- iOS: プッシュ通知は制限あり（Safari 16.4+ で対応）
- ストア配信不可（個人利用には十分）

---

### Phase 1: Capacitor によるネイティブラッパー（工数: 中）

**概要:** 既存のReactビルドをCapacitorでラップしてiOS/Android appを生成。

**技術スタック追加:**
```
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npm install @capacitor/local-notifications  # リマインダー用
npm install @capacitor/haptics              # 触覚フィードバック
```

**作業内容:**
1. `npx cap init` でCapacitorプロジェクト初期化
2. `vite.config.js` の `base: './'` は既に設定済み（互換あり）
3. `npx cap add ios` / `npx cap add android`
4. `npm run build && npx cap sync` でネイティブプロジェクトに同期
5. XcodeでiOSビルド → App Store Connect 提出
6. Android StudioでAndroidビルド → Google Play 提出

**Firebase連携:**
- 現行の Firebase Auth / Firestore はWebのまま使用可能
- Google Sign-In は `@capacitor-google-auth` で対応

**追加できるネイティブ機能:**
| 機能 | プラグイン | 優先度 |
|------|-----------|--------|
| 出勤リマインダー通知 | @capacitor/local-notifications | 高 |
| 生体認証ロック | @capacitor/biometrics | 中 |
| 触覚フィードバック | @capacitor/haptics | 低 |
| ウィジェット（給与残り等） | native code required | 将来 |

**費用:**
- Apple Developer Program: $99/年（App Store配信に必要）
- Google Play Console: $25（一回払い）

---

### Phase 2: React Native Expo（工数: 大・将来検討）

**概要:** Webコードを捨ててReact Nativeで再実装。完全ネイティブUI。

**採用タイミング:**
- ウィジェット（ホーム画面で今日の給与を表示）が必要になったとき
- Capacitorでは対応できないネイティブ機能が必要になったとき
- ユーザー数が増えてパフォーマンス要件が厳しくなったとき

**移行コスト:**
- JSXロジック・Firebase連携・計算ロジックは流用可能
- HTML/CSSはReact Native StyleSheetに書き直し必要
- 推定工数: 2〜3週間

---

## 推奨ロードマップ

```
今すぐ    → Phase 0: PWA化（1日）
          → 個人利用・テスト配布は十分カバー

必要になったら → Phase 1: Capacitor（1〜2週間）
              → App Store / Google Play 配信

ユーザー数拡大後 → Phase 2: React Native（将来）
```

---

## Phase 0 実装タスク（具体的）

```
salary-app-react/
├── public/
│   ├── manifest.json          ← 追加
│   ├── icons/
│   │   ├── icon-192.png       ← 追加
│   │   └── icon-512.png       ← 追加
├── vite.config.js             ← vite-plugin-pwa 追加
└── index.html                 ← manifest/theme-color metaタグ追加
```

**manifest.json 最小構成:**
```json
{
  "name": "こんまに",
  "short_name": "こんまに",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#fff0f5",
  "theme_color": "#f472b6",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 結論

**まず Phase 0（PWA化）を実施**し、個人での実運用を開始。
App Store配信が必要になった時点で **Phase 1（Capacitor）** に移行する。
現在のReact+Viteスタックはそのままで、追加コスト最小。

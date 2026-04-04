# りかポートフォリオ フルデザインリニューアル

**日付**: 2026-04-04
**担当**: Tech Lead
**ステータス**: 設計完了 → 実装開始

---

## 概要

rika-portfolio のビジュアルデザインを完全リニューアルする。
ロゴ「ひとりっ子遊び場」のイメージに合わせ、ポップ・グリッター・レインボーのテイストに一新。

### デザインキーワード
- **ポップ**: 明るく楽しい、丸みのあるUI
- **グリッター**: キラキラ・スパークル・光沢感
- **レインボー**: ロゴ準拠の虹色グラデーション

### ロゴ分析（logo.png）
- テキスト: 「ひとりっ子遊び場」（Hitorikko no Asobiba）
- カラー: ピンク→オレンジ→黄→黄緑→水色→青紫のレインボーグラデーション
- 背景: シルバーグリッター（細かいラメ）
- 装飾: 白抜きハート
- 全体の印象: ファンシー・キュート・ガーリー

---

## 設計・方針

### カラーパレット（ロゴ準拠）
```
--rainbow-1: #FF6B9D  (ピンク)
--rainbow-2: #FF9A56  (オレンジ)
--rainbow-3: #FFD93D  (イエロー)
--rainbow-4: #6BCB77  (グリーン)
--rainbow-5: #4D96FF  (ブルー)
--rainbow-6: #9B59B6  (パープル)
--rainbow-grad: linear-gradient(90deg, #FF6B9D, #FF9A56, #FFD93D, #6BCB77, #4D96FF, #9B59B6)
--bg-main: #F0ECF3      (淡いラベンダーグレー)
--bg-glitter: #E8E4ED   (グリッターベース)
--white: #FFFFFF
--text-dark: #4A3F55    (ダークパープル系)
--text-light: #8B7FA0
--card-bg: rgba(255,255,255,0.85)
--glitter-silver: #C0C0C0
```

### フォント
- 見出し: `'M PLUS Rounded 1c'` (Google Fonts) — 丸ゴシック、ポップ
- 本文: `'M PLUS Rounded 1c'` weight 400
- 英語アクセント: `'Quicksand'` (Google Fonts) — 丸みのあるサンセリフ

### 背景・質感
- ベース: 淡いラベンダーグレー
- グリッター: CSSアニメーションによるキラキラエフェクト（radial-gradient + animation）
- セクション区切り: 波形またはレインボーライン

### 装飾要素
- ハート（♥ ♡）をアクセントに使用
- スパークル（✦ ✧ ⭐）をセクションヘッダーに
- ボタン: レインボーグラデーション + ホバーでキラキラ

### セクション別デザイン
| セクション | 背景 | 特徴 |
|-----------|------|------|
| Nav | 透明→白半透明（スクロール時） | ロゴ画像使用、レインボーアンダーライン |
| Hero | ヒーロー画像 + レインボーオーバーレイ | ロゴ大きく配置、グリッターパーティクル |
| Marquee | レインボーグラデーション帯 | 白文字 + ハート区切り |
| About | 白背景 | レインボーボーダーの画像枠、タグはパステルカラー |
| Gallery | 淡いラベンダー背景 | フィルターボタンはレインボー、ホバーでキラキラ |
| Services | レインボーグラデーション背景（柔らかめ） | 白カード、アイコンにキラキラ |
| Process | 白背景 | ステップ番号がレインボー、ハート装飾 |
| Contact | パステルピンク背景 | 白カード、レインボーボタン |
| Footer | ダークパープル | ロゴ画像小さく、レインボーアクセント |

---

## 詳細 — チーム分担

### Aチーム: HTML修正
**対象ファイル**: `rika-portfolio/index.html`

1. `<head>` フォント差し替え:
   - 削除: Cormorant Garamond, Jost, Noto Sans JP
   - 追加: M PLUS Rounded 1c (weights: 300,400,500,700), Quicksand (weights: 400,600)
2. nav-logo: `<a>` テキスト「RICA」→ `<img src="images/logo.png" alt="ひとりっ子遊び場" class="nav-logo-img">` に変更
3. hero-content 内:
   - hero-eyebrow: 「Makeup Artist Portfolio」はそのまま
   - hero-title: `Rica<br>Makeup` → `<img src="images/logo.png" alt="ひとりっ子遊び場" class="hero-logo">` に変更
   - hero-tagline: そのまま
4. marquee の `✦` → `♥` に全て変更
5. OGP title/description を「ひとりっ子遊び場」に変更
6. `<title>` を「ひとりっ子遊び場 — Makeup Artist Portfolio」に変更
7. footer-logo: テキスト → `<img>` に変更
8. footer のコピーライト: 「Rica Makeup Artist」→「ひとりっ子遊び場」
9. glitter 背景用の装飾 div を body 直下に追加: `<div class="glitter-bg" aria-hidden="true"></div>`

### Bチーム: CSS フルリライト
**対象ファイル**: `rika-portfolio/css/style.css`

全面書き換え。以下の方針で640行のCSSを新デザインに置換:

#### :root 変数
上記カラーパレット + レインボーグラデーション変数

#### グリッター背景
```css
.glitter-bg {
  position: fixed; inset: 0; z-index: -1;
  background: var(--bg-main);
  /* radial-gradient でキラキラ粒子 */
}
.glitter-bg::before {
  /* アニメーションするスパークル */
  animation: glitter-sparkle 3s ease-in-out infinite;
}
```

#### Nav
- 背景: 透明→白半透明（backdrop-filter: blur）
- ロゴ: max-height: 40px でロゴ画像表示
- リンク: ダークパープル文字、ホバーでレインボーアンダーライン
- ハンバーガー: ダークパープル線

#### Hero
- オーバーレイ: レインボーグラデーション（opacity低め）
- ロゴ画像: max-width: 400px, filter: drop-shadow
- ボタン: レインボーグラデーション + 白アウトライン

#### Marquee
- 背景: レインボーグラデーション（animated）
- 文字: 白、ハート区切り

#### About
- 背景: 白
- 画像枠: レインボーボーダー（3px solid + gradient border trick）
- タグ: パステルカラーの丸ピル
- 数字: レインボーグラデーションテキスト

#### Gallery
- 背景: var(--bg-main)
- フィルターボタン: active時レインボーグラデーション背景
- ホバー: box-shadow にレインボーグロー
- オーバーレイ: パステルピンク半透明

#### Services
- 背景: ソフトレインボーグラデーション（pastel版）
- カード: 白背景、角丸16px、レインボートップボーダー
- タイトル: ダークパープル

#### Process
- 背景: 白
- ステップ番号: レインボーグラデーションテキスト
- カード: ラベンダー淡い背景、角丸

#### Contact
- 背景: パステルピンク
- カード: 白背景、レインボーボーダー
- ボタン: レインボーグラデーション

#### Footer
- 背景: ダークパープル (#2D2140)
- ロゴ: 小さいロゴ画像
- テキスト: 白半透明

#### レスポンシブ
- 既存のブレイクポイント（1024, 768, 480）を維持
- ロゴサイズの調整を追加

### Cチーム: 不要（今回はA+Bで完結）

---

## レビュー観点
- ロゴ画像がすべてのビューポートで適切に表示されるか
- レインボーグラデーションがロゴのカラーと調和しているか
- グリッターエフェクトがパフォーマンスに影響しないか
- テキストの可読性（背景とのコントラスト比）
- モバイルでのレスポンシブ表示

# [TICKET] 給料計算アプリ v3: UI全面刷新

- **ステータス**: open
- **優先度**: high

## 要件

1. **日毎の時給設定** - 日ごとに個別の時給を設定できる
2. **品目設定を別画面** - settings.html として分離
3. **日毎の詳細ページ** - day.html?date=YYYY-MM-DD
4. **トップページに当日データ** - index.html を開くと今日の入力フォームを表示
5. **日毎の合計表示** - カレンダー各セルに「時給分 + バック分 = 合計」を表示

## ファイル構成（新規）

```
salary-app/
├── index.html      ← 今日のデータ入力 + 月カレンダー
├── day.html        ← 日毎詳細ページ（?date=YYYY-MM-DD）
├── settings.html   ← 品目設定ページ
├── style.css       ← 共通スタイル
├── common.js       ← データ管理・計算（共通）
├── index.js        ← トップページ用
├── day.js          ← 日毎ページ用
└── settings.js     ← 品目設定ページ用
```

# 設計書: こんまに LP作成・ログインフロー変更

## 概要

1. LP（`lp.html`）を新規作成
2. ログインフローをLPに集約
3. アプリページ側は「未ログインならlp.htmlへリダイレクト」に変更
4. LPのログイン画面でロゴを大きく表示

---

## ① lp.html（新規作成）

### 構成
```
salary-app/lp.html
```

### HTML構造
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>こんまに - 給料管理アプリ</title>
  <link rel="stylesheet" href="style.css">
</head>
<body class="lp-body">

  <!-- ヒーローセクション -->
  <section class="lp-hero">
    <div class="lp-hero-inner">
      <img src="logo.png" alt="こんまに" class="lp-logo">
      <h1 class="lp-title">こんまに</h1>
      <p class="lp-subtitle">バック・時給・出勤を記録して<br>今月いくら稼いだか一目でわかる</p>
      <button id="lp-login-btn" class="lp-login-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><!-- Googleアイコン省略 --></svg>
        Googleでログイン
      </button>
      <p class="lp-note">無料・登録不要・Googleアカウントだけ</p>
    </div>
  </section>

  <!-- 機能紹介セクション -->
  <section class="lp-features">
    <div class="lp-feature-card">
      <div class="lp-feature-icon">📅</div>
      <div class="lp-feature-title">カレンダーで管理</div>
      <div class="lp-feature-desc">出勤日・時刻・バック数をカレンダーに記録。月をまたいだ集計も自動。</div>
    </div>
    <div class="lp-feature-card">
      <div class="lp-feature-icon">💰</div>
      <div class="lp-feature-title">給料を自動計算</div>
      <div class="lp-feature-desc">固定給＋バック、時給＋バック、どちらのタイプも対応。</div>
    </div>
    <div class="lp-feature-card">
      <div class="lp-feature-icon">📊</div>
      <div class="lp-feature-title">統計ダッシュボード</div>
      <div class="lp-feature-desc">バック比率・平均日給・最高収入日など月の成績を振り返れる。</div>
    </div>
    <div class="lp-feature-card">
      <div class="lp-feature-icon">☁️</div>
      <div class="lp-feature-title">どこからでもアクセス</div>
      <div class="lp-feature-desc">Googleログインでデータをクラウド保存。スマホ・PCどちらでも。</div>
    </div>
  </section>

  <!-- ページ下部CTAボタン -->
  <section class="lp-cta">
    <button id="lp-login-btn-2" class="lp-login-btn">Googleでログイン</button>
  </section>

  <!-- Firebase SDK -->
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
  <script src="firebase-config.js"></script>
  <script src="lp.js"></script>
</body>
</html>
```

---

## ② lp.js（新規作成）

```
salary-app/lp.js
```

ロジック:
- ログインボタン（`#lp-login-btn`、`#lp-login-btn-2`）クリック → `signInWithPopup(GoogleAuthProvider)`
- `onAuthStateChanged` でユーザーが検出されたら → `window.location.href = 'index.html'`
- ボタン押下中はローディング表示（ボタンテキストを「ログイン中…」に変更）

```js
document.addEventListener('DOMContentLoaded', function () {
  var googleProvider = new firebase.auth.GoogleAuthProvider();

  window.firebaseAuth.onAuthStateChanged(function (user) {
    if (user) {
      window.location.href = 'index.html';
    }
  });

  function doLogin() {
    var btns = document.querySelectorAll('.lp-login-btn');
    btns.forEach(function(b) { b.disabled = true; b.textContent = 'ログイン中…'; });
    window.firebaseAuth.signInWithPopup(googleProvider).catch(function (error) {
      btns.forEach(function(b) { b.disabled = false; b.textContent = 'Googleでログイン'; });
      if (error.code !== 'auth/popup-closed-by-user') {
        alert('ログインに失敗しました: ' + error.message);
      }
    });
  }

  var btn1 = document.getElementById('lp-login-btn');
  var btn2 = document.getElementById('lp-login-btn-2');
  if (btn1) btn1.addEventListener('click', doLogin);
  if (btn2) btn2.addEventListener('click', doLogin);
});
```

---

## ③ auth.js 修正

ログインしていない場合、オーバーレイ表示ではなく `lp.html` にリダイレクトする。

### 変更箇所（auth.js の `onAuthStateChanged` の else ブロック）

現在:
```js
} else {
  window.currentUser = null;
  window.appData = null;
  if (loginOverlay) loginOverlay.style.display = 'flex';
  if (appContent)   appContent.style.display   = 'none';
  if (userNameEl)   userNameEl.textContent      = '';
}
```

修正後:
```js
} else {
  window.currentUser = null;
  window.appData = null;
  window.location.href = 'lp.html';
}
```

また、`loginOverlay`・`loginBtn` に関する DOM 参照・イベントリスナーも不要になるため削除する。

---

## ④ index.html / day.html / settings.html / dashboard.html 修正

ログインオーバーレイのHTML（`<div id="login-overlay">〜</div>`）を各ページから削除する。
auth.js がリダイレクトするため不要。

---

## ⑤ style.css — LP用スタイル追加

既存の style.css 末尾に追記する。

```css
/* ===== LP ===== */
.lp-body {
  background: linear-gradient(135deg, #fdf2f8 0%, #faf5ff 50%, #ecfeff 100%);
  background-attachment: fixed;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.lp-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80dvh;
  padding: 48px 24px 40px;
  text-align: center;
}

.lp-hero-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 400px;
  width: 100%;
}

.lp-logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 8px 24px rgba(232,121,160,0.3));
}

.lp-title {
  font-size: 40px;
  font-weight: 900;
  background: linear-gradient(135deg, #e879a0, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1px;
  line-height: 1;
}

.lp-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.7;
  font-weight: 500;
}

.lp-login-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #f472b6, #a78bfa);
  color: #fff;
  border: none;
  border-radius: 9999px;
  padding: 16px 36px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 8px 24px rgba(232,121,160,0.35);
  transition: all 0.2s;
  letter-spacing: 0.3px;
}

.lp-login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(232,121,160,0.45);
}

.lp-login-btn:active { transform: scale(0.97); }
.lp-login-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

.lp-note {
  font-size: 12px;
  color: var(--text-muted);
}

.lp-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 16px 40px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.lp-feature-card {
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1.5px solid rgba(236,131,192,0.25);
  border-radius: var(--radius);
  padding: 20px 16px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.lp-feature-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.lp-feature-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
}

.lp-feature-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.6;
}

.lp-cta {
  display: flex;
  justify-content: center;
  padding: 8px 16px 48px;
}

@media (max-width: 400px) {
  .lp-logo { width: 96px; height: 96px; }
  .lp-title { font-size: 32px; }
  .lp-features { grid-template-columns: 1fr 1fr; gap: 8px; }
  .lp-feature-card { padding: 14px 10px; }
}
```

---

## 分担

| 担当 | ファイル | 作業 |
|------|---------|------|
| Engineer 1 | `salary-app/lp.html` | LP のHTML新規作成 |
| Engineer 2 | `salary-app/style.css` | LP用スタイルを末尾に追記 |
| Engineer 3 | `salary-app/lp.js` 新規作成 / `salary-app/auth.js` 修正 / 4ページからlogin-overlay削除 |

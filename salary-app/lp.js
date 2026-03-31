// lp.js — LP用ログイン処理

document.addEventListener('DOMContentLoaded', function () {
  var googleProvider = new firebase.auth.GoogleAuthProvider();

  // すでにログイン済みならアプリへ
  window.firebaseAuth.onAuthStateChanged(function (user) {
    if (user) {
      window.location.href = 'index.html';
    }
  });

  function doLogin() {
    var btns = document.querySelectorAll('.lp-login-btn');
    btns.forEach(function (b) { b.disabled = true; b.textContent = 'ログイン中…'; });
    window.firebaseAuth.signInWithPopup(googleProvider).catch(function (error) {
      btns.forEach(function (b) { b.disabled = false; b.textContent = 'Googleでログイン'; });
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

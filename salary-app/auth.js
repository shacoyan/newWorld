// auth.js

document.addEventListener('DOMContentLoaded', function() {
  var loginOverlay = document.getElementById('login-overlay');
  var appContent   = document.getElementById('app-content');
  var loginBtn     = document.getElementById('login-btn');
  var logoutBtn    = document.getElementById('logout-btn');
  var userNameEl   = document.getElementById('user-name');

  var googleProvider = new firebase.auth.GoogleAuthProvider();

  if (loginBtn) {
    loginBtn.addEventListener('click', function() {
      window.firebaseAuth.signInWithPopup(googleProvider).catch(function(error) {
        if (error.code !== 'auth/popup-closed-by-user') {
          alert('ログインに失敗しました: ' + error.message);
        }
      });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      window.firebaseAuth.signOut().catch(function(error) {
        alert('ログアウトに失敗しました: ' + error.message);
      });
    });
  }

  window.firebaseAuth.onAuthStateChanged(function(user) {
    if (user) {
      window.currentUser = user;
      if (userNameEl) userNameEl.textContent = user.displayName || user.email;

      Promise.resolve()
        .then(function() {
          return window.syncFromLocalStorage ? window.syncFromLocalStorage(user.uid) : Promise.resolve();
        })
        .catch(function() {})
        .then(function() {
          return window.loadDataAsync ? window.loadDataAsync(user.uid) : Promise.resolve(loadData());
        })
        .then(function(data) {
          window.appData = data;
        })
        .catch(function() {
          window.appData = loadData();
        })
        .then(function() {
          if (loginOverlay) loginOverlay.style.display = 'none';
          if (appContent)   appContent.style.display   = 'block';
          document.dispatchEvent(new CustomEvent('app:ready'));
        });
    } else {
      window.currentUser = null;
      window.appData = null;
      if (loginOverlay) loginOverlay.style.display = 'flex';
      if (appContent)   appContent.style.display   = 'none';
      if (userNameEl)   userNameEl.textContent      = '';
    }
  });
});

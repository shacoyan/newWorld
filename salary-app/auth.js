// auth.js

document.addEventListener('DOMContentLoaded', function() {
  var appContent   = document.getElementById('app-content');
  var logoutBtn    = document.getElementById('logout-btn');
  var userNameEl   = document.getElementById('user-name');

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
          if (appContent)   appContent.style.display   = 'block';
          document.dispatchEvent(new CustomEvent('app:ready'));
        });
    } else {
      window.location.href = 'lp.html';
    }
  });
});

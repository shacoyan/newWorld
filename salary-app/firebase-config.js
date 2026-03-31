// firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyDp02UQu-M4oSyHZRfODx45fzk864AeS-U",
  authDomain: "concafemakemoney.firebaseapp.com",
  projectId: "concafemakemoney",
  storageBucket: "concafemakemoney.firebasestorage.app",
  messagingSenderId: "769214084360",
  appId: "1:769214084360:web:ece3f603125eec1e20e8bd",
  measurementId: "G-8L4VXZ5H2V"
};

const app = firebase.initializeApp(firebaseConfig);

window.firebaseApp = app;
window.firebaseAuth = firebase.auth();
window.firebaseDb = firebase.firestore();

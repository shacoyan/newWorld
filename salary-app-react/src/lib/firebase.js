import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDp02UQu-M4oSyHZRfODx45fzk864AeS-U",
  authDomain: "concafemakemoney.firebaseapp.com",
  projectId: "concafemakemoney",
  storageBucket: "concafemakemoney.firebasestorage.app",
  messagingSenderId: "769214084360",
  appId: "1:769214084360:web:ece3f603125eec1e20e8bd"
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

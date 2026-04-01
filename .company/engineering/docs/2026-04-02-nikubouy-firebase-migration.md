# 設計書: 肉棒家 Firebase移行

## 概要
Supabase → Firebase（Auth + Firestore）に切り替え。

## Firestoreデータ構造
```
users/{userId}/records/{recordId}
  - nickname: string
  - date: string
  - length_cm?: number
  - girth_cm?: number
  - curvature?: string
  - glans_size?: string
  - foreskin?: string
  - color?: string
  - hair_care?: string
  - texture_notes?: string
  - overall_rating?: number
  - memory_notes?: string
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

## 環境変数（.env）
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Aチーム実装指示

### src/lib/firebase.ts（新規）
- initializeApp(config)
- getAuth(app) → export auth
- getFirestore(app) → export db

### src/contexts/AuthContext.tsx
- onAuthStateChanged(auth, ...) でuser監視
- signIn: signInWithEmailAndPassword(auth, email, password)
- signUp: createUserWithEmailAndPassword(auth, email, password)
- signOut: signOut(auth)
- import from "firebase/auth"

## Bチーム実装指示

### Firestore CRUD パターン
```typescript
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuth } from "../../contexts/AuthContext"

// コレクション参照
const recordsRef = collection(db, "users", user.uid, "records")

// 一覧取得
const q = query(recordsRef, orderBy("createdAt", "desc"))
const snapshot = await getDocs(q)
const records = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))

// 新規作成
await addDoc(recordsRef, { ...formData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })

// 更新
await updateDoc(doc(db, "users", user.uid, "records", id), { ...formData, updatedAt: serverTimestamp() })

// 削除
await deleteDoc(doc(db, "users", user.uid, "records", id))

// 1件取得
const snap = await getDoc(doc(db, "users", user.uid, "records", id))
const record = { id: snap.id, ...snap.data() }
```

## 注意事項
- supabase.tsは削除、firebase.tsに差し替え
- import文をすべてfirebase.*に変更
- NikuRecord型のid/user_idは不要になる（Firestoreのdoc.idを使用）
- createdAt/updatedAtはTimestamp型 → 表示時は .toDate().toLocaleDateString()

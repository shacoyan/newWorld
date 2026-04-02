import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getDefaultSettings } from '../lib/calc'

const STORAGE_KEY = 'salary-app-v3'

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const d = JSON.parse(raw)
      return {
        settings: { ...getDefaultSettings(), ...(d.settings || {}) },
        records: d.records || {}
      }
    }
  } catch (e) {}
  return { settings: getDefaultSettings(), records: {} }
}

function saveLocal(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch (e) {}
}

async function loadFirestore(uid) {
  try {
    const ref = doc(db, 'users', uid, 'data', 'salary-app-v3')
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const d = snap.data()
      return {
        settings: { ...getDefaultSettings(), ...(d.settings || {}) },
        records: d.records || {}
      }
    }
  } catch (e) { console.warn('Firestore load failed:', e) }
  return null
}

async function saveFirestore(uid, data) {
  try {
    await setDoc(doc(db, 'users', uid, 'data', 'salary-app-v3'), data, { merge: true })
  } catch (e) { console.warn('Firestore save failed:', e) }
}

export function useAppData(user) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (user === undefined) return
    if (user === null) { setData(loadLocal()); return }
    let cancelled = false
    loadFirestore(user.uid).then(fsData => {
      if (cancelled) return
      const local = loadLocal()
      if (!fsData && Object.keys(local.records || {}).length > 0) {
        saveFirestore(user.uid, local)
        setData(local)
      } else {
        setData(fsData || local)
      }
    })
    return () => { cancelled = true }
  }, [user])

  function persistData(newData) {
    setData(newData)
    saveLocal(newData)
    if (user) saveFirestore(user.uid, newData)
  }

  return { data, persistData }
}

// firestore-sync.js
// common.js と auth.js の後に読み込む

function _firestoreDocRef(uid) {
  return firebase.firestore().doc('users/' + uid + '/data/salary-app-v3');
}

window.loadDataAsync = async function(uid) {
  try {
    var docSnap = await _firestoreDocRef(uid).get();
    if (docSnap.exists) {
      var d = docSnap.data();
      return {
        settings: d.settings || getDefaultSettings(),
        records:  d.records  || {}
      };
    }
    return { settings: getDefaultSettings(), records: {} };
  } catch (e) {
    console.warn('Firestore load failed, fallback to localStorage:', e);
    return loadData();
  }
};

window.saveDataAsync = async function(uid, data) {
  try {
    await _firestoreDocRef(uid).set(data, { merge: true });
  } catch (e) {
    console.warn('Firestore save failed:', e);
  }
};

window.syncFromLocalStorage = async function(uid) {
  try {
    var localData = loadData();
    if (localData && (localData.settings || Object.keys(localData.records || {}).length > 0)) {
      await window.saveDataAsync(uid, localData);
      console.log('localStorage → Firestore 移行完了');
    }
  } catch (e) {
    console.warn('Sync failed:', e);
  }
};

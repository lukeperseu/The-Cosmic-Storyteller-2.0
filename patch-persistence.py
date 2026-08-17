import sys

with open('src/firebase.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  runTransaction, 
  serverTimestamp,
  query,
  collection,
  where,
  getDocs,
  onSnapshot,
  enableIndexedDbPersistence
} from 'firebase/firestore';

// Read config from firebase-applet-config.json
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
  } else if (err.code == 'unimplemented') {
    console.warn('The current browser does not support all of the features required to enable persistence');
  }
});

export const googleProvider = new GoogleAuthProvider();
"""

import re
old_regex = r"import \{\n  getFirestore,[\s\S]*?export const googleProvider = new GoogleAuthProvider\(\);"
content = re.sub(old_regex, replacement.strip(), content)

with open('src/firebase.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched persistence")

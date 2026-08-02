// ============================================
// FIREBASE CONFIG - CDN Version
// ============================================

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

// Collections
const shoesCollection = db.collection('shoes');
const usersCollection = db.collection('users');

// ===== AUTH FUNCTIONS =====
const signInWithPopup = (auth, provider) => {
  return auth.signInWithPopup(provider);
};

const signOut = (auth) => {
  return auth.signOut();
};

const onAuthStateChanged = (auth, callback) => {
  return auth.onAuthStateChanged(callback);
};

// ===== FIRESTORE FUNCTIONS =====
const getDocs = async (collection) => {
  const snapshot = await collection.get();
  return {
    docs: snapshot.docs.map(doc => ({
      id: doc.id,
      data: () => doc.data(),
      ...doc
    })),
    size: snapshot.size,
    empty: snapshot.empty,
    forEach: (callback) => {
      snapshot.docs.forEach(doc => {
        callback({ id: doc.id, data: () => doc.data(), ...doc });
      });
    }
  };
};

const addDoc = async (collection, data) => {
  const docRef = await collection.add(data);
  return docRef;
};

const deleteDoc = async (docRef) => {
  await docRef.delete();
};

const doc = (collection, id) => {
  return collection.doc(id);
};

const getDoc = async (docRef) => {
  const snapshot = await docRef.get();
  return {
    exists: snapshot.exists,
    id: snapshot.id,
    data: () => snapshot.data()
  };
};

const setDoc = async (docRef, data) => {
  await docRef.set(data);
  return docRef;
};

const query = (collection, conditions) => {
  let q = collection;
  if (conditions && conditions.field && conditions.operator && conditions.value) {
    q = q.where(conditions.field, conditions.operator, conditions.value);
  }
  return q;
};

const where = (field, operator, value) => {
  return { field, operator, value };
};

// ===== EXPORT EVERYTHING =====
export { 
  auth, 
  db, 
  provider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  shoesCollection, 
  usersCollection,
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc,
  getDoc,
  setDoc,
  query,
  where
};
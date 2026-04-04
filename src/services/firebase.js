import { initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

let db = null;
if (hasFirebaseConfig) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export const saveTask = async (taskId, prompt) => {
  if (!db) {
    throw new Error('Firebase is not configured. Add VITE_FIREBASE_* variables to .env.');
  }

  await addDoc(collection(db, 'videoTasks'), {
    taskId,
    prompt,
    createdAt: serverTimestamp(),
  });
};

export const getTasks = async () => {
  if (!db) {
    return [];
  }

  const q = query(collection(db, 'videoTasks'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

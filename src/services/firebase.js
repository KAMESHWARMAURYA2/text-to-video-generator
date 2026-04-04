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

const isPermissionDeniedError = (error) =>
  error?.code === 'permission-denied' ||
  error?.message?.toLowerCase().includes('missing or insufficient permissions');

const toFirebaseActionError = (action, error) => {
  if (isPermissionDeniedError(error)) {
    return new Error(
      `Firebase permission denied while trying to ${action}. Please update your Firestore security rules.`,
    );
  }
  return error;
};

export const saveTask = async (taskId, prompt) => {
  if (!db) {
    throw new Error('Firebase is not configured. Add VITE_FIREBASE_* variables to .env.');
  }

  try {
    await addDoc(collection(db, 'videoTasks'), {
      taskId,
      prompt,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    throw toFirebaseActionError('save task data', error);
  }
};

export const getTasks = async () => {
  if (!db) {
    return [];
  }

  try {
    const q = query(collection(db, 'videoTasks'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      console.error(
        'Firebase read permission denied. Returning empty history. Check Firestore security rules.',
        error,
      );
      return [];
    }

    throw toFirebaseActionError('load task history', error);
  }
};

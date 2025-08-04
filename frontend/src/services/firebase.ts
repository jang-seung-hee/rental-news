import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyB5ANB4cZJOMHollDxBylEkjk6ruJL6ODM",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "rental-news-fbefd.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "rental-news-fbefd",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "rental-news-fbefd.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "44673065875",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:44673065875:web:630a14efcd27f8f3ec3e66",
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firestore 초기화
export const db = getFirestore(app);

// Storage 초기화
export const storage = getStorage(app);

// Auth 초기화
export const auth = getAuth(app);

// 개발 환경에서 에뮬레이터 연결
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('Firebase emulators connected');
  } catch (error) {
    console.log('Firebase emulators already connected');
  }
}

export default app; 
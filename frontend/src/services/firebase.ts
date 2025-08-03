// Firebase 설정을 임시로 비활성화
console.log('Firebase is temporarily disabled');

// 더미 객체들 생성
const dummyDb = {
  collection: () => ({ add: () => Promise.resolve({ id: 'dummy' }) }),
  doc: () => ({ get: () => Promise.resolve({ data: () => null }) }),
};

const dummyStorage = {
  ref: () => ({ put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('dummy-url') } }) }),
};

const dummyAuth = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => callback(null),
};

// Firebase 앱 초기화 (더미)
const app = {
  name: 'dummy-app',
  options: {},
};

// Firestore 초기화 (더미)
export const db = dummyDb as any;

// Storage 초기화 (더미)
export const storage = dummyStorage as any;

// Auth 초기화 (더미)
export const auth = dummyAuth as any;

export default app; 
import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  User 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';


interface UseAdminAuthReturn {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  setError: (error: string | null) => void;
}

export const useAdminAuth = (): UseAdminAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 관리자 권한 확인 함수
  const checkAdminStatus = async (uid: string): Promise<boolean> => {
    try {
      const adminDoc = await getDoc(doc(db, 'admins', uid));
      return adminDoc.exists();
    } catch (error) {
      return false;
    }
  };

  // Firebase Auth 상태 변경 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // 사용자가 로그인된 경우 관리자 권한 확인
        const adminStatus = await checkAdminStatus(user.uid);
        setIsAdmin(adminStatus);
      } else {
        // 사용자가 로그아웃된 경우
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 로그인 함수
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 로그인 성공 후 관리자 권한 확인
      const adminStatus = await checkAdminStatus(userCredential.user.uid);
      setIsAdmin(adminStatus);
      
      if (!adminStatus) {
        // 관리자가 아닌 경우 로그아웃
        await signOut(auth);
        setError('관리자 권한이 없습니다.');
      }
    } catch (error: any) {
      // Firebase Auth 에러 메시지 처리
      switch (error.code) {
        case 'auth/user-not-found':
          setError('등록되지 않은 이메일입니다.');
          break;
        case 'auth/wrong-password':
          setError('비밀번호가 올바르지 않습니다.');
          break;
        case 'auth/invalid-email':
          setError('올바르지 않은 이메일 형식입니다.');
          break;
        case 'auth/too-many-requests':
          setError('너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.');
          break;
        default:
          setError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 함수
  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      setError(null);
    } catch (error) {
      setError('로그아웃에 실패했습니다.');
    }
  };

  // 에러 초기화 함수
  const clearError = (): void => {
    setError(null);
  };

  return {
    user,
    isAdmin,
    loading,
    error,
    signIn,
    signOut: handleSignOut,
    clearError,
    setError
  };
}; 
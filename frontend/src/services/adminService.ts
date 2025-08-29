import { 
  getDocs, 
  getDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy,
  setDoc
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  deleteUser
} from 'firebase/auth';
import { 
  getCollectionRef, 
  getDocumentRef, 
  addTimestamps, 
  handleFirebaseError 
} from './firebaseUtils';
import { auth } from './firebase';
import { AdminUser } from '../types/auth';
import { CrudResult } from '../types';

const COLLECTION_NAME = 'admins';

// 관리자 목록 조회
export const getAdmins = async (): Promise<AdminUser[]> => {
  try {
    const adminsRef = getCollectionRef(COLLECTION_NAME);
    const q = query(adminsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AdminUser[];
  } catch (error) {
    console.error('관리자 목록 조회 실패:', error);
    throw new Error(handleFirebaseError(error));
  }
};

// 관리자 계정 생성
export const createAdmin = async (
  email: string, 
  password: string,
  currentAdminUid: string
): Promise<CrudResult<AdminUser>> => {
  try {
    // Firebase Auth에서 사용자 생성
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Firestore admins 컬렉션에 관리자 정보 추가
    const adminData = addTimestamps({
      uid: user.uid,
      email: email,
      role: 'admin' as const,
      createdBy: currentAdminUid
    });
    
    const adminDocRef = getDocumentRef(COLLECTION_NAME, user.uid);
    await setDoc(adminDocRef, adminData);
    
    return {
      success: true,
      data: {
        id: user.uid,
        ...adminData
      }
    };
  } catch (error: any) {
    console.error('관리자 생성 실패:', error);
    
    // Firebase Auth 에러 메시지 처리
    let errorMessage = '관리자 생성에 실패했습니다.';
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = '이미 사용 중인 이메일입니다.';
        break;
      case 'auth/weak-password':
        errorMessage = '비밀번호가 너무 약합니다. 최소 6자 이상 입력해주세요.';
        break;
      case 'auth/invalid-email':
        errorMessage = '올바르지 않은 이메일 형식입니다.';
        break;
      default:
        errorMessage = handleFirebaseError(error);
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// 관리자 삭제
export const deleteAdmin = async (
  adminId: string,
  currentAdminUid: string
): Promise<CrudResult<void>> => {
  try {
    // 자기 자신은 삭제할 수 없음
    if (adminId === currentAdminUid) {
      return {
        success: false,
        error: '자기 자신은 삭제할 수 없습니다.'
      };
    }
    
    // Firestore에서 관리자 정보 삭제
    const adminDocRef = getDocumentRef(COLLECTION_NAME, adminId);
    await deleteDoc(adminDocRef);
    
    // 참고: Firebase Auth에서는 현재 로그인된 사용자만 삭제할 수 있으므로
    // 여기서는 Firestore에서만 삭제합니다.
    // 실제 Auth 계정 삭제는 해당 사용자가 직접 하거나 Admin SDK를 사용해야 합니다.
    
    return {
      success: true
    };
  } catch (error) {
    console.error('관리자 삭제 실패:', error);
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 관리자 권한 확인
export const checkAdminExists = async (uid: string): Promise<boolean> => {
  try {
    const adminDocRef = getDocumentRef(COLLECTION_NAME, uid);
    const adminDoc = await getDoc(adminDocRef);
    return adminDoc.exists();
  } catch (error) {
    console.error('관리자 권한 확인 실패:', error);
    return false;
  }
};

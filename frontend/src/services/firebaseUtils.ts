import { 
  collection, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from './firebase';

// Firestore 컬렉션 참조
export const getCollectionRef = (collectionName: string) => {
  return collection(db, collectionName);
};

// 문서 참조
export const getDocumentRef = (collectionName: string, docId: string) => {
  return doc(db, collectionName, docId);
};

// 타임스탬프 생성
export const createTimestamp = () => {
  return Timestamp.now();
};

// 문서 데이터에 타임스탬프 추가
export const addTimestamps = (data: any) => {
  return {
    ...data,
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  };
};

// 문서 데이터 업데이트 타임스탬프 추가
export const addUpdateTimestamp = (data: any) => {
  return {
    ...data,
    updatedAt: createTimestamp(),
  };
};

// 이미지 업로드
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('이미지 업로드에 실패했습니다.');
  }
};

// 이미지 삭제
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('이미지 삭제에 실패했습니다.');
  }
};

// Firestore 쿼리 빌더
export const buildQuery = (
  collectionName: string,
  conditions: Array<{ field: string; operator: any; value: any }> = [],
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'desc',
  limitCount?: number
) => {
  let q: any = collection(db, collectionName);
  
  // 조건 추가
  conditions.forEach(condition => {
    q = query(q, where(condition.field, condition.operator, condition.value));
  });
  
  // 정렬 추가
  if (orderByField) {
    q = query(q, orderBy(orderByField, orderDirection));
  }
  
  // 제한 추가
  if (limitCount) {
    q = query(q, limit(limitCount));
  }
  
  return q;
};

// 에러 처리 유틸리티
export const handleFirebaseError = (error: any): string => {
  console.error('Firebase error:', error);
  
  if (error.code === 'permission-denied') {
    return '권한이 없습니다.';
  } else if (error.code === 'not-found') {
    return '데이터를 찾을 수 없습니다.';
  } else if (error.code === 'already-exists') {
    return '이미 존재하는 데이터입니다.';
  } else if (error.code === 'invalid-argument') {
    return '잘못된 입력값입니다.';
  } else {
    return '오류가 발생했습니다. 다시 시도해주세요.';
  }
}; 
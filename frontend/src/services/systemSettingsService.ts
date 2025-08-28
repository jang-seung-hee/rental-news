import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { SystemSettings, UpdateSystemSettingsRequest } from '../types/systemSettings';

const COLLECTION_NAME = 'systemSettings';
const DOCUMENT_ID = 'main';

// 시스템 설정 문서 참조 가져오기
const getDocumentRef = () => doc(db, COLLECTION_NAME, DOCUMENT_ID);

// 타임스탬프 추가
const addTimestamps = (data: UpdateSystemSettingsRequest) => ({
  ...data,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
});

// 업데이트 타임스탬프 추가
const addUpdateTimestamp = (data: Partial<UpdateSystemSettingsRequest>) => ({
  ...data,
  updatedAt: Timestamp.now()
});

// Firebase 에러 처리
const handleFirebaseError = (error: any): string => {
  console.error('Firebase error:', error);
  if (error.code === 'permission-denied') {
    return '권한이 없습니다.';
  } else if (error.code === 'not-found') {
    return '데이터를 찾을 수 없습니다.';
  } else {
    return '시스템 오류가 발생했습니다.';
  }
};

// 시스템 설정 조회
export const getSystemSettings = async (): Promise<SystemSettings | null> => {
  try {
    const docRef = getDocumentRef();
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as SystemSettings;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting system settings:', error);
    return null;
  }
};

// 시스템 설정 생성 또는 업데이트
export const upsertSystemSettings = async (
  data: UpdateSystemSettingsRequest
): Promise<{ success: boolean; error?: string }> => {
  try {
    const docRef = getDocumentRef();
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // 기존 문서가 있으면 업데이트
      await updateDoc(docRef, addUpdateTimestamp(data));
    } else {
      // 새 문서 생성
      await setDoc(docRef, addTimestamps(data));
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 기본 시스템 설정 초기화
export const initializeDefaultSystemSettings = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const existingSettings = await getSystemSettings();
    if (existingSettings) {
      return { success: true }; // 이미 초기화됨
    }
    
    const defaultSettings: UpdateSystemSettingsRequest = {
      siteName: '렌탈톡톡',
      defaultTitle: '렌탈톡톡 월간 소식',
      defaultDescription: '최신 렌탈 정보와 프로모션을 확인하세요',
      defaultImageUrl: '/promotionViewTitle_resize.png',
      faviconUrl: '/promotionViewTitle_resize.png',
      // 프로모션 비활성화 시 안내 메시지 기본값
      inactivePromotionTitle: '프로모션 종료',
      inactivePromotionMessage: '죄송합니다. 해당 프로모션은 종료되었습니다.',
      inactivePromotionGuide: '허준 팀장에게 현재 진행중인 프로모션으로 새로 안내해 달라고 하세요.',
      inactivePromotionButtonText: '돌아가기'
    };
    
    return await upsertSystemSettings(defaultSettings);
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

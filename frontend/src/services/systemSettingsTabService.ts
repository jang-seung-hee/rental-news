import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { 
  SiteBasicInfo, 
  SharingInfo, 
  InactivePromotionInfo, 
  TabSaveResult 
} from '../types/systemSettingsTabs';

const SETTINGS_DOC_ID = 'main';
const SETTINGS_COLLECTION = 'systemSettings';

// 사이트 기본 정보 저장
export const saveSiteBasicInfo = async (data: SiteBasicInfo): Promise<TabSaveResult> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    
    await updateDoc(settingsRef, {
      siteName: data.siteName,
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error: any) {
    console.error('사이트 기본 정보 저장 실패:', error);
    return { 
      success: false, 
      error: error.message || '사이트 기본 정보 저장에 실패했습니다.' 
    };
  }
};

// 공유 정보 저장
export const saveSharingInfo = async (data: SharingInfo): Promise<TabSaveResult> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    
    await updateDoc(settingsRef, {
      defaultTitle: data.defaultTitle,
      defaultDescription: data.defaultDescription,
      defaultImageUrl: data.defaultImageUrl,
      faviconUrl: data.faviconUrl,
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error: any) {
    console.error('공유 정보 저장 실패:', error);
    return { 
      success: false, 
      error: error.message || '공유 정보 저장에 실패했습니다.' 
    };
  }
};

// 비활성화 프로모션 정보 저장
export const saveInactivePromotionInfo = async (data: InactivePromotionInfo): Promise<TabSaveResult> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    
    await updateDoc(settingsRef, {
      inactivePromotionTitle: data.inactivePromotionTitle,
      inactivePromotionMessage: data.inactivePromotionMessage,
      inactivePromotionGuide: data.inactivePromotionGuide,
      inactivePromotionButtonText: data.inactivePromotionButtonText,
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error: any) {
    console.error('비활성화 프로모션 정보 저장 실패:', error);
    return { 
      success: false, 
      error: error.message || '비활성화 프로모션 정보 저장에 실패했습니다.' 
    };
  }
};

// 현재 설정 조회 (각 탭에서 사용)
export const getCurrentSettings = async () => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      return settingsDoc.data();
    }
    return null;
  } catch (error) {
    console.error('설정 조회 실패:', error);
    return null;
  }
};

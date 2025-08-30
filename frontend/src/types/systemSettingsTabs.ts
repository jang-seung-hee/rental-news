// 각 탭별 시스템 설정 타입 정의

// 사이트 기본 정보 탭
export interface SiteBasicInfo {
  siteName: string;
}

// 공유 정보 탭  
export interface SharingInfo {
  defaultTitle: string;
  defaultDescription: string;
  defaultImageUrl: string;
  faviconUrl: string;
}

// 비활성화 프로모션 탭
export interface InactivePromotionInfo {
  inactivePromotionTitle: string;
  inactivePromotionMessage: string;
  inactivePromotionGuide: string;
  inactivePromotionButtonText: string;
}

// 각 탭별 저장 결과
export interface TabSaveResult {
  success: boolean;
  error?: string;
}

// 각 탭의 저장 함수 타입
export type TabSaveFunction<T> = (data: T) => Promise<TabSaveResult>;

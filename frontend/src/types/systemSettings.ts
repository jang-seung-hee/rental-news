export interface SystemSettings {
  id: string;
  siteName: string;           // 사이트명
  defaultTitle: string;       // 기본 제목
  defaultDescription: string; // 기본 설명
  defaultImageUrl: string;    // 기본 이미지 URL
  faviconUrl: string;         // 파비콘 URL
  // 프로모션 비활성화 시 안내 메시지 설정
  inactivePromotionTitle: string;      // 비활성화된 프로모션 제목
  inactivePromotionMessage: string;    // 비활성화된 프로모션 메인 메시지
  inactivePromotionGuide: string;      // 비활성화된 프로모션 안내 가이드
  inactivePromotionButtonText: string; // 비활성화된 프로모션 버튼 텍스트
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateSystemSettingsRequest {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImageUrl: string;
  faviconUrl: string;
  // 프로모션 비활성화 시 안내 메시지 설정
  inactivePromotionTitle: string;
  inactivePromotionMessage: string;
  inactivePromotionGuide: string;
  inactivePromotionButtonText: string;
}

import { Timestamp } from 'firebase/firestore';

// 프로모션 기본 인터페이스
export interface Promotion {
  id: string;                    // 프로모션 ID (자동 생성)
  code: string;                  // 프로모션 코드 (레시피코드)
  month: string;                 // 프로모션 월 (YYYY-MM 형식)
  target: string;                // 타겟 고객그룹
  title: string;                 // 제목
  slug: string;                  // SEO 친화적 URL 슬러그
  greeting: string;              // 인사말
  content: string;               // 프로모션 내용 (HTML)
  closing: string;               // 매듭말
  otherProduct1?: string;        // 다른제품 1 (프로모션 ID)
  otherProduct2?: string;        // 다른제품 2 (프로모션 ID)
  otherProduct3?: string;        // 다른제품 3 (프로모션 ID)
  otherProduct4?: string;        // 다른제품 4 (프로모션 ID)
  contact: string;               // 연락처
  shortUrl?: string;             // 단축 URL (선택사항)
  createdAt: Timestamp;          // 생성일시
  updatedAt: Timestamp;          // 수정일시
  isActive?: boolean;            // 활성화 상태 (선택사항)
  imageUrl?: string | null;      // 이미지 URL (선택사항)
}

// 프로모션 생성 요청 타입
export interface CreatePromotionRequest {
  code: string;
  month: string;
  target: string;
  title: string;
  slug: string;
  greeting: string;
  content: string;
  closing: string;
  otherProduct1?: string;
  otherProduct2?: string;
  otherProduct3?: string;
  otherProduct4?: string;
  contact: string;
  shortUrl?: string;
  isActive?: boolean;
  imageUrl?: string | null;
}

// 프로모션 수정 요청 타입
export interface UpdatePromotionRequest {
  id: string;
  code?: string;
  month?: string;
  target?: string;
  title?: string;
  slug?: string;
  greeting?: string;
  content?: string;
  closing?: string;
  otherProduct1?: string;
  otherProduct2?: string;
  otherProduct3?: string;
  otherProduct4?: string;
  contact?: string;
  shortUrl?: string;
  isActive?: boolean;
  imageUrl?: string | null;
}

// 프로모션 목록 응답 타입
export interface PromotionListResponse {
  promotions: Promotion[];
  totalCount: number;
  hasNextPage: boolean;
  lastDoc?: any; // 마지막 문서 스냅샷 (페이지네이션용)
}

// 프로모션 검색 필터 타입
export interface PromotionFilter {
  month?: string;
  target?: string;
  isActive?: boolean;
  searchTerm?: string;
}

// 프로모션 정렬 옵션 타입
export interface PromotionSort {
  field: 'createdAt' | 'updatedAt' | 'title' | 'month';
  direction: 'asc' | 'desc';
}

// 프로모션 폼 데이터 타입
export interface PromotionFormData {
  code: string;
  month: string;
  target: string;
  title: string;
  slug: string;
  greeting: string;
  content: string;
  closing: string;
  otherProduct1?: string;
  otherProduct2?: string;
  otherProduct3?: string;
  otherProduct4?: string;
  contact: string;
  shortUrl?: string;
  isActive: boolean;
  imageFile?: File;
}

// 프로모션 월 옵션 타입
export interface MonthOption {
  value: string;
  label: string;
}

// 프로모션 타겟 옵션 타입
export interface TargetOption {
  value: string;
  label: string;
}

// 프로모션 상태 타입
export type PromotionStatus = 'active' | 'inactive' | 'all';

// 프로모션 유효성 검사 에러 타입
export interface PromotionValidationErrors {
  code?: string;
  month?: string;
  target?: string;
  title?: string;
  slug?: string;
  greeting?: string;
  content?: string;
  closing?: string;
  otherProduct1?: string;
  otherProduct2?: string;
  otherProduct3?: string;
  otherProduct4?: string;
  contact?: string;
  shortUrl?: string;
} 
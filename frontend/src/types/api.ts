// API 응답 기본 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API 에러 타입
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// 페이지네이션 타입
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginationResponse<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// 검색 파라미터 타입
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: PaginationParams;
}

// 파일 업로드 응답 타입
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  contentType: string;
}

// 로딩 상태 타입
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// API 요청 상태 타입
export interface RequestState<T = any> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}

// CRUD 작업 결과 타입
export interface CrudResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  affectedCount?: number;
}

// Firebase 문서 스냅샷 타입
export interface DocumentSnapshot<T = any> {
  id: string;
  data: T;
  exists: boolean;
  ref: any;
}

// Firebase 쿼리 스냅샷 타입
export interface QuerySnapshot<T = any> {
  docs: DocumentSnapshot<T>[];
  empty: boolean;
  size: number;
  metadata: any;
}

// 폼 유효성 검사 결과 타입
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// 사용자 권한 타입
export interface UserPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canManage: boolean;
}

// 인증 상태 타입
export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  error: string | null;
} 
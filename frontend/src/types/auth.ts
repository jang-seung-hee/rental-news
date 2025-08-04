import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

// 관리자 사용자 정보 타입
export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin';
  createdAt: Timestamp;
  createdBy: string; // 최초 관리자 또는 시스템
}

// Firebase Authentication 기반 인증 상태 타입
export interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

// 로그인 폼 데이터 타입
export interface LoginFormData {
  email: string;
  password: string;
}

// 로그인 응답 타입
export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// 관리자 권한 확인 결과 타입
export interface AdminCheckResult {
  isAdmin: boolean;
  adminData?: AdminUser;
  error?: string;
} 
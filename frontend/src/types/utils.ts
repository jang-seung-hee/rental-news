// 유틸리티 타입 정의

// 선택적 필드 타입
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 필수 필드 타입
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// 읽기 전용 타입
export type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 깊은 읽기 전용 타입
export type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

// 함수 타입
export type FunctionType<TArgs extends any[] = any[], TReturn = any> = (...args: TArgs) => TReturn;

// 이벤트 핸들러 타입
export type EventHandler<T = any> = (event: T) => void;

// 비동기 함수 타입
export type AsyncFunction<TArgs extends any[] = any[], TReturn = any> = (...args: TArgs) => Promise<TReturn>;

// 컴포넌트 Props 타입
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

// 폼 필드 타입
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'email' | 'password';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  };
}

// 테이블 컬럼 타입
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  width?: string | number;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
}

// 모달 타입
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// 토스트 메시지 타입
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// 드롭다운 옵션 타입
export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

// 탭 타입
export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

// 스텝 타입
export interface StepItem {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'current' | 'completed' | 'error';
  icon?: React.ReactNode;
}

// 필터 옵션 타입
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

// 정렬 옵션 타입
export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

// 날짜 범위 타입
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// 파일 정보 타입
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  url?: string;
}

// 이미지 정보 타입
export interface ImageInfo extends FileInfo {
  width?: number;
  height?: number;
  alt?: string;
}

// 링크 타입
export interface LinkInfo {
  url: string;
  text: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
} 
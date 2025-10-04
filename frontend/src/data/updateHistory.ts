/**
 * 업데이트 기록 데이터
 * 최신순으로 정렬되어 있습니다.
 */

export interface UpdateRecord {
  date: string;
  content: string;
}

export const updateHistory: UpdateRecord[] = [
  {
    date: '2025-10-04',
    content: '시스템 설정 탭 구성 정리: 기본/공유/비활성 프로모션/관리자 관리'
  },
  {
    date: '2025-10-04',
    content: '공유 정보 탭: 기본 제목·설명, 기본 이미지·파비콘 업로드 및 미리보기 지원'
  },
  {
    date: '2025-10-04',
    content: '사이트 기본 정보 탭: 사이트명 저장, 폼 검증/저장 토스트 추가'
  },
  {
    date: '2025-10-04',
    content: '비활성화 프로모션 탭: 안내 제목/메시지/가이드/버튼 텍스트 저장'
  },
  {
    date: '2025-10-04',
    content: '설정 공통 서비스 보강: getCurrentSettings, 각 탭별 save* 함수 및 updatedAt 기록'
  },
  {
    date: '2025-10-04',
    content: '타입 정의 추가: systemSettingsTabs 인터페이스(SiteBasicInfo, SharingInfo, InactivePromotionInfo)'
  },
  {
    date: '2025-10-04',
    content: '이미지 업로드 연동: Firebase Storage 업로드 유틸 사용(기본 이미지/파비콘)'
  },
  {
    date: '2025-10-04',
    content: '업데이트 기록 섹션 추가: 시스템 설정 화면에 최신 변경사항 노출'
  },
  {
    date: '2025-09-03',
    content: '프로모션 뷰 페이지에 글자 크기 조절 기능 추가 (보통/크게/더 크게)'
  },
  {
    date: '2025-08-02',
    content: '프로모션 상세 페이지 UI 개선 및 반응형 디자인 적용'
  },
  {
    date: '2025-08-01',
    content: '커스텀 태그 관리 기능 추가'
  },
  {
    date: '2025-08-30',
    content: '관리자 대시보드 통계 기능 구현'
  },
  {
    date: '2025-07-29',
    content: '프로모션 생성 및 편집 폼 개선'
  }
];

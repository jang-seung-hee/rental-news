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
    content: '프로모션 뷰 페이지에 글자 크기 조절 기능 추가 (보통/크게/더 크게)'
  },
  {
    date: '2025-10-04',
    content: '사이드바에 프로모션 통계 카운트 집계 기능 추가'
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

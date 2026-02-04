import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';

import { useConfirm } from '../hooks/useConfirm';
import PromotionTable from '../components/admin/PromotionTable';
import BulkCopyDialog from '../components/admin/BulkCopyDialog';

import { Promotion, PromotionFilter, PromotionSort, PromotionStatsSummary } from '../types';
import { getPromotions } from '../services/promotionService';



interface PromotionListProps {
  onEdit: (promotion: Promotion) => void;
  onView: (promotion: Promotion) => void;
  onAdd: () => void;
}

const PromotionList: React.FC<PromotionListProps> = ({
  onEdit,
  onView,
  onAdd
}) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promotionStats, setPromotionStats] = useState<{ [promotionId: string]: PromotionStatsSummary }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<PromotionFilter>({});
  const [sort, setSort] = useState<PromotionSort>({ field: 'code', direction: 'asc' });
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isPersistEnabled, setIsPersistEnabled] = useState(false);
  const [isBulkCopyOpen, setIsBulkCopyOpen] = useState(false);
  const lastDocRef = useRef<any>(null);
  const { ConfirmComponent } = useConfirm();

  const pageSize = 10;

  // 로컬스토리지 키 (버전 업데이트로 인한 초기화)
  const STORAGE_KEY = 'promotion-list-filters-v3';
  const PERSIST_KEY = 'promotion-list-persist-enabled';

  // 검색 조건을 로컬스토리지에 저장
  const saveFiltersToStorage = useCallback(() => {
    const filtersToSave = {
      searchTerm,
      filter,
      sort
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtersToSave));
  }, [searchTerm, filter, sort]);

  // 로컬스토리지에서 검색 조건 불러오기
  const loadFiltersFromStorage = useCallback(() => {
    try {
      const savedFilters = localStorage.getItem(STORAGE_KEY);
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        setSearchTerm(parsed.searchTerm || '');
        setFilter(parsed.filter || {});
        setSort(parsed.sort || { field: 'code', direction: 'asc' });
      }
    } catch (error) {
      console.error('Failed to load filters from storage:', error);
    }
  }, []);

  // 기본값으로 초기화
  const resetToDefault = useCallback(() => {
    setSearchTerm('');
    setFilter({});
    setSort({ field: 'code', direction: 'asc' });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // 컴포넌트 마운트 시 저장된 설정 확인 및 복원
  useEffect(() => {
    const persistEnabled = localStorage.getItem(PERSIST_KEY) === 'true';
    setIsPersistEnabled(persistEnabled);

    if (persistEnabled) {
      loadFiltersFromStorage();
    }
  }, [loadFiltersFromStorage]);

  // 검색 조건이 변경될 때마다 저장 (고정이 활성화된 경우)
  useEffect(() => {
    if (isPersistEnabled) {
      saveFiltersToStorage();
    }
  }, [isPersistEnabled, saveFiltersToStorage]);

  // 프로모션 목록 조회
  const loadPromotions = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getPromotions(filter, sort, pageSize, reset ? null : lastDocRef.current);

      if (result.success && result.data) {
        let filteredPromotions = result.data.promotions;

        // 추가: 서버 정렬이 인덱스 미생성 등의 이유로 동작하지 않을 경우를 대비한 클라이언트 사이드 확정 정렬
        if (sort.field) {
          filteredPromotions = [...filteredPromotions].sort((a, b) => {
            const field = sort.field as keyof Promotion;
            const valA = String(a[field] || '');
            const valB = String(b[field] || '');

            let comparison = 0;
            if (sort.field === 'code') {
              // 코드순일 경우 (YYYYMM-X.Y) 파싱하여 숫자 기반으로 정렬
              const parseCode = (c: string) => {
                const parts = c.split('-');
                const prefix = parts[0] || '';
                const version = parts[1] || '';
                const verParts = version.split('.').map(p => parseInt(p, 10) || 0);
                return { prefix, major: verParts[0] || 0, minor: verParts[1] || 0 };
              };

              const aP = parseCode(valA);
              const bP = parseCode(valB);

              if (aP.prefix !== bP.prefix) {
                comparison = aP.prefix.localeCompare(bP.prefix);
              } else if (aP.major !== bP.major) {
                comparison = aP.major - bP.major;
              } else {
                comparison = aP.minor - bP.minor;
              }
            } else {
              comparison = valA.localeCompare(valB, undefined, { numeric: true });
            }

            return sort.direction === 'asc' ? comparison : -comparison;
          });
        }

        if (reset) {
          setPromotions(filteredPromotions);
        } else {
          setPromotions(prev => [...prev, ...filteredPromotions]);
        }
        setHasNextPage(result.data.hasNextPage);
        lastDocRef.current = result.data.lastDoc;

        // 통계는 별도 useEffect에서 처리
      } else {
        setError(result.error || '프로모션 목록을 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [filter, sort, pageSize]);

  // 프로모션 통계 로드 (배치 조회로 최적화)
  const loadPromotionStats = useCallback(async (promotionIds: string[], reset = false) => {
    try {
      // getPromotionStatsSummary 사용 (실시간 uniqueIPCount 계산)
      const { getPromotionStatsSummary } = await import('../services/promotionStatsService');
      const result = await getPromotionStatsSummary(promotionIds);

      if (result.success && result.data) {
        const newStats = result.data;

        if (reset) {
          setPromotionStats(newStats);
        } else {
          setPromotionStats(prev => ({ ...prev, ...newStats }));
        }
      } else {
        console.warn('프로모션 통계 로드 실패:', result.error);
      }
    } catch (error) {
      console.warn('프로모션 통계 로드 실패:', error);
      // 통계 로드 실패는 사용자에게 알리지 않음 (선택적 기능)
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    loadPromotions(true);
  }, [filter, sort, loadPromotions]);

  // 프로모션이 로드된 후 통계 로드
  useEffect(() => {
    if (promotions.length > 0) {
      const promotionIds = promotions.map(p => p.id);
      loadPromotionStats(promotionIds, true);
    }
  }, [promotions, loadPromotionStats]);

  // 검색 처리
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // 검색어가 변경되면 필터를 업데이트하고 목록을 다시 로드
    const newFilter = { ...filter, searchTerm: value || undefined };
    setFilter(newFilter);
  };

  // 월 필터 처리
  const handleMonthFilter = (month: string) => {
    const newFilter = { ...filter, month: month || undefined };
    setFilter(newFilter);
  };

  // 상태 필터 처리
  const handleStatusFilter = (status: string) => {
    let isActive: boolean | undefined;
    if (status === 'active') isActive = true;
    else if (status === 'inactive') isActive = false;
    else isActive = undefined;

    const newFilter = { ...filter, isActive };
    setFilter(newFilter);
  };

  // 정렬 처리
  const handleSort = (field: 'createdAt' | 'updatedAt' | 'title' | 'month' | 'code') => {
    const newSort: PromotionSort = {
      field,
      direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc'
    };
    setSort(newSort);
  };



  // 더 보기
  const handleLoadMore = () => {
    if (hasNextPage && !isLoading) {
      loadPromotions(false);
    }
  };

  // 검색 조건 고정 토글
  const handlePersistToggle = (enabled: boolean) => {
    setIsPersistEnabled(enabled);
    localStorage.setItem(PERSIST_KEY, enabled.toString());

    if (enabled) {
      // 고정 활성화 시 현재 조건 저장
      saveFiltersToStorage();
    } else {
      // 고정 비활성화 시 기본값으로 초기화
      resetToDefault();
    }
  };

  // 월 옵션 생성
  const generateMonthOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();

    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        const value = `${year}-${monthStr}`;
        const label = `${year}년 ${month}월`;
        options.push({ value, label });
      }
    }

    return options;
  };

  const monthOptions = generateMonthOptions();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="admin-page-title">프로모션 관리</h1>
          <p className="admin-description mt-1">프로모션 목록을 조회하고 관리할 수 있습니다.</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsBulkCopyOpen(true)}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            월별 대량 복사
          </Button>
          <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700">
            새 프로모션 등록
          </Button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="admin-card-title">검색 및 필터</CardTitle>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="persistFilters"
              checked={isPersistEnabled}
              onChange={(e) => handlePersistToggle(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="persistFilters" className="admin-label cursor-pointer">
              검색 조건 고정
            </label>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 검색 */}
            <div className="space-y-2">
              <label className="admin-label">검색</label>
              <Input
                placeholder="제목, 코드, 내용으로 검색..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* 월 필터 */}
            <div className="space-y-2">
              <label className="admin-label">월</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 admin-body-text"
                onChange={(e) => handleMonthFilter(e.target.value)}
                value={filter.month || ''}
              >
                <option value="">전체</option>
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 상태 필터 */}
            <div className="space-y-2">
              <label className="admin-label">상태</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 admin-body-text"
                onChange={(e) => handleStatusFilter(e.target.value)}
                value={filter.isActive === true ? 'active' : filter.isActive === false ? 'inactive' : ''}
              >
                <option value="">전체</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>

            {/* 정렬 */}
            <div className="space-y-2">
              <label className="admin-label">정렬</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 admin-body-text"
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSort({ field: field as any, direction: direction as any });
                }}
                value={`${sort.field}-${sort.direction}`}
              >
                <option value="code-asc">코드순</option>
                <option value="createdAt-desc">최신순</option>
                <option value="createdAt-asc">오래된순</option>
                <option value="title-asc">제목순</option>
                <option value="month-desc">월순</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 에러 메시지 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 프로모션 테이블 */}
      <PromotionTable
        promotions={promotions}
        promotionStats={promotionStats}
        onEdit={onEdit}
        onView={onView}
        isLoading={isLoading}
        onPromotionUpdate={() => loadPromotions(true)}
      />

      {/* 더 보기 버튼 */}
      {hasNextPage && !searchTerm && (
        <div className="flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            variant="outline"
            className="px-8"
          >
            {isLoading ? '로딩 중...' : '더 보기'}
          </Button>
        </div>
      )}

      {/* 대량 복사 다이얼로그 */}
      <BulkCopyDialog
        isOpen={isBulkCopyOpen}
        onClose={() => setIsBulkCopyOpen(false)}
        onSuccess={() => {
          loadPromotions(true);
        }}
      />

      {/* 커스텀 확인창 */}
      <ConfirmComponent />
    </div>
  );
};

export default PromotionList; 
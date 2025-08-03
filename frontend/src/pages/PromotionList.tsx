import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import PromotionTable from '../components/admin/PromotionTable';

import { Promotion, PromotionFilter, PromotionSort } from '../types';
import { getPromotions, deletePromotion } from '../services/promotionService';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<PromotionFilter>({});
  const [sort, setSort] = useState<PromotionSort>({ field: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const pageSize = 10;

  // 프로모션 목록 조회
  const loadPromotions = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const lastDocRef = reset ? null : lastDoc;

      const result = await getPromotions(filter, sort, pageSize, lastDocRef);
      
      if (result.success && result.data) {
        if (reset) {
          setPromotions(result.data.promotions);
          setCurrentPage(1);
        } else {
          setPromotions(prev => [...prev, ...result.data!.promotions]);
        }
        setHasNextPage(result.data.hasNextPage);
        setLastDoc(result.data.lastDoc);
      } else {
        setError(result.error || '프로모션 목록을 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Load promotions error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filter, sort, pageSize]);

  // 초기 로드
  useEffect(() => {
    loadPromotions(true);
  }, [filter, sort]);

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
  const handleSort = (field: 'createdAt' | 'updatedAt' | 'title' | 'month') => {
    const newSort: PromotionSort = {
      field,
      direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc'
    };
    setSort(newSort);
  };

  // 삭제 처리
  const handleDelete = async (promotionId: string) => {
    if (!window.confirm('정말로 이 프로모션을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const result = await deletePromotion(promotionId);
      if (result.success) {
        // 목록에서 삭제된 항목 제거
        setPromotions(prev => prev.filter(p => p.id !== promotionId));
      } else {
        setError(result.error || '삭제에 실패했습니다.');
      }
    } catch (err) {
      setError('삭제 중 오류가 발생했습니다.');
      console.error('Delete promotion error:', err);
    }
  };

  // 더 보기
  const handleLoadMore = () => {
    if (hasNextPage && !isLoading) {
      setCurrentPage(prev => prev + 1);
      loadPromotions(false);
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
          <h1 className="text-3xl font-bold text-gray-900">프로모션 관리</h1>
          <p className="text-gray-600 mt-1">프로모션 목록을 조회하고 관리할 수 있습니다.</p>
        </div>
        <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700">
          새 프로모션 등록
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardHeader>
          <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 검색 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">검색</label>
              <Input
                placeholder="제목, 코드, 내용으로 검색..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* 월 필터 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">월</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="text-sm font-medium text-gray-700">상태</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="text-sm font-medium text-gray-700">정렬</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  const [field] = e.target.value.split('-');
                  handleSort(field as any);
                }}
                value={`${sort.field}-${sort.direction}`}
              >
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
        onEdit={onEdit}
        onDelete={handleDelete}
        onView={onView}
        isLoading={isLoading}
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
    </div>
  );
};

export default PromotionList; 
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  DocumentTextIcon, 
  PlusIcon, 
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { getActivePromotions, getPromotions } from '../services/promotionService';
import { Promotion } from '../types';
import { StatsCardSkeleton, ListSkeleton } from '../components/common/SkeletonLoader';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalPromotions: 0,
    activePromotions: 0,
    thisMonthPromotions: 0
  });
  const [recentPromotions, setRecentPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // 전체 프로모션 수 조회
        const allPromotionsResult = await getPromotions({}, { field: 'createdAt', direction: 'desc' }, 1000);
        const totalPromotions = allPromotionsResult.success ? allPromotionsResult.data?.promotions.length || 0 : 0;
        
        // 활성 프로모션 수 조회
        const activePromotionsResult = await getActivePromotions();
        const activePromotions = activePromotionsResult.success ? activePromotionsResult.data?.length || 0 : 0;
        
        // 이번 달 프로모션 수 계산
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM 형식
        const thisMonthPromotions = allPromotionsResult.success 
          ? allPromotionsResult.data?.promotions.filter(p => p.month === currentMonth).length || 0 
          : 0;
        
        // 최근 프로모션 5개
        const recent = allPromotionsResult.success 
          ? allPromotionsResult.data?.promotions.slice(0, 5) || []
          : [];

        setStats({
          totalPromotions,
          activePromotions,
          thisMonthPromotions
        });
        setRecentPromotions(recent);
      } catch (error) {
        console.error('Dashboard data load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('ko-KR');
    } catch (error) {
      return '-';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* 통계 카드 스켈레톤 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <StatsCardSkeleton />
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <StatsCardSkeleton />
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <StatsCardSkeleton />
          </div>
        </div>

        {/* 빠른 액션 스켈레톤 */}
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* 최근 프로모션 스켈레톤 */}
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <ListSkeleton count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">프로모션 관리 대시보드</h1>
          <p className="text-gray-600 mt-2">프로모션 현황을 한눈에 확인하세요</p>
        </div>
        <Button asChild>
          <Link to="/promotions/new">
            <PlusIcon className="w-5 h-5 mr-2" />
            새 프로모션 등록
          </Link>
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 프로모션</CardTitle>
            <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPromotions}</div>
            <p className="text-xs text-muted-foreground">
              등록된 프로모션 총 개수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 프로모션</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePromotions}</div>
            <p className="text-xs text-muted-foreground">
              현재 활성화된 프로모션
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 프로모션</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonthPromotions}</div>
            <p className="text-xs text-muted-foreground">
              이번 달 등록된 프로모션
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 액션</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/promotions">
                <DocumentTextIcon className="w-6 h-6 mb-2" />
                프로모션 목록
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/promotions/new">
                <PlusIcon className="w-6 h-6 mb-2" />
                새 프로모션 등록
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/settings">
                <UserGroupIcon className="w-6 h-6 mb-2" />
                시스템 설정
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/promotions">
                <ChartBarIcon className="w-6 h-6 mb-2" />
                통계 보기
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 최근 프로모션 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>최근 프로모션</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/promotions">전체 보기</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentPromotions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              등록된 프로모션이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {recentPromotions.map((promotion) => (
                <div
                  key={promotion.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{promotion.title}</h3>
                    <p className="text-sm text-gray-600">
                      {promotion.month} • {promotion.target}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {formatDate(promotion.createdAt)}
                    </span>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/promotions/${promotion.id}`}>
                        보기
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard; 
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  DocumentTextIcon, 
  PlusIcon, 
  ChartBarIcon,
  CalendarIcon,
  EyeIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { getActivePromotions, getPromotions } from '../services/promotionService';
import { 
  getDashboardStats, 
  getTopViewedPromotions, 
  getTopUserPromotions 
} from '../services/promotionStatsService';
import { Promotion, PromotionStatsSummary } from '../types';
import { StatsCardSkeleton, ListSkeleton } from '../components/common/SkeletonLoader';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalPromotions: 0,
    activePromotions: 0,
    thisMonthPromotions: 0
  });
  const [viewStats, setViewStats] = useState({
    yesterday: { totalViews: 0, uniqueIPCount: 0 },
    today: { totalViews: 0, uniqueIPCount: 0 },
    thisMonth: { totalViews: 0, uniqueIPCount: 0 }
  });
  const [topViewedPromotion, setTopViewedPromotion] = useState<PromotionStatsSummary | null>(null);
  const [topUserPromotion, setTopUserPromotion] = useState<PromotionStatsSummary | null>(null);
  const [promotionTitles, setPromotionTitles] = useState<{ [id: string]: string }>({});
  const [recentPromotions, setRecentPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

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

        // 프로모션 제목 매핑 생성
        const titles: { [id: string]: string } = {};
        if (allPromotionsResult.success && allPromotionsResult.data?.promotions) {
          allPromotionsResult.data.promotions.forEach(p => {
            titles[p.id] = p.title;
          });
        }

        setStats({
          totalPromotions,
          activePromotions,
          thisMonthPromotions
        });
        setRecentPromotions(recent);
        setPromotionTitles(titles);
      } catch (error) {
        console.error('대시보드 데이터 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const loadViewStats = async () => {
      try {
        setIsStatsLoading(true);
        
        // 날짜별 전체 통계 조회
        const dashboardStatsResult = await getDashboardStats();
        if (dashboardStatsResult.success && dashboardStatsResult.data) {
          setViewStats(dashboardStatsResult.data);
        }

        // 가장 열람 많은 프로모션 조회
        const topViewedResult = await getTopViewedPromotions(1);
        if (topViewedResult.success && topViewedResult.data && topViewedResult.data.length > 0) {
          setTopViewedPromotion(topViewedResult.data[0]);
        }

        // 가장 이용자 많은 프로모션 조회
        const topUserResult = await getTopUserPromotions(1);
        if (topUserResult.success && topUserResult.data && topUserResult.data.length > 0) {
          setTopUserPromotion(topUserResult.data[0]);
        }
      } catch (error) {
        console.error('통계 데이터 로딩 실패:', error);
      } finally {
        setIsStatsLoading(false);
      }
    };

    loadDashboardData();
    loadViewStats();
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
          <h1 className="admin-page-title">프로모션 관리 대시보드</h1>
          <p className="admin-description mt-2">프로모션 현황을 한눈에 확인하세요</p>
        </div>
        <Button asChild>
          <Link to="/promotions/new">
            <PlusIcon className="w-5 h-5 mr-2" />
            새 프로모션 등록
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {/* 프로모션 관리 통계 */}
        <div className="space-y-3">
          <h3 className="admin-section-title">프로모션 관리 현황</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="admin-stats-label">전체 프로모션</CardTitle>
                <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="admin-stats-value">{stats.totalPromotions}</div>
                <p className="admin-caption">
                  등록된 프로모션 총 개수
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="admin-stats-label">활성 프로모션</CardTitle>
                <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="admin-stats-value">{stats.activePromotions}</div>
                <p className="admin-caption">
                  현재 활성화된 프로모션
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="admin-stats-label">이번 달 프로모션</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="admin-stats-value">{stats.thisMonthPromotions}</div>
                <p className="admin-caption">
                  이번 달 등록된 프로모션
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* 일별 조회 통계 */}
        <div className="space-y-3">
          <h3 className="admin-section-title">일별 조회 현황</h3>
          {isStatsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 어제 열람수 */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="admin-stats-label">어제 열람수</CardTitle>
                  <EyeIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="admin-metric-medium text-blue-600">
                    {viewStats.yesterday.totalViews}건 / {viewStats.yesterday.uniqueIPCount}명
                  </div>
                  <p className="admin-caption">
                    전일 프로모션 조회 현황
                  </p>
                </CardContent>
              </Card>

              {/* 오늘 열람수 */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="admin-stats-label">오늘 열람수</CardTitle>
                  <EyeIcon className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="admin-metric-medium text-green-600">
                    {viewStats.today.totalViews}건 / {viewStats.today.uniqueIPCount}명
                  </div>
                  <p className="admin-caption">
                    오늘 프로모션 조회 현황
                  </p>
                </CardContent>
              </Card>

              {/* 이번달 합계 */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="admin-stats-label">이번달 합계</CardTitle>
                  <UsersIcon className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="admin-metric-medium text-purple-600">
                    {viewStats.thisMonth.totalViews}건 / {viewStats.thisMonth.uniqueIPCount}명
                  </div>
                  <p className="admin-caption">
                    이번달 누적 조회 현황
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* 인기 프로모션 정보 */}
        <div className="space-y-3">
          <h3 className="admin-section-title">인기 프로모션</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 가장 열람 많은 프로모션 */}
            <Card>
              <CardHeader>
                <CardTitle className="admin-card-title flex items-center">
                  <ChartBarIcon className="h-4 w-4 mr-2 text-blue-600" />
                  가장 열람 많은 프로모션
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isStatsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : topViewedPromotion ? (
                  <div>
                    <div className="admin-body-text font-medium truncate">
                      {promotionTitles[topViewedPromotion.promotionId] || '제목 없음'}
                    </div>
                    <div className="admin-caption mt-1">
                      {topViewedPromotion.totalViews}회 조회 / {topViewedPromotion.uniqueIPCount}명 이용
                    </div>
                  </div>
                ) : (
                  <div className="admin-loading">조회 데이터가 없습니다</div>
                )}
              </CardContent>
            </Card>

            {/* 가장 이용자 많은 프로모션 */}
            <Card>
              <CardHeader>
                <CardTitle className="admin-card-title flex items-center">
                  <UsersIcon className="h-4 w-4 mr-2 text-green-600" />
                  가장 이용자 많은 프로모션
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isStatsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : topUserPromotion ? (
                  <div>
                    <div className="admin-body-text font-medium truncate">
                      {promotionTitles[topUserPromotion.promotionId] || '제목 없음'}
                    </div>
                    <div className="admin-caption mt-1">
                      {topUserPromotion.uniqueIPCount}명 이용 / {topUserPromotion.totalViews}회 조회
                    </div>
                  </div>
                ) : (
                  <div className="admin-loading">이용자 데이터가 없습니다</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>



      {/* 최근 프로모션 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="admin-card-title">최근 프로모션</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/promotions" className="admin-button-text">전체 보기</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentPromotions.length === 0 ? (
            <div className="text-center py-8 admin-loading">
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
                    <h3 className="admin-body-text font-medium">{promotion.title}</h3>
                    <p className="admin-caption">
                      {promotion.month} • {promotion.target}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="admin-caption">
                      {formatDate(promotion.createdAt)}
                    </span>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/promotions/${promotion.id}`} className="admin-button-text">
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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Promotion, PromotionViewStats } from '../../types';

import { aggregateViewsByDate, aggregateEnvironmentRatios, aggregateReferrerRatios, aggregateWeekdayRatios, aggregateGroupedTimeRatios } from '../../utils/statsUtils';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '../../hooks/use-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  promotion: Promotion;
}

const PromotionStatsDialog: React.FC<Props> = ({ isOpen, onClose, promotion }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PromotionViewStats | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { toast } = useToast();
  const [start, setStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [end, setEnd] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // 통계 데이터 로드 함수
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { getPromotionStats } = await import('../../services/promotionStatsService');
      const result = await getPromotionStats(promotion.id);
      if (result.success) setStats(result.data || null);
      else setError(result.error || '통계를 불러올 수 없습니다.');
    } catch (e) {
      setError('통계를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [promotion.id]);

  // 통계 리셋 함수
  const handleResetStats = async () => {
    try {
      setIsResetting(true);
      const { resetPromotionStats } = await import('../../services/promotionStatsService');
      const result = await resetPromotionStats(promotion.id);
      
      if (result.success) {
        toast({
          title: "통계 리셋 완료",
          description: `"${promotion.title}" 프로모션의 열람/이용자 수가 리셋되었습니다.`,
          duration: 3000,
        });
        
        // 통계 데이터 다시 로드
        await loadStats();
        setShowResetConfirm(false);
      } else {
        toast({
          title: "리셋 실패",
          description: result.error || "통계 리셋에 실패했습니다.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "리셋 실패",
        description: "통계 리셋 중 오류가 발생했습니다.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadStats();
  }, [isOpen, promotion.id, loadStats]);

  const daily = useMemo(() => {
    if (!stats) return [];
    const s = new Date(start);
    const e = new Date(end);
    return aggregateViewsByDate(stats.viewHistory || [], s, e);
  }, [stats, start, end]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">통계: {promotion.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-sm text-gray-600">시작일</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
                className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="text-sm text-gray-600">종료일</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)}
                className="w-full p-2 border rounded" />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => { /* no-op, use controlled values */ }}>적용</Button>
            </div>
          </div>
          
          {/* 기간 선택 배지 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">빠른 선택:</span>
            <button
              onClick={() => {
                const today = new Date();
                const startDate = new Date(today);
                startDate.setDate(today.getDate() - 6);
                setStart(startDate.toISOString().slice(0, 10));
                setEnd(today.toISOString().slice(0, 10));
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              7일
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const startDate = new Date(today);
                startDate.setDate(today.getDate() - 14);
                setStart(startDate.toISOString().slice(0, 10));
                setEnd(today.toISOString().slice(0, 10));
              }}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            >
              15일
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = today.getMonth(); // 0-based (0=1월, 7=8월)
                
                // YYYY-MM-DD 형식으로 변환
                const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
                const endStr = today.toISOString().slice(0, 10);
                
                console.log('🗓️ 이번달 선택:', { year, month: month + 1, startStr, endStr });
                
                setStart(startStr);
                setEnd(endStr);
              }}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
            >
              이번달
            </button>
          </div>
        </div>

        {loading && <div className="py-10 text-center text-gray-600">로딩 중...</div>}
        {error && <div className="py-4 text-red-600">{error}</div>}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 border border-blue-100 rounded p-3 text-center">
                <div className="text-xs text-blue-700">열람수</div>
                <div className="text-xl font-semibold text-blue-800">{stats?.totalViews || 0}</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded p-3 text-center">
                <div className="text-xs text-green-700">이용자수(고유 IP)</div>
                <div className="text-xl font-semibold text-green-800">
                  {stats?.uniqueIPs ? stats.uniqueIPs.length : 0}
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded p-3 text-center">
                <div className="text-xs text-gray-600">기간 일수</div>
                <div className="text-xl font-semibold text-gray-800">{daily.length}</div>
              </div>
            </div>

            {/* 간단한 막대 그래프 (순수 CSS) */}
            <div className="mb-6">
              <div className="text-sm font-medium text-gray-800 mb-2">일자별 열람수 / 이용자수</div>
              <div className="w-full border rounded p-3 overflow-x-auto">
                <div className="flex items-end space-x-3 min-w-[800px]">
                  {daily.map(d => {
                    const maxViews = Math.max(1, ...daily.map(x => x.totalViews));
                    const maxUsers = Math.max(1, ...daily.map(x => x.uniqueIPCount));
                    const viewsHeight = Math.round((d.totalViews / maxViews) * 120);
                    const usersHeight = Math.round((d.uniqueIPCount / maxUsers) * 120);
                    return (
                      <div key={d.date} className="flex flex-col items-center">
                        <div className="flex items-end space-x-1 mb-1">
                          {/* 열람수 막대 */}
                          <div className="flex flex-col items-center">
                            <div className="bg-blue-500 w-4" style={{ height: `${viewsHeight}px` }} />
                            <div className="text-[9px] text-blue-700 mt-1">{d.totalViews}</div>
                          </div>
                          {/* 이용자수 막대 */}
                          <div className="flex flex-col items-center">
                            <div className="bg-green-500 w-4" style={{ height: `${usersHeight}px` }} />
                            <div className="text-[9px] text-green-700 mt-1">{d.uniqueIPCount}</div>
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-600">{d.date.slice(5)}</div>
                      </div>
                    );
                  })}
                </div>
                {/* 범례 */}
                <div className="flex justify-center mt-3 space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500"></div>
                    <span className="text-xs text-gray-600">열람수</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500"></div>
                    <span className="text-xs text-gray-600">이용자수</span>
                  </div>
                </div>
              </div>
            </div>



            {/* 비율 섹션 */}
            <div className="grid grid-cols-1 gap-6 mt-6">
              {/* 클라이언트 환경 비율 - 막대그래프 */}
              <div>
                <div className="text-sm font-medium text-gray-800 mb-2">클라이언트 환경 비율</div>
                <div className="border rounded p-3">
                  {aggregateEnvironmentRatios(stats?.viewHistory || []).map(r => {
                    const maxCount = Math.max(1, ...aggregateEnvironmentRatios(stats?.viewHistory || []).map(x => x.count));
                    const width = Math.round((r.count / maxCount) * 100);
                    return (
                      <div key={r.label} className="flex items-center mb-2">
                        <div className="w-28 text-xs text-gray-600 whitespace-nowrap">{r.label}</div>
                        <div className="flex-1 ml-3 mr-2">
                          <div className="bg-gray-200 rounded h-4 relative">
                            <div 
                              className="bg-blue-500 h-4 rounded flex items-center justify-end pr-1" 
                              style={{ width: `${width}%` }}
                            >
                              <span className="text-white text-xs font-medium">{r.ratio}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-8 text-xs text-gray-600 text-right">{r.count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>



              {/* 요일 비율 - 막대그래프 */}
              <div>
                <div className="text-sm font-medium text-gray-800 mb-2">요일 비율</div>
                <div className="border rounded p-3">
                  {aggregateWeekdayRatios(stats?.viewHistory || []).map(r => {
                    const maxCount = Math.max(1, ...aggregateWeekdayRatios(stats?.viewHistory || []).map(x => x.count));
                    const width = Math.round((r.count / maxCount) * 100);
                    return (
                      <div key={r.label} className="flex items-center mb-2">
                        <div className="w-28 text-xs text-gray-600 whitespace-nowrap">{r.label}</div>
                        <div className="flex-1 ml-3 mr-2">
                          <div className="bg-gray-200 rounded h-4 relative">
                            <div 
                              className="bg-green-500 h-4 rounded flex items-center justify-end pr-1" 
                              style={{ width: `${width}%` }}
                            >
                              <span className="text-white text-xs font-medium">{r.ratio}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-8 text-xs text-gray-600 text-right">{r.count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 시간대 비율 - 막대그래프 (요청된 커스텀 구간) */}
              <div>
                <div className="text-sm font-medium text-gray-800 mb-2">시간대 비율</div>
                <div className="border rounded p-3 max-h-64 overflow-y-auto">
                  {aggregateGroupedTimeRatios(stats?.viewHistory || []).filter(r => r.count > 0).map(r => {
                    const maxCount = Math.max(1, ...aggregateGroupedTimeRatios(stats?.viewHistory || []).map(x => x.count));
                    const width = Math.round((r.count / maxCount) * 100);
                    return (
                      <div key={r.label} className="flex items-center mb-1">
                        <div className="w-28 text-xs text-gray-600 whitespace-nowrap">{r.label}</div>
                        <div className="flex-1 ml-3 mr-2">
                          <div className="bg-gray-200 rounded h-3 relative">
                            <div 
                              className="bg-purple-500 h-3 rounded flex items-center justify-end pr-1" 
                              style={{ width: `${width}%` }}
                            >
                              <span className="text-white text-[10px] font-medium">{r.ratio}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-6 text-xs text-gray-600 text-right">{r.count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 레퍼러 비율 */}
            <div className="mt-6">
              <div className="text-sm font-medium text-gray-800 mb-2">레퍼러 비율</div>
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2 border">레퍼러</th>
                    <th className="text-right p-2 border">비율</th>
                    <th className="text-right p-2 border">건수</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregateReferrerRatios(stats?.viewHistory || []).map(r => (
                    <tr key={r.label}>
                      <td className="p-2 border">{r.label}</td>
                      <td className="p-2 border text-right">{r.ratio}%</td>
                      <td className="p-2 border text-right">{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 일자별 상세 표 - 가장 아래 배치 */}
            <div className="mt-6">
              <div className="text-sm font-medium text-gray-800 mb-2">일자별 상세</div>
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2 border">날짜</th>
                    <th className="text-right p-2 border">열람수</th>
                    <th className="text-right p-2 border">이용자수</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.map(d => (
                    <tr key={d.date}>
                      <td className="p-2 border">{d.date}</td>
                      <td className="p-2 border text-right">{d.totalViews}</td>
                      <td className="p-2 border text-right">{d.uniqueIPCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 통계 리셋 섹션 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm font-medium text-red-800 mb-2">⚠️ 개발자 도구</div>
                <p className="text-sm text-red-700 mb-4">
                  이 프로모션의 모든 열람/이용자 통계를 리셋합니다. 
                  <br />
                  <strong>이 작업은 되돌릴 수 없으니 신중하게 진행하세요.</strong>
                </p>
                
                {!showResetConfirm ? (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setShowResetConfirm(true)}
                  >
                    통계 리셋
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Alert variant="destructive">
                      <AlertDescription>
                        정말로 "{promotion.title}" 프로모션의 모든 통계를 리셋하시겠습니까?
                        <br />
                        모든 열람 기록과 이용자 데이터가 삭제됩니다.
                      </AlertDescription>
                    </Alert>
                    <div className="flex gap-2">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleResetStats}
                        disabled={isResetting}
                      >
                        {isResetting ? '리셋 중...' : '확인 - 리셋 실행'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowResetConfirm(false)}
                        disabled={isResetting}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PromotionStatsDialog;



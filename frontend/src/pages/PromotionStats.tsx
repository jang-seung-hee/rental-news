import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { getPromotions } from '../services/promotionService';
import { getAllPromotionStats } from '../services/promotionStatsService';
import { Promotion, PromotionViewStats } from '../types';
import { 
  aggregateViewsByDate,
  aggregateEnvironmentRatios,
  aggregateReferrerRatios,
  aggregateWeekdayRatios,
  aggregateGroupedTimeRatios,
  ViewRecordLike
} from '../utils/statsUtils';

const PromotionStatsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [allStats, setAllStats] = useState<PromotionViewStats[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedPromotionId, setSelectedPromotionId] = useState<string>('all');
  const [showDatePopup, setShowDatePopup] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [pRes, sRes] = await Promise.all([
          getPromotions({}, { field: 'createdAt', direction: 'desc' }, 1000),
          getAllPromotionStats()
        ]);
        if (pRes.success && pRes.data?.promotions) {
          setPromotions(pRes.data.promotions);
        }
        if (sRes.success && sRes.data) {
          setAllStats(sRes.data);
        }
      } catch (e) {
        setError('통계를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const promotionTitleMap = useMemo(() => {
    const map: { [id: string]: string } = {};
    promotions.forEach(p => { map[p.id] = p.title; });
    return map;
  }, [promotions]);

  // 월별 프로모션 카운트
  const monthOptions = useMemo(() => {
    const grouped: { [month: string]: number } = {};
    promotions.forEach(p => {
      const month = p.month || '기타';
      grouped[month] = (grouped[month] || 0) + 1;
    });
    // 월 기준으로 정렬
    const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
    return sortedMonths.map(month => ({
      month,
      count: grouped[month]
    }));
  }, [promotions]);

  // 선택된 월에 해당하는 프로모션 목록 (개별 프로모션 드롭다운용)
  const availablePromotions = useMemo(() => {
    if (selectedMonth === 'all') return promotions;
    return promotions.filter(p => (p.month || '기타') === selectedMonth);
  }, [promotions, selectedMonth]);

  // 월별 프로모션 선택 변경 시 개별 프로모션 초기화
  useEffect(() => {
    if (selectedMonth !== 'all') {
      setSelectedPromotionId('all');
    }
  }, [selectedMonth]);

  // 날짜 필터링 모드 판단
  const isDateFilterMode = useMemo(() => {
    return start !== '' && end !== '';
  }, [start, end]);

  // 날짜 필터와 프로모션 필터는 독립적으로 동작

  const startDate = useMemo(() => new Date(start), [start]);
  const endDate = useMemo(() => new Date(end), [end]);

  const filterByRange = useCallback((records: ViewRecordLike[], s: Date, e: Date): ViewRecordLike[] => {
    const startClamped = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    const endClamped = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999);
    return records.filter(r => {
      const dt = (r.viewedAt as any)?.toDate?.() ? (r.viewedAt as any).toDate() : (r.viewedAt as Date);
      return dt >= startClamped && dt <= endClamped;
    });
  }, []);

  const mergedRecordsInRange: ViewRecordLike[] = useMemo(() => {
    const all: ViewRecordLike[] = [];
    
    allStats.forEach(s => {
      // 프로모션 필터링 적용 (날짜 필터와 독립적)
      // 개별 프로모션이 선택된 경우
      if (selectedPromotionId !== 'all' && s.promotionId !== selectedPromotionId) {
        return;
      }
      // 월별 프로모션이 선택된 경우 (개별 프로모션이 'all'일 때)
      if (selectedMonth !== 'all' && selectedPromotionId === 'all') {
        const promotion = promotions.find(p => p.id === s.promotionId);
        if (!promotion || (promotion.month || '기타') !== selectedMonth) {
          return;
        }
      }
      
      if (Array.isArray(s.viewHistory)) all.push(...s.viewHistory as any);
    });

    // 날짜 필터가 설정된 경우 날짜 범위 필터링 추가 적용
    if (isDateFilterMode) {
      return filterByRange(all, startDate, endDate);
    }
    
    // 날짜 필터가 없으면 전체 기간 데이터 반환
    return all as ViewRecordLike[];
  }, [allStats, selectedPromotionId, selectedMonth, promotions, isDateFilterMode, startDate, endDate, filterByRange]);

  const daily = useMemo(() => {
    if (!isDateFilterMode) {
      // 날짜 필터가 없으면 최근 30일 기본 표시
      const defaultEnd = new Date();
      const defaultStart = new Date();
      defaultStart.setDate(defaultEnd.getDate() - 29);
      return aggregateViewsByDate(mergedRecordsInRange, defaultStart, defaultEnd);
    }
    return aggregateViewsByDate(mergedRecordsInRange, startDate, endDate);
  }, [mergedRecordsInRange, startDate, endDate, isDateFilterMode]);

  const overview = useMemo(() => {
    const totalViews = mergedRecordsInRange.length;
    const uniqueIPs = new Set<string>();
    mergedRecordsInRange.forEach(r => uniqueIPs.add((r as any).ip));
    
    // 프로모션 필터링된 통계에서 포함된 프로모션 수 계산
    let filteredStats = allStats;
    if (selectedPromotionId !== 'all') {
      filteredStats = allStats.filter(s => s.promotionId === selectedPromotionId);
    } else if (selectedMonth !== 'all') {
      filteredStats = allStats.filter(s => {
        const promotion = promotions.find(p => p.id === s.promotionId);
        return promotion && (promotion.month || '기타') === selectedMonth;
      });
    }
    
    const involvedPromotionCount = filteredStats.filter(s => {
      if (!isDateFilterMode) return s.viewHistory && s.viewHistory.length > 0;
      return (s.viewHistory || []).some((r: any) => {
        const dt = (r.viewedAt as any)?.toDate?.() ? r.viewedAt.toDate() : r.viewedAt;
        return dt >= startDate && dt <= endDate;
      });
    }).length;
    
    return { totalViews, uniqueIPCount: uniqueIPs.size, involvedPromotionCount };
  }, [mergedRecordsInRange, allStats, startDate, endDate, isDateFilterMode, selectedPromotionId, selectedMonth, promotions]);

  const monthlyByPromotion = useMemo(() => {
    const acc: { [pid: string]: { totalViews: number; uniqueIPs: Set<string> } } = {};
    
    // 프로모션 필터링된 통계 계산
    let filteredStats = allStats;
    if (selectedPromotionId !== 'all') {
      filteredStats = allStats.filter(s => s.promotionId === selectedPromotionId);
    } else if (selectedMonth !== 'all') {
      filteredStats = allStats.filter(s => {
        const promotion = promotions.find(p => p.id === s.promotionId);
        return promotion && (promotion.month || '기타') === selectedMonth;
      });
    }
    
    filteredStats.forEach(s => {
      (s.viewHistory || []).forEach((r: any) => {
        const dt = (r.viewedAt as any)?.toDate?.() ? r.viewedAt.toDate() : r.viewedAt;
        
        // 날짜 필터가 있으면 날짜 범위 체크, 없으면 모든 데이터
        let includeRecord = true;
        if (isDateFilterMode) {
          includeRecord = dt >= startDate && dt <= endDate;
        }
        
        if (includeRecord) {
          const pid = s.promotionId;
          if (!acc[pid]) acc[pid] = { totalViews: 0, uniqueIPs: new Set<string>() };
          acc[pid].totalViews += 1;
          acc[pid].uniqueIPs.add(r.ip);
        }
      });
    });
    
    const rows = Object.entries(acc).map(([pid, v]) => ({
      promotionId: pid,
      title: promotionTitleMap[pid] || pid,
      totalViews: v.totalViews,
      uniqueIPCount: v.uniqueIPs.size
    }));
    rows.sort((a, b) => b.totalViews - a.totalViews);
    return rows;
  }, [allStats, promotionTitleMap, isDateFilterMode, selectedPromotionId, selectedMonth, promotions, startDate, endDate]);

  return (
    <div className="space-y-4">
      <h1 className="admin-page-title">프로모션 통계</h1>

      {/* 검색 필터 그룹 */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="admin-section-title mb-4">검색 필터</h3>
        
        <div className="mb-4">
          {/* 기본 필터 (월별, 개별) + 날짜 버튼 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 월별 프로모션 선택 */}
            <div className="min-w-0">
              <label className="admin-label mb-1 block">월별 프로모션</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 truncate admin-body-text"
              >
                <option value="all">전체 월</option>
                {monthOptions.map(option => (
                  <option key={option.month} value={option.month}>
                    {option.month} ({option.count}개)
                  </option>
                ))}
              </select>
            </div>

            {/* 개별 프로모션 선택 */}
            <div className="min-w-0">
              <label className="admin-label mb-1 block">개별 프로모션</label>
              <select 
                value={selectedPromotionId} 
                onChange={(e) => setSelectedPromotionId(e.target.value)}
                disabled={selectedMonth === 'all'}
                className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 truncate admin-body-text ${
                  selectedMonth === 'all' ? 'bg-gray-100 text-gray-400' : ''
                }`}
              >
                <option value="all">전체 프로모션</option>
                {availablePromotions.map(promotion => (
                  <option key={promotion.id} value={promotion.id}>
                    {promotion.title.length > 15 ? promotion.title.substring(0, 15) + '...' : promotion.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 날짜 필터 버튼 */}
            <div className="min-w-0">
              <label className="admin-label mb-1 block">날짜 필터</label>
              <button
                onClick={() => setShowDatePopup(true)}
                className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left admin-body-text ${
                  isDateFilterMode ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'
                }`}
              >
                {isDateFilterMode 
                  ? `${start} ~ ${end}` 
                  : '날짜 범위 선택'}
              </button>
            </div>
          </div>
        </div>

        {/* 날짜 선택 팝업 */}
        {showDatePopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="admin-subsection-title mb-4">날짜 범위 선택</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="admin-label mb-1 block">시작일</label>
                  <input 
                    type="date" 
                    value={start} 
                    onChange={(e) => setStart(e.target.value)} 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 admin-body-text" 
                  />
                </div>
                
        <div>
                  <label className="admin-label mb-1 block">종료일</label>
                  <input 
                    type="date" 
                    value={end} 
                    onChange={(e) => setEnd(e.target.value)} 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 admin-body-text" 
                  />
                </div>

                {/* 빠른 선택 버튼들 */}
                <div className="flex flex-wrap gap-2">
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
                    최근 7일
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const startDate = new Date(today);
                      startDate.setDate(today.getDate() - 29);
                      setStart(startDate.toISOString().slice(0, 10));
                      setEnd(today.toISOString().slice(0, 10));
                    }}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                  >
                    최근 30일
                  </button>
                  <button
                    onClick={() => {
                      setStart('');
                      setEnd('');
                    }}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    초기화
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowDatePopup(false)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={() => setShowDatePopup(false)}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  적용
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 현재 필터 상태 표시 */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {isDateFilterMode && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded-md font-medium whitespace-nowrap">
                날짜 필터: {start} ~ {end}
              </span>
            )}
            {selectedPromotionId !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md font-medium max-w-xs truncate">
                선택된 프로모션: {promotionTitleMap[selectedPromotionId]}
              </span>
            )}
            {selectedMonth !== 'all' && selectedPromotionId === 'all' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-md font-medium whitespace-nowrap">
                선택된 월: {selectedMonth}
              </span>
            )}
            {!isDateFilterMode && selectedMonth === 'all' && selectedPromotionId === 'all' && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md font-medium whitespace-nowrap">
                전체 데이터
              </span>
            )}
          </div>
          
          {/* 필터 초기화 버튼 */}
          {(isDateFilterMode || selectedMonth !== 'all' || selectedPromotionId !== 'all') && (
            <button
              onClick={() => {
                setSelectedMonth('all');
                setSelectedPromotionId('all');
                setStart('');
                setEnd('');
              }}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors whitespace-nowrap"
            >
              전체 초기화
            </button>
          )}
        </div>
      </div>

      {loading && <div className="py-10 text-center admin-loading">로딩 중...</div>}
      {error && <div className="py-4 admin-error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 border border-blue-100 rounded p-3 text-center">
              <div className="admin-stats-label text-blue-700">열람수</div>
              <div className="admin-metric-medium text-blue-800">{overview.totalViews}</div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded p-3 text-center">
              <div className="admin-stats-label text-green-700">이용자수(고유 IP)</div>
              <div className="admin-metric-medium text-green-800">{overview.uniqueIPCount}</div>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded p-3 text-center">
              <div className="admin-stats-label text-gray-600">포함된 프로모션 수</div>
              <div className="admin-metric-medium text-gray-800">{overview.involvedPromotionCount}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="admin-subsection-title mb-2">일자별 열람수 / 이용자수</div>
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
                        <div className="flex flex-col items-center">
                          <div className="bg-blue-500 w-4" style={{ height: `${viewsHeight}px` }} />
                          <div className="text-[9px] text-blue-700 mt-1">{d.totalViews}</div>
                        </div>
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
              <div className="flex justify-center mt-3 space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500"></div>
                  <span className="admin-caption">열람수</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500"></div>
                  <span className="admin-caption">이용자수</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-6">
            <div>
              <div className="admin-subsection-title mb-2">클라이언트 환경 비율</div>
              <div className="border rounded p-3">
                {aggregateEnvironmentRatios(mergedRecordsInRange as any).map(r => {
                  const maxCount = Math.max(1, ...aggregateEnvironmentRatios(mergedRecordsInRange as any).map(x => x.count));
                  const width = Math.round((r.count / maxCount) * 100);
                  return (
                    <div key={r.label} className="flex items-center mb-2">
                      <div className="w-28 admin-caption whitespace-nowrap">{r.label}</div>
                      <div className="flex-1 ml-3 mr-2">
                        <div className="bg-gray-200 rounded h-4 relative">
                          <div className="bg-blue-500 h-4 rounded flex items-center justify-end pr-1" style={{ width: `${width}%` }}>
                            <span className="text-white text-xs font-medium">{r.ratio}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-8 admin-caption text-right">{r.count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="admin-subsection-title mb-2">요일 비율</div>
              <div className="border rounded p-3">
                {aggregateWeekdayRatios(mergedRecordsInRange as any).map(r => {
                  const maxCount = Math.max(1, ...aggregateWeekdayRatios(mergedRecordsInRange as any).map(x => x.count));
                  const width = Math.round((r.count / maxCount) * 100);
                  return (
                    <div key={r.label} className="flex items-center mb-2">
                      <div className="w-28 admin-caption whitespace-nowrap">{r.label}</div>
                      <div className="flex-1 ml-3 mr-2">
                        <div className="bg-gray-200 rounded h-4 relative">
                          <div className="bg-green-500 h-4 rounded flex items-center justify-end pr-1" style={{ width: `${width}%` }}>
                            <span className="text-white text-xs font-medium">{r.ratio}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-8 admin-caption text-right">{r.count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="admin-subsection-title mb-2">시간대 비율</div>
              <div className="border rounded p-3 max-h-64 overflow-y-auto">
                {aggregateGroupedTimeRatios(mergedRecordsInRange as any).filter(r => r.count > 0).map(r => {
                  const maxCount = Math.max(1, ...aggregateGroupedTimeRatios(mergedRecordsInRange as any).map(x => x.count));
                  const width = Math.round((r.count / maxCount) * 100);
                  return (
                    <div key={r.label} className="flex items-center mb-1">
                      <div className="w-28 admin-caption whitespace-nowrap">{r.label}</div>
                      <div className="flex-1 ml-3 mr-2">
                        <div className="bg-gray-200 rounded h-3 relative">
                          <div className="bg-purple-500 h-3 rounded flex items-center justify-end pr-1" style={{ width: `${width}%` }}>
                            <span className="text-white text-[10px] font-medium">{r.ratio}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-6 admin-caption text-right">{r.count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="admin-subsection-title mb-2">레퍼러 비율</div>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2 border admin-table-header">레퍼러</th>
                  <th className="text-right p-2 border admin-table-header">비율</th>
                  <th className="text-right p-2 border admin-table-header">건수</th>
                </tr>
              </thead>
              <tbody>
                {aggregateReferrerRatios(mergedRecordsInRange as any).map(r => (
                  <tr key={r.label}>
                    <td className="p-2 border admin-table-cell">{r.label}</td>
                    <td className="p-2 border admin-table-cell text-right">{r.ratio}%</td>
                    <td className="p-2 border admin-table-cell text-right">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <div className="admin-subsection-title mb-2">
              {isDateFilterMode 
                ? `기간별 프로모션 통계 (${start} ~ ${end})`
                : selectedPromotionId !== 'all' 
                  ? `선택된 프로모션 통계` 
                  : selectedMonth !== 'all' 
                    ? `${selectedMonth} 월 프로모션 통계` 
                    : '전체 프로모션 통계'
              }
            </div>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2 border admin-table-header">프로모션</th>
                  <th className="text-right p-2 border admin-table-header">열람수</th>
                  <th className="text-right p-2 border admin-table-header">이용자수</th>
                </tr>
              </thead>
              <tbody>
                {monthlyByPromotion.map(row => (
                  <tr key={row.promotionId}>
                    <td className="p-2 border admin-table-cell">{row.title}</td>
                    <td className="p-2 border admin-table-cell text-right">{row.totalViews}</td>
                    <td className="p-2 border admin-table-cell text-right">{row.uniqueIPCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <div className="admin-subsection-title mb-2">일자별 상세</div>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2 border admin-table-header">날짜</th>
                  <th className="text-right p-2 border admin-table-header">열람수</th>
                  <th className="text-right p-2 border admin-table-header">이용자수</th>
                </tr>
              </thead>
              <tbody>
                {daily.map(d => (
                  <tr key={d.date}>
                    <td className="p-2 border admin-table-cell">{d.date}</td>
                    <td className="p-2 border admin-table-cell text-right">{d.totalViews}</td>
                    <td className="p-2 border admin-table-cell text-right">{d.uniqueIPCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default PromotionStatsPage;



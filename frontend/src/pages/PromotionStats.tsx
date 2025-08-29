import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPromotionById } from '../services/promotionService';
import { getPromotionStats } from '../services/promotionStatsService';
import { aggregateViewsByDate } from '../utils/statsUtils';

const PromotionStatsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') || '';
  const [title, setTitle] = useState('통계');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  });
  const [end, setEnd] = useState<string>(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const p = await getPromotionById(id);
        if (p.success && p.data) setTitle(`통계: ${p.data.title}`);
        const s = await getPromotionStats(id);
        if (s.success) setStats(s.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const daily = useMemo(() => {
    if (!stats) return [];
    return aggregateViewsByDate(stats.viewHistory || [], new Date(start), new Date(end));
  }, [stats, start, end]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm text-gray-600">시작일</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="text-sm text-gray-600">종료일</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full p-2 border rounded" />
        </div>
      </div>

      {loading && <div className="py-10 text-center text-gray-600">로딩 중...</div>}

      {!loading && stats && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 border border-blue-100 rounded p-3 text-center">
              <div className="text-xs text-blue-700">열람수</div>
              <div className="text-xl font-semibold text-blue-800">{stats?.totalViews || 0}</div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded p-3 text-center">
              <div className="text-xs text-green-700">이용자수(고유 IP)</div>
              <div className="text-xl font-semibold text-green-800">{stats?.uniqueIPCount || 0}</div>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded p-3 text-center">
              <div className="text-xs text-gray-600">기간 일수</div>
              <div className="text-xl font-semibold text-gray-800">{daily.length}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm font-medium text-gray-800 mb-2">일자별 열람수</div>
            <div className="w-full border rounded p-3 overflow-x-auto">
              <div className="flex items-end space-x-2 min-w-[800px]">
                {daily.map(d => {
                  const max = Math.max(1, ...daily.map(x => x.totalViews));
                  const h = Math.round((d.totalViews / max) * 140);
                  return (
                    <div key={d.date} className="flex flex-col items-center">
                      <div className="bg-blue-500 w-6" style={{ height: `${h}px` }} />
                      <div className="text-[10px] text-gray-600 mt-1">{d.date}</div>
                      <div className="text-[10px] text-gray-800">{d.totalViews}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
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
        </>
      )}
    </div>
  );
};

export default PromotionStatsPage;



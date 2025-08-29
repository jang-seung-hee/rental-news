import { Timestamp } from 'firebase/firestore';

export interface ViewRecordLike {
  ip: string;
  userAgent: string;
  viewedAt: Timestamp | Date;
  referrer?: string;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  totalViews: number;
  uniqueIPCount: number;
}

export const toDateKey = (dt: Date): string => {
  const y = dt.getFullYear();
  const m = `${dt.getMonth() + 1}`.padStart(2, '0');
  const d = `${dt.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const clampRange = (start: Date, end: Date): { start: Date; end: Date } => {
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
  return { start: s, end: e };
};

export const aggregateViewsByDate = (
  viewHistory: ViewRecordLike[] = [],
  start: Date,
  end: Date
): DailyStats[] => {
  const { start: s, end: e } = clampRange(start, end);
  const map: Record<string, { total: number; ips: Set<string> }> = {};

  // initialize all dates in range to zero for chart continuity
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    map[toDateKey(d)] = { total: 0, ips: new Set() };
  }

  for (const rec of viewHistory) {
    const date = rec.viewedAt instanceof Date ? rec.viewedAt : (rec.viewedAt as any)?.toDate?.() || new Date(rec.viewedAt as any);
    if (!date || date < s || date > e) continue;
    const key = toDateKey(date);
    if (!map[key]) map[key] = { total: 0, ips: new Set() };
    map[key].total += 1;
    map[key].ips.add(rec.ip || 'unknown');
  }

  return Object.entries(map)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, v]) => ({ date, totalViews: v.total, uniqueIPCount: v.ips.size }));
};

export interface RatioItem { label: string; count: number; ratio: number; }

export const aggregateEnvironmentRatios = (viewHistory: ViewRecordLike[] = []): RatioItem[] => {
  const map: Record<string, number> = {};
  let total = 0;
  for (const rec of viewHistory) {
    const ua = (rec.userAgent || 'unknown').toLowerCase();
    let key = '기타';
    if (ua.includes('windows')) key = 'Windows';
    else if (ua.includes('macintosh') || ua.includes('mac os')) key = 'Mac';
    else if (ua.includes('android')) key = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) key = 'iOS';
    map[key] = (map[key] || 0) + 1;
    total += 1;
  }
  return Object.entries(map)
    .map(([label, count]) => ({ label, count, ratio: total ? Math.round((count / total) * 1000) / 10 : 0 }))
    .sort((a, b) => b.count - a.count);
};

export const aggregateWeekdayRatios = (viewHistory: ViewRecordLike[] = []): RatioItem[] => {
  const names = ['일', '월', '화', '수', '목', '금', '토'];
  const map: Record<string, number> = {};
  let total = 0;
  for (const rec of viewHistory) {
    const date = rec.viewedAt instanceof Date ? rec.viewedAt : (rec.viewedAt as any)?.toDate?.() || new Date(rec.viewedAt as any);
    if (!date) continue;
    const key = names[date.getDay()];
    map[key] = (map[key] || 0) + 1;
    total += 1;
  }
  return names.map(n => ({ label: n, count: map[n] || 0, ratio: total ? Math.round(((map[n] || 0) / total) * 1000) / 10 : 0 }));
};

export const aggregateHourRatios = (viewHistory: ViewRecordLike[] = []): RatioItem[] => {
  const map: number[] = new Array(24).fill(0);
  let total = 0;
  for (const rec of viewHistory) {
    const date = rec.viewedAt instanceof Date ? rec.viewedAt : (rec.viewedAt as any)?.toDate?.() || new Date(rec.viewedAt as any);
    if (!date) continue;
    const h = date.getHours();
    map[h] += 1;
    total += 1;
  }
  return map.map((count, h) => ({ label: `${h}시`, count, ratio: total ? Math.round((count / total) * 1000) / 10 : 0 }));
};

// 사용자 지정 시간대 그룹으로 비율 집계
// 기본 그룹(요청안):
// 07:01-10:00, 10:01-12:00, 12:01-13:00, 13:01-15:00, 15:01-17:00, 17:01-18:00, 18:01-22:00, 22:01-07:00
export const aggregateGroupedTimeRatios = (viewHistory: ViewRecordLike[] = []): RatioItem[] => {
  type Range = { label: string; startMin: number; endMin: number };
  const ranges: Range[] = [
    { label: '07:01~10:00', startMin: 7 * 60 + 1, endMin: 10 * 60 },
    { label: '10:01~12:00', startMin: 10 * 60 + 1, endMin: 12 * 60 },
    { label: '12:01~13:00', startMin: 12 * 60 + 1, endMin: 13 * 60 },
    { label: '13:01~15:00', startMin: 13 * 60 + 1, endMin: 15 * 60 },
    { label: '15:01~17:00', startMin: 15 * 60 + 1, endMin: 17 * 60 },
    { label: '17:01~18:00', startMin: 17 * 60 + 1, endMin: 18 * 60 },
    { label: '18:01~22:00', startMin: 18 * 60 + 1, endMin: 22 * 60 },
    // 자정 넘김 구간: 22:01~07:00
    { label: '22:01~07:00', startMin: 22 * 60 + 1, endMin: 7 * 60 }
  ];

  const counts: Record<string, number> = Object.fromEntries(ranges.map(r => [r.label, 0]));
  let total = 0;

  for (const rec of viewHistory) {
    const dt = rec.viewedAt instanceof Date ? rec.viewedAt : (rec.viewedAt as any)?.toDate?.() || new Date(rec.viewedAt as any);
    if (!dt) continue;
    const minutes = dt.getHours() * 60 + dt.getMinutes();
    for (const r of ranges) {
      if (r.startMin <= r.endMin) {
        // 일반 구간
        if (minutes >= r.startMin && minutes <= r.endMin) {
          counts[r.label] += 1;
          total += 1;
          break;
        }
      } else {
        // 자정 넘김 구간 (예: 22:01-07:00)
        if (minutes >= r.startMin || minutes <= r.endMin) {
          counts[r.label] += 1;
          total += 1;
          break;
        }
      }
    }
  }

  return ranges.map(r => {
    const count = counts[r.label] || 0;
    const ratio = total ? Math.round((count / total) * 1000) / 10 : 0;
    return { label: r.label, count, ratio };
  });
};

export const aggregateReferrerRatios = (viewHistory: ViewRecordLike[] = []): RatioItem[] => {
  const map: Record<string, number> = {};
  let total = 0;
  for (const rec of viewHistory) {
    let ref = rec.referrer || '직접 방문';
    try {
      if (ref && ref !== '직접 방문') {
        const u = new URL(ref);
        ref = u.hostname.replace('www.', '');
      }
    } catch { /* ignore malformed urls */ }
    map[ref] = (map[ref] || 0) + 1;
    total += 1;
  }
  return Object.entries(map)
    .map(([label, count]) => ({ label, count, ratio: total ? Math.round((count / total) * 1000) / 10 : 0 }))
    .sort((a, b) => b.count - a.count);
};



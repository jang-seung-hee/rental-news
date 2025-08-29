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



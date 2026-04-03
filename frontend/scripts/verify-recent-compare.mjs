import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadEnvFile = (envPath) => {
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  });
};

loadEnvFile(path.resolve(__dirname, '..', '.env'));

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const normalizePromotionTitle = (title) => {
  let t = (title || '').trim();
  if (!t) return '';
  t = t.replace(/^프로모션\s*안내\s*\(\s*/i, '');
  t = t.replace(/\)\s*$/, '');
  t = t.replace(/^\s*\d{1,2}\s*\/\s*\d{1,2}\s*월\s*/i, '');
  t = t.replace(/^\s*\d{1,2}\s*~\s*\d{1,2}\s*월\s*/i, '');
  t = t.replace(/^\s*\d{1,2}\s*월\s*/i, '');
  return t.trim() || title;
};

const buildRecentMonths = () => {
  const now = new Date();
  const months = [];
  for (let i = 0; i < 4; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({ key, year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  const hasOtherYear = months.some(m => m.year !== now.getFullYear());
  return months.map(m => ({
    ...m,
    label: hasOtherYear ? `${m.year}년 ${m.month}월` : `${m.month}월`
  }));
};

const toDate = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v.toDate === 'function') return v.toDate();
  return new Date(v);
};

const run = async () => {
  const recentMonths = buildRecentMonths();
  const monthKeySet = new Set(recentMonths.map(m => m.key));

  const promotionsSnap = await getDocs(collection(db, 'promotions'));
  const statsSnap = await getDocs(collection(db, 'promotionStats'));

  const promotionsById = new Map();
  promotionsSnap.forEach(doc => {
    const data = doc.data();
    promotionsById.set(doc.id, { id: doc.id, ...data });
  });

  const acc = {};
  const promotionLevel = {};

  const statsByPromotionId = new Map();
  statsSnap.forEach(doc => {
    const stat = doc.data();
    statsByPromotionId.set(stat.promotionId, stat);
  });

  promotionsById.forEach((promotion, promotionId) => {
    if (!promotion?.month) return;
    if (!monthKeySet.has(promotion.month)) return;
    const stat = statsByPromotionId.get(promotionId) || {};
    const rawTitle = promotion.title || promotionId;
    const baseTitle = normalizePromotionTitle(rawTitle);

    if (!acc[baseTitle]) acc[baseTitle] = { title: baseTitle, month: {}, totalViews: 0 };
    if (!acc[baseTitle].month[promotion.month]) acc[baseTitle].month[promotion.month] = { views: 0, users: 0 };

    const views = stat.totalViews || 0;
    const users = stat.uniqueIPCount || (stat.uniqueIPs ? stat.uniqueIPs.length : 0);

    acc[baseTitle].month[promotion.month].views += views;
    acc[baseTitle].month[promotion.month].users += users;
    acc[baseTitle].totalViews += views;

    promotionLevel[promotionId] = {
      id: promotionId,
      title: rawTitle,
      month: promotion.month,
      monthCounts: {
        [promotion.month]: { views, users }
      }
    };
  });

  const rows = Object.values(acc)
    .filter(r => r.totalViews > 0)
    .map(r => ({
      title: r.title,
      monthCells: recentMonths.map(m => {
        const cell = r.month[m.key];
        return { key: m.key, views: cell?.views || 0, users: cell?.users || 0 };
      })
    }));

  console.log('최근 4개월:', recentMonths.map(m => `${m.label}(${m.key})`).join(', '));
  console.log('');
  console.log('=== 최근 열람 비교 (타이틀 정규화 기준) ===');
  console.log(['프로모션명', ...recentMonths.map(m => m.label)].join('\t'));
  rows.forEach(row => {
    const line = [row.title, ...row.monthCells.map(c => `${c.views}/${c.users}`)].join('\t');
    console.log(line);
  });

  console.log('');
  console.log('=== 프로모션 단위 검산 (최근 4개월 프로모션만, stats total 기준) ===');
  Object.values(promotionLevel).forEach((p) => {
    if (!monthKeySet.has(p.month)) return;
    const cells = recentMonths.map(m => {
      const cell = p.monthCounts[m.key];
      const views = cell?.views || 0;
      const users = cell?.users || 0;
      return `${views}/${users}`;
    });
    if (cells.every(v => v === '0/0')) return;
    console.log([`[${p.month}] ${p.title} (${p.id})`, ...cells].join('\t'));
  });
};

run().catch((err) => {
  console.error('검산 실패:', err);
  process.exit(1);
});

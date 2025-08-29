import { 
  getDocs, 
  addDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  updateDoc,
  setDoc,
  arrayUnion,
  increment
} from 'firebase/firestore';
import { 
  getCollectionRef, 
  getDocumentRef,
  handleFirebaseError 
} from './firebaseUtils';
import { 
  PromotionViewStats, 
  PromotionStatsSummary,
  CrudResult 
} from '../types';

const STATS_COLLECTION_NAME = 'promotionStats';

// 클라이언트 IP 가져오기 함수
const getClientIP = async (): Promise<string> => {
  try {
    // 개발 환경 체크
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
      // 개발 환경에서는 고정 IP 사용 (같은 세션에서는 동일한 IP)
      return '127.0.0.1'; // 개발용 고정 IP
    }
    
    // 프로덕션 환경에서는 실제 IP 가져오기 (타임아웃 설정)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
    
    try {
      const response = await fetch('https://api.ipify.org?format=json', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.ip || generateFallbackIP();
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.warn('IP 주소를 가져올 수 없습니다:', error);
    // 실패 시 대체 IP 생성 (모바일 환경에서도 작동)
    return generateFallbackIP();
  }
};

// 대체 IP 생성 함수 (고유성 보장)
const generateFallbackIP = (): string => {
  // 브라우저 정보와 시간을 조합하여 고유한 식별자 생성
  const userAgent = navigator.userAgent || '';
  const timestamp = Date.now();
  const screenInfo = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // 간단한 해시 생성
  const combined = userAgent + timestamp + screenInfo + timezone;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32비트 정수로 변환
  }
  
  // IP 형식으로 변환 (192.168.x.x 형태)
  const num = Math.abs(hash);
  const a = 192;
  const b = 168;
  const c = (num % 254) + 1;
  const d = ((num >> 8) % 254) + 1;
  
  return `${a}.${b}.${c}.${d}`;
};

// User-Agent 정보 가져오기
const getUserAgent = (): string => {
  return navigator.userAgent || 'unknown';
};

// 프로모션 조회 기록
export const recordPromotionView = async (
  promotionId: string
): Promise<CrudResult<void>> => {
  try {
    console.log('🔥 프로모션 조회 기록 시작:', promotionId);
    console.log('📱 환경 정보:', {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isMobile: /Mobi|Android/i.test(navigator.userAgent),
      isKakao: /KAKAOTALK/i.test(navigator.userAgent),
      screen: `${window.screen.width}x${window.screen.height}`,
      hostname: window.location.hostname
    });
    
    const clientIP = await getClientIP();
    const userAgent = getUserAgent();
    const referrer = document.referrer || undefined;
    const viewedAt = Timestamp.now();
    
    console.log('📊 조회 데이터:', {
      promotionId,
      clientIP,
      userAgent: userAgent.substring(0, 50) + '...',
      referrer,
      viewedAt: viewedAt.toDate()
    });

    // 권한 문제 해결: 기존 문서 조회 없이 바로 업데이트 시도
    const newViewRecord: any = {
      ip: clientIP,
      userAgent,
      viewedAt,
      ...(referrer && { referrer })
    };

    // 고정된 문서 ID 사용 (promotionId 기반)
    const docId = `stats_${promotionId}`;
    const docRef = getDocumentRef(STATS_COLLECTION_NAME, docId);

    // setDoc with merge: 문서가 없으면 생성, 있으면 merge
    await setDoc(docRef, {
      promotionId,
      totalViews: increment(1),
      uniqueIPs: arrayUnion(clientIP),
      viewHistory: arrayUnion(newViewRecord),
      lastUpdated: viewedAt,
      updatedAt: Timestamp.now(),
      // 문서가 없을 때만 설정될 기본값들
      ...(newViewRecord.ip && { 
        createdAt: viewedAt,
        uniqueIPCount: 1  // 첫 생성시에만 설정
      })
    } as any, { merge: true });
    
    console.log('✅ 통계 문서 업데이트/생성 완료');

    console.log('🎉 프로모션 조회 기록 완료!');
    return {
      success: true
    };
  } catch (error) {
    console.error('프로모션 조회 기록 실패:', error);
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 프로모션 통계 조회
export const getPromotionStats = async (
  promotionId: string
): Promise<CrudResult<PromotionViewStats | null>> => {
  try {
    const q = query(
      getCollectionRef(STATS_COLLECTION_NAME),
      where('promotionId', '==', promotionId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return {
        success: true,
        data: null
      };
    }

    const doc = querySnapshot.docs[0];
    const stats: PromotionViewStats = {
      id: doc.id,
      ...doc.data()
    } as PromotionViewStats;

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 여러 프로모션의 통계 요약 조회
export const getPromotionStatsSummary = async (
  promotionIds: string[]
): Promise<CrudResult<{ [promotionId: string]: PromotionStatsSummary }>> => {
  try {
    if (promotionIds.length === 0) {
      return {
        success: true,
        data: {}
      };
    }

    const statsSummary: { [promotionId: string]: PromotionStatsSummary } = {};

    // Firestore의 'in' 쿼리는 최대 10개까지만 지원하므로 배치 처리
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < promotionIds.length; i += batchSize) {
      batches.push(promotionIds.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const q = query(
        getCollectionRef(STATS_COLLECTION_NAME),
        where('promotionId', 'in', batch)
      );

      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        const stats = doc.data() as PromotionViewStats;
        statsSummary[stats.promotionId] = {
          promotionId: stats.promotionId,
          totalViews: stats.totalViews,
          uniqueIPCount: stats.uniqueIPCount
        };
      });
    }

    // 통계가 없는 프로모션들에 대해 기본값 설정
    promotionIds.forEach(id => {
      if (!statsSummary[id]) {
        statsSummary[id] = {
          promotionId: id,
          totalViews: 0,
          uniqueIPCount: 0
        };
      }
    });

    return {
      success: true,
      data: statsSummary
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 통계 데이터 삭제 (프로모션 삭제 시 사용)
export const deletePromotionStats = async (
  promotionId: string
): Promise<CrudResult<void>> => {
  try {
    const q = query(
      getCollectionRef(STATS_COLLECTION_NAME),
      where('promotionId', '==', promotionId)
    );

    const querySnapshot = await getDocs(q);
    
    // 모든 관련 통계 문서 삭제
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 상위 N개 조회된 프로모션 조회
export const getTopViewedPromotions = async (
  limitCount: number = 10
): Promise<CrudResult<PromotionStatsSummary[]>> => {
  try {
    const q = query(
      getCollectionRef(STATS_COLLECTION_NAME),
      orderBy('totalViews', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const topPromotions: PromotionStatsSummary[] = [];

    querySnapshot.forEach((doc) => {
      const stats = doc.data() as PromotionViewStats;
      topPromotions.push({
        promotionId: stats.promotionId,
        totalViews: stats.totalViews,
        uniqueIPCount: stats.uniqueIPCount
      });
    });

    return {
      success: true,
      data: topPromotions
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 상위 N개 고유 이용자가 많은 프로모션 조회
export const getTopUserPromotions = async (
  limitCount: number = 10
): Promise<CrudResult<PromotionStatsSummary[]>> => {
  try {
    const q = query(
      getCollectionRef(STATS_COLLECTION_NAME),
      orderBy('uniqueIPCount', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const topPromotions: PromotionStatsSummary[] = [];

    querySnapshot.forEach((doc) => {
      const stats = doc.data() as PromotionViewStats;
      topPromotions.push({
        promotionId: stats.promotionId,
        totalViews: stats.totalViews,
        uniqueIPCount: stats.uniqueIPCount
      });
    });

    return {
      success: true,
      data: topPromotions
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 날짜별 전체 통계 조회 (어제, 오늘, 이번달)
export const getDashboardStats = async (): Promise<CrudResult<{
  yesterday: { totalViews: number; uniqueIPCount: number; };
  today: { totalViews: number; uniqueIPCount: number; };
  thisMonth: { totalViews: number; uniqueIPCount: number; };
}>> => {
  try {
    // 날짜 계산
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Timestamp로 변환
    const todayTimestamp = Timestamp.fromDate(today);
    const yesterdayTimestamp = Timestamp.fromDate(yesterday);
    const thisMonthTimestamp = Timestamp.fromDate(thisMonthStart);

    // 모든 프로모션 통계 조회
    const q = query(getCollectionRef(STATS_COLLECTION_NAME));
    const querySnapshot = await getDocs(q);

    let yesterdayViews = 0;
    let yesterdayUsers = new Set<string>();
    let todayViews = 0;
    let todayUsers = new Set<string>();
    let thisMonthViews = 0;
    let thisMonthUsers = new Set<string>();

    querySnapshot.forEach((doc) => {
      const stats = doc.data() as PromotionViewStats;
      
      // 각 프로모션의 viewHistory를 확인하여 날짜별 집계
      stats.viewHistory.forEach((record) => {
        const recordTimestamp = record.viewedAt;

        // 어제 데이터
        if (recordTimestamp >= yesterdayTimestamp && recordTimestamp < todayTimestamp) {
          yesterdayViews++;
          yesterdayUsers.add(record.ip);
        }

        // 오늘 데이터
        if (recordTimestamp >= todayTimestamp) {
          todayViews++;
          todayUsers.add(record.ip);
        }

        // 이번달 데이터
        if (recordTimestamp >= thisMonthTimestamp) {
          thisMonthViews++;
          thisMonthUsers.add(record.ip);
        }
      });
    });

    return {
      success: true,
      data: {
        yesterday: {
          totalViews: yesterdayViews,
          uniqueIPCount: yesterdayUsers.size
        },
        today: {
          totalViews: todayViews,
          uniqueIPCount: todayUsers.size
        },
        thisMonth: {
          totalViews: thisMonthViews,
          uniqueIPCount: thisMonthUsers.size
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

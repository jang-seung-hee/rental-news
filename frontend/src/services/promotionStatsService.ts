import { 
  getDocs, 
  addDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  runTransaction,
  Transaction,
  Timestamp
} from 'firebase/firestore';
import { 
  getCollectionRef, 
  addTimestamps, 
  addUpdateTimestamp, 
  handleFirebaseError 
} from './firebaseUtils';
import { db } from './firebase';
import { 
  PromotionViewStats, 
  PromotionViewRecord, 
  PromotionStatsSummary,
  CrudResult 
} from '../types';

const STATS_COLLECTION_NAME = 'promotionStats';

// 카카오 인앱 브라우저 감지
const isKakaoInApp = (): boolean => {
  try {
    const ua = navigator.userAgent || '';
    return /KAKAOTALK|KAKAOBROWSER/i.test(ua);
  } catch {
    return false;
  }
};

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
    
    // 카카오 인앱 브라우저에서는 외부 IP 조회가 차단/지연될 수 있으므로 즉시 폴백
    if (isKakaoInApp()) {
      return '0.0.0.0';
    }
    
    // 프로덕션 환경에서는 실제 IP 가져오기 (타임아웃 적용)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    try {
      const response = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
      const data = await response.json();
      return data.ip || 'localhost';
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.warn('IP 주소를 가져올 수 없습니다:', error);
    // 개발 환경에서는 고정 IP 반환, 프로덕션에서는 로컬 표시
    return process.env.NODE_ENV === 'development' ? '127.0.0.1' : '0.0.0.0';
  }
};

// User-Agent 정보 가져오기
const getUserAgent = (): string => {
  try {
    return navigator.userAgent || 'unknown';
  } catch {
    return 'unknown';
  }
};

// 프로모션 조회 기록
export const recordPromotionView = async (
  promotionId: string
): Promise<CrudResult<void>> => {
  try {
    console.log('🔥 프로모션 조회 기록 시작:', promotionId);
    
    // 인앱에서의 네트워크 제약 회피: 통계 수집 최소화 처리 (필요 시 서버 사이드 수집으로 대체)
    if (isKakaoInApp()) {
      console.log('🟡 카카오 인앱 브라우저 감지: 통계 수집 스킵');
      return { success: true };
    }
    
    const clientIP = await getClientIP();
    const userAgent = getUserAgent();
    const referrer = typeof document !== 'undefined' && document.referrer ? document.referrer : undefined;
    const viewedAt = Timestamp.now();
    
    console.log('📊 조회 데이터:', {
      promotionId,
      clientIP,
      userAgent: userAgent.substring(0, 50) + '...',
      referrer,
      viewedAt: viewedAt.toDate()
    });

    // 기존 통계 문서 조회
    const statsQuery = query(
      getCollectionRef(STATS_COLLECTION_NAME),
      where('promotionId', '==', promotionId),
      limit(1)
    );
    
    const statsSnapshot = await getDocs(statsQuery);
    
    if (statsSnapshot.empty) {
      // 새 통계 문서 생성
      const newStats: Omit<PromotionViewStats, 'id'> = {
        promotionId,
        totalViews: 1,
        uniqueIPs: [clientIP],
        uniqueIPCount: 1,
        viewHistory: [{
          ip: clientIP,
          userAgent,
          viewedAt,
          referrer
        }],
        lastUpdated: viewedAt
      };

      await addDoc(getCollectionRef(STATS_COLLECTION_NAME), addTimestamps(newStats));
      console.log('✅ 새로운 통계 문서 생성 완료');
    } else {
      // 기존 통계 문서 업데이트 (트랜잭션 사용)
      await runTransaction(db, async (transaction: Transaction) => {
        const statsDoc = statsSnapshot.docs[0];
        const docRef = statsDoc.ref;
        const docSnapshot = await transaction.get(docRef);
        
        if (!docSnapshot.exists()) {
          throw new Error('Statistics document has been deleted');
        }
        
        const existingStats = docSnapshot.data() as PromotionViewStats;
        
        const newViewRecord: PromotionViewRecord = {
          ip: clientIP,
          userAgent,
          viewedAt,
          referrer
        };
        
        // 고유 IP 목록 업데이트
        const updatedUniqueIPs = existingStats.uniqueIPs.includes(clientIP) 
          ? existingStats.uniqueIPs 
          : [...existingStats.uniqueIPs, clientIP];

        // 조회 기록 추가 (최근 100개만 유지)
        const updatedViewHistory = [...existingStats.viewHistory, newViewRecord]
          .sort((a, b) => b.viewedAt.toMillis() - a.viewedAt.toMillis())
          .slice(0, 100);

        const updatedStats = {
          totalViews: existingStats.totalViews + 1,
          uniqueIPs: updatedUniqueIPs,
          uniqueIPCount: updatedUniqueIPs.length,
          viewHistory: updatedViewHistory,
          lastUpdated: viewedAt
        };

        transaction.update(docRef, addUpdateTimestamp(updatedStats));
        console.log('✅ 기존 통계 문서 업데이트 완료');
      });
    }

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


export default {
  recordPromotionView,
  getPromotionStats,
  getPromotionStatsSummary,
  deletePromotionStats,
  getTopViewedPromotions,
  getTopUserPromotions,
  getDashboardStats
};
 

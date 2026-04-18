import { 
  getDocs, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  setDoc,
  arrayUnion,
  increment,
  updateDoc
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

// 기존 통계 데이터 마이그레이션 함수
// 동일 promotionId 를 가진 레거시 문서를 모두 "stats_<promotionId>" 문서로 병합하고 정리한다
const migrateExistingStats = async (promotionId: string): Promise<void> => {
  try {
    const targetDocId = `stats_${promotionId}`;
    const targetDocRef = getDocumentRef(STATS_COLLECTION_NAME, targetDocId);
    
    // 동일 promotionId 를 가진 모든 문서 조회 (레거시 포함)
    const q = query(
      getCollectionRef(STATS_COLLECTION_NAME),
      where('promotionId', '==', promotionId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // 아무 문서도 없으면 대상 문서를 초기 생성
      await setDoc(targetDocRef, {
        promotionId,
        totalViews: 0,
        uniqueIPs: [],
        viewHistory: [],
        createdAt: Timestamp.now(),
        lastUpdated: Timestamp.now(),
        updatedAt: Timestamp.now()
      } as any, { merge: true });
      return;
    }

    // 병합 대상 수집
    let sumTotalViews = 0;
    const allUniqueIps = new Set<string>();
    const allViewHistory: any[] = [];
    let earliestCreatedAt: any = null;
    let latestUpdatedAt: any = null;

    querySnapshot.forEach((doc) => {
      const d: any = doc.data();
      sumTotalViews += d.totalViews || 0;
      (d.uniqueIPs || []).forEach((ip: string) => allUniqueIps.add(ip));
      (d.viewHistory || []).forEach((rec: any) => allViewHistory.push(rec));
      if (!earliestCreatedAt || (d.createdAt && d.createdAt < earliestCreatedAt)) {
        earliestCreatedAt = d.createdAt;
      }
      if (!latestUpdatedAt || (d.updatedAt && d.updatedAt > latestUpdatedAt)) {
        latestUpdatedAt = d.updatedAt;
      }
    });

    // 대상 문서로 병합 저장
    await setDoc(targetDocRef, {
      promotionId,
      totalViews: sumTotalViews,
      // arrayUnion 은 가변 길이를 받으므로 스프레드 사용 (개수가 많아도 일반적으로 안전한 크기)
      uniqueIPs: arrayUnion(...Array.from(allUniqueIps)),
      viewHistory: arrayUnion(...allViewHistory),
      createdAt: earliestCreatedAt || Timestamp.now(),
      lastUpdated: latestUpdatedAt || Timestamp.now(),
      updatedAt: Timestamp.now()
    } as any, { merge: true });

    // 대상 문서 이외 레거시 문서 제거
    const deletePromises = querySnapshot.docs
      .filter(doc => doc.id !== targetDocId)
      .map(doc => deleteDoc(doc.ref));
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }
    console.log('✅ 통계 데이터 병합 및 정리 완료:', promotionId);
  } catch (error) {
    console.warn('⚠️ 기존 통계 데이터 마이그레이션 실패:', error);
    // 마이그레이션 실패해도 새 기록은 계속 진행
  }
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

    // 기존 데이터가 있는지 확인하고 마이그레이션
    await migrateExistingStats(promotionId);

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
      updatedAt: Timestamp.now()
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
      where('promotionId', '==', promotionId)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return { success: true, data: null };
    }

    // 동일 promotionId 문서가 여러 개 있을 경우 합산/병합하여 반환
    let totalViews = 0;
    const uniqueIpSet = new Set<string>();
    const viewHistory: any[] = [];
    let chosenId: string | null = null;

    querySnapshot.forEach((doc) => {
      const d: any = doc.data();
      if (!chosenId || doc.id === `stats_${promotionId}`) {
        chosenId = doc.id; // 가능하면 정식 ID를 우선 채택
      }
      totalViews += d.totalViews || 0;
      (d.uniqueIPs || []).forEach((ip: string) => uniqueIpSet.add(ip));
      (d.viewHistory || []).forEach((rec: any) => viewHistory.push(rec));
    });

    const stats: PromotionViewStats = {
      id: chosenId || querySnapshot.docs[0].id,
      promotionId,
      totalViews,
      uniqueIPs: Array.from(uniqueIpSet),
      uniqueIPCount: uniqueIpSet.size,
      viewHistory,
      lastUpdated: Timestamp.now() as any
    } as any;

    return { success: true, data: stats };
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
        const d = doc.data() as any;
        const pid = d.promotionId;
        if (!statsSummary[pid]) {
          statsSummary[pid] = { promotionId: pid, totalViews: 0, uniqueIPCount: 0 };
        }
        // 합산 및 고유 IP 집합화
        statsSummary[pid].totalViews += d.totalViews || 0;
        const prevCount = statsSummary[pid].uniqueIPCount || 0;
        // 임시로 set을 숨겨 저장 (최종 반환 전에 개수 계산)
        (statsSummary as any)[`__ips_${pid}`] = (statsSummary as any)[`__ips_${pid}`] || new Set<string>();
        (d.uniqueIPs || []).forEach((ip: string) => (statsSummary as any)[`__ips_${pid}`].add(ip));
        statsSummary[pid].uniqueIPCount = Math.max(prevCount, (statsSummary as any)[`__ips_${pid}`].size);
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
      // uniqueIPs 배열의 길이로 실제 고유 IP 수 계산
      const actualUniqueIPCount = stats.uniqueIPs ? stats.uniqueIPs.length : 0;
      
      topPromotions.push({
        promotionId: stats.promotionId,
        totalViews: stats.totalViews,
        uniqueIPCount: actualUniqueIPCount
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
      // uniqueIPs 배열의 길이로 실제 고유 IP 수 계산
      const actualUniqueIPCount = stats.uniqueIPs ? stats.uniqueIPs.length : 0;
      
      topPromotions.push({
        promotionId: stats.promotionId,
        totalViews: stats.totalViews,
        uniqueIPCount: actualUniqueIPCount
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

// 모든 프로모션의 통계(병합 후) 조회
export const getAllPromotionStats = async (): Promise<CrudResult<PromotionViewStats[]>> => {
  try {
    const qAll = query(getCollectionRef(STATS_COLLECTION_NAME));
    const snapshot = await getDocs(qAll);

    // promotionId 단위로 병합
    const merged: { [promotionId: string]: PromotionViewStats } = {} as any;

    snapshot.forEach((doc) => {
      const d = doc.data() as any;
      const pid = d.promotionId;
      if (!pid) return;

      if (!merged[pid]) {
        merged[pid] = {
          id: doc.id,
          promotionId: pid,
          totalViews: d.totalViews || 0,
          uniqueIPs: Array.isArray(d.uniqueIPs) ? d.uniqueIPs.slice() : [],
          uniqueIPCount: Array.isArray(d.uniqueIPs) ? d.uniqueIPs.length : (d.uniqueIPCount || 0),
          viewHistory: Array.isArray(d.viewHistory) ? d.viewHistory.slice() : [],
          lastUpdated: d.updatedAt || d.lastUpdated || Timestamp.now()
        } as PromotionViewStats;
      } else {
        const target = merged[pid];
        target.totalViews += d.totalViews || 0;
        const set = new Set<string>(target.uniqueIPs);
        (d.uniqueIPs || []).forEach((ip: string) => set.add(ip));
        target.uniqueIPs = Array.from(set);
        target.uniqueIPCount = target.uniqueIPs.length;
        if (Array.isArray(d.viewHistory)) {
          target.viewHistory = target.viewHistory.concat(d.viewHistory);
        }
        // 최신 업데이트 시간 반영
        const newUpdated = d.updatedAt || d.lastUpdated;
        if (newUpdated && (!target.lastUpdated || newUpdated.toMillis?.() > (target.lastUpdated as any)?.toMillis?.())) {
          target.lastUpdated = newUpdated;
        }
      }
    });

    return {
      success: true,
      data: Object.values(merged)
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

/**
 * 특정 프로모션의 조회/이용자 통계 리셋
 * @param promotionId 리셋할 프로모션 ID
 * @returns 리셋 결과
 */
export const resetPromotionStats = async (promotionId: string): Promise<CrudResult<void>> => {
  try {
    // 프로모션 통계 문서 찾기 (getPromotionStats와 동일한 방식)
    const q = query(
      getCollectionRef(STATS_COLLECTION_NAME),
      where('promotionId', '==', promotionId)
    );

    const querySnapshot = await getDocs(q);
    
    const resetData = {
      totalViews: 0,
      uniqueIPs: [],
      viewHistory: [],
      updatedAt: Timestamp.now()
    };

    if (!querySnapshot.empty) {
      // 해당 promotionId를 가진 모든 문서를 리셋 (중복 문서 문제 해결)
      const resetPromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, resetData)
      );
      
      await Promise.all(resetPromises);
      console.log(`프로모션 ${promotionId}의 통계 ${querySnapshot.docs.length}개 문서가 모두 리셋되었습니다.`);
    } else {
      // 통계 문서가 없으면 새로 생성
      const newDocRef = getDocumentRef(STATS_COLLECTION_NAME, promotionId);
      await setDoc(newDocRef, {
        promotionId,
        ...resetData,
        createdAt: Timestamp.now()
      });
      console.log(`프로모션 ${promotionId}의 통계 문서가 새로 생성되어 리셋되었습니다.`);
    }
    
    return {
      success: true,
      data: undefined
    };
  } catch (error) {
    console.error('통계 리셋 실패:', error);
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

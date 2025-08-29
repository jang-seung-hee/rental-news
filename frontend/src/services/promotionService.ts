import { 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { 
  getCollectionRef, 
  getDocumentRef, 
  addTimestamps, 
  addUpdateTimestamp, 
  uploadImage, 
  deleteImage, 
  handleFirebaseError 
} from './firebaseUtils';
import { 
  Promotion, 
  CreatePromotionRequest, 
  UpdatePromotionRequest, 
  PromotionListResponse, 
  PromotionFilter, 
  PromotionSort,
  CrudResult 
} from '../types';
import { generateSlug, ensureUniqueSlug } from '../utils/utils';
import { deletePromotionStats } from './promotionStatsService';

const COLLECTION_NAME = 'promotions';

// undefined 값을 제거하는 유틸리티 함수
const removeUndefined = (obj: any): any => {
  const cleaned: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

// 프로모션 생성
export const createPromotion = async (
  data: CreatePromotionRequest
): Promise<CrudResult<string>> => {
  try {
    // slug는 반드시 제공되어야 함 (자동 생성 제거)
    if (!data.slug || data.slug.trim() === '') {
      return {
        success: false,
        error: 'URL 슬러그는 필수입니다.'
      };
    }

    let slug = data.slug;
    let slugConflict = false;
    let originalSlug = '';
    
    // 수동으로 입력된 slug의 중복 확인
    const existingPromotions = await getDocs(getCollectionRef(COLLECTION_NAME));
    const existingSlugs = existingPromotions.docs.map(doc => doc.data().slug).filter(Boolean);
    
    if (existingSlugs.includes(slug)) {
      slugConflict = true;
      originalSlug = slug;
      slug = ensureUniqueSlug(slug, existingSlugs);
    }

    // 이미지 업로드 처리
    let imageUrl = data.imageUrl;
    if (data.imageUrl && data.imageUrl.startsWith('blob:')) {
      // Blob URL을 File 객체로 변환하여 업로드
      const response = await fetch(data.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'promotion-image.jpg', { type: blob.type });
      imageUrl = await uploadImage(file, 'promotions');
    }

    // 타임스탬프 추가 및 undefined 값 제거
    const promotionData = addTimestamps({
      ...removeUndefined(data),
      slug,
      imageUrl: imageUrl || null,
      isActive: data.isActive ?? true
    });

    const docRef = await addDoc(getCollectionRef(COLLECTION_NAME), promotionData);
    
    return {
      success: true,
      data: docRef.id,
      affectedCount: 1,
      warning: slugConflict ? `입력된 slug "${originalSlug}"가 이미 존재하여 "${slug}"로 변경되었습니다.` : undefined
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 프로모션 목록 조회
export const getPromotions = async (
  filter?: PromotionFilter,
  sort?: PromotionSort,
  pageSize: number = 10,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<CrudResult<PromotionListResponse>> => {
  try {
    let q: any = getCollectionRef(COLLECTION_NAME);

    // 필터 적용
    if (filter) {
      if (filter.month) {
        q = query(q, where('month', '==', filter.month));
      }
      if (filter.target) {
        q = query(q, where('target', '==', filter.target));
      }
      if (filter.isActive !== undefined) {
        q = query(q, where('isActive', '==', filter.isActive));
      }
    }

    // 정렬 적용 (서버 사이드 정렬)
    const sortField = sort?.field || 'createdAt';
    const sortDirection = sort?.direction || 'desc';
    q = query(q, orderBy(sortField, sortDirection));

    // 페이지네이션 적용 (검색어가 있을 때는 더 많은 데이터를 가져옴)
    const limitSize = filter?.searchTerm ? 50 : pageSize;
    if (lastDoc && !filter?.searchTerm) {
      q = query(q, startAfter(lastDoc), limit(limitSize));
    } else {
      q = query(q, limit(limitSize));
    }

    const querySnapshot = await getDocs(q);
    let promotions: Promotion[] = [];

    querySnapshot.forEach((doc) => {
      promotions.push({
        id: doc.id,
        ...(doc.data() as any)
      } as Promotion);
    });

    // 검색어 필터링 (클라이언트 사이드)
    if (filter?.searchTerm) {
      const searchTerm = filter.searchTerm.toLowerCase();
      promotions = promotions.filter(promotion => 
        promotion.title.toLowerCase().includes(searchTerm) ||
        promotion.code.toLowerCase().includes(searchTerm) ||
        promotion.content.toLowerCase().includes(searchTerm) ||
        promotion.greeting.toLowerCase().includes(searchTerm) ||
        promotion.closing.toLowerCase().includes(searchTerm)
      );
    }



    // 검색어가 있을 때는 페이지네이션 비활성화
    const hasNextPage = filter?.searchTerm 
      ? false 
      : querySnapshot.docs.length === limitSize;
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      success: true,
      data: {
        promotions,
        totalCount: promotions.length,
        hasNextPage,
        lastDoc: lastVisible
      }
    };
  } catch (error) {
    console.error('🔥 Firestore getPromotions error:', error);
    console.error('🔥 Error message:', (error as any)?.message);
    console.error('🔥 Error code:', (error as any)?.code);
    if ((error as any)?.message?.includes('index')) {
      console.error('🔗 Missing index detected! Check the error message for the creation link.');
    }
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 프로모션 상세 조회 (ID 기반)
export const getPromotionById = async (id: string): Promise<CrudResult<Promotion>> => {
  try {
    const docRef = getDocumentRef(COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: '프로모션을 찾을 수 없습니다.'
      };
    }

    const promotion: Promotion = {
      id: docSnap.id,
      ...docSnap.data()
    } as Promotion;

    return {
      success: true,
      data: promotion
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 프로모션 상세 조회 (Slug 기반)
export const getPromotionBySlug = async (slug: string): Promise<CrudResult<Promotion>> => {
  try {
    // 먼저 slug로 조회 시도
    let q = query(
      getCollectionRef(COLLECTION_NAME),
      where('slug', '==', slug)
    );
    
    let querySnapshot = await getDocs(q);
    
    // slug로 찾지 못한 경우, ID로도 조회 시도 (기존 프로모션 지원)
    if (querySnapshot.empty) {
      q = query(
        getCollectionRef(COLLECTION_NAME),
        where('id', '==', slug)
      );
      querySnapshot = await getDocs(q);
    }
    
    if (querySnapshot.empty) {
      return {
        success: false,
        error: '프로모션을 찾을 수 없습니다.'
      };
    }

    const doc = querySnapshot.docs[0];
    const promotion: Promotion = {
      id: doc.id,
      ...doc.data()
    } as Promotion;

    return {
      success: true,
      data: promotion
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 프로모션 수정
export const updatePromotion = async (
  id: string,
  data: UpdatePromotionRequest
): Promise<CrudResult<void>> => {
  try {
    const docRef = getDocumentRef(COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: '프로모션을 찾을 수 없습니다.'
      };
    }

    // 기존 이미지 URL 가져오기
    const existingData = docSnap.data() as Promotion;
    let imageUrl = data.imageUrl || existingData.imageUrl;

    // 새 이미지가 업로드된 경우
    if (data.imageUrl && data.imageUrl.startsWith('blob:')) {
      // 기존 이미지 삭제
      if (existingData.imageUrl) {
        try {
          await deleteImage(existingData.imageUrl);
        } catch (error) {
          // 기존 이미지 삭제 실패 시 무시하고 진행
        }
      }

      // 새 이미지 업로드
      const response = await fetch(data.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'promotion-image.jpg', { type: blob.type });
      imageUrl = await uploadImage(file, 'promotions');
    }

    // slug 변경 시 중복 확인
    let slug = data.slug;
    let slugConflict = false;
    let originalSlug = '';
    
    if (data.slug && data.slug !== existingData.slug) {
      // 기존 slug들과 중복 확인하여 고유한 slug 생성
      const existingPromotions = await getDocs(getCollectionRef(COLLECTION_NAME));
      const existingSlugs = existingPromotions.docs
        .map(doc => doc.data().slug)
        .filter(Boolean)
        .filter(s => s !== existingData.slug); // 현재 프로모션의 기존 slug는 제외
      
      if (existingSlugs.includes(data.slug)) {
        slugConflict = true;
        originalSlug = data.slug;
      }
      
      slug = ensureUniqueSlug(data.slug, existingSlugs);
    }

    // 업데이트 데이터 준비
    const updateData = addUpdateTimestamp({
      ...removeUndefined(data),
      slug: slug || existingData.slug,
      imageUrl: imageUrl || null
    });

    await updateDoc(docRef, updateData);

    return {
      success: true,
      affectedCount: 1,
      warning: slugConflict ? `입력된 slug "${originalSlug}"가 이미 존재하여 "${slug}"로 변경되었습니다.` : undefined
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 프로모션 활성 상태 업데이트
export const updatePromotionStatus = async (
  id: string,
  isActive: boolean
): Promise<CrudResult<void>> => {
  try {
    const docRef = getDocumentRef(COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: '프로모션을 찾을 수 없습니다.'
      };
    }

    // 업데이트 데이터 준비
    const updateData = addUpdateTimestamp({
      isActive
    });

    await updateDoc(docRef, updateData);

    return {
      success: true,
      affectedCount: 1
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 슬러그 업데이트
export const updatePromotionSlug = async (
  id: string,
  newSlug: string
): Promise<CrudResult<void>> => {
  try {
    const docRef = getDocumentRef(COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: '프로모션을 찾을 수 없습니다.'
      };
    }

    // 기존 데이터 가져오기
    const existingData = docSnap.data() as Promotion;
    
    // slug가 변경되지 않은 경우
    if (newSlug === existingData.slug) {
      return {
        success: true,
        affectedCount: 0
      };
    }

    // slug 중복 확인
    let slug = newSlug;
    let slugConflict = false;
    let originalSlug = '';
    
    if (newSlug && newSlug.trim() !== '') {
      // 기존 slug들과 중복 확인하여 고유한 slug 생성
      const existingPromotions = await getDocs(getCollectionRef(COLLECTION_NAME));
      const existingSlugs = existingPromotions.docs
        .map(doc => doc.data().slug)
        .filter(Boolean)
        .filter(s => s !== existingData.slug); // 현재 프로모션의 기존 slug는 제외
      
      if (existingSlugs.includes(newSlug)) {
        slugConflict = true;
        originalSlug = newSlug;
      }
      
      slug = ensureUniqueSlug(newSlug, existingSlugs);
    }

    // 업데이트 데이터 준비
    const updateData = addUpdateTimestamp({
      slug: slug || existingData.slug
    });

    await updateDoc(docRef, updateData);

    return {
      success: true,
      affectedCount: 1,
      warning: slugConflict ? `입력된 slug "${originalSlug}"가 이미 존재하여 "${slug}"로 변경되었습니다.` : undefined
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 프로모션 삭제
export const deletePromotion = async (id: string): Promise<CrudResult<void>> => {
  try {
    const docRef = getDocumentRef(COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: '프로모션을 찾을 수 없습니다.'
      };
    }

    // 이미지 삭제
    const promotion = docSnap.data() as Promotion;
    if (promotion.imageUrl) {
      try {
        await deleteImage(promotion.imageUrl);
      } catch (error) {
        // 이미지 삭제 실패 시 무시하고 진행
      }
    }

    await deleteDoc(docRef);

    // 관련 통계 데이터 삭제
    try {
      await deletePromotionStats(id);
    } catch (error) {
      console.warn('프로모션 통계 삭제 실패:', error);
      // 통계 삭제 실패는 무시하고 진행
    }

    return {
      success: true,
      affectedCount: 1
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 기존 프로모션들을 위한 slug 마이그레이션
export const migratePromotionSlugs = async (): Promise<CrudResult<number>> => {
  try {
    const promotions = await getDocs(getCollectionRef(COLLECTION_NAME));
    let migratedCount = 0;

    for (const doc of promotions.docs) {
      const promotion = doc.data() as Promotion;
      
      // slug가 없거나 빈 문자열인 경우에만 마이그레이션
      if (!promotion.slug || promotion.slug.trim() === '') {
        const newSlug = generateSlug(promotion.title);
        
        // 기존 slug들과 중복 확인
        const existingSlugs = promotions.docs
          .map(d => d.data().slug)
          .filter(Boolean)
          .filter(s => s !== newSlug);
        
        const uniqueSlug = ensureUniqueSlug(newSlug, existingSlugs);
        
        // slug 업데이트
        await updateDoc(doc.ref, {
          slug: uniqueSlug,
          updatedAt: new Date()
        });
        
        migratedCount++;
      }
    }

    return {
      success: true,
      data: migratedCount,
      affectedCount: migratedCount
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// slug 또는 ID로 프로모션 조회 (통합 함수)
export const getPromotionBySlugOrId = async (identifier: string): Promise<CrudResult<Promotion>> => {
  try {
    // slug와 ID를 모두 조회하여 둘 중 하나라도 찾으면 반환
    const [slugQuery, idQuery] = await Promise.all([
      getDocs(query(
        getCollectionRef(COLLECTION_NAME),
        where('slug', '==', identifier)
      )),
      getDocs(query(
        getCollectionRef(COLLECTION_NAME),
        where('id', '==', identifier)
      ))
    ]);
    
    // slug로 찾은 경우
    if (!slugQuery.empty) {
      const doc = slugQuery.docs[0];
      const promotion: Promotion = {
        id: doc.id,
        ...doc.data()
      } as Promotion;
      
      return {
        success: true,
        data: promotion
      };
    }
    
    // ID로 찾은 경우
    if (!idQuery.empty) {
      const doc = idQuery.docs[0];
      const promotion: Promotion = {
        id: doc.id,
        ...doc.data()
      } as Promotion;
      
      return {
        success: true,
        data: promotion
      };
    }
    
    // 둘 다 찾지 못한 경우
    return {
      success: false,
      error: '프로모션을 찾을 수 없습니다.'
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 프로모션 검색
export const searchPromotions = async (
  searchTerm: string,
  limitCount: number = 20
): Promise<CrudResult<Promotion[]>> => {
  try {
    // Firestore는 전체 텍스트 검색을 지원하지 않으므로
    // 클라이언트 사이드에서 필터링하거나
    // Algolia 같은 외부 검색 서비스를 사용해야 합니다.
    // 여기서는 간단한 구현을 위해 모든 프로모션을 가져와서 필터링합니다.
    
    const result = await getPromotions(undefined, undefined, 100);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || '데이터를 가져올 수 없습니다.'
      };
    }

    const filteredPromotions = result.data.promotions.filter(promotion => 
      promotion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.content.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, limitCount);

    return {
      success: true,
      data: filteredPromotions
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 월별 프로모션 조회 (현재 프로모션 제외)
export const getPromotionsByMonth = async (
  month: string, 
  excludePromotionId?: string
): Promise<CrudResult<Promotion[]>> => {
  try {
    // 정렬 없이 월 필터만 적용하여 쿼리
    const q = query(
      getCollectionRef(COLLECTION_NAME),
      where('month', '==', month),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    const promotions: Promotion[] = [];

    querySnapshot.forEach((doc) => {
      promotions.push({
        id: doc.id,
        ...(doc.data() as any)
      } as Promotion);
    });

    // 현재 프로모션을 제외하고 필터링
    let filteredPromotions = promotions;
    if (excludePromotionId) {
      filteredPromotions = filteredPromotions.filter(
        promotion => promotion.id !== excludePromotionId
      );
    }

    // 클라이언트 사이드에서 정렬 (최신순)
    filteredPromotions.sort((a, b) => {
      const aTime = (a.createdAt as any)?.toDate?.() || new Date((a.createdAt as any));
      const bTime = (b.createdAt as any)?.toDate?.() || new Date((b.createdAt as any));
      return bTime.getTime() - aTime.getTime();
    });

    return {
      success: true,
      data: filteredPromotions
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 활성 프로모션 조회
export const getActivePromotions = async (): Promise<CrudResult<Promotion[]>> => {
  try {
    // 서버 사이드 정렬을 제거하고 클라이언트 사이드에서 정렬
    const result = await getPromotions({ isActive: true }, undefined, 50);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || '데이터를 가져올 수 없습니다.'
      };
    }

    // 클라이언트 사이드에서 최신순 정렬
    const sortedPromotions = result.data.promotions.sort((a, b) => {
      const aTime = (a.createdAt as any)?.toDate?.() || new Date((a.createdAt as any));
      const bTime = (b.createdAt as any)?.toDate?.() || new Date((b.createdAt as any));
      return bTime.getTime() - aTime.getTime();
    });

    return {
      success: true,
      data: sortedPromotions
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
}; 

// 다른제품 정보 조회
export const getOtherProductsInfo = async (
  otherProductIds: (string | undefined)[]
): Promise<CrudResult<{ [key: string]: { id: string; code: string; title: string } }>> => {
  try {
    const validIds = otherProductIds.filter(Boolean) as string[];
    
    if (validIds.length === 0) {
      return {
        success: true,
        data: {}
      };
    }

    const products: { [key: string]: { id: string; code: string; title: string } } = {};

    for (const id of validIds) {
      try {
        const result = await getPromotionById(id);
        if (result.success && result.data) {
          products[id] = {
            id: result.data.id,
            code: result.data.code,
            title: result.data.title
          };
        }
      } catch (error) {
        // 다른제품 정보 조회 실패 (ID: ${id}): ${error}
      }
    }

    return {
      success: true,
      data: products
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 월별 프로모션 코드 목록 조회 (복사용)
export const getPromotionCodesByMonth = async (
  month: string
): Promise<CrudResult<{ id: string; code: string; title: string }[]>> => {
  try {
    const q = query(
      getCollectionRef(COLLECTION_NAME),
      where('month', '==', month),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    const promotions: { id: string; code: string; title: string }[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      promotions.push({
        id: doc.id,
        code: data.code,
        title: data.title
      });
    });

    return {
      success: true,
      data: promotions
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
}; 

// 단축 URL 업데이트
export const updateShortUrl = async (
  id: string,
  shortUrl: string
): Promise<CrudResult<void>> => {
  try {
    const docRef = getDocumentRef(COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: '프로모션을 찾을 수 없습니다.'
      };
    }

    const updateData = addUpdateTimestamp({
      shortUrl: shortUrl.trim()
    });

    await updateDoc(docRef, updateData);

    return {
      success: true,
      affectedCount: 1
    };
  } catch (error) {
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
}; 
import { 
  collection, 
  doc, 
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
import { db } from './firebase';
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
      imageUrl: imageUrl || null,
      isActive: data.isActive ?? true
    });

    const docRef = await addDoc(getCollectionRef(COLLECTION_NAME), promotionData);
    
    return {
      success: true,
      data: docRef.id,
      affectedCount: 1
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

    // 정렬 적용 (isActive 필터가 있을 때는 정렬 제외)
    if (!filter?.isActive) {
      const sortField = sort?.field || 'createdAt';
      const sortDirection = sort?.direction || 'desc';
      q = query(q, orderBy(sortField, sortDirection));
    }

    // 페이지네이션 적용
    if (lastDoc) {
      q = query(q, startAfter(lastDoc), limit(pageSize));
    } else {
      q = query(q, limit(pageSize));
    }

    const querySnapshot = await getDocs(q);
    const promotions: Promotion[] = [];

    querySnapshot.forEach((doc) => {
      promotions.push({
        id: doc.id,
        ...(doc.data() as any)
      } as Promotion);
    });

    const hasNextPage = querySnapshot.docs.length === pageSize;
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
    return {
      success: false,
      error: handleFirebaseError(error)
    };
  }
};

// 프로모션 상세 조회
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
          console.warn('기존 이미지 삭제 실패:', error);
        }
      }

      // 새 이미지 업로드
      const response = await fetch(data.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'promotion-image.jpg', { type: blob.type });
      imageUrl = await uploadImage(file, 'promotions');
    }

    // 업데이트 데이터 준비
    const updateData = addUpdateTimestamp({
      ...removeUndefined(data),
      imageUrl: imageUrl || null
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
        console.warn('이미지 삭제 실패:', error);
      }
    }

    await deleteDoc(docRef);

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
        console.error(`다른제품 정보 조회 실패 (ID: ${id}):`, error);
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
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { CustomerGroup, CustomerGroupFormData } from '../types/customer';

const CUSTOMER_GROUPS_COLLECTION = 'customerGroups';

// 고객 그룹 목록 조회
export const getCustomerGroups = async (): Promise<CustomerGroup[]> => {
  try {
    const q = query(collection(db, CUSTOMER_GROUPS_COLLECTION), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as CustomerGroup[];
  } catch (error) {
    throw new Error('고객 그룹 목록을 불러올 수 없습니다.');
  }
};

// 고객 그룹 상세 조회
export const getCustomerGroup = async (id: string): Promise<CustomerGroup | null> => {
  try {
    const docRef = doc(db, CUSTOMER_GROUPS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as CustomerGroup;
    }
    return null;
  } catch (error) {
    throw new Error('고객 그룹 정보를 불러올 수 없습니다.');
  }
};

// 고객 그룹 등록
export const createCustomerGroup = async (groupData: CustomerGroupFormData): Promise<string> => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, CUSTOMER_GROUPS_COLLECTION), {
      ...groupData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    throw new Error('고객 그룹 등록에 실패했습니다.');
  }
};

// 고객 그룹 수정
export const updateCustomerGroup = async (id: string, groupData: Partial<CustomerGroupFormData>): Promise<void> => {
  try {
    const docRef = doc(db, CUSTOMER_GROUPS_COLLECTION, id);
    await updateDoc(docRef, {
      ...groupData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw new Error('고객 그룹 수정에 실패했습니다.');
  }
};

// 고객 그룹 삭제
export const deleteCustomerGroup = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, CUSTOMER_GROUPS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    throw new Error('고객 그룹 삭제에 실패했습니다.');
  }
}; 
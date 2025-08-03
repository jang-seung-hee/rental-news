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
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Customer, CustomerFormData, CustomerFilter, ExcelCustomerData } from '../types/customer';

const CUSTOMERS_COLLECTION = 'customers';

// 고객 목록 조회
export const getCustomers = async (filter?: CustomerFilter): Promise<Customer[]> => {
  try {
    let q = query(collection(db, CUSTOMERS_COLLECTION));
    
    if (filter) {
      const conditions = [];
      if (filter.customerGroup) {
        conditions.push(where('customerGroup', '==', filter.customerGroup));
      }
      if (filter.customerName) {
        conditions.push(where('customerName', '>=', filter.customerName));
        conditions.push(where('customerName', '<=', filter.customerName + '\uf8ff'));
      }
      if (filter.phoneNumber) {
        conditions.push(where('phoneNumber', '==', filter.phoneNumber));
      }
      if (filter.currentProduct) {
        conditions.push(where('currentProduct', '==', filter.currentProduct));
      }
      
      if (conditions.length > 0) {
        q = query(collection(db, CUSTOMERS_COLLECTION), ...conditions);
      }
    }

    const querySnapshot = await getDocs(q);
    const customers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Customer[];
    
    // 클라이언트 사이드에서 정렬
    return customers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('고객 목록 조회 실패:', error);
    throw error;
  }
};

// 고객 상세 조회
export const getCustomer = async (id: string): Promise<Customer | null> => {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as Customer;
    }
    return null;
  } catch (error) {
    console.error('고객 상세 조회 실패:', error);
    throw error;
  }
};

// 고객 등록
export const createCustomer = async (customerData: CustomerFormData): Promise<string> => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), {
      ...customerData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('고객 등록 실패:', error);
    throw error;
  }
};

// 고객 수정
export const updateCustomer = async (id: string, customerData: Partial<CustomerFormData>): Promise<void> => {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);
    await updateDoc(docRef, {
      ...customerData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('고객 수정 실패:', error);
    throw error;
  }
};

// 고객 삭제
export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('고객 삭제 실패:', error);
    throw error;
  }
};

// 일괄 고객 등록 (엑셀 데이터)
export const createCustomersBatch = async (customersData: ExcelCustomerData[]): Promise<string[]> => {
  try {
    const batch = writeBatch(db);
    const now = Timestamp.now();
    const customerIds: string[] = [];

    customersData.forEach((customerData) => {
      const docRef = doc(collection(db, CUSTOMERS_COLLECTION));
      batch.set(docRef, {
        ...customerData,
        createdAt: now,
        updatedAt: now,
      });
      customerIds.push(docRef.id);
    });

    await batch.commit();
    return customerIds;
  } catch (error) {
    console.error('일괄 고객 등록 실패:', error);
    throw error;
  }
};

// 고객 그룹별 통계
export const getCustomerStats = async (): Promise<{ [key: string]: number }> => {
  try {
    const customers = await getCustomers();
    const stats: { [key: string]: number } = {};
    
    customers.forEach(customer => {
      const group = customer.customerGroup;
      stats[group] = (stats[group] || 0) + 1;
    });
    
    return stats;
  } catch (error) {
    console.error('고객 통계 조회 실패:', error);
    throw error;
  }
}; 
import * as XLSX from 'xlsx';
import { ExcelCustomerData } from '../types/customer';

// 엑셀 파일을 고객 데이터로 변환
export const parseExcelFile = (file: File): Promise<ExcelCustomerData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        console.log('파일 읽기 시작:', file.name, file.size);
        
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // 엑셀 데이터를 JSON으로 변환
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // 헤더 제거하고 데이터만 추출
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[][];
        
        console.log('헤더:', headers);
        console.log('데이터 행 수:', rows.length);
        
        // 데이터 검증 및 변환
        const customers: ExcelCustomerData[] = rows
          .filter(row => row.length >= 6) // 최소 6개 컬럼 필요
          .map((row, index) => {
            console.log(`행 ${index + 2} 원본 데이터:`, row);
            
            const customer: ExcelCustomerData = {
              customerGroup: String(row[0] || '').trim(),
              customerName: String(row[1] || '').trim(),
              phoneNumber: String(row[2] || '').trim(),
              currentProduct: String(row[3] || '').trim(),
              installationDate: String(row[4] || '').trim(),
              mandatoryUsagePeriod: Number(row[5]) || 0,
            };
            
            console.log(`행 ${index + 2} 변환된 데이터:`, customer);
            
            // 필수 필드 검증
            if (!customer.customerName || !customer.phoneNumber) {
              throw new Error(`행 ${index + 2}: 고객명과 휴대폰번호는 필수입니다.`);
            }
            
            // 휴대폰번호 형식 검증 및 정리
            let phoneNumber = customer.phoneNumber.trim();
            
            // 공백 제거
            phoneNumber = phoneNumber.replace(/\s/g, '');
            
            // 다양한 휴대폰번호 형식 처리
            // 1. 010-1234-5678 형식
            if (phoneNumber.match(/^010-\d{4}-\d{4}$/)) {
              customer.phoneNumber = phoneNumber;
            }
            // 2. 01012345678 형식 (하이픈 제거)
            else if (phoneNumber.match(/^010\d{8}$/)) {
              customer.phoneNumber = phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
            }
            // 3. 010 1234 5678 형식 (공백 포함)
            else if (phoneNumber.match(/^010\s?\d{4}\s?\d{4}$/)) {
              customer.phoneNumber = phoneNumber.replace(/\s/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
            }
            // 4. 기타 형식은 경고만 출력하고 그대로 사용
            else {
              console.warn(`행 ${index + 2}: 비표준 휴대폰번호 형식 - ${phoneNumber}`);
              customer.phoneNumber = phoneNumber;
            }
            
            // 날짜 형식 검증 및 변환
            if (customer.installationDate) {
              let date: Date | null = null;
              
              // 다양한 날짜 형식 처리
              const dateStr = customer.installationDate.trim();
              
              // 1. '22년 8월' 형식 처리
              const yearMonthMatch = dateStr.match(/(\d{2})년\s*(\d{1,2})월/);
              if (yearMonthMatch) {
                const year = parseInt(yearMonthMatch[1]) + 2000; // 22 -> 2022
                const month = parseInt(yearMonthMatch[2]) - 1; // 0-based month
                date = new Date(year, month, 1);
              }
              // 2. '2024-01-01' 형식 처리
              else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                date = new Date(dateStr);
              }
              // 3. '2024/01/01' 형식 처리
              else if (dateStr.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
                date = new Date(dateStr);
              }
              // 4. 일반적인 Date 생성자 형식
              else {
                date = new Date(dateStr);
              }
              
              if (date && !isNaN(date.getTime())) {
                // 유효한 날짜인 경우 ISO 형식으로 변환
                customer.installationDate = date.toISOString().split('T')[0];
              } else {
                // 날짜가 유효하지 않으면 빈 문자열로 설정 (필수 필드가 아니므로)
                customer.installationDate = '';
              }
            }
            
            return customer;
          });
        
        console.log('최종 변환된 고객 데이터:', customers);
        resolve(customers);
      } catch (error) {
        console.error('파일 파싱 에러:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('파일 읽기 에러:', error);
      reject(new Error('파일 읽기 실패'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// 고객 데이터를 엑셀 파일로 다운로드
export const downloadCustomerExcel = (customers: ExcelCustomerData[], filename: string = 'customers.xlsx') => {
  try {
    // @ts-ignore - XLSX 타입 정의 문제 임시 해결
    const worksheet = XLSX.utils.json_to_sheet(customers);
    // @ts-ignore
    const workbook = XLSX.utils.book_new();
    // @ts-ignore
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    
    // 엑셀 파일 생성 및 다운로드
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('엑셀 파일 생성 에러:', error);
    throw error;
  }
};

// 엑셀 템플릿 생성
export const createExcelTemplate = () => {
  const template = [
    {
      customerGroup: '샘플 그룹',
      customerName: '홍길동',
      phoneNumber: '010-1234-5678',
      currentProduct: '렌탈 상품명',
      installationDate: '2024-01-01',
      mandatoryUsagePeriod: 3,
    }
  ];
  
  downloadCustomerExcel(template, 'customer_template.xlsx');
};

// 파일 형식 검증
export const validateExcelFile = (file: File): boolean => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv', // .csv
  ];
  
  return allowedTypes.includes(file.type);
}; 
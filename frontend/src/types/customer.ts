export interface Customer {
  id: string;
  customerGroup: string;
  customerName: string;
  phoneNumber: string;
  currentProduct: string;
  installationDate: string;
  mandatoryUsagePeriod: number; // 년 단위
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerFormData {
  customerGroup: string;
  customerName: string;
  phoneNumber: string;
  currentProduct: string;
  installationDate: string;
  mandatoryUsagePeriod: number;
}

export interface CustomerGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerGroupFormData {
  name: string;
  description?: string;
}

export interface CustomerFilter {
  customerGroup?: string;
  customerName?: string;
  phoneNumber?: string;
  currentProduct?: string;
}

export interface ExcelCustomerData {
  customerGroup: string;
  customerName: string;
  phoneNumber: string;
  currentProduct: string;
  installationDate: string;
  mandatoryUsagePeriod: number;
}

export interface EditableCustomer extends Customer {
  isNew?: boolean;
  isEditing?: boolean;
  hasChanges?: boolean;
  [key: string]: any; // 인덱스 시그니처 추가
} 
import React, { useState, useEffect } from 'react';
import { EditableCustomer, CustomerGroup } from '../../types/customer';
import { createCustomer, updateCustomer, deleteCustomer } from '../../services/customerService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import LoadingSpinner from '../common/LoadingSpinner';

interface EditableCustomerGridProps {
  customers: EditableCustomer[];
  customerGroups: CustomerGroup[];
  selectedGroup: string;
  onCustomersChange: (customers: EditableCustomer[]) => void;
  onRefresh: () => void;
}

const EditableCustomerGrid: React.FC<EditableCustomerGridProps> = ({
  customers,
  customerGroups,
  selectedGroup,
  onCustomersChange,
  onRefresh
}) => {
  const [editingCustomers, setEditingCustomers] = useState<EditableCustomer[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // 편집 가능한 고객 목록 초기화 (최소 20줄)
  useEffect(() => {
    const minRows = 20;
    const currentRows = customers.length;
    
    if (currentRows < minRows) {
      const emptyRows: EditableCustomer[] = Array.from({ length: minRows - currentRows }, (_, index) => ({
        id: `new-${Date.now()}-${index}`,
        customerGroup: selectedGroup,
        customerName: '',
        phoneNumber: '',
        currentProduct: '',
        installationDate: '',
        mandatoryUsagePeriod: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        isNew: true,
        isEditing: false,
        hasChanges: false
      }));
      
      onCustomersChange([...customers, ...emptyRows]);
    }
  }, [customers.length, selectedGroup, onCustomersChange]);

  // 편집 중인 고객 데이터 관리
  useEffect(() => {
    setEditingCustomers(customers);
  }, [customers]);

  // 셀 데이터 변경 처리
  const handleCellChange = (rowIndex: number, field: keyof EditableCustomer, value: string | number) => {
    const updatedCustomers = [...editingCustomers];
    const customer = { ...updatedCustomers[rowIndex] };
    
    customer[field] = value as any;
    customer.hasChanges = true;
    customer.isEditing = true;
    
    updatedCustomers[rowIndex] = customer;
    setEditingCustomers(updatedCustomers);
  };

  // 행 저장
  const handleSaveRow = async (rowIndex: number) => {
    const customer = editingCustomers[rowIndex];
    
    if (!customer.customerName.trim() || !customer.phoneNumber.trim()) {
      toast({
        title: "오류",
        description: "고객명과 휴대폰번호는 필수입니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      if (customer.isNew) {
        // 새 고객 등록
        const { id, isNew, isEditing, hasChanges, ...customerData } = customer;
        await createCustomer(customerData);
        toast({
          title: "성공",
          description: "새 고객이 등록되었습니다.",
        });
      } else if (customer.hasChanges) {
        // 기존 고객 수정
        const { id, isNew, isEditing, hasChanges, createdAt, updatedAt, ...customerData } = customer;
        await updateCustomer(id, customerData);
        toast({
          title: "성공",
          description: "고객 정보가 수정되었습니다.",
        });
      }
      
      onRefresh();
    } catch (error) {
      toast({
        title: "오류",
        description: "저장에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // 행 삭제
  const handleDeleteRow = async (rowIndex: number) => {
    const customer = editingCustomers[rowIndex];
    
    if (customer.isNew) {
      // 새 행인 경우 목록에서만 제거
      const updatedCustomers = editingCustomers.filter((_, index) => index !== rowIndex);
      setEditingCustomers(updatedCustomers);
      onCustomersChange(updatedCustomers);
    } else {
      // 기존 고객인 경우 확인 후 삭제
      if (!window.confirm('정말로 이 고객을 삭제하시겠습니까?')) return;
      
      try {
        setSaving(true);
        await deleteCustomer(customer.id);
        toast({
          title: "성공",
          description: "고객이 삭제되었습니다.",
        });
        onRefresh();
      } catch (error) {
        toast({
          title: "오류",
          description: "삭제에 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    }
  };

  // 새 행 추가
  const handleAddRow = () => {
    const newCustomer: EditableCustomer = {
      id: `new-${Date.now()}`,
      customerGroup: selectedGroup,
      customerName: '',
      phoneNumber: '',
      currentProduct: '',
      installationDate: '',
      mandatoryUsagePeriod: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      isNew: true,
      isEditing: false,
      hasChanges: false
    };
    
    const updatedCustomers = [...editingCustomers, newCustomer];
    setEditingCustomers(updatedCustomers);
    onCustomersChange(updatedCustomers);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">고객 목록 ({editingCustomers.filter(c => !c.isNew || c.customerName).length}명)</h3>
        <Button onClick={handleAddRow} className="bg-blue-600 hover:bg-blue-700">
          새 행 추가
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border-b">고객 그룹</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border-b">고객명 *</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border-b">휴대폰번호 *</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border-b">현재 상품</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border-b">설치일자</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border-b">의무사용기간</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border-b">작업</th>
            </tr>
          </thead>
          <tbody>
            {editingCustomers.map((customer, index) => (
              <tr key={customer.id} className={`border-b ${customer.hasChanges ? 'bg-yellow-50' : ''}`}>
                {/* 고객 그룹 */}
                <td className="px-3 py-2">
                  <Select
                    value={customer.customerGroup}
                    onValueChange={(value) => handleCellChange(index, 'customerGroup', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {customerGroups.map((group) => (
                        <SelectItem key={group.id} value={group.name}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>

                {/* 고객명 */}
                <td className="px-3 py-2">
                  <Input
                    value={customer.customerName}
                    onChange={(e) => handleCellChange(index, 'customerName', e.target.value)}
                    placeholder="고객명 입력"
                    className={!customer.customerName && customer.hasChanges ? 'border-red-500' : ''}
                  />
                </td>

                {/* 휴대폰번호 */}
                <td className="px-3 py-2">
                  <Input
                    value={customer.phoneNumber}
                    onChange={(e) => handleCellChange(index, 'phoneNumber', e.target.value)}
                    placeholder="010-1234-5678"
                    className={!customer.phoneNumber && customer.hasChanges ? 'border-red-500' : ''}
                  />
                </td>

                {/* 현재 상품 */}
                <td className="px-3 py-2">
                  <Input
                    value={customer.currentProduct}
                    onChange={(e) => handleCellChange(index, 'currentProduct', e.target.value)}
                    placeholder="현재 상품"
                  />
                </td>

                {/* 설치일자 */}
                <td className="px-3 py-2">
                  <Input
                    type="date"
                    value={customer.installationDate}
                    onChange={(e) => handleCellChange(index, 'installationDate', e.target.value)}
                  />
                </td>

                {/* 의무사용기간 */}
                <td className="px-3 py-2">
                  <Select
                    value={customer.mandatoryUsagePeriod.toString()}
                    onValueChange={(value) => handleCellChange(index, 'mandatoryUsagePeriod', parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1년</SelectItem>
                      <SelectItem value="2">2년</SelectItem>
                      <SelectItem value="3">3년</SelectItem>
                      <SelectItem value="4">4년</SelectItem>
                      <SelectItem value="5">5년</SelectItem>
                      <SelectItem value="6">6년</SelectItem>
                    </SelectContent>
                  </Select>
                </td>

                {/* 작업 버튼 */}
                <td className="px-3 py-2">
                  <div className="flex space-x-2">
                    {customer.hasChanges && (
                      <Button
                        size="sm"
                        onClick={() => handleSaveRow(index)}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {saving ? <LoadingSpinner className="w-4 h-4" /> : '저장'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteRow(index)}
                      disabled={saving}
                    >
                      삭제
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EditableCustomerGrid; 
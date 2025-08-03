import React, { useState, useEffect } from 'react';
import { Customer, CustomerFormData } from '../../types/customer';
import { createCustomer, updateCustomer } from '../../services/customerService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';

interface CustomerFormProps {
  customer?: Customer | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    customerGroup: '',
    customerName: '',
    phoneNumber: '',
    currentProduct: '',
    installationDate: '',
    mandatoryUsagePeriod: 3,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // 고객 데이터가 있으면 폼에 설정
  useEffect(() => {
    if (customer) {
      setFormData({
        customerGroup: customer.customerGroup,
        customerName: customer.customerName,
        phoneNumber: customer.phoneNumber,
        currentProduct: customer.currentProduct,
        installationDate: customer.installationDate,
        mandatoryUsagePeriod: customer.mandatoryUsagePeriod,
      });
    }
  }, [customer]);

  // 폼 데이터 변경 핸들러
  const handleInputChange = (field: keyof CustomerFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!formData.customerName.trim()) {
      toast({
        title: "오류",
        description: "고객명을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.phoneNumber.trim()) {
      toast({
        title: "오류",
        description: "휴대폰번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 휴대폰번호 형식 검증
    const phoneRegex = /^[0-9-]+$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast({
        title: "오류",
        description: "올바른 휴대폰번호 형식을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      if (customer) {
        // 고객 수정
        await updateCustomer(customer.id, formData);
        toast({
          title: "성공",
          description: "고객 정보가 수정되었습니다.",
        });
      } else {
        // 새 고객 등록
        await createCustomer(formData);
        toast({
          title: "성공",
          description: "새 고객이 등록되었습니다.",
        });
      }
      
      onSubmit();
    } catch (error) {
      toast({
        title: "오류",
        description: customer ? "고객 정보 수정에 실패했습니다." : "고객 등록에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 고객 그룹 */}
        <div className="space-y-2">
          <Label htmlFor="customerGroup">고객 그룹 *</Label>
          <Input
            id="customerGroup"
            value={formData.customerGroup}
            onChange={(e) => handleInputChange('customerGroup', e.target.value)}
            placeholder="예: VIP, 일반, 신규"
            required
          />
        </div>

        {/* 고객명 */}
        <div className="space-y-2">
          <Label htmlFor="customerName">고객명 *</Label>
          <Input
            id="customerName"
            value={formData.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            placeholder="고객 이름을 입력하세요"
            required
          />
        </div>

        {/* 휴대폰번호 */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">휴대폰번호 *</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="010-1234-5678"
            required
          />
        </div>

        {/* 현재 상품 */}
        <div className="space-y-2">
          <Label htmlFor="currentProduct">현재 상품</Label>
          <Input
            id="currentProduct"
            value={formData.currentProduct}
            onChange={(e) => handleInputChange('currentProduct', e.target.value)}
            placeholder="현재 사용 중인 렌탈 상품"
          />
        </div>

        {/* 설치일자 */}
        <div className="space-y-2">
          <Label htmlFor="installationDate">설치일자</Label>
          <Input
            id="installationDate"
            type="date"
            value={formData.installationDate}
            onChange={(e) => handleInputChange('installationDate', e.target.value)}
          />
        </div>

        {/* 의무사용기간 */}
        <div className="space-y-2">
          <Label htmlFor="mandatoryUsagePeriod">의무사용기간 (년)</Label>
          <Select
            value={formData.mandatoryUsagePeriod.toString()}
            onValueChange={(value) => handleInputChange('mandatoryUsagePeriod', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="의무사용기간을 선택하세요" />
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
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          {loading ? '처리 중...' : (customer ? '수정' : '등록')}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm; 
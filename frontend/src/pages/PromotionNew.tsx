import React from 'react';
import { useNavigate } from 'react-router-dom';
import PromotionForm from '../components/admin/PromotionForm';

const PromotionNew: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (promotionId: string) => {
    // 등록 성공 시 상세 페이지로 이동
    navigate(`/promotions/${promotionId}`);
  };

  const handleCancel = () => {
    // 취소 시 목록으로 이동
    navigate('/promotions');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">새 프로모션 등록</h1>
          <p className="text-gray-600 mt-2">새로운 프로모션을 등록하세요</p>
        </div>
      </div>

      <PromotionForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default PromotionNew; 